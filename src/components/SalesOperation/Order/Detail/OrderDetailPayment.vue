<template>
  <div class="order-detail-payment">
    <div class="order-detail-payment__title">
      {{ $t('payment-detail') }}
    </div>

    <div class="order-detail-payment__content order-detail-payment-content">
      <div
        class="order-detail-payment-content__block order-detail-payment-content-block"
      >
        <div class="order-detail-payment-content-block__item">
          <div class="order-detail-payment-content-block__item--label">
            {{ $t('sub-total') }}
          </div>
          <div class="order-detail-payment-content-block__item--value">
            <app-currency
              :price="payment.subTotal"
              :currency="`${currency} `"
            />
          </div>
        </div>
        <div class="order-detail-payment-content-block__item">
          <div class="order-detail-payment-content-block__item--label">
            {{ $t('discount-code') }}
          </div>
          <div class="order-detail-payment-content-block__item--value">
            {{ payment.discountCode }}
          </div>
        </div>
        <div class="order-detail-payment-content-block__item">
          <div class="order-detail-payment-content-block__item--label">
            {{ $t('discount-value') }}
          </div>
          <div class="order-detail-payment-content-block__item--value">
            <app-currency
              :price="payment.discountValue"
              :currency="`${currency} `"
            />
          </div>
        </div>
      </div>
      <div
        class="order-detail-payment-content__block order-detail-payment-content-block"
      >
        <div class="order-detail-payment-content-block__item">
          <div class="order-detail-payment-content-block__item--label">
            {{ $t('shipping-fee') }}
          </div>
          <div class="order-detail-payment-content-block__item--value">
            <app-currency
              :price="payment.shippingFee"
              :currency="`${currency} `"
            />
          </div>
        </div>
        <div class="order-detail-payment-content-block__item">
          <div class="order-detail-payment-content-block__item--label">
            {{ $t('total') }}
          </div>
          <div class="order-detail-payment-content-block__item--value">
            <app-currency :price="payment.total" :currency="`${currency} `" />
          </div>
        </div>
      </div>
      <div
        class="order-detail-payment-content__block order-detail-payment-content-block"
      >
        <div class="order-detail-payment-content-block__item">
          <div class="order-detail-payment-content-block__item--label">
            {{ $t('pre-paid') }}
          </div>
          <div class="order-detail-payment-content-block__item--value">
            <app-currency :price="payment.prePaid" :currency="`${currency} `" />
          </div>
        </div>
        <div class="order-detail-payment-content-block__item">
          <div class="order-detail-payment-content-block__item--label">
            {{ $t('pay-at-delivery') }}
          </div>
          <div class="order-detail-payment-content-block__item--value">
            <app-currency
              :price="payment.payAtDelivery"
              :currency="`${currency} `"
            />
          </div>
        </div>
        <div v-if="!isCOD" class="order-detail-payment-content-block__item">
          <div class="order-detail-payment-content-block__item--label">
            {{ $t('payment-proof') }}
          </div>
          <div v-if="payment.paymentProof" class="payment-proof-image">
            <a
              class="payment-proof-image__icon"
              :href="payment.paymentProof"
              rel="noreferrer"
              target="_blank"
              :download="payment.paymentProof"
            >
              <img :src="payment.paymentProof" alt="Prime CRM" />
            </a>
            <div class="payment-proof-image__text">
              {{ $t('click-image-to-view-or-download-it') }}
            </div>
          </div>
          <div v-else class="order-detail-payment-content-block__item--value">
            --
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get, invert } from 'lodash'

export default {
  name: 'OrderDetailPayment',
  props: {
    order: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    currency() {
      return get(this.order, 'currency.symbol', '') || ''
    },
    paymentType() {
      return invert(this.$store.state.paymentType)
    },
    isCOD() {
      return this.paymentType[this.order.payment_method_id] === 'cod'
    },
    payment() {
      return {
        subTotal: this.order.sub_total || 0,
        discountCode: this.order.promotion_code || '--',
        discountValue: this.order.total_discount || 0,
        shippingFee: this.order.total_shipping || 0,
        total: this.order.total || 0,
        prePaid: this.isCOD ? 0 : this.order.total || 0,
        payAtDelivery: this.isCOD ? this.order.total : 0,
        ...(!this.isCOD && {
          paymentProof: this.order.payment_proof_image,
        }),
      }
    },
  },
}
</script>

<style lang="less" scoped>
.order-detail-payment {
  border: 1px solid @secondary-2;
  border-radius: @border-radius-lg;
  padding: @padding-24 @padding-16;

  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: @margin-12;
    @apply font-semibold;
  }
}

.order-detail-payment-content {
  @apply grid grid-cols-1 gap-4;

  .desktop({
    @apply grid-cols-3;
  });
}

.order-detail-payment-content-block {
  &__item {
    color: @black;
    font-size: @size-14;
    margin-bottom: @margin-16;
    @apply flex items-center justify-between;

    &:last-child {
      margin-bottom: 0;
    }

    &--label {
      @apply font-medium;
    }
  }
}

.payment-proof-image {
  @apply text-right;

  &__icon {
    width: 2.5rem;
    height: 2rem;
    border: 1px solid @secondary-2;
    border-radius: @border-radius-base;
    @apply block ml-auto;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__text {
    font-style: italic;
    color: @secondary-2;
    margin-top: 0.25rem;
  }
}
</style>
