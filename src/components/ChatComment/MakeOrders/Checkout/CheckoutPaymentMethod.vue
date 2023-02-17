<template>
  <div class="payment-method">
    <a-select
      :value="paymentMethod"
      size="large"
      class="custom-select"
      @change="handleChangePaymentMethod"
    >
      <template #suffixIcon>
        <icon-right :style="{ transform: 'rotate(90deg)' }" />
      </template>
      <a-select-option :value="configPaymentThod.type.cod">
        {{ $t('cod') }}
      </a-select-option>
      <a-select-option :value="configPaymentThod.type.bank_transfer">
        {{ $t('bank-transfer') }}
      </a-select-option>
    </a-select>
    <div
      v-if="paymentMethod === configPaymentThod.type.bank_transfer"
      class="payment-method__bank-transfer"
    >
      <input
        ref="paymentProof"
        type="file"
        :accept="acceptFile"
        :style="{ display: 'none' }"
        @change="handleUploadImage"
      />
      <a-button type="primary" @click="$refs.paymentProof.click()">
        {{ $t('upload-payment-proof') }}
      </a-button>
      <p class="mt-2">{{ $t('format') }}: {{ acceptFile }}</p>
      <div v-for="(file, index) in listPreview" :key="index" class="img-proof">
        <a target="_blank" :href="file.blob" class="mb-2">{{ file.name }} </a>
        <img v-if="file.type === 'image'" :src="file.blob" alt="" />
        <embed v-else :src="file.blob" width="100%" height="400px" />
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'CheckoutPaymentMethod',
  props: {
    paymentMethod: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      acceptFile: '.pdf, .png, .jpg',
      fileList: [],
      listPreview: [],
    }
  },
  computed: {
    configPaymentThod() {
      return this.$store.state.configPaymentMethod
    },
  },
  methods: {
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
          this.fileList.splice(0)
          this.listPreview.splice(0)
          const inputFile = this.$refs.paymentProof
          if (inputFile) {
            inputFile.value = ''
          }
          return false
        }
        const extension = file.name.substr(file.name.lastIndexOf('.'))
        const allowedExtensionsRegx = /(\.jpg|\.png|\.pdf)$/i
        const isAllowed = allowedExtensionsRegx.test(extension)
        if (!isAllowed) {
          notification.error({
            message: this.$t('invalid-file-type'),
            class: 'notification-error',
          })
          this.fileList.splice(0)
          this.listPreview.splice(0)
          const inputFile = this.$refs.paymentProof
          if (inputFile) {
            inputFile.value = ''
          }
          return false
        }
        const type = file.type.includes('image') ? 'image' : 'file'
        this.listPreview = [
          {
            blob: URL.createObjectURL(file),
            type,
            name: file.name,
          },
        ]
        this.fileList = [file]
        this.$emit('handleChangePaymentProofImage', {
          ...(this.fileList.length && { fileList: [...this.fileList] }),
        })
        notification.success({
          message: this.$t('uploaded-file-successfully'),
          class: 'notification-success',
        })
      }
    },
    handleChangePaymentMethod(value) {
      this.$emit('handleChangePaymentMethod', value)
    },
  },
}
</script>
<style lang="less" scoped>
.payment-method {
  @apply mt-4;
  &__bank-transfer {
    @apply my-4;
  }
  /deep/.custom-select {
    @apply w-full mt-2;
    .ant-select-selection {
      height: @height-field;
      border-color: @black-gray;
      &__rendered {
        line-height: @height-field;
      }
    }
    .ant-select-selection-selected-value {
      @apply flex items-center;
    }
    .mx-input {
      height: @height-field;
    }
  }
  .img-proof {
    img {
      border: 1px solid @border-grey-fade;
      @apply rounded-md;
    }
  }
}
</style>
