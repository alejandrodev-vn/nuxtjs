<template>
  <div ref="wrapComment" class="wrap-comment">
    <div class="comment-guest">
      <div class="comment-guest__left">
        <div
          v-if="commentInline.replies.data.length"
          class="vertical-line-comment"
        ></div>
        <div class="avatar-guest">
          <app-avatar
            :image="guestAvatar"
            :full-name="commentInline.from_name"
            size="large"
          />
        </div>
      </div>
      <div ref="commentGuestRight" class="comment-guest__right">
        <div class="top">
          <span class="name-guest">{{ commentInline.from_name }}</span>
          <p class="content">
            {{ commentInline.content }}
          </p>
          <comment-attachment
            v-if="commentInline.attachments.length"
            :attachments="commentInline.attachments"
          />
        </div>
        <div class="action" :class="{ isCollapsed }">
          <!-- <template
            v-if="
              commentInline.from_id === currentInfoFan.social_profile_id &&
              !commentInline.is_deleted
            "
          >
            <span
              class="action__reply"
              :class="{
                active: activeCommentId === commentInline.conversation_id,
                disabled: isLockedByOtherUser,
              }"
              @click="handleClickReplyComment"
            >
              {{ $t('reply') }}
            </span>
            <button-actions-hide-comment
              :comment="commentInline"
              @handleUpdateComment="handleUpdateComment"
            />
            <button-actions-delete-comment
              :comment="commentInline"
              @handleUpdateComment="handleUpdateComment"
            />
            <button-actions-send-message :comment="commentInline" />
          </template>
          <span
            v-else-if="commentInline.is_deleted"
            class="action__deleted italic mr-4"
          >
            {{ $t('deleted') }}
          </span> -->
          <span
            v-if="commentInline.is_deleted"
            class="action__deleted italic mr-4"
          >
            {{ $t('deleted') }}
          </span>
          <conversation-actions
            v-else-if="
              commentInline.from_id === currentInfoFan.social_profile_id &&
              !isLockedByOtherUser
            "
            :conversation="commentInline"
            :active-conversation-id="activeCommentId"
            :keywords="keywords"
            :is-show-action-hide="true"
            @handleClickReplyConversation="handleClickReplyComment"
            @handleCancelReplyConversation="handleCancelReplyComment"
            @handleUpdateConversationProgress="handleUpdateConversationProgress"
            @handleDeleteTag="handleDeleteTag"
            @handleUpdateHistories="handleUpdateHistories"
            @handleChangeBreadcrumbs="handleChangeBreadcrumbs"
            @handleUpdateComment="handleUpdateComment"
          />
          <time
            v-if="commentInline.updated_by_name"
            class="action__time"
            :class="{ 'mt-2': isCollapsed }"
          >
            <div v-if="breadcrumbs.length" class="breadcrumbs">
              {{ breadcrumbs }}
            </div>
            <a-tooltip
              v-if="!commentInline.is_deleted"
              overlay-class-name="custom-tooltip-light"
              placement="bottomLeft"
            >
              <template slot="title">
                {{
                  $t('view-comment-on-channel', {
                    channel: infoPage.channel_type.data.name,
                  })
                }}
              </template>
              <span
                class="action__time--tooltip"
                @click="handleViewCommentOnChannel"
              >
                {{
                  $moment
                    .utc(commentInline.publish_time)
                    .local()
                    .format('HH:mm DD/MM/YYYY')
                }}
                -
                {{ commentInline.updated_by_name }}
              </span>
            </a-tooltip>
            <template v-else>
              {{
                $moment
                  .utc(commentInline.publish_time)
                  .local()
                  .format('HH:mm DD/MM/YYYY')
              }}
              -
              {{ commentInline.updated_by_name }}
            </template>
          </time>
          <time v-else class="action__time" :class="{ 'mt-2': isCollapsed }">
            <div v-if="breadcrumbs.length" class="breadcrumbs">
              {{ breadcrumbs }}
            </div>
            <a-tooltip
              v-if="!commentInline.is_deleted"
              overlay-class-name="custom-tooltip-light"
              placement="bottomLeft"
            >
              <template slot="title">
                {{
                  $t('view-comment-on-channel', {
                    channel: infoPage.channel_type.data.name,
                  })
                }}
              </template>
              <span
                class="action__time--tooltip"
                @click="handleViewCommentOnChannel"
              >
                {{ publishTime }}
              </span>
            </a-tooltip>
            <template v-else>
              {{ publishTime }}
            </template>
          </time>
        </div>
      </div>
    </div>
    <div class="comment-guest__replies">
      <template v-if="infoPage && commentInline.replies.data">
        <template v-for="(reply, index) in commentInline.replies.data">
          <comment-response
            v-if="reply.from_id === infoPage.social_id"
            :key="index"
            :response="reply"
            :info-page="infoPage"
            :parent-id="commentInline.id"
            :parent-deleted="parentDeleted"
            :is-last="index === commentInline.replies.data.length - 1"
            :comment-guest="commentInline"
          />
          <comment-guest-reply
            v-else
            :key="reply.id"
            :comment="reply"
            :info-page="infoPage"
            :active-comment-id="activeCommentId"
            :post="post"
            :is-last="index === commentInline.replies.data.length - 1"
            :keywords="keywords"
            :is-show-background-wrap-children="isShowBackgroundWrapChildren"
            @handleCancelReplyComment="handleCancelReplyComment"
            @handleClickReplyComment="handleClickReplyCommentChildren"
            @rerenderVerticalLine="rerenderVerticalLine"
          />
        </template>
      </template>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { actionTypes } from '@/constants/action-types-firebase'
import event from '@/utils/event'
Vue.use(notification)

export default {
  name: 'CommentGuest',
  props: {
    comment: {
      type: Object,
      default: () => {},
    },
    infoPage: {
      type: Object,
      default: () => {},
    },
    activeCommentId: {
      type: Number,
      default: 0,
    },
    post: {
      type: Object,
      default: () => {},
    },
    keywords: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      commentInline: {},
      breadcrumbs: '',
    }
  },
  computed: {
    isCollapsed() {
      return this.$store.state.conversationCollapsed
    },
    socialChannelId() {
      return this.$route.params.page
    },
    configConversations() {
      return this.$store.state.configConversations
    },
    publishTime() {
      return this.$moment
        .utc(this.commentInline.publish_time)
        .local()
        .format('HH:mm DD/MM/YYYY ')
    },
    isActivePage() {
      return this.$store.state.isActivePage === 1
    },
    currentInfoFan() {
      return this.$store.state.currentInfoFan
    },
    guestAvatar() {
      return this.currentInfoFan &&
        this.commentInline.from_id === this.currentInfoFan.social_profile_id
        ? this.currentInfoFan.avatar
        : null
    },
    isLockedByOtherUser() {
      return (
        this.currentInfoFan?.locked_by &&
        this.$auth.user.id !== this.currentInfoFan.locked_by.id
      )
    },
    parentDeleted() {
      return {
        is_deleted: this.commentInline.is_deleted,
        updated_by_name: this.commentInline.updated_by_name,
      }
    },
    conversationProgress() {
      return this.commentInline.conversation_mysql?.data?.progress?.data
    },
    isShowBackgroundWrapChildren() {
      return (
        !this.commentInline.replies.data.some(
          (reply) => reply.from_id === this.infoPage.social_id
        ) && this.commentInline.replies.data.length < 2
      )
    },
  },
  watch: {
    'commentInline.replies.data'() {
      this.rerenderVerticalLine()
    },
  },
  created() {
    this.commentInline = { ...this.commentInline, ...this.comment }
  },
  mounted() {
    event.$on(
      `update-comment-${this.commentInline.conversation_id}`,
      (data) => {
        this.handleUpdateComment(data)
      }
    )
    event.$on(
      `${actionTypes.REALTIME_NEW_CONVERSATION}-${this.commentInline.social_id}`,
      (newConversation) => {
        this.commentInline.replies.data.push({ ...newConversation })
      }
    )
    this.rerenderVerticalLine()
  },
  beforeDestroy() {
    event.$off(`update-comment-${this.commentInline.conversation_id}`)
    event.$off(
      `${actionTypes.REALTIME_NEW_CONVERSATION}-${this.commentInline.social_id}`
    )
  },
  methods: {
    rerenderVerticalLine() {
      this.$nextTick(() => {
        if (
          !this.$el.querySelector('.vertical-line-comment') ||
          !this.$refs.wrapComment
        )
          return
        this.$el.querySelector('.vertical-line-comment').style.height =
          this.$refs.wrapComment.clientHeight + 'px'
      })
    },
    handleViewCommentOnChannel() {
      if (!this.commentInline.is_deleted) {
        window.open(this.commentInline.social_link, '_blank')
      }
    },
    handleUpdateComment(newData) {
      const { id, ...others } = newData
      this.commentInline = { ...this.commentInline, ...others }
      this.rerenderVerticalLine()
    },
    handleCancelReplyComment() {
      this.$emit('handleCancelReplyComment')
    },
    handleChangeBreadcrumbs(breadcrumbs) {
      this.breadcrumbs = breadcrumbs
    },
    handleDeleteTag() {
      this.commentInline.conversation_mysql.data.progress.data.conversation_progress_tags.data =
        []
    },
    handleUpdateConversationProgress(data) {
      this.commentInline.conversation_mysql.data = {
        ...data,
      }
    },
    handleUpdateHistories(data) {
      this.commentInline.conversation_mysql.data.progress.data.histories.data.push(
        { ...data }
      )
    },
    handleClickReplyComment() {
      this.$emit('handleClickReplyComment', this.commentInline)
    },
    handleClickReplyCommentChildren(comment) {
      this.$emit('handleClickReplyComment', comment)
    },
  },
}
</script>
<style lang="less" scoped>
.wrap-comment {
  @apply relative overflow-hidden;
  .vertical-line-comment {
    background-color: @gray-6;
    width: 0.225rem;
    height: 100%;
    transform: translateX(50%);
    left: 50%;
    position: absolute;
  }
}
.comment-guest {
  margin-top: 1.4rem;
  @apply relative flex;
  &__left {
    @apply flex flex-col items-center relative;
    .avatar-guest {
      width: 4rem;
      height: 4rem;
      z-index: 1;
      @apply relative rounded-full flex-shrink-0;
      /deep/.ant-avatar {
        width: 100%;
        height: 100%;
        font-size: @size-16 !important;
        @apply flex items-center justify-center;
      }
    }
  }
  &__right {
    @apply ml-2;
    .top {
      background-color: @primary-4;
      color: @black;
      font-size: @font-size-base;
      width: fit-content;
      @apply rounded-2xl p-4;
      .name-guest {
        @apply font-semibold;
      }
      .content {
        word-break: break-word;
        font-size: @size-16;
        @apply m-0;
      }
    }
    .action {
      color: @grey;
      font-size: @size-14;
      @apply mt-4 flex items-center justify-between;
      &.isCollapsed {
        @apply flex-col items-start;
      }
      &__reply {
        color: @grey;
        font-weight: 500;
        @apply cursor-pointer mr-2 duration-500;
        &:hover,
        &.active {
          color: @primary;
        }
        &.disabled {
          cursor: not-allowed;
        }
      }
      &__deleted {
        color: @grey;
        font-weight: 500;
      }
      &__time {
        @apply flex items-center;
        &--tooltip {
          @apply cursor-pointer;

          &:hover {
            text-decoration: underline;
          }
        }
        .breadcrumbs {
          margin-right: @margin-8;
          color: #488effcc;
          margin-inline: @margin-12;
        }
      }
      .comment-actions {
        margin-left: 1rem;
        @apply flex items-end flex-shrink-0;
        &__icon {
          border-radius: 50%;
          width: 2.6rem;
          height: 2.6rem;
          font-size: @size-14;
          margin-right: @margin-8;
          color: @black;
          background-color: #f2f2f2;
          transition: 0.25s linear;
          @apply flex items-center justify-center cursor-pointer;
          &:hover,
          &.active {
            background-color: @primary-3;
            color: @primary;
          }
          &.disabled {
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
</style>
