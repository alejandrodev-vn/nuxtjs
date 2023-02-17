<template>
  <div class="comment-attachment">
    <div
      v-for="attr in attachmentList"
      :key="attr.id"
      class="comment-attachment__item"
    >
      <div
        v-if="attr"
        class="comment-attachment__item__container"
        @click="handleOnClickView"
      >
        <a-modal
          v-if="attr.isImage && imgSrc"
          v-model="visiblePreviewImage"
          centered
          :closable="false"
          :footer="null"
          destroy-on-close
        >
          <img :src="imgSrc" class="mx-auto" />
        </a-modal>
        <img
          v-if="(attr.isImage && imgSrc) || (attr.isSticker && imgSrc)"
          class="comment-attachment__item__container--img"
          :class="{ 'cursor-pointer': attr.isImage }"
          loading="lazy"
          :src="imgSrc"
          @click="handleClickPreviewImage"
        />
        <img
          v-else-if="(attr.isImage && !imgSrc) || (attr.isSticker && !imgSrc)"
          src="@/assets/images/Icon/No-Image.png"
        />
        <video v-else-if="attr.isVideo" controls>
          <source :src="attr.file_url" type="video/mp4" />
        </video>
        <a
          v-else
          id="comment-attachment-link"
          :href="attr.file_url"
          target="_blank"
        >
          <i class="far fa-paperclip" />
          {{ attr.attachmentText }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentAttachment',
  props: {
    attachments: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      imgSrc: null,
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
        this.checkImageExists(attr.file_url)
        return {
          ...attr,
          attachmentType,
          attachmentText,
          previewList,
          isVideo,
          isImage,
          isSticker,
          isOther,
        }
      })
    },
  },
  methods: {
    handleClickPreviewImage() {
      this.visiblePreviewImage = true
    },
    handleOnClickView(e) {
      e.stopPropagation()
    },
    checkImageExists(url) {
      const img = new Image()

      img.src = url

      if (img.complete) {
        return (this.imgSrc = url)
      } else {
        img.onload = () => {
          return (this.imgSrc = url)
        }

        img.onerror = () => {
          return (this.imgSrc = null)
        }
      }
    },
    getAttachmentType(fileType) {
      let type = 'other'
      if (
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
      let text = 'View attachment'
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
.comment-attachment {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.25em;
  &__item {
    padding: 0 0.25em;
    &__container {
      margin-top: 0.5em;
      display: inline-block;
      max-width: 150px;
      /deep/video {
        max-width: 100%;
      }
      /deep/&--img {
        max-height: 200px;
        object-fit: contain;
      }
      /deep/.el-image {
        display: block;
        border-radius: 3px;
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
