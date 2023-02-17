<template>
  <div class="order-detail-customer">
    <div class="order-detail-customer__header order-detail-customer-header">
      <div class="order-detail-customer-header__title">
        {{ $t('customer') }}
      </div>
      <img
        :src="customer.rank"
        alt="Prime CRM"
        class="order-detail-customer-header__icon"
      />
    </div>

    <div class="order-detail-customer__content order-detail-customer-content">
      <div class="order-detail-customer-content__item">
        <div class="order-detail-customer-content__item--label">
          {{ $t('full-name') }}
        </div>
        <div class="order-detail-customer-content__item--value">
          {{ customer.name }}
        </div>
      </div>
      <div class="order-detail-customer-content__item">
        <div class="order-detail-customer-content__item--label">
          {{ $t('phone') }}
        </div>
        <div class="order-detail-customer-content__item--value">
          {{ customer.phone }}
        </div>
      </div>
      <div class="order-detail-customer-content__item">
        <div class="order-detail-customer-content__item--label">
          {{ $t('email') }}
        </div>
        <div class="order-detail-customer-content__item--value">
          {{ customer.email }}
        </div>
      </div>
      <div class="order-detail-customer-content__item">
        <div class="order-detail-customer-content__item--label">
          {{ $t('address') }}
        </div>
        <div class="order-detail-customer-content__item--value">
          {{ customer.address }}
        </div>
      </div>
      <div class="order-detail-customer-content__item">
        <div class="order-detail-customer-content__item--label">
          {{ $t('notes') }}
        </div>
        <div class="order-detail-customer-content__item--value">
          {{ customer.notes }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'OrderDetailCustomer',
  props: {
    order: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    customer() {
      return {
        rank: get(this.order, 'customer.data.rank.data.image', '--') || '--',
        name: get(this.order, 'customer.data.name', '--') || '--',
        phone: get(this.order, 'customer.data.phone', '--') || '--',
        email: get(this.order, 'customer.data.email', '--') || '--',
        address:
          get(this.order, 'shipping_address.data.full_address', '--') || '--',
        notes: get(this.order, 'comment', '--') || '--',
      }
    },
  },
}
</script>

<style lang="less" scoped>
.order-detail-customer {
  border: 1px solid @secondary-2;
  border-radius: @border-radius-lg;
  padding: @padding-24 @padding-16;
}

.order-detail-customer-header {
  margin-bottom: @margin-24;
  @apply flex items-center;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }

  &__icon {
    width: @size-24;
    height: @size-24;
    object-fit: contain;
    margin-left: 2rem;
  }
}

.order-detail-customer-content {
  &__item {
    color: @black;
    font-size: @size-14;
    margin-bottom: @margin-24;
    @apply flex flex-wrap items-center;

    &--label {
      width: 30%;
      padding-right: 1rem;
      @apply font-medium;
    }

    &--value {
      width: 70%;
    }
  }
}
</style>
