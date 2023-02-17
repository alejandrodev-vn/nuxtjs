<template>
  <div class="message-attachment">
    <div
      v-for="attr in attachmentList"
      :key="attr.id"
      class="message-attachment__item"
    >
      <div
        v-if="attr"
        class="message-attachment__item__container"
        @click="handleOnClickView"
      >
        <attachment-shopee v-if="attr.isShopee" :attachment="attr" />
        <img
          v-else-if="attr.isImage && attr.file_url"
          class="el-image"
          :src="attr.file_url"
          @click="handlePreviewImage(attr.file_url)"
        />
        <img
          v-else-if="attr.isSticker && attr.file_url"
          class="el-sticker"
          :src="attr.file_url"
        />
        <img
          v-else-if="
            (attr.isImage && !attr.file_url) ||
            (attr.isSticker && !attr.file_url)
          "
          class="el-image"
          src="@/assets/images/Icon/No-Image.png"
        />
        <video v-else-if="attr.isVideo" controls>
          <source :src="attr.file_url" type="video/mp4" />
        </video>
        <a
          v-else
          id="message-attachment-link"
          :href="attr.file_url"
          target="_blank"
        >
          <i class="far fa-paperclip" />
          {{ attr.attachmentText }}
        </a>
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
  name: 'MessageAttachment',
  props: {
    attachments: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      previewImage: null,
      visiblePreviewImage: false,
    }
  },
  computed: {
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
        ],
        sticker: ['image/png', 'sticker'],
        video: ['video/mp4', 'video/mp3', 'video_inline'],
        shopee: [
          'shopee/image',
          'shopee/video',
          'shopee/sticker',
          'shopee/item',
          'shopee/order',
        ],
      }
    },
    previewList() {
      return this.attachments.map((attr) => attr.file_url)
    },
    attachmentList() {
      return this.attachments.map((attr, index) => {
        const attachmentType = this.getAttachmentType(attr.file_type)
        const attachmentText = this.getAttachmentText(attachmentType)
        const previewList = this.getAttachmentPreviews(index)
        const isVideo =
          attachmentType === 'video' ||
          attachmentType === 'animated_image_share'
        const isImage = attachmentType === 'image'
        const isSticker = attachmentType === 'sticker'
        const isOther = attachmentType === 'other'
        const isShopee = attr.file_type.includes('shopee')

        return {
          ...attr,
          attachmentType,
          attachmentText,
          previewList,
          isVideo,
          isImage,
          isSticker,
          isOther,
          isShopee,
        }
      })
    },
  },
  methods: {
    handlePreviewImage(src) {
      this.previewImage = src
      this.visiblePreviewImage = true
    },
    handleOnClickView(e) {
      e.stopPropagation()
    },
    getAttachmentType(fileType) {
      let type = 'other'
      if (fileType.includes('shopee')) {
        return fileType
      } else if (
        fileType.includes('video') ||
        fileType.includes('animated_image_share')
      ) {
        type = 'video'
      } else if (this.attachmentTypes.image.includes(fileType)) {
        type = 'image'
      } else if (this.attachmentTypes.sticker.includes(fileType)) {
        type = 'sticker'
      }
      return type
    },
    getAttachmentText(type) {
      let text = this.$t('view-attachment')
      if (type === 'video') {
        text = 'View video'
      }
      return text
    },
    getAttachmentPreviews(index) {
      return this.previewList
        .slice(index, this.previewList.length)
        .concat(this.previewList.slice(0, index))
    },
  },
}
</script>

<style lang="less" scoped>
.message-attachment {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.25em;
  &__item {
    padding: 0 0.25em;
    &__container {
      margin-top: 0.5em;
      display: inline-block;
      /deep/video {
        max-width: 30rem;
        max-height: 30rem;
      }
      /deep/.el-sticker {
        width: 15rem;
        height: 15rem;
      }
      /deep/.el-image {
        display: block;
        border-radius: 0.3rem;
        width: 30rem;
        height: 30rem;
        object-fit: cover;
        @apply cursor-pointer;
        &__inner {
          width: auto;
          max-height: 4em;
        }
        .image-error {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 4em;
          height: 4em;
          background-color: @gray-4;
          i {
            color: @gray-3;
            font-size: 1.5em;
          }
        }
      }
    }
  }
}
</style>
