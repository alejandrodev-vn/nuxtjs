<template>
  <div class="customer">
    <div class="customer__item">
      <div class="customer__item__left">
        <span class="text-left">{{ $t('full-name') }}</span>
      </div>
      <div class="customer__item__right">
        <span class="text-right">{{ customer.full_name }}</span>
      </div>
    </div>
    <div class="customer__item">
      <div class="customer__item__left">
        <span class="text-left">{{ $t('phone') }}</span>
      </div>
      <div class="customer__item__right">
        <span class="text-right">{{ customer.phone }}</span>
      </div>
    </div>
    <div class="customer__item">
      <div class="customer__item__left">
        <span class="text-left">{{ $t('email') }}</span>
      </div>
      <div class="customer__item__right">
        <span class="text-right">{{ customer.email }}</span>
      </div>
    </div>
    <div class="customer__item">
      <div class="customer__item__left">
        <span class="text-left">{{ $t('address') }}</span>
      </div>
      <div class="customer__item__right">
        <span class="text-right">{{ customer.full_address }}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SearchOrdersCustomer',
  props: {
    customer: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
<style lang="less" scoped>
.customer {
  @apply flex flex-col p-4;
  &__item {
    &:not(:last-child) {
      margin-bottom: 22px;
    }
    @apply flex items-baseline justify-between;
    &__left {
      color: @black;
      width: 30%;
      @apply font-medium;
      &__social-channel {
        @apply flex items-center;
        img {
          @apply mr-2;
        }
        p {
          @apply font-medium m-0 truncate;
        }
      }
    }
    &__right {
      color: @black;
      width: 70%;
      @apply text-left;
    }
  }
}
</style>
