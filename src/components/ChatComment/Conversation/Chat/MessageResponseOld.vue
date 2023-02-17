<template>
  <div
    class="message-response"
    :class="{ isCollapsed, failed: action.status && action.status === 2 }"
  >
    <div class="message-response__left">
      <div
        class="message-response__right__wrap-content"
        :class="{ 'no-bg': !action.content.length }"
      >
        <a-icon
          v-if="action.status && action.status === 2"
          type="exclamation-circle"
          class="icon-failed"
        />
        <div
          v-if="action.content.length"
          class="content"
          v-html="action.content"
        >
          {{ action.content }}
        </div>
        <div
          v-for="(attachment, index) in action.attachments"
          :key="index"
          class="attachment"
        >
          <div
            v-if="attachment.file_type.includes('image')"
            class="attachment-img"
          >
            <img :src="attachment.file_url" :alt="attachment.file_url" />
          </div>
          <div
            v-if="attachment.file_type.includes('shopee/sticker')"
            class="attachment-sticker"
          >
            <img
              :src="getShopeeStickerByCDN(attachment.file_url)"
              :alt="attachment.file_url"
            />
          </div>
          <div
            v-if="attachment.file_type.includes('video')"
            class="attachment-video"
          >
            <video controls>
              <source :src="attachment.file_url" />
            </video>
          </div>
          <a
            v-if="attachment.file_type.includes('file')"
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
      <div class="message-response__right__info-message">
        <span class="message-response__right__info-message--bold">
          {{ action.updated_by_name ? action.updated_by_name : action.last_by }}
        </span>
        <span>
          {{ formatTime(publishTime) }}
        </span>
      </div>
    </div>
    <div class="message-response__right">
      <app-avatar
        :image="action.from_avatar ? action.from_avatar : action.last_by_avatar"
        :full-name="
          action.updated_by_name ? action.updated_by_name : action.last_by
        "
        size="large"
      />
    </div>
  </div>
</template>
<script>
import event from '@/utils/event'
import { domainStickerShopee } from '@/constants/shopee'

export default {
  name: 'MessageResponse',
  props: {
    action: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    infoPage() {
      return this.$store.state.currentInfoPage
    },
    attachmentTypes() {
      return {
        image: [
          'image/gif',
          'image/jpeg',
          'photo',
          'cover_photo',
          'animated_image_share',
          'share',
          'event',
          'shopee/image',
        ],
        sticker: ['image/png', 'sticker', 'shopee/sticker'],
        video: ['video/mp4', 'video/mp3', 'video_inline', 'shopee/video'],
        shopee: ['shopee/image', 'shopee/video', 'shopee/item'],
      }
    },
    isCollapsed() {
      return this.$store.state.conversationCollapsed
    },
    viewResponseId() {
      return this.$store.state.viewResponseId
    },
    publishTime() {
      return this.action.publish_time
        ? this.action.publish_time
        : this.action.created_at
        ? this.action.created_at
        : this.action.last_at
    },
  },
  mounted() {
    event.$on('scrollToMessage', (conversationId) => {
      this.scrollToMessage(conversationId)
    })
    if (this.viewResponseId) {
      this.scrollToMessage(this.viewResponseId)
    }
  },
  destroyed() {
    event.$off('scrollToMessage')
  },
  methods: {
    formatTime(time) {
      return this.$moment.utc(time).local().format('hh:mm A DD/MM/YYYY')
    },
    scrollToMessage(responseId) {
      if (!responseId) return
      this.$nextTick(function () {
        const el = this.$el.querySelector(`#position-message-${responseId}`)
        if (el) {
          el.scrollIntoView({
            block: 'start',
          })
        }
      })
    },
    getShopeeStickerByCDN(sticker) {
      return `${domainStickerShopee(this.infoPage?.region)}/${sticker}@1x.png`
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
  &__left {
    @apply mr-4;
  }
  &__right {
    /deep/.ant-avatar {
      width: 4rem;
      height: 4rem;
      font-size: @size-16 !important;
      @apply flex items-center justify-center;
    }
    &__wrap-content {
      color: @black;
      background-color: @gray-6;
      padding: @padding-8 @padding-16;
      @apply rounded-md;
      &.no-bg {
        background-color: unset;
      }
      .content {
        /deep/p {
          white-space: pre-wrap;
          word-break: break-word;
          font-size: @size-16;
          @apply m-0;
        }
      }
      .attachment {
        @apply rounded-md my-2;
        &-img {
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
    }
    &__info-message {
      @apply flex items-center justify-end;
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
  &.failed {
    .message-response {
      &__right {
        &__wrap-content {
          background-color: @red-2;
          border: 1px solid @red;
          @apply relative;
          .icon-failed {
            color: @red;
            left: -20px;
            @apply absolute bottom-0;
          }
          .content {
            /deep/p {
              color: @red;
            }
          }
        }
      }
    }
  }
}
</style>
