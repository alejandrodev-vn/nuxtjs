<template>
  <div
    v-show="!(!isCanSend && !isSent)"
    class="button-actions-send-message"
    @click="handleClick"
  >
    {{ titleButton }}

    <app-modal ref="modalSendMessage" :hidden-header="true">
      <template #content>
        <div class="modal-content-send-message">
          <div class="modal-content-send-message__title">
            <i class="fab fa-facebook-messenger"></i>
            {{ $t('send-message') }}
          </div>
          <div class="modal-content-send-message__description">
            {{
              $t('send-a-private-reply-to-name’s-comment-in-the-chat', {
                name: comment.from_name,
              })
            }}
          </div>
          <a-form-model
            ref="formSendMessage"
            :model="form"
            :rules="rules"
            :colon="false"
          >
            <a-form-model-item ref="messageGuest" prop="messageGuest">
              <a-textarea
                v-model="form.messageGuest"
                :rows="5"
                class="modal-content-send-message__form"
              />
            </a-form-model-item>
          </a-form-model>
        </div>
      </template>
      <template #footer>
        <a-button key="cancel" @click="handleCloseSendMessage">
          {{ $t('cancel') }}
        </a-button>
        <a-button
          key="confirm"
          type="primary"
          :disabled="loading"
          @click="handleConfirmSendMessage"
        >
          <a-icon v-if="loading" type="loading" />
          {{ $t('send-message') }}
        </a-button>
      </template>
    </app-modal>
    <app-modal ref="modalWarningKeyword">
      <template #title> {{ $t('warning') }} </template>
      <template #content>
        <div>
          <div>
            {{
              $t('modal-warning-keyword', {
                number: listWarning.length,
                keywords: listWarning.slice(0, limit).join(', '),
              })
            }}
            <a-tooltip
              v-if="listWarning.length > limit"
              overlay-class-name="custom-tooltip-light"
            >
              <template slot="title">
                {{ listWarning.slice(limit, listWarning.length).join(', ') }}
              </template>
              , ...
            </a-tooltip>
            <template v-else>.</template>
          </div>
          <div>{{ $t('confirm-send-message-warning-keyword') }}</div>
        </div>
      </template>
      <template #footer>
        <a-button key="cancel" @click="handleCancelModalWarningKeyword">
          {{ $t('cancel') }}
        </a-button>
        <a-button
          key="confirm"
          type="primary"
          :disabled="loading"
          @click="handleSubmit"
        >
          <a-icon v-if="loading" type="loading" />
          {{ $t('confirm') }}
        </a-button>
      </template>
    </app-modal>
    <app-modal ref="modalBannedKeyword">
      <template #title> {{ $t('banned-keyword') }} </template>
      <template #content>
        <div>
          <div>
            {{
              $t('modal-banned-keyword', {
                number: listBanned.length,
                keywords: listBanned.slice(0, limit).join(', '),
              })
            }}
            <a-tooltip
              v-if="listBanned.length > limit"
              overlay-class-name="custom-tooltip-light"
            >
              <template slot="title">
                {{ listBanned.slice(limit, listBanned.length).join(', ') }}
              </template>
              , ...
            </a-tooltip>
            <template v-else>.</template>
          </div>
          <div>{{ $t('please-try-again') }}</div>
        </div>
      </template>
      <template #footer>
        <a-button key="cancel" @click="handleCancelModalBannedKeyword">
          {{ $t('cancel') }}
        </a-button>
      </template>
    </app-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { get, union } from 'lodash'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'ButtonActionsSendMessage',
  props: {
    comment: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      limit: 3,
      isCanSend: true,
      isSent: false,
      loading: false,
      form: {
        messageGuest: '',
      },
      rules: {
        messageGuest: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            max: 2000,
            message: this.$t('messages-cannot-exceed-number-characters', {
              number: 2000,
            }),
            trigger: 'blur',
          },
        ],
      },
      listWarning: [],
      listBanned: [],
    }
  },
  computed: {
    titleButton() {
      return this.isCanSend
        ? this.$t('send-message')
        : this.isSent
        ? this.$t('see-response')
        : ''
    },
  },
  mounted() {
    this.isCanSend = this.comment.can_reply_privately
    this.isSent = !this.isCanSend && this.comment.reference_id
  },
  methods: {
    handleOpenSendMessage() {
      this.$refs.modalSendMessage.show()
    },
    handleCloseSendMessage() {
      this.$refs.modalSendMessage.hide()
    },
    handleClick() {
      if (this.isCanSend) {
        this.handleOpenSendMessage()
      } else {
        const pageId = this.$route.params.page
        const guestId = this.$route.params.guest
        this.$router.push(
          this.localePath({
            path: `/conversations/chat-comment/${pageId}/chat/${guestId}`,
          })
        )
      }
    },
    handleConfirmSendMessage() {
      this.$refs.formSendMessage.validate((valid) => {
        if (valid) {
          this.checkUnsafeKeyword()
        }
      })
    },
    checkUnsafeKeyword() {
      this.listWarning = []
      this.listBanned = []
      const listUnsafeKeywords = this.$store.state.unsafeKeywords
      listUnsafeKeywords.forEach((item) => {
        const message = this.form.messageGuest.toLowerCase()
        const isUnsafeKeyword = message.includes(
          item.disallow_keyword.toLowerCase()
        )
        if (isUnsafeKeyword && item.type === 1) {
          this.listWarning = [...this.listWarning, `"${item.disallow_keyword}"`]
        } else if (isUnsafeKeyword && item.type === 2) {
          this.listBanned = [...this.listBanned, `"${item.disallow_keyword}"`]
        }
      })
      union(this.listWarning)
      union(this.listBanned)

      this.handleNextStep()
    },
    handleCancelModalWarningKeyword() {
      this.$refs.modalWarningKeyword.hide()
      this.handleOpenSendMessage()
    },
    handleCancelModalBannedKeyword() {
      this.$refs.modalBannedKeyword.hide()
      this.handleOpenSendMessage()
    },
    handleNextStep() {
      if (!this.listWarning.length && !this.listBanned.length) {
        this.handleSubmit()
      } else if (this.listBanned.length) {
        this.handleCloseSendMessage()
        this.$refs.modalBannedKeyword.show()
      } else if (this.listWarning.length) {
        this.handleCloseSendMessage()
        this.$refs.modalWarningKeyword.show()
      }
    },
    async handleSubmit() {
      this.loading = true
      try {
        const channel =
          get(this.$store.state.currentInfoFan, 'channel_type.data.code', '') ||
          ''
        const typeChannel = channel === 'facebook' ? 'fb' : 'ig'
        const payload = {
          id: this.comment.conversation_id,
          social_channel_id: this.comment.social_channel_id,
          content: this.form.messageGuest,
          actions: {
            send_private_message: 1,
          },
        }

        const { data } = await this.$api.conversation.sendMessage(
          typeChannel,
          this.comment.conversation_id,
          payload
        )

        if (data) {
          this.isCanSend = false
          this.isSent = true
          this.form.messageGuest = ''
          this.listWarning = []
          this.listBanned = []
          this.handleCloseSendMessage()
          this.$refs.modalWarningKeyword.hide()
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.button-actions-send-message {
  font-size: @size-14;
  color: @grey;
  font-weight: 500;
  @apply inline-block cursor-pointer mr-2 duration-500;
  &:hover,
  &.active {
    color: @primary;
  }
  &.disabled {
    cursor: not-allowed;
  }
}

.modal-content-send-message {
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
    height: auto !important;
    margin-top: 1.5rem;
    font-size: @size-4;
    color: @gray-3;
  }
}
</style>
