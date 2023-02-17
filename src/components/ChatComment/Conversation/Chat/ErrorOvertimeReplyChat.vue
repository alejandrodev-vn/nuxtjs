<template>
  <div class="error-overtime-reply-chat">
    <a-icon type="exclamation-circle" class="icon-failed" />
    <p
      class="error-overtime-reply-chat__content"
      :style="isShowMore ? 'display: block' : ''"
      v-html="content"
    >
      {{ content }}
    </p>
    <span
      class="error-overtime-reply-chat__btn-see-more"
      @click="handleClickSeeMore"
    >
      {{ isShowMore ? $t('collapse') : $t('seeMore') }}
    </span>
  </div>
</template>
<script>
export default {
  name: 'ErrorOvertimeReplyChat',
  props: {
    infoPage: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isShowMore: false,
    }
  },
  computed: {
    channelCode() {
      return this.infoPage?.channel_type?.data?.code
    },
    linkPolicy() {
      return this.channelCode === 'facebook'
        ? 'https://developers.facebook.com/docs/messenger-platform/send-messages/message-tags/'
        : 'https://developers.facebook.com/docs/messenger-platform/send-messages/message-tags/'
    },
    content() {
      return this.channelCode === 'facebook'
        ? this.$t('error-overtime-reply-chat', { linkPolicy: this.linkPolicy })
        : this.$t(`error-overtime-reply-chat-${this.channelCode}`, {
            linkPolicy: this.linkPolicy,
          })
    },
  },
  methods: {
    handleClickSeeMore() {
      this.isShowMore = !this.isShowMore
    },
  },
}
</script>
<style lang="less" scoped>
.error-overtime-reply-chat {
  background-color: @red-2;
  border: 1px solid @red;
  border-radius: 6px;
  width: fit-content;
  max-width: 80%;
  @apply mx-auto flex justify-center px-4 py-2;
  .icon-failed {
    color: @red;
    font-size: @size-20;
    @apply font-semibold;
  }
  p {
    color: @red;
    font-size: @size-14;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    @apply m-0 ml-2 font-semibold;
  }
  &__btn-see-more {
    white-space: nowrap;
    flex-shrink: 0;
    align-self: flex-end;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
