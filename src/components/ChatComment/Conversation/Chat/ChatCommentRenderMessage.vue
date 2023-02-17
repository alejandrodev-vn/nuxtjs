<template>
  <div>
    <message-fan
      v-if="message.from_id === socialProfileId"
      :message="message"
      :active-message-id="activeMessageId"
      :keywords="keywords"
      :overtime-reply="overtimeReply"
      @handleDeleteTag="handleDeleteTag"
      @handleClickReplyMessage="handleClickReplyMessage"
      @handleUpdateConversationProgress="handleUpdateConversationProgress"
      @handleUpdateHistories="handleUpdateHistories"
      @handleCancelReplyMessage="handleCancelReplyMessage"
    />
    <message-response-from-comment
      v-else-if="message.reference_id"
      :message="message"
    />
    <message-response v-else :message="message" />
  </div>
</template>
<script>
export default {
  name: 'ChatcommentRenderMessage',
  props: {
    message: {
      type: Object,
      default: () => {},
    },
    socialProfileId: {
      type: String,
      default: '',
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
  methods: {
    handleClickReplyMessage() {
      this.$emit('handleClickReplyMessage', this.message)
    },
    handleUpdateConversationProgress(conversationProgress) {
      this.$emit(
        'handleUpdateConversationProgress',
        conversationProgress,
        this.message.id
      )
    },
    handleDeleteTag() {
      this.$emit('handleDeleteTag', this.message.id)
    },
    handleUpdateHistories(history) {
      this.$emit('handleUpdateHistories', history, this.message.id)
    },
    handleCancelReplyMessage() {
      this.$emit('handleCancelReplyMessage')
    },
  },
}
</script>
