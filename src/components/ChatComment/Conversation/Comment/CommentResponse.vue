<template>
  <div
    class="comment-response"
    :class="{
      failed: failedResponse,
      'last-comment': isLast,
    }"
  >
    <div class="line-branch-comment"></div>
    <div class="comment-response__left">
      <div class="avatar-response">
        <app-avatar
          :image="infoPage.avatar"
          :full-name="infoPage.name"
          size="large"
        />
      </div>
      <div
        v-if="responseInline.replies.data.length"
        class="vertical-line-comment"
      ></div>
    </div>
    <div class="comment-response__right">
      <div class="top">
        <span class="name-response">{{ infoPage.name }}</span>
        <div
          class="comment-response__right__wrap-content"
          :class="{ 'no-bg': !response.content.length }"
        >
          <div class="content" v-html="responseInline.content"></div>
          <div
            v-for="(attachment, index) in responseInline.attachments"
            :key="index"
            class="attachment"
          >
            <div
              v-if="
                attachment.file_type === 'image' ||
                attachment.file_type === 'photo'
              "
              class="attachment-img"
              @click="handlePreviewImage"
            >
              <img :src="attachment.file_url" :alt="attachment.file_url" />
              <a-modal
                v-model="visiblePreviewImage"
                centered
                :closable="false"
                :footer="null"
                destroy-on-close
              >
                <img :src="attachment.file_url" class="mx-auto" />
              </a-modal>
            </div>
            <div
              v-if="attachment.file_type === 'video'"
              class="attachment-video"
            >
              <video controls>
                <source :src="attachment.file_url" />
              </video>
            </div>
          </div>
          <a-icon
            v-if="failedResponse"
            type="exclamation-circle"
            class="icon-failed"
          />
        </div>
      </div>
      <div class="action">
        <!-- <template v-if="responseInline.social_id">
          <button-actions-delete-comment
            v-if="!responseInline.is_deleted && !parentDeleted.is_deleted"
            :comment="responseInline"
            :parent-id="parentId"
            @handleUpdateComment="handleUpdateComment"
          />
        </template> -->
        <template v-if="responseInline.is_deleted">
          <span class="action__deleted italic mr-4">
            {{ $t('deleted') }}
          </span>
          <time class="action__time">
            {{
              $moment
                .utc(responseInline.publish_time)
                .local()
                .format('HH:mm DD/MM/YYYY')
            }}
            -
            {{ responseInline.updated_by_name }}
          </time>
        </template>
        <template v-else>
          <span
            v-if="parentDeleted.is_deleted"
            class="action__deleted italic mr-4"
          >
            {{ $t('deleted') }}
          </span>
          <time class="action__time">
            <template v-if="parentDeleted.is_deleted">
              {{
                $moment
                  .utc(responseInline.publish_time)
                  .local()
                  .format('HH:mm DD/MM/YYYY')
              }}
              -
              {{ parentDeleted.updated_by_name }}
            </template>
            <template
              v-else-if="
                (responseInline.status && responseInline.status === 2) ||
                !responseInline.social_id
              "
            >
              {{
                $moment
                  .utc(responseInline.publish_time)
                  .local()
                  .format('HH:mm DD/MM/YYYY')
              }}
              -
              {{ responseInline.updated_by_name }}
            </template>
            <a-tooltip
              v-else
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
                    .utc(responseInline.publish_time)
                    .local()
                    .format('HH:mm DD/MM/YYYY')
                }}
                -
                {{ responseInline.updated_by_name }}
              </span>
            </a-tooltip>
          </time>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CommentResponse',
  props: {
    response: {
      type: Object,
      default: () => {},
    },
    infoPage: {
      type: Object,
      default: () => {},
    },
    parentId: {
      type: String,
      default: '',
    },
    parentDeleted: {
      type: Object,
      default: () => {},
    },
    commentGuest: {
      type: Object,
      default: () => {},
    },
    isLast: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      responseInline: {},
      visiblePreviewImage: false,
    }
  },
  computed: {
    socialChannelId() {
      return this.$route.params.page
    },
    failedResponse() {
      return !this.responseInline?.conversation_mysql?.data
        ? 0
        : this.responseInline.conversation_mysql.data.progress.data
            .third_service_status === 2
    },
  },
  watch: {
    response: {
      deep: true,
      immediate: true,
      handler() {
        this.responseInline = { ...this.responseInline, ...this.response }
      },
    },
  },
  created() {
    this.responseInline = {
      ...this.responseInline,
      ...this.response,
      social_channel_id: this.socialChannelId,
    }
  },
  methods: {
    handlePreviewImage() {
      this.visiblePreviewImage = true
    },
    handleViewCommentOnChannel() {
      if (this.responseInline.social_id) {
        if (this.commentGuest?.social_link?.includes('facebook')) {
          window.open(
            `https://www.facebook.com/${this.responseInline.social_id}`,
            '_blank'
          )
          return
        }
        if (this.commentGuest.social_link?.includes('instagram')) {
          window.open(this.commentGuest?.social_link, '_blank')
        }
      }
    },
    handleUpdateComment(newData) {
      this.responseInline = { ...this.responseInline, ...newData }
    },
  },
}
</script>
<style lang="less" scoped>
.comment-response {
  padding-left: 2.2rem;
  z-index: 1;
  @apply relative flex;
  &.last-comment {
    background-color: @white;
  }
  .line-branch-comment {
    border-color: @gray-6;
    width: 3.8rem;
    height: 2.7rem;
    border-left-width: 0.3rem;
    border-bottom-width: 0.3rem;
    border-bottom-left-radius: 2rem;
    border-bottom-style: solid;
    border-top-style: solid;
    flex-shrink: 0;
  }
  &__left {
    padding-top: 1rem;
    @apply relative flex flex-col items-center;
    .avatar-response {
      width: 4rem;
      height: 4rem;
      background-color: @gray-6;
      z-index: 1;
      @apply relative rounded-full flex-shrink-0;
      /deep/.ant-avatar {
        width: 100%;
        height: 100%;
        font-size: @size-16 !important;
        @apply flex items-center justify-center;
      }
    }
    .vertical-line-comment {
      background-color: @gray-6;
      width: 0.225rem;
      height: 100%;
      transform: translateX(50%);
      left: 50%;
      position: absolute;
    }
  }
  &__right {
    padding-top: 1rem;
    @apply ml-2;
    .top {
      background-color: @gray-6;
      color: @black;
      font-size: @font-size-base;
      width: fit-content;
      @apply rounded-2xl p-4;
      .name-response {
        @apply font-semibold;
      }
    }
    &__wrap-content {
      .content {
        /deep/p {
          white-space: pre-wrap;
          word-break: break-word;
          font-size: @size-16;
          @apply m-0;
        }
      }
      &.no-bg {
        background-color: unset;
      }
      .attachment {
        &-img {
          max-width: 350px;
          height: 180px;
          @apply cursor-pointer;
          img {
            max-width: 100%;
            width: 100%;
            height: 100%;
            max-height: 200px;
            object-fit: contain;
          }
        }
      }
    }
    .action {
      color: @grey;
      font-size: @size-14;
      @apply mt-4;
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
        &--tooltip {
          @apply cursor-pointer;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
  &.failed {
    .top {
      background-color: @red-2;
      border: 1px solid @red;
      @apply relative;
      .icon-failed {
        color: @red;
        right: -20px;
        @apply absolute bottom-0;
      }
    }
  }
}
</style>
