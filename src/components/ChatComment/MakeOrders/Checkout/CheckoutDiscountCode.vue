<template>
  <div class="discount">
    <a-input
      v-model="discountCode"
      size="large"
      :disabled="isLoading"
      @pressEnter="handleCheckDiscountCode"
    />
    <a-button
      class="ml-2"
      type="primary"
      :loading="isLoading"
      @click="handleCheckDiscountCode"
    >
      {{ $t('apply') }}
    </a-button>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'CheckoutDiscountCode',
  props: {
    subTotal: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      discountCode: '',
      discount: null,
      isLoading: false,
    }
  },
  methods: {
    async handleCheckDiscountCode() {
      try {
        this.isLoading = true
        const params = {
          code: this.discountCode,
        }
        const { data } = await this.$api.discount.checkValidCode(params)
        if (data) {
          if (
            !data.is_min_payment ||
            (data.is_min_payment && data.min_payment <= this.subTotal)
          ) {
            this.discount = { ...data }
            this.handleApplyDiscountCode()
            return notification.success({
              message: this.$t('apply-discount-code-success'),
              class: 'notification-success',
            })
          }
          return notification.error({
            message: this.$t('apply-discount-code-failed'),
            class: 'notification-error',
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoading = false
      }
    },
    handleApplyDiscountCode() {
      this.$emit('onApplyDiscount', this.discount)
    },
  },
}
</script>
<style lang="less" scoped>
.discount {
  @apply mt-4 flex items-center;
  /deep/.ant-input {
    height: @height-field;
  }
  /deep/.ant-btn {
    height: @height-field;
  }
}
</style>
