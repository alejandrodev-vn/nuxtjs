<template>
  <a-form-model
    ref="form"
    class="whatsapp-order-form-setup-form"
    :model="form"
    :rules="rules"
    :colon="false"
  >
    <div class="flex items-center mb-2">
      <span class="whatsapp-order-form-label-bold">
        {{ $t('channel-settings') }}
      </span>
      <a-tooltip overlay-class-name="custom-tooltip-light">
        <template slot="title">
          {{ $t('tooltip-whatsapp-channel-settings') }}
        </template>
        <i class="fal fa-info-circle custom-icon-info ml-2"></i>
      </a-tooltip>
    </div>
    <a-form-model-item
      ref="displayName"
      prop="displayName"
      :label="$t('display-name')"
    >
      <a-input
        v-model="form.displayName"
        :disabled="status !== 1"
        :placeholder="$t('enter-display-name')"
      />
    </a-form-model-item>
    <a-form-model-item
      ref="phoneNumber"
      prop="phoneNumber"
      :label="$t('phone-number')"
      class="mb-3"
    >
      <a-input
        v-model="form.phoneNumber"
        :disabled="status !== 1"
        :placeholder="$t('enter-phone-number')"
      />
    </a-form-model-item>
    <div class="flex items-center mb-2">
      <span class="whatsapp-order-form-label-bold">
        {{ $t('order-form') }}
      </span>
      <a-tooltip overlay-class-name="custom-tooltip-light">
        <template slot="title">
          {{ $t('tooltip-order-form') }}
        </template>
        <i class="fal fa-info-circle custom-icon-info ml-2"></i>
      </a-tooltip>
    </div>
    <a-form-model-item ref="title" prop="title" :label="$t('title')">
      <a-input
        v-model="form.title"
        :disabled="status !== 1"
        :placeholder="$t('enter-title')"
      />
    </a-form-model-item>
    <a-form-model-item
      ref="shortTitle"
      prop="shortTitle"
      :label="$t('short-title')"
    >
      <a-input
        v-model="form.shortTitle"
        :disabled="status !== 1"
        :placeholder="$t('enter-short-title')"
      />
    </a-form-model-item>
    <a-form-model-item :label="$t('order-form-link')">
      <a-input
        :value="orderFormLink"
        disabled
        class="disabled-input"
        :class="{
          'has-short-title':
            !isErrorShortTitle &&
            isValidAllFields &&
            status === 1 &&
            isExistLink,
          'pointer-events-none':
            isErrorShortTitle ||
            !isValidAllFields ||
            status !== 1 ||
            !isExistLink,
        }"
      >
        <!-- <template slot="prefix">
          <i
            v-if="!isErrorShortTitle && isValidAllFields"
            class="far fa-link cursor-pointer"
            @click="handleClickFollowLink"
          ></i>
        </template> -->
        <template slot="suffix">
          <a-icon v-if="isLoading" type="loading" />
          <i
            v-else-if="!isErrorShortTitle && isValidAllFields"
            class="far fa-clone cursor-pointer"
            :class="{ 'cursor-not-allowed': !isExistLink }"
            @click="handleCopyLink"
          ></i>
        </template>
      </a-input>
    </a-form-model-item>
  </a-form-model>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { debounce } from 'lodash'
import { getResponseErrorMessage } from '../../../utils'
import regexText from '@/mixins/regexText'
Vue.use(notification)
export default {
  name: 'WhatsappOrderFormSetupForm',
  mixins: [regexText],
  props: {
    status: {
      type: Number,
      default: 0,
    },
    orderForm: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        displayName: '',
        phoneNumber: '',
        title: '',
        shortTitle: '',
      },
      orderFormLink: '',
      isErrorShortTitle: false,
      isLoading: false,
    }
  },
  computed: {
    domainCRM() {
      return process.env.DOMAIN_CRM
    },
    rules() {
      return {
        displayName: [
          {
            min: 1,
            message: this.$t('field-is-required'),
            required: true,
            trigger: 'blur',
          },
          {
            max: 20,
            message: this.$t('field-cannot-exceed-20-characters'),
            required: true,
            trigger: 'blur',
          },
        ],
        phoneNumber: [
          {
            message: this.$t('field-is-required'),
            required: true,
            trigger: 'change',
          },
          {
            // pattern: /(^84|^60)[0-9]{8,9}\s*$/g,
            pattern: /^[0-9]*\s*$/g,
            message: this.$t('validateFormatPhone'),
            trigger: 'change',
          },
          {
            max: 11,
            message: this.$t('validateFormatPhoneMax'),
            trigger: 'change',
          },
          {
            min: 10,
            message: this.$t('validateFormatPhoneMin'),
            trigger: 'change',
          },
        ],
        title: [
          {
            message: this.$t('field-is-required'),
            required: true,
          },
          {
            max: 20,
            message: this.$t('field-cannot-exceed-20-characters'),
            required: true,
            trigger: 'blur',
          },
        ],
        shortTitle: [
          {
            message: this.$t('field-is-required'),
            trigger: 'blur',
            required: true,
          },
          {
            max: 20,
            message: this.$t('field-cannot-exceed-20-characters'),
            required: true,
            trigger: 'blur',
          },
        ],
      }
    },
    isValidAllFields() {
      const patternPhoneNumber = /^[0-9]{10,11}\s*$/g
      const isValid =
        patternPhoneNumber.test(this.form.phoneNumber) &&
        this.form.displayName.length > 0 &&
        this.form.displayName.length < 21 &&
        this.form.title.length > 0 &&
        this.form.title.length < 21 &&
        this.form.shortTitle.length > 0 &&
        this.form.shortTitle.length < 21
      return isValid
    },
    isExistLink() {
      return this.form.shortTitle === this.orderForm?.short_title
    },
  },
  watch: {
    form: {
      deep: true,
      handler() {
        if (!this.form.shortTitle.length) return (this.orderFormLink = '')
        this.form.shortTitle = this.replaceAccentedLetters(this.form.shortTitle)
        this.form.shortTitle = this.replaceSpecialCharacters(
          this.form.shortTitle
        )
        this.form.shortTitle = this.form.shortTitle.toLowerCase()
        this.renderOrderFormLink()
      },
    },
    orderForm: {
      deep: true,
      handler() {
        if (this.orderForm) {
          this.form = {
            ...this.form,
            displayName: this.orderForm.name,
            phoneNumber: this.orderForm.phone,
            title: this.orderForm.title,
            shortTitle: this.orderForm.short_title,
          }
        }
      },
    },
  },

  methods: {
    renderOrderFormLink: debounce(async function () {
      if (!this.isValidAllFields) return
      this.isLoading = true
      if (this.orderForm?.short_title === this.form.shortTitle) {
        this.orderFormLink = `${this.domainCRM}${this.form.shortTitle}`
        this.isLoading = false
        return
      }
      await this.checkValidShortTitle()
      this.isLoading = false
      if (this.isErrorShortTitle) return
      this.orderFormLink = `${this.domainCRM}${this.form.shortTitle}`
    }, 1000),
    async checkValidShortTitle() {
      try {
        const payload = {
          short_title: this.form.shortTitle,
        }
        await this.$api.orderForm.checkValidOrderForm(payload)
        this.isErrorShortTitle = false
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
        this.isErrorShortTitle = true
      }
    },
    validateOrderFormLink() {
      return !this.isErrorShortTitle && this.orderFormLink.length > 0
    },
    handleSave() {
      let isValid = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          return (isValid = true)
        }
        return (isValid = false)
      })
      return isValid
    },
    getForm() {
      return {
        displayName: this.form.displayName,
        phoneNumber: this.form.phoneNumber,
        title: this.form.title,
        shortTitle: this.form.shortTitle,
      }
    },
    async handleCopyLink() {
      if (!this.status || !this.isValidAllFields || !this.isExistLink) return
      await navigator.clipboard.writeText(this.orderFormLink)
      notification.success({
        message: this.$t('copied-to-clipboard'),
        class: 'notification-success',
      })
    },
    handleClickFollowLink() {
      const url = `${this.domainCRM}${this.form.shortTitle}`
      window.open(url, '_blank')
    },
  },
}
</script>

<style lang="less" scoped>
.whatsapp-order-form-setup-form {
  .whatsapp-order-form {
    &-label-bold {
      color: @black;
      font-size: @size-16;
      @apply font-medium;
    }
  }
  /deep/.ant-form-item-control {
    width: 50%;
  }
  /deep/.ant-form-item-children {
    position: relative;
    .anticon-info-circle {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: -25px;
    }
  }
  /deep/.disabled-input {
    &.has-short-title {
      .ant-input {
        background-color: @white;
        color: @primary;
        text-decoration: underline;
        cursor: text;
      }
    }
  }
}
</style>
