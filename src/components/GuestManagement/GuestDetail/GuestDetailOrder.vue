<template>
  <div class="guest-detail-order">
    <div class="guest-detail-order__title">{{ $t('crm-order') }}</div>
    <div class="guest-detail-order__content">
      <div class="guest-detail-order__content--label">
        {{ $t('total-order') }}:
      </div>
      <div class="guest-detail-order__content--value">
        {{ totalOrders }}
      </div>
    </div>
    <div class="guest-detail-order__content">
      <div class="guest-detail-order__content--label">
        {{ $t('order-complete-rate') }}:
      </div>
      <div class="guest-detail-order__content--value">
        {{ completeRate }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuestDetailOrder',
  props: {
    guest: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    totalOrders() {
      return ` ${this.$t('number-orders', {
        number: this.guest?.order_count ? this.guest?.order_count : 0,
      })}`
        .replace(' 1 orders', `1 ${this.$t('order')}`)
        .replace(' 0 orders', `0 ${this.$t('order')}`)
    },
    completeRate() {
      return `${
        this.guest?.complete_rate ? `${this.guest?.complete_rate}%` : '--'
      }`
    },
  },
}
</script>

<style lang="less" scoped>
.guest-detail-order {
  color: @black;
  border: 1px solid @secondary-2;
  border-radius: @border-radius-lg;
  padding: @padding-24;

  &__title {
    font-size: @size-20;
    @apply font-semibold;
  }

  &__content {
    font-size: @size-16;
    margin-top: 1rem;

    &--label {
      @apply inline-block font-medium;
    }

    &--value {
      @apply inline-block;
    }
  }
}
</style>
