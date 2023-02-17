<template>
  <div v-if="item.isImage && imgSrc">
    <img class="el-image" :src="imgSrc" @click="handlePreviewImage(imgSrc)" />
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
  <img v-else-if="item.isSticker && imgSrc" class="el-sticker" :src="imgSrc" />
  <img
    v-else-if="(item.isImage && !imgSrc) || (item.isSticker && !imgSrc)"
    src="@/assets/images/Icon/No-Image.png"
  />
  <video v-else-if="item.isVideo" controls>
    <source :src="item.videoSrc" type="video/mp4" />
  </video>
  <attachment-shopee-item v-else-if="item.isItem" :data="item.data" />
  <attachment-shopee-order v-else-if="item.isOrder" :data="item.data" />
  <a v-else id="message-attachment-link" :href="item.file_url" target="_blank">
    <i class="far fa-paperclip" />
    {{ item.attachmentText }}
  </a>
</template>
<script>
import { domainStickerShopee, domainVideoShopee } from '@/constants/shopee'

export default {
  name: 'AttachmentShopee',
  props: {
    attachment: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      imgSrc: null,
      visiblePreviewImage: false,
      previewImage: null,
    }
  },
  computed: {
    infoPage() {
      return this.$store.state.currentInfoPage
    },
    item() {
      const isVideo = this.attachment.file_type.includes('video')
      const isImage = this.attachment.file_type.includes('image')
      const isSticker = this.attachment.file_type.includes('sticker')
      const isItem = this.attachment.file_type.includes('item')
      const isOrder = this.attachment.file_type.includes('order')
      let data = {}
      let videoSrc = ''
      if (isImage) {
        this.checkImageExists(this.attachment.file_url)
      }
      if (isVideo) {
        videoSrc = `${domainVideoShopee}/${this.attachment.file_url}`
      }
      if (isSticker) {
        const url = `${domainStickerShopee(this.infoPage?.region)}/${
          this.attachment.file_url
        }@1x.png`
        this.checkImageExists(url)
      }
      if (isItem || isOrder) {
        data = JSON.parse(this.attachment.data)
      }
      return {
        ...this.attachment,
        isImage,
        isVideo,
        isSticker,
        isItem,
        isOrder,
        data,
        videoSrc,
      }
    },
  },
  methods: {
    handlePreviewImage(src) {
      this.previewImage = src
      this.visiblePreviewImage = true
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
  },
}
</script>
