<template>
  <div class="message-sender" :class="{ isCollapsed }">
    <div class="type-text">
      <div class="message-sender__left">
        <app-avatar
          :image="avatar"
          :full-name="message.from_name"
          size="large"
        />
      </div>
      <div class="message-sender__right">
        <div class="flex">
          <div
            class="message-sender__right__content"
            :class="{ 'no-bg': noBackground, unsupport: isUnsupportMessage }"
          >
            <template v-if="isUnsupportMessage">
              <p>
                {{ $t('unsupported-message-type') }}
              </p>
              <a-icon type="exclamation-circle" class="icon-failed" />
            </template>
            <p v-else v-html="message.content"></p>
            <message-attachment
              v-if="
                message.attachments &&
                message.attachments.length &&
                !isUnsupportMessage
              "
              :attachments="message.attachments"
            />
          </div>
          <conversation-actions
            v-if="!isLockedByOtherUser"
            :conversation="message"
            :active-conversation-id="activeMessageId"
            :keywords="keywords"
            :overtime-reply="overtimeReply"
            @handleClickReplyConversation="handleClickReplyMessage"
            @handleCancelReplyConversation="handleCancelReplyMessage"
            @handleUpdateConversationProgress="handleUpdateConversationProgress"
            @handleDeleteTag="handleDeleteTag"
            @handleUpdateHistories="handleUpdateHistories"
            @handleChangeBreadcrumbs="handleChangeBreadcrumbs"
          />
          <!-- <div class="message-actions">
            <a-tooltip
              placement="bottom"
              overlay-class-name="custom-tooltip-light"
            >
              <template slot="title">
                <span>
                  {{ $t('add-tag-to-conversation') }}
                </span>
              </template>
              <div
                class="message-actions__icon message-actions__icon--tag"
                :class="{
                  active: isTagged,
                }"
                @click="handleClickTag"
              >
                <i class="far fa-tag"></i>
              </div>
            </a-tooltip>
            <a-tooltip
              v-if="isShowActionSkip"
              placement="bottom"
              overlay-class-name="custom-tooltip-light"
            >
              <template slot="title">
                <span>
                  {{ contentTooltipSkip }}
                </span>
              </template>
              <div
                class="message-actions__icon message-actions__icon--skip"
                :class="{
                  active: (isSkipped && !isEscalated) || isSkippedEscalate,
                  '!cursor-default':
                    (isSkipped && !isEscalated) || isSkippedEscalate,
                }"
                @click="handleClickSkipMessage"
              >
                <i class="far fa-step-forward"></i>
              </div>
            </a-tooltip>
            <a-tooltip
              v-if="isShowActionResponse"
              placement="bottom"
              overlay-class-name="custom-tooltip-light"
            >
              <template slot="title">
                <span>
                  {{ contentTooltipResponse }}
                </span>
              </template>
              <div
                class="message-actions__icon message-actions__icon--reply"
                :class="{
                  active:
                    activeMessageId === message.conversation_id ||
                    (isResponded && !isEscalated) ||
                    isRespondedEscalate,
                  '!cursor-default':
                    (isResponded && !isEscalated) || isRespondedEscalate,
                }"
                @click="handleClickReplyMessage"
              >
                <i class="far fa-reply"></i>
              </div>
            </a-tooltip>
            <a-tooltip
              placement="bottom"
              overlay-class-name="custom-tooltip-light"
            >
              <template slot="title">
                <span>
                  {{ isEscalated ? $t('escalated') : $t('escalate') }}
                </span>
              </template>
              <div
                class="message-actions__icon message-actions__icon--escalate"
                :class="{
                  active: isEscalated,
                }"
                @click="handleClickEscalate"
              >
                <i class="far fa-question"></i>
              </div>
            </a-tooltip>
          </div> -->
        </div>

        <div class="message-sender__right__bottom">
          <div v-if="breadcrumbs.length" class="breadcrumbs">
            {{ breadcrumbs }}
          </div>
          <div class="message-sender__right__bottom__info-message">
            <span class="message-sender__right__bottom__info-message--bold">
              {{ message.from_name }}
            </span>
            <span>{{ formatTime(message.publish_time) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'MessageFan',
  props: {
    message: {
      type: Object,
      default: () => {},
    },
    activeMessageId: {
      type: Number,
      default: 0,
    },
    keywords: {
      type: Array,
      default: () => [],
    },
    overtimeReply: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      thumbnailSrc: null,
      breadcrumbs: '',
    }
  },
  computed: {
    socialChannelId() {
      return this.$route.params.page
    },
    isActivePage() {
      return this.$store.state.isActivePage === 1
    },
    infoFan() {
      return this.$store.state.currentInfoFan
    },
    isLockedByOtherUser() {
      return (
        this.infoFan?.locked_by &&
        this.$auth.user.id !== this.infoFan.locked_by.id
      )
    },
    avatar() {
      return this.message.from_avatar?.length
        ? this.message.from_avatar
        : this.infoFan.avatar
    },
    configConversations() {
      return this.$store.state.configConversations
    },
    isUnsupportMessage() {
      return this.message.content_types.some(
        (type) =>
          parseInt(type) === this.configConversations.content_type.unknown
      )
    },
    isCollapsed() {
      return this.$store.state.conversationCollapsed
    },
    noBackground() {
      return (
        this.message.attachments?.some((item) =>
          item.file_type.includes('sticker')
        ) || !this.message.content.length
      )
    },
  },
  methods: {
    formatTime(time) {
      return this.$moment.utc(time).local().format('hh:mm A DD/MM/YYYY')
    },
    handleChangeBreadcrumbs(breadcrumbs) {
      this.breadcrumbs = breadcrumbs
    },
    handleClickReplyMessage() {
      this.$emit('handleClickReplyMessage')
    },
    handleDeleteTag() {
      this.$emit('handleDeleteTag')
    },
    handleUpdateConversationProgress(data) {
      this.$emit('handleUpdateConversationProgress', data)
    },
    handleUpdateHistories(data) {
      this.$emit('handleUpdateHistories', data)
    },
    handleCancelReplyMessage() {
      this.$emit('handleCancelReplyMessage')
    },
  },
}
</script>
<style lang="less" scoped>
.message-sender {
  max-width: 60%;
  &.isCollapsed {
    max-width: 90%;
  }

  &__left {
    @apply mr-4;
    /deep/.ant-avatar {
      width: 4rem;
      height: 4rem;
      font-size: @size-16 !important;
      @apply flex items-center justify-center;
    }
  }
  &__right {
    &__content {
      color: @black;
      background-color: @gray-6;
      font-size: @size-16;
      padding: @padding-8 @padding-12;
      @apply rounded-md relative;
      p {
        word-break: break-word;
        white-space: pre-line;
        @apply m-0;
      }
      &.no-bg {
        background-color: unset;
      }
      .icon-failed {
        color: #ff9600;
        right: -20px;
        @apply absolute bottom-0;
      }
      /deep/&.unsupport {
        border: 1px solid #ff9600;
        color: #ff9600;
        background-color: @yellow-2;
      }
    }

    &__bottom {
      margin-top: @margin-8;
      @apply flex items-center justify-between;
      .breadcrumbs {
        margin-right: @margin-8;
        color: #488effcc;
      }
      &__info-message {
        padding-right: 14.5rem;
        span {
          font-size: @size-12;
          color: @gray-4;
          @apply px-2;
        }
        &--bold {
          @apply font-semibold relative pl-0 pr-2;
          &::after {
            content: '';
            width: 0.15rem;
            height: 90%;
            top: 0%;
            right: 0;
            background-color: @gray-4;
            @apply absolute;
          }
        }
      }
    }
  }
  .type-text {
    @apply flex my-6 ml-4;
  }
}
</style>
