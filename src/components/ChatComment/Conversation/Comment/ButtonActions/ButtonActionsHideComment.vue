<template>
  <span
    v-if="!comment.is_hidden"
    class="action__reply"
    :class="{ disabled: isLockedByOtherUser || isLoading }"
    @click="handleClickHideComment"
  >
    {{ $t('hide') }}
    <a-icon v-if="isLoading" type="loading" />
  </span>
  <span
    v-else
    class="action__reply"
    :class="{ disabled: isLockedByOtherUser || isLoading }"
    @click="handleClickUnhideComment"
  >
    {{ $t('unhide') }}
    <a-icon v-if="isLoading" type="loading" />
  </span>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
import { actionTypesComment } from '@/constants/action-types-comment'
Vue.use(notification)

export default {
  name: 'ButtonActionsHideComment',
  props: {
    comment: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isLoading: false,
    }
  },
  computed: {
    isActivePage() {
      return this.$store.state.isActivePage === 1
    },
    currentInfoFan() {
      return this.$store.state.currentInfoFan
    },
    isLockedByOtherUser() {
      return (
        this.currentInfoFan?.locked_by &&
        this.$auth.user.id !== this.currentInfoFan.locked_by.id
      )
    },
  },
  methods: {
    async handleClickHideComment() {
      if (!this.isActivePage || this.isLockedByOtherUser || this.isLoading)
        return
      try {
        this.isLoading = true
        const { data } = await this.updateComment(actionTypesComment.HIDE)
        if (data) {
          this.$emit('handleUpdateComment', data)
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoading = false
      }
    },
    async handleClickUnhideComment() {
      if (!this.isActivePage || this.isLockedByOtherUser || this.isLoading)
        return
      try {
        this.isLoading = true
        const { data } = await this.updateComment(actionTypesComment.UNHIDE)
        if (data) {
          this.$emit('handleUpdateComment', data)
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoading = false
      }
    },
    async updateComment(type) {
      const payload = {
        hide: type,
        social_channel_id: this.comment.social_channel_id,
      }
      return await this.$api.conversation.updateConversation(
        this.comment.conversation_id,
        payload
      )
    },
  },
}
</script>
