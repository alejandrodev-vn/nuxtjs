<template>
  <div class="conversation-bottom">
    <transition name="float-up" mode="out-in">
      <embedded-message
        v-if="activeMessage"
        :active-message="activeMessage"
        @handleCancelReplyMessage="handleCancelReplyMessage"
      />
    </transition>
    <a-button
      type="secondary"
      class="conversation-bottom__lock"
      :disabled="!canUnblock"
      @click="openModalUnblock"
    >
      <a-icon type="lock" />
    </a-button>
    <div class="conversation-bottom__form">
      <div v-if="fileList.length && listPreview.length" class="preview-list">
        <div
          v-for="(file, index) in listPreview"
          :key="index"
          class="custom-preview"
        >
          <a-icon
            class="btn-delete-file"
            type="close"
            @click="handleDeleteFile(index)"
          />
          <img
            v-if="file.type === 'image'"
            :src="file.blob"
            :alt="file.name"
            @click="handleOpenPreviewFile(file.blob)"
          />
          <video
            v-else-if="file.type === 'video'"
            :src="file.blob"
            @click="handleOpenPreviewFile(file.blob)"
          >
            <source :src="file.blob" type="video" />
          </video>
          <div
            v-else
            class="file-item"
            @click="handleOpenPreviewFile(file.blob)"
          >
            <div class="file-item__thumb">
              <a-icon type="file-text" theme="filled" />
            </div>
            <div class="file-item__name">
              <p>{{ file.name }}</p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="form-enter"
        :class="{ disable: isLock || isOvertime || !activeMessageId }"
      >
        <a-textarea
          id="formChat"
          v-model="content"
          size="large"
          class="custom-textarea"
          :auto-size="{ minRows: 1, maxRows: 6 }"
          :disabled="isLock || isOvertime || !activeMessageId"
          @pressEnter="handlePressEnter"
        >
        </a-textarea>
        <sticker-shopee
          v-if="isShowStickerShopee"
          :disabled="isLock || isOvertime || !activeMessageId"
          @handleClickSticker="handleClickSticker"
        />
        <input
          id="attachmentFile"
          ref="attachmentFile"
          :style="{ display: 'none' }"
          type="file"
          class="button-upload__input"
          :accept="acceptFile"
          :disabled="isLock || isOvertime || !activeMessageId"
          @change="handleUploadImage"
        />
        <label for="attachmentFile">
          <icon-attach
            class="icon-attach"
            :class="{ disable: isLock || isOvertime || !activeMessageId }"
          />
        </label>
      </div>
    </div>
    <a-button
      class="conversation-bottom__submit"
      type="primary"
      :class="{ disable: isLock || isOvertime || !activeMessageId }"
      @click="handleSubmitReplyMessage"
    >
      <icon-send class="icon-send" />
    </a-button>
    <app-modal
      ref="modalWarningUnsafeKeyword"
      :cancel-text="$t('cancel')"
      :ok-text="$t('confirm')"
      @confirm="handleConfirmWarningToReplyMessage"
    >
      <template #title> {{ $t('warning') }} </template>
      <template #content>
        {{
          $t('content-warning-keyword', {
            keywords: getStringKeywordWarning,
          })
        }}
      </template>
    </app-modal>
    <app-modal ref="modalBannedUnsafeKeyword">
      <template #title> {{ $t('banned-keyword') }} </template>
      <template #content>
        {{
          $t('content-banned-keyword', {
            keywords: getStringKeywordBanned,
          })
        }}
      </template>
      <template slot="footer">
        <a-button key="cancel" @click="handleCancelModalBanned">
          {{ $t('cancel') }}
        </a-button>
      </template>
    </app-modal>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { get } from 'lodash'
import event from '@/utils/event'
Vue.use(notification)

export default {
  name: 'ChatCommentFormChat',
  props: {
    activeMessageId: {
      type: Number,
      default: 0,
    },
    activeMessage: {
      type: Object,
      default: null,
    },
    isLock: {
      type: Boolean,
      default: false,
    },
    isOvertime: {
      type: Boolean,
      default: false,
    },
    canUnblock: {
      type: Boolean,
      default: false,
    },
    unsafeKeywords: {
      type: Array,
      default: () => [],
    },
    infoPage: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      content: '',
      containUnsafeKeywords: [],
      typeModalUnsafeKeyword: '',
      getStringKeywordWarning: '',
      getStringKeywordBanned: '',
      fileList: [],
      listPreview: [],
      acceptFile: '.png, .jpg, .jpeg',
    }
  },
  computed: {
    isChat() {
      return this.$store.state.conversationType
    },
    isShowStickerShopee() {
      return this.infoPage?.channel_type?.data?.code === 'shopee'
    },
  },
  watch: {
    containUnsafeKeywords() {
      this.getStringKeywordWarning = this.containUnsafeKeywords
        .filter((keyword) => keyword.type === 1)
        .map((keyword) => keyword.disallow_keyword)
        .join(', ')
      this.getStringKeywordBanned = this.containUnsafeKeywords
        .filter((keyword) => keyword.type === 2)
        .map((keyword) => keyword.disallow_keyword)
        .join(', ')
    },
    infoPage() {
      const codeChannelType = get(
        this.infoPage,
        'channel_type.data.code',
        'instagram'
      )
      const configAcceptFile = [
        {
          code: 'facebook',
          acceptFile:
            'audio/*,video/*,.png, .jpg, .jpeg,.pdf,.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        {
          code: 'instagram',
          acceptFile: '.png, .jpg, .jpeg',
        },
      ]
      const find = configAcceptFile.find(
        (item) => item.code === codeChannelType
      )
      if (find) return (this.acceptFile = find.acceptFile)
      this.acceptFile = '.png, .jpg, .jpeg'
    },
  },
  created() {
    if (this.infoPage) {
      const codeChannelType = get(
        this.infoPage,
        'channel_type.data.code',
        'instagram'
      )
      const configAcceptFile = [
        {
          code: 'facebook',
          acceptFile:
            'audio/*,video/*,.png, .jpg, .jpeg,.pdf,.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        {
          code: 'instagram',
          acceptFile: '.png, .jpg, .jpeg',
        },
      ]
      const find = configAcceptFile.find(
        (item) => item.code === codeChannelType
      )
      if (find) return (this.acceptFile = find.acceptFile)
      this.acceptFile = '.png, .jpg, .jpeg'
    }
  },
  mounted() {
    event.$on('useResponseTemplate', this.handleUseResponseTemplate)
  },
  destroyed() {
    event.$off('useResponseTemplate')
  },
  methods: {
    handleCancelReplyMessage() {
      this.$emit('handleCancelReplyMessage')
    },
    handleClickSticker(packageId, id) {
      this.$emit('handleClickSticker', packageId, id)
    },
    openModalUnblock() {
      if (!this.canUnblock) return
      this.$emit('openModalUnblock')
    },
    handlePressEnter(e) {
      if (e.shiftKey) return
      if (e.ctrlKey) return (this.content += '\n')
      this.handleSubmitReplyMessage()
      e.preventDefault()
    },
    checkKeyword() {
      const matched = this.unsafeKeywords.filter(
        (item) =>
          (!item.conversation_type || item.conversation_type === 1) &&
          this.content
            .toLowerCase()
            .includes(item.disallow_keyword.toLowerCase())
      )
      this.containUnsafeKeywords = matched
    },
    handleConfirmWarningToReplyMessage() {
      if (this.isOvertime) return
      const listIdUnsafeKeywords = this.containUnsafeKeywords.map(
        (keyword) => keyword.id
      )
      this.$emit('handleSubmitReplyMessage', {
        content: this.content,
        unsafeKeywords: listIdUnsafeKeywords.length,
        ...(this.fileList.length && { fileList: [...this.fileList] }),
        ...(this.listPreview.length && { listPreview: [...this.listPreview] }),
      })
      this.content = ''
      this.fileList.splice(0)
      this.listPreview.splice(0)
      const inputFile = this.$el.querySelector('#attachmentFile')
      if (inputFile) {
        inputFile.value = ''
      }
      this.$refs.modalWarningUnsafeKeyword.hide()
    },
    handleSubmitReplyMessage() {
      if (this.isOvertime) return
      this.content = this.content.replace(/\n*$/, '').trimStart().trimEnd()
      if (!this.content.length && !this.fileList.length) return
      this.checkKeyword()
      if (this.containUnsafeKeywords.length) {
        const isBanned = this.containUnsafeKeywords.some(
          (keyword) => keyword.type === 2
        )
        if (isBanned) {
          this.$refs.modalBannedUnsafeKeyword.show()
        } else {
          this.$refs.modalWarningUnsafeKeyword.show()
        }
        return
      }
      this.$emit('handleSubmitReplyMessage', {
        content: this.content,
        ...(this.fileList.length && { fileList: [...this.fileList] }),
        ...(this.listPreview.length && { listPreview: [...this.listPreview] }),
      })
      this.content = ''
      this.fileList.splice(0)
      this.listPreview.splice(0)
      const inputFile = this.$el.querySelector('#attachmentFile')
      if (inputFile) {
        inputFile.value = ''
      }
    },
    handleUseResponseTemplate(value) {
      if (!value.length || this.isOvertime) return
      this.content = value
    },
    handleCancelModalBanned() {
      this.$refs.modalBannedUnsafeKeyword.hide()
    },
    handleCancel() {
      this.previewVisible = false
    },
    handleUploadImage(e) {
      const file = e.target.files[0] || null
      if (file) {
        const fileSize = file.size / 1024 / 1024
        if (fileSize > 20) {
          notification.error({
            message: `${this.$t('upload-max-size-attachment', {
              size: '20MB',
            })}!`,
            class: 'notification-error',
          })
          return
        }
        const type = file.type.includes('image')
          ? 'image'
          : file.type.includes('video')
          ? 'video'
          : 'file'
        this.listPreview = [
          {
            blob: URL.createObjectURL(file),
            type,
            name: file.name,
            file_type: type,
            file_url: URL.createObjectURL(file),
          },
        ]
        this.fileList = [file]
      }
    },
    handleDeleteFile(indexDelete) {
      this.listPreview = this.listPreview.filter(
        (file, index) => indexDelete !== index
      )
      this.fileList = this.fileList.filter(
        (file, index) => indexDelete !== index
      )
      const fileInput = this.$el.querySelector('#attachmentFile')
      if (fileInput) {
        fileInput.value = null
      }
    },
    handleOpenPreviewFile(fileBlob) {
      window.open(fileBlob, '_blank')
    },
  },
}
</script>
<style lang="less" scoped>
.conversation {
  &-bottom {
    min-height: 8%;
    background-color: @white;
    padding-inline: @padding-24;
    padding-block: @padding-8 @padding-12;
    @apply relative z-10 flex items-center justify-center;
    &__lock {
      background-color: @red-2;
      border-color: @red;
      color: @red;
      height: 3.6rem;
      width: 3.6rem;
      font-size: @size-14;
      @apply rounded-xl p-0 flex-shrink-0;
    }
    &__form {
      width: 85%;
      border-color: @gray-3;
      border-radius: 22px;
      margin-inline: @margin-16;
      @apply z-10 border overflow-hidden;
      .form-enter {
        background-color: @white;
        min-height: 3.6rem;
        @apply flex items-end pr-4;
        &.disable {
          background-color: #f5f5f5;
          cursor: not-allowed;
          filter: grayscale();
        }
      }
      /deep/.custom-textarea {
        resize: none;
        border: none !important;
        box-shadow: none !important;
        border-radius: 22px;
        min-height: 3.6rem !important;
        padding: @padding-8;
        @apply w-full;
        &::-webkit-scrollbar {
          width: 6px;
          &:hover {
            width: 11px;
          }
        }
        &::-webkit-scrollbar-track {
          background-color: #eee;
          border-radius: 6px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: #aaa;
          border-radius: 6px;
          &:hover {
            background-color: #999;
          }
        }
      }
      .icon-attach {
        width: @size-12;
        margin-bottom: @margin-8;
        @apply ml-2 cursor-pointer;
        &.disable {
          filter: invert();
          cursor: not-allowed;
        }
      }
      .preview-list {
        @apply w-full flex flex-wrap items-center m-2 mb-4 cursor-pointer;
      }
      .custom-preview {
        padding: 0.5rem;
        height: 4.5rem;
        @apply relative mb-2;
        img,
        video {
          width: 4.5rem;
          height: 4.5rem;
          object-fit: cover;
          border-bottom: 4px solid @green;
          border-radius: 5px;
        }
        .btn-delete-file {
          font-size: @size-12;
          color: #323232;
          background-color: #f3f3f3;
          padding: 0.3rem;
          @apply absolute top-0 right-0 duration-500 cursor-pointer rounded-full;
          &:hover {
            color: @red;
            transform: scale(1.2);
          }
        }
        .file-item {
          background-color: #0112221a;
          height: 4.5rem;
          border-bottom: 4px solid @green;
          border-radius: 5px;
          @apply p-2 flex items-center justify-center overflow-hidden;
          &__thumb {
            width: 3.5rem;
            height: 3.5rem;
            background-color: @white;
            @apply flex items-center justify-center rounded-full mr-2;
            .anticon {
              font-size: @size-15;
              color: @black;
            }
          }
          &__name {
            p {
              width: 6rem;
              font-size: @size-10;
              color: @black;
              @apply m-0 truncate;
            }
          }
        }
      }
    }
    &__submit {
      width: 3.6rem;
      height: 3.6rem;
      text-align: -webkit-center;
      @apply flex items-center justify-center rounded-full p-0 flex-shrink-0;
      .icon-send {
        width: @size-20;
        height: @size-20;
      }
      &.disable {
        filter: grayscale();
        cursor: not-allowed;
      }
    }
  }
}
</style>
