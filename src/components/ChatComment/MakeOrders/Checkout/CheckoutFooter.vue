<template>
  <div class="checkout-footer">
    <div class="checkout-footer__info">
      <span class="checkout-footer__info__left">{{ $t('subtotal') }}</span>
      <div class="checkout-footer__info__right">
        <app-currency :price="subTotal" :currency="symbolCurrency" />
      </div>
    </div>
    <div class="checkout-footer__info">
      <span class="checkout-footer__info__left">{{ $t('discount') }}</span>
      <div
        class="checkout-footer__info__right checkout-footer__info__right--red"
      >
        <app-currency :price="-discount" :currency="symbolCurrency" />
      </div>
    </div>
    <div class="checkout-footer__info">
      <span class="checkout-footer__info__left">{{ $t('shipping-fee') }}</span>
      <div class="checkout-footer__info__right">
        <app-currency :price="shippingFee" :currency="symbolCurrency" />
      </div>
    </div>
    <div class="checkout-footer__info">
      <span class="checkout-footer__info__left">{{ $t('total') }}</span>
      <div
        class="checkout-footer__info__right checkout-footer__info__right--blue"
      >
        <app-currency :price="total" :currency="symbolCurrency" />
      </div>
    </div>
    <div class="checkout-footer__info">
      <span class="checkout-footer__info__left">{{ $t('pre-paid') }}</span>
      <div class="checkout-footer__info__right">
        <app-currency :price="prePaid" :currency="symbolCurrency" />
      </div>
    </div>
    <div class="checkout-footer__info">
      <span class="checkout-footer__info__left">
        {{ $t('pay-at-delivery') }}
      </span>
      <div class="checkout-footer__info__right">
        <app-currency :price="payAtDelivery" :currency="symbolCurrency" />
      </div>
    </div>
    <div class="checkout-footer__bottom">
      <a-button
        type="secondary"
        class="btn-cancel"
        @click="handleCloseCheckout"
      >
        {{ $t('cancel') }}
      </a-button>
      <a-button
        type="primary"
        class="btn-submit"
        :disabled="!canMakeOrder || !canCheckout"
        @click="handleSubmitCheckout"
      >
        {{ $t('checkout') }}
      </a-button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'CheckoutFooter',
  props: {
    canMakeOrder: {
      type: Boolean,
      default: false,
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountCode: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: Number,
      default: 1,
    },
    listProofImages: {
      type: Array,
      default: () => [],
    },
    customer: {
      type: Object,
      default: () => {},
    },
    delivery: {
      type: Object,
      default: () => {},
    },
    branch: {
      type: Object,
      default: () => {},
    },
    products: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    symbolCurrency() {
      return `${this.$store.state.configCurrency.vi.symbol} `
    },
    configPaymentMethod() {
      return this.$store.state.configPaymentMethod
    },
    configDelivery() {
      return this.$store.state.configDelivery
    },
    socialChannelId() {
      return this.$route.params.page
    },
    guestId() {
      return this.$route.params.guest
    },
    conversationType() {
      return this.$route.params.type
    },
    configPaymentThod() {
      return this.$store.state.configPaymentMethod
    },
    total() {
      return this.subTotal - this.discount + this.shippingFee
    },
    prePaid() {
      return this.paymentMethod === this.configPaymentThod.type.cod
        ? 0
        : this.total
    },
    payAtDelivery() {
      return this.paymentMethod === this.configPaymentThod.type.bank_transfer
        ? 0
        : this.total
    },
    productSkus() {
      return this.products.map((product) => {
        return { sku: product.sku, quantity: product.quantity }
      })
    },
    canCheckout() {
      return !(
        !this.socialChannelId ||
        !this.guestId?.length ||
        !this.customer.fullName?.length ||
        !this.customer.email?.length ||
        !this.customer.phone?.length ||
        !this.customer.address?.length ||
        !this.customer.province ||
        !this.delivery.delivery_provider_id ||
        !this.paymentMethod ||
        !this.branch?.id ||
        !this.products?.length
      )
    },
    paymentProofImage() {
      return this.listProofImages[0]
    },
  },
  methods: {
    handleCloseCheckout() {
      this.$emit('onCloseCheckout')
    },
    async handleSubmitCheckout() {
      try {
        if (!this.canCheckout || !this.canMakeOrder) return
        const payload = new FormData()
        payload.append('social_channel_id', this.socialChannelId)
        payload.append('fan_id', this.guestId)
        payload.append('name', this.customer.fullName)
        payload.append('email', this.customer.email)
        payload.append('phone', this.customer.phone)
        payload.append('address', this.customer.address)
        payload.append('province_id', this.customer.province)
        if (this.customer.district)
          payload.append('district_id', this.customer.district)
        if (this.customer.ward) payload.append('ward_id', this.customer.ward)
        if (this.customer.postCode?.length)
          payload.append('post_code', this.customer.postCode)
        if (this.customer.note?.length)
          payload.append('comment', this.customer.note)
        payload.append(
          'delivery_provider_id',
          this.delivery.delivery_provider_id
        )
        payload.append('payment_method_id', this.paymentMethod)
        if (this.discountCode?.length)
          payload.append('promotion_code', this.discountCode)
        payload.append('branch_id', this.branch.id)
        for (let i = 0; i < this.productSkus.length; i++) {
          payload.append(`products[${i}][sku]`, this.productSkus[i].sku)
          payload.append(
            `products[${i}][quantity]`,
            this.productSkus[i].quantity
          )
        }
        if (
          this.paymentMethod === this.configPaymentMethod.type.bank_transfer &&
          this.paymentProofImage
        )
          payload.append('payment_proof_image', this.paymentProofImage)
        const { data } = await this.$api.order.createOrder(payload)
        if (data) {
          notification.success({
            message: this.$t('order-success'),
            class: 'notification-success',
          })
          this.$emit('resetCart')
          const query = {
            ...this.$route.query,
          }
          this.$router.push(
            this.localePath({
              path: `/conversations/chat-comment/${this.socialChannelId}/${this.conversationType}/${this.guestId}/search-orders?order_id=${data.code}`,
              query,
            })
          )
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
  },
}
</script>
<style lang="less" scoped>
.checkout-footer {
  padding: @padding-24;
  &__info {
    margin-bottom: @margin-12;
    @apply flex justify-between;
    &__left {
      color: @black;
      font-size: @size-16;
    }
    &__right {
      color: @black;
      font-size: @size-16;
      @apply text-right font-medium;
      &--red {
        color: @red;
      }
      &--blue {
        color: @primary;
        font-size: @size-20;
        @apply font-semibold;
      }
    }
  }
  &__bottom {
    @apply mt-6 flex items-center justify-end;
    .btn-cancel {
      color: @black;
      @apply font-medium mr-4;
    }
    .btn-submit {
      @apply font-medium;
    }
  }
}
</style>
