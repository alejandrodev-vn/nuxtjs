<template>
  <span
    class="action__reply"
    :class="{ disabled: isLockedByOtherUser || isLoading }"
    @click="handleOpenDeleteComment"
  >
    {{ $t('delete') }}
    <a-icon v-if="isLoading" type="loading" />
    <app-modal
      ref="modalDeleteComment"
      type="danger"
      :loading="isLoading"
      @confirm="handleConfirmDeleteComment"
    >
      <template #title> {{ $t('delete') }} </template>
      <template #content>{{ $t('confirm-to-delete-comment') }} </template>
    </app-modal>
  </span>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'ButtonActionsHideComment',
  props: {
    comment: {
      type: Object,
      default: () => {},
    },
    parentId: {
      type: String,
      default: '',
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
    userName() {
      return this.$auth.user.name
    },
  },
  methods: {
    handleOpenDeleteComment() {
      if (!this.isActivePage || this.isLockedByOtherUser || this.isLoading)
        return
      this.$refs.modalDeleteComment.show()
    },
    async handleConfirmDeleteComment() {
      if (!this.isActivePage || this.isLockedByOtherUser || this.isLoading)
        return
      try {
        this.isLoading = true
        const { data } = await this.deleteComment()
        if (data) {
          const replies = {
            data: this.comment?.replies?.data?.map((children) => {
              return {
                ...children,
                is_deleted: 1,
                updated_at: data.updated_at,
                updated_by_name: data.updated_by_name,
              }
            }),
          }
          this.$emit('handleUpdateComment', {
            last_at: this.$moment(new Date())
              .local()
              .utc()
              .format('YYYY-MM-DD HH:mm:ss'),
            last_by: this.userName,
            updated_at: data.updated_at,
            updated_by_name: data.updated_by_name,
            ...(this.comment?.replies?.data && { replies }),
            is_deleted: 1,
            content: this.comment.content,
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoading = false
        this.$refs.modalDeleteComment.hide()
      }
    },
    async deleteComment() {
      const payload = {
        social_channel_id: this.comment.social_channel_id,
        social_id: this.comment.social_id,
        ...(this.parentId?.length && { parent_id: this.parentId }),
      }
      return await this.$api.conversation.deleteConversation(payload)
    },
  },
}
</script>
