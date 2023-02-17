<template>
  <div class="products">
    <search-orders-ordered-products-item
      v-for="product in products"
      :key="product.id"
      :product="product"
      :currency="currency"
    />
    <div class="total">
      <span class="total__title">{{ $t('total') }}</span>
      <div class="total__price">
        <app-currency :price="total" :currency="symbolCurrency" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SearchOrdersOrderedProducts',
  props: {
    products: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    currency: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    symbolCurrency() {
      return this.currency.symbol
        ? `${this.currency.symbol} `
        : `${this.$store.state.configCurrency.my.symbol} `
    },
  },
}
</script>
<style lang="less" scoped>
.products {
  .total {
    font-size: @size-16;
    @apply p-2 pt-4 flex items-center justify-between;
    &__title {
      color: @black;
    }
    &__price {
      color: @primary;
    }
  }
}
</style>
