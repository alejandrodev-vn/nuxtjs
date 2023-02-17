<template>
  <div
    class="message-response"
    :class="{
      isCollapsed,
    }"
  >
    <div class="type-text">
      <div class="message-response__left">
        <div
          class="message-response__left__content"
          :class="{
            'no-bg': noBackground,
            unsupport: isUnsupportMessage,
            failed: message.reply_status && message.reply_status === 2,
          }"
        >
          <template v-if="isUnsupportMessage">
            <p>
              {{ $t('unsupported-message-type') }}
            </p>
            <a-icon
              v-if="isUnsupportMessage"
              type="exclamation-circle"
              class="icon-warning"
            />
          </template>
          <p v-else v-html="message.content"></p>
          <a-icon
            v-if="message.reply_status && message.reply_status === 2"
            type="exclamation-circle"
            class="icon-failed"
          />
          <div
            v-for="(attachment, index) in message.attachments"
            :key="index"
            class="attachment"
          >
            <div
              v-if="
                attachment.file_type.includes('photo') ||
                attachment.file_type.includes('image')
              "
              class="attachment-img"
              @click="handlePreviewImage(attachment.file_url)"
            >
              <img :src="attachment.file_url" :alt="attachment.file_url" />
            </div>
            <div
              v-else-if="attachment.file_type.includes('shopee/sticker')"
              class="attachment-sticker"
            >
              <img
                :src="getShopeeStickerByCDN(attachment.file_url)"
                :alt="attachment.file_url"
              />
            </div>
            <div
              v-else-if="
                attachment.file_type.includes('video') ||
                attachment.file_url.includes('.mp4')
              "
              class="attachment-video"
            >
              <video controls>
                <source :src="attachment.file_url" />
              </video>
            </div>
            <a
              v-else
              :href="attachment.file_url"
              target="_blank"
              class="attachment-file"
            >
              <div class="attachment-file__thumb">
                <a-icon type="file-text" theme="filled" />
              </div>
              <div class="attachment-file__name">
                <p>{{ attachment.file_url }}</p>
              </div>
            </a>
          </div>
        </div>
        <div class="message-response__left__info-message">
          <span class="message-response__left__info-message--bold">
            {{ message.updated_by_name }} </span
          ><span>{{ formatTime(message.publish_time) }}</span>
        </div>
      </div>
      <div class="message-response__right">
        <app-avatar
          :image="message.form_avatar"
          :full-name="message.updated_by_name"
          size="large"
        />
      </div>
    </div>
    <a-modal
      v-model="visiblePreviewImage"
      centered
      :closable="false"
      :footer="null"
      destroy-on-close
    >
      <img :src="previewImage" alt="" />
    </a-modal>
  </div>
</template>
<script>
export default {
  name: 'MessageResponse',
  props: {
    message: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      thumbnailSrc: null,
      previewImage: null,
      visiblePreviewImage: false,
    }
  },
  computed: {
    configConversations() {
      return this.$store.state.configConversations
    },
    isCollapsed() {
      return this.$store.state.conversationCollapsed
    },
    isUnsupportMessage() {
      return this.message.content_types?.some(
        (type) =>
          parseInt(type) === this.configConversations.content_type.unknown
      )
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
    handlePreviewImage(src) {
      this.previewImage = src
      this.visiblePreviewImage = true
    },
    formatTime(time) {
      return this.$moment.utc(time).local().format('hh:mm A DD/MM/YYYY')
    },
  },
}
</script>
<style lang="less" scoped>
.message-response {
  max-width: 45%;
  @apply flex justify-end my-6 ml-auto mr-4;

  &.isCollapsed {
    max-width: 90%;
  }

  &__right {
    @apply ml-4;
    /deep/.ant-avatar {
      width: 4rem;
      height: 4rem;
      font-size: @size-16 !important;
      @apply flex items-center justify-center;
    }
  }
  &__left {
    &__content {
      color: @black;
      background-color: @gray-6;
      font-size: @size-16;
      padding: @padding-8 @padding-12;
      &.failed {
        background-color: @red-2;
        border: 1px solid @red;
        p {
          color: @red;
        }
      }
      @apply rounded-md relative;
      p {
        word-break: break-word;
        white-space: pre-line;
        @apply m-0;
      }
      &.no-bg {
        background-color: unset;
      }
      .icon-warning {
        color: #ff9600;
        left: -20px;
        @apply absolute bottom-0;
      }
      .icon-failed {
        color: @red;
        left: -20px;
        @apply absolute bottom-0;
      }
      /deep/&.unsupport {
        border: 1px solid #ff9600;
        color: #ff9600;
        background-color: @yellow-2;
      }
    }
    .attachment {
      @apply rounded-md my-2;
      &-img {
        border: 1px solid @gray-4;
        max-width: 30rem;
        max-height: 30rem;
        background-color: @white;
        @apply cursor-pointer rounded-md overflow-hidden;
      }
      &-video {
        border: 1px solid @gray-4;
        max-width: 30rem;
        max-height: 30rem;
        background-color: @white;
        @apply rounded-md overflow-hidden;
      }
      &-sticker {
        width: 15rem;
        height: 15rem;
        background-color: @white;
        @apply rounded-md overflow-hidden;
      }
      &-file {
        background-color: #0112221a;
        height: 45px;
        border-radius: 5px;
        @apply p-2 flex items-center overflow-hidden cursor-pointer;
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
            width: 60px;
            font-size: @size-10;
            color: @black;
            @apply m-0 truncate;
          }
        }
      }
    }
    &__info-message {
      @apply flex items-center;
      span {
        font-size: @size-12;
        color: @gray-4;
        @apply mt-2 px-2;
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
  .type-text {
    @apply flex;
  }
}
</style>
