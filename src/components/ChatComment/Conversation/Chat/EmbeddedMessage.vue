<template>
  <div class="embedded-message">
    <div class="embedded-message__content">
      <i class="fas fa-reply"></i>
      <p>
        {{ $t('reply') }}:
        <span class="ml-1">{{ content }}</span>
      </p>
    </div>
    <div class="embedded-message__close-icon" @click="handleCancelReplyMessage">
      <i class="fal fa-times"></i>
    </div>
  </div>
</template>
<script>
export default {
  name: 'EmbeddedMessage',
  props: {
    activeMessage: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    content() {
      return this.activeMessage?.content
        ? this.activeMessage.content
        : this.$t('send-an-attachment')
    },
  },
  methods: {
    handleCancelReplyMessage() {
      this.$emit('handleCancelReplyMessage')
    },
  },
}
</script>
<style lang="less" scoped>
.embedded-message {
  width: fit-content;
  max-width: 40%;
  border-radius: 1rem;
  background-color: @gray-6;
  top: -3.3rem;
  left: 9%;
  padding: @padding-8 @padding-16;
  line-height: 1;
  @apply absolute flex items-center justify-between;
  &__content {
    @apply w-full flex overflow-hidden;
    i {
      font-size: @size-16;
    }
    p {
      margin-left: @margin-8;
      font-size: @size-16;
      @apply truncate mb-0;
    }
  }
  &__close-icon {
    font-size: @size-20;
    margin-left: @margin-12;
    @apply cursor-pointer;
  }
}
</style>
