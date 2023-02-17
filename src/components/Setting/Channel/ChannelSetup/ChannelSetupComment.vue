<template>
  <div class="channel-setup-body">
    <a-radio-group
      :value="commentOptions.get_all_post"
      @change="handleChangeType"
    >
      <a-radio
        v-for="option in handleOptions"
        :key="option.key"
        :style="radioStyle"
        :value="option.value"
        :disabled="option.disabled"
        class="custom-radio"
      >
        <span class="custom-radio__label">{{ option.label }}</span>
      </a-radio>
    </a-radio-group>
    <channel-setup-posts
      v-if="
        commentOptions.get_all_post ===
        configChannel.manual_data_type.get_by_post_id
      "
      :is-check-comment="isCheckComment"
      :comment-options="commentOptions"
      :channel-id="channelId"
      @changePostStatus="handleChangePostStatus"
      @addPost="handleAddPost"
      @deletePost="handleDeletePost"
      @clearPosts="clearPosts"
    />
  </div>
</template>
<script>
export default {
  name: 'ChannelSetupComment',
  props: {
    isCheckMessage: {
      type: Boolean,
      default: false,
    },
    isCheckComment: {
      type: Boolean,
      default: false,
    },
    commentOptions: {
      type: Object,
      default: () => {},
    },
    channelId: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      radioStyle: {
        height: '30px',
        lineHeight: '30px',
      },
    }
  },
  computed: {
    configChannel() {
      return this.$store.state.configChannel
    },
    handleOptions() {
      return [
        {
          value: this.configChannel.manual_data_type.get_all_post,
          label: this.$t(
            'tick-if-you-want-to-get-all-comments-from-new-posts-by-default'
          ),
          disabled: !this.isCheckComment,
        },
        {
          value: this.configChannel.manual_data_type.get_by_post_id,
          label: this.$t(
            'tick-if-you-only-want-to-get-conversations-according-to-a-specified-post'
          ),
          disabled: !this.isCheckComment,
        },
      ]
    },
  },
  methods: {
    handleChangeType(e) {
      this.$emit('changeType', e.target.value)
    },
    handleChangePostStatus(value) {
      this.$emit('changePostStatus', value)
    },
    handleAddPost(postId) {
      this.$emit('addPost', postId)
    },
    handleDeletePost(postId) {
      this.$emit('deletePost', postId)
    },
    clearPosts() {
      this.$emit('clearPosts')
    },
  },
}
</script>
<style lang="less" scoped>
.channel-setup-body {
  border: 1px solid @gray-5;
  border-radius: 8px;
  .custom-radio {
    span {
      &:nth-child(2) {
        width: 90%;
      }
    }
    &__label {
      white-space: normal;
      color: @black;
      font-size: @size-14;
      @apply font-medium;
    }
  }
}
</style>
