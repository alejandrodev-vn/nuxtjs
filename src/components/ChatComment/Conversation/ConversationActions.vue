<template>
  <div class="conversation-actions">
    <a-tooltip placement="bottom" overlay-class-name="custom-tooltip-light">
      <template slot="title">
        <span>
          {{ $t('add-tag-to-conversation') }}
        </span>
      </template>
      <div
        class="conversation-actions__icon conversation-actions__icon--tag"
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
        class="conversation-actions__icon conversation-actions__icon--skip"
        :class="{
          active: (isSkipped && !isEscalated) || isSkippedEscalate,
          '!cursor-default': (isSkipped && !isEscalated) || isSkippedEscalate,
        }"
        @click="handleClickSkipConversation"
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
        class="conversation-actions__icon conversation-actions__icon--reply"
        :class="{
          active:
            activeConversationId === conversation.conversation_id ||
            (isResponded && !isEscalated) ||
            isRespondedEscalate,
          '!cursor-default':
            (isResponded && !isEscalated) || isRespondedEscalate,
        }"
        @click="handleClickReplyConversation"
      >
        <i class="far fa-reply"></i>
      </div>
    </a-tooltip>
    <a-tooltip placement="bottom" overlay-class-name="custom-tooltip-light">
      <template slot="title">
        <span>
          {{ isEscalated ? $t('escalated') : $t('escalate') }}
        </span>
      </template>
      <div
        v-if="!isSkipped"
        class="conversation-actions__icon conversation-actions__icon--escalate"
        :class="{
          active: isEscalated,
        }"
        @click="handleClickEscalate"
      >
        <i class="far fa-question"></i>
      </div>
    </a-tooltip>
    <a-tooltip placement="bottom" overlay-class-name="custom-tooltip-light">
      <template slot="title">
        <span>
          {{ conversation.is_hidden ? $t('unhide') : $t('hide') }}
        </span>
      </template>
      <div
        v-if="isShowActionHide"
        class="conversation-actions__icon comment-actions__icon--hide"
        :class="{
          active: conversation.is_hidden,
        }"
        @click="handleClickHideComment"
      >
        <a-icon v-if="isLoadingHide" type="loading" />
        <i v-else class="far fa-eye-slash"></i>
      </div>
    </a-tooltip>
    <conversation-modal-tag
      :visible="isVisibleModalTag"
      :tag-edit="tagEdit"
      :keywords="keywords"
      :value-keywords="valueKeywords"
      @handleDeleteTag="handleDeleteTag"
      @handleChangeKeyword="handleChangeKeyword"
      @handleUpdateTag="handleUpdateTag"
      @closeModal="closeModal"
    />
    <app-modal
      ref="modalSkipConversation"
      type="warning"
      @confirm="handleSubmitSkipConversation"
    >
      <template #title> {{ $t('skip') }} </template>
      <template #content>{{ $t('confirm-to-skip-conversation') }} </template>
    </app-modal>
    <app-modal ref="modalEscalate" :hidden-header="true">
      <template #content>
        <div class="modal-escalate">
          <p class="modal-escalate__title">
            {{ $t('escalate-this-response') }}
          </p>
          <!-- <label for="formEscalate" class="modal-escalate__description">{{ $t('question') }}:</label> -->
          <a-form-model
            ref="formEscalate"
            class="modal-escalate__form"
            :model="formEscalate"
            :rules="rulesEscalate"
            :colon="false"
            hide-required-mark
          >
            <a-form-model-item
              ref="question"
              prop="question"
              :label="`${$t('question')}:`"
            >
              <a-textarea
                v-model="formEscalate.question"
                :auto-size="{ minRows: 5, maxRows: 10 }"
                :disabled="isEscalated"
                class="modal-escalate__input-text"
              />
            </a-form-model-item>
          </a-form-model>
        </div>
      </template>
      <template #footer>
        <a-button key="cancel" @click="handleCloseEscalate">
          {{ $t('cancel') }}
        </a-button>
        <a-button
          key="confirm"
          type="primary"
          :disabled="isLoadingEscalate || isEscalated"
          @click="handleSubmitEscalate"
        >
          <a-icon v-if="isLoadingEscalate" type="loading" />
          {{ $t('escalate') }}
        </a-button>
      </template>
    </app-modal>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
import { actionTypesComment } from '@/constants/action-types-comment'
import enumEventEmit from '@/constants/enum-event-emit'
import event from '@/utils/event'
Vue.use(notification)

export default {
  name: 'ConversationActions',
  props: {
    conversation: {
      type: Object,
      default: () => {},
    },
    activeConversationId: {
      type: Number,
      default: 0,
    },
    keywords: {
      type: Array,
      default: () => [],
    },
    isShowActionHide: {
      type: Boolean,
      default: false,
    },
    overtimeReply: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isVisibleModalTag: false,
      tagEdit: {},
      valueKeywords: [],
      formEscalate: {
        question: '',
      },
      isLoadingEscalate: false,
      isLoadingHide: false,
    }
  },
  computed: {
    rulesEscalate() {
      return {
        question: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
        ],
      }
    },
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
      return this.conversation.from_avatar?.length
        ? this.conversation.from_avatar
        : this.infoFan.avatar
    },
    configConversations() {
      return this.$store.state.configConversations
    },
    isCollapsed() {
      return this.$store.state.conversationCollapsed
    },
    noBackground() {
      return (
        this.conversation.attachments?.some((item) =>
          item.file_type.includes('sticker')
        ) || !this.conversation.content.length
      )
    },
    conversationProgress() {
      return this.conversation.conversation_mysql?.data?.progress?.data
    },
    isTagged() {
      return this.conversationProgress?.conversation_progress_tags?.data?.length
    },
    isSkipped() {
      return this.conversationProgress.histories.data.some(
        (history) =>
          history.action === this.configConversations.action_type.direct_skip
      )
    },
    isResponded() {
      return this.conversationProgress.histories.data.some(
        (history) =>
          history.action ===
          this.configConversations.action_type.direct_response
      )
    },
    isEscalated() {
      return this.conversationProgress.histories.data.some(
        (history) =>
          history.action === this.configConversations.action_type.escalated
      )
    },
    isRespondedEscalate() {
      return this.conversationProgress.histories.data.some(
        (history) =>
          history.action ===
          this.configConversations.action_type.escalate_response
      )
    },
    isSkippedEscalate() {
      return this.conversationProgress.histories.data.some(
        (history) =>
          history.action === this.configConversations.action_type.escalate_skip
      )
    },
    isShowActionSkip() {
      return (
        (!this.isResponded && !this.isEscalated) ||
        (this.isEscalated && !this.isRespondedEscalate)
      )
    },
    isShowActionResponse() {
      if (!this.overtimeReply) {
        return (
          (!this.isSkipped && !this.isEscalated) ||
          (this.isEscalated && !this.isSkippedEscalate)
        )
      } else {
        return (
          (this.isResponded && !this.isEscalated) || this.isRespondedEscalate
        )
      }
    },
    contentTooltipSkip() {
      if (this.isSkippedEscalate) return this.$t('skipped-escalate')
      if (this.isSkipped && !this.isEscalated) return this.$t('skipped')
      return this.$t('skip')
    },
    contentTooltipResponse() {
      if (this.isRespondedEscalate) return this.$t('responded-escalate')
      if (this.isResponded && !this.isEscalated) return this.$t('responded')
      return this.$t('response')
    },
    breadcrumbs() {
      let result = ''
      if (this.isTagged) {
        result = `${this.$t('tagged')}`
        if (this.isSkipped) {
          result = `${this.$t('tagged')} > ${this.$t('skipped')}`
        }
        if (this.isResponded) {
          result = `${this.$t('tagged')} > ${this.$t('responded')}`
        }
        if (this.isEscalated) {
          result = `${this.$t('tagged')} > ${this.$t('escalated')}`
        }
        if (this.isRespondedEscalate) {
          result = `${this.$t('tagged')} > ${this.$t('escalated')} > ${this.$t(
            'responded-escalate'
          )}`
        }
        if (this.isSkippedEscalate) {
          result = `${this.$t('tagged')} > ${this.$t('escalated')} > ${this.$t(
            'skipped-escalate'
          )}`
        }
      }
      return result
    },
  },
  watch: {
    message: {
      deep: true,
      immediate: true,
      handler() {
        this.tagEdit = this.conversationProgress?.conversation_progress_tags
          ?.data?.length
          ? {
              ...this.conversationProgress.conversation_progress_tags.data[0]
                .tag.data,
              sentiment:
                this.conversationProgress.conversation_progress_tags.data[0]
                  .sentiment,
            }
          : {}
        this.valueKeywords = this.conversationProgress
          ?.conversation_progress_keywords?.data?.length
          ? this.conversationProgress.conversation_progress_keywords.data.map(
              (item) => item.keyword.data.id
            )
          : []
        const escalate = this.conversationProgress.histories.data.find(
          (item) =>
            item.action === this.configConversations.action_type.escalated
        )
        if (escalate) {
          this.formEscalate.question = escalate.payload.message
        }
      },
    },
    breadcrumbs: {
      immediate: true,
      handler() {
        this.$emit('handleChangeBreadcrumbs', this.breadcrumbs)
      },
    },
  },
  methods: {
    handleSubmitEscalate() {
      try {
        if (this.isEscalated) return
        this.$refs.formEscalate.validate(async (valid) => {
          if (valid) {
            this.isLoadingEscalate = true
            const payload = {
              actions: {
                hide: 0,
                like: 0,
                reply: 0,
                question: 1,
              },
              message: this.formEscalate.question,
              social_channel_id: this.socialChannelId,
            }
            await this.$api.conversation.escalateConversationFb(
              this.conversation.conversation_id,
              payload
            )
            this.$emit('handleUpdateHistories', {
              action: this.configConversations.action_type.escalated,
              payload,
            })
            event.$emit(enumEventEmit.conversation.UPDATE_COUNT_GUEST, {
              guestId: this.conversation.from_id,
              payload: {
                total_pending: this.isResponded ? 0 : -1,
                total_waiting: 1,
              },
              ...(this.conversation.social_post_id?.length && {
                socialPostId: this.conversation.social_post_id,
              }),
            })
            this.handleCloseEscalate()
          }
        })
      } catch (e) {
      } finally {
        this.isLoadingEscalate = false
      }
    },
    handleCloseEscalate() {
      this.$refs.modalEscalate.hide()
    },
    handleClickEscalate() {
      if (this.isLockedByOtherUser || !this.isActivePage) return
      if (
        !this.conversationProgress?.conversation_progress_tags?.data?.length
      ) {
        return notification.warning({
          message: this.$t(
            'data-tags-empty-please-tag-before-skipping-or-response'
          ),
          class: 'notification-warning',
        })
      }
      this.$refs.modalEscalate.show()
    },
    handleClickSkipConversation() {
      if (
        this.isLockedByOtherUser ||
        !this.isActivePage ||
        (this.isSkipped && !this.isEscalated) ||
        this.isSkippedEscalate
      )
        return
      if (
        !this.conversationProgress?.conversation_progress_tags?.data?.length
      ) {
        return notification.warning({
          message: this.$t(
            'data-tags-empty-please-tag-before-skipping-or-response'
          ),
          class: 'notification-warning',
        })
      }
      this.$emit('handleCancelReplyConversation')
      this.$refs.modalSkipConversation.show()
    },
    async handleSubmitSkipConversation() {
      try {
        const payload = {
          social_channel_id: this.socialChannelId,
          actions: {
            hide: 0,
            like: 0,
          },
        }
        await this.$api.conversation.skipConversationFb(
          this.conversation.conversation_id,
          payload
        )
        notification.success({
          message: this.$t('skipped-successfully'),
          class: 'notification-success',
        })
        this.$emit('handleUpdateHistories', {
          action: this.isEscalated
            ? this.configConversations.action_type.escalate_skip
            : this.configConversations.action_type.direct_skip,
        })
        event.$emit(enumEventEmit.conversation.UPDATE_COUNT_GUEST, {
          guestId: this.conversation.from_id,
          payload: {
            total_pending: this.isEscalated ? 0 : -1,
            total_waiting: this.isEscalated ? -1 : 0,
          },
          ...(this.conversation.social_post_id?.length && {
            socialPostId: this.conversation.social_post_id,
          }),
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-success',
        })
      } finally {
        this.$refs.modalSkipConversation.hide()
      }
    },
    handleClickReplyConversation() {
      if (
        this.isLockedByOtherUser ||
        !this.isActivePage ||
        (this.isResponded && !this.isEscalated) ||
        this.isRespondedEscalate
      )
        return
      if (
        !this.conversationProgress?.conversation_progress_tags?.data?.length
      ) {
        return notification.warning({
          message: this.$t(
            'data-tags-empty-please-tag-before-skipping-or-response'
          ),
          class: 'notification-warning',
        })
      }
      this.$emit('handleClickReplyConversation')
    },
    handleClickTag() {
      if (this.isLockedByOtherUser || !this.isActivePage) return
      this.isVisibleModalTag = true
    },
    closeModal() {
      this.isVisibleModalTag = false
    },
    async handleUpdateTag(tag, sentiment) {
      try {
        if (
          !tag?.id ||
          !this.socialChannelId ||
          this.isLockedByOtherUser ||
          !this.isActivePage
        )
          return
        const payload = {
          social_channel_id: this.socialChannelId,
          tags: [
            {
              tag_id: tag.id,
              sentiment,
            },
          ],
        }
        const { data } = await this.$api.conversation.addTagToConversation(
          this.conversation.conversation_id,
          payload
        )
        if (data) {
          this.tagEdit = {
            ...data.progress.data.conversation_progress_tags.data[0].tag.data,
            sentiment:
              data.progress.data.conversation_progress_tags.data[0].sentiment,
          }
          notification.success({
            message: this.$t('add-tag-successfully'),
            class: 'notification-success',
          })
          this.$emit('handleUpdateConversationProgress', data)
        }
      } catch (e) {
        return notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async handleChangeKeyword(value) {
      try {
        if (
          !this.socialChannelId ||
          this.isLockedByOtherUser ||
          !this.isActivePage
        )
          return
        const payload = {
          social_channel_id: this.socialChannelId,
          keywords: [...value],
        }
        const { data } = await this.$api.conversation.addTagToConversation(
          this.conversation.conversation_id,
          payload
        )
        if (data) {
          this.valueKeywords = [...value]
          this.$emit('handleUpdateConversationProgress', data)
        }
      } catch (e) {
        return notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async handleDeleteTag() {
      try {
        if (
          !this.socialChannelId ||
          this.isLockedByOtherUser ||
          !this.isActivePage
        )
          return
        const cannotDelete = this.conversationProgress.histories.data.some(
          (history) =>
            history.action ===
              this.configConversations.action_type.direct_response ||
            history.action ===
              this.configConversations.action_type.direct_skip ||
            history.action === this.configConversations.action_type.escalated
        )
        if (cannotDelete) {
          return notification.error({
            message: this.$t('error-delete-conversation-tag'),
            class: 'notification-error',
          })
        }
        const payload = {
          social_channel_id: this.socialChannelId,
          tags: [],
        }
        const { data } = await this.$api.conversation.addTagToConversation(
          this.conversation.conversation_id,
          payload
        )
        if (data) {
          this.tagEdit = {}
          notification.success({
            message: this.$t('delete-tag-successfully'),
            class: 'notification-success',
          })
          this.$emit('handleDeleteTag')
        }
      } catch (e) {
        return notification.error({
          message: this.$t('error-delete-conversation-tag'),
          class: 'notification-error',
        })
      }
    },
    async handleClickHideComment() {
      if (!this.isActivePage || this.isLockedByOtherUser || this.isLoadingHide)
        return
      try {
        this.isLoadingHide = true
        const type =
          this.conversation.is_hidden === actionTypesComment.UNHIDE
            ? actionTypesComment.HIDE
            : actionTypesComment.UNHIDE
        const payload = {
          hide: type,
          social_channel_id: this.conversation.social_channel_id,
        }
        const { data } = await this.$api.conversation.updateConversation(
          this.conversation.conversation_id,
          payload
        )
        if (data) {
          this.$emit('handleUpdateComment', data)
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoadingHide = false
      }
    },
  },
}
</script>
<style lang="less" scoped>
.conversation-actions {
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
  }
}
.modal-escalate {
  &__title {
    font-size: @size-2;
    color: @black;
    @apply font-semibold text-center;

    i {
      font-size: 2.4rem;
      color: @primary;
      vertical-align: middle;
      margin-right: 0.5rem;
    }
  }

  &__description {
    font-size: @size-4;
    color: @gray-3;
    margin-top: 0.75rem;
    @apply text-center;
  }

  &__form {
    /deep/.ant-form-item-label {
      label {
        font-size: 1.4rem;
        color: @black;
      }
    }
  }
}
</style>
