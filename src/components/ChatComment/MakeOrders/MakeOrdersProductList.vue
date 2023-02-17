<template>
  <div class="product-list">
    <template v-for="product in products">
      <make-orders-product-item
        v-for="productSku in product.product_skus.data"
        :key="productSku.id"
        :product-sku="productSku"
        :product="product"
        :cart="cart"
        :is-filter-all-branches="isFilterAllBranches"
        :selected-branch="selectedBranch"
        @handleOpenProductDetail="handleOpenProductDetail"
      />
    </template>
  </div>
</template>
<script>
export default {
  name: 'MakeOrdersProductList',
  props: {
    products: {
      type: Array,
      default: () => [],
    },
    cart: {
      type: Array,
      default: () => [],
    },
    isFilterAllBranches: {
      type: Boolean,
      default: true,
    },
    selectedBranch: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    handleOpenProductDetail(product) {
      this.$emit('handleOpenProductDetail', product)
    },
  },
}
</script>
<style lang="less" scoped>
.product-list {
  border-color: @gray-4;
  margin-inline: @margin-24;
  margin-block: 0 @margin-24;
  @apply border rounded-md;
}
</style>
