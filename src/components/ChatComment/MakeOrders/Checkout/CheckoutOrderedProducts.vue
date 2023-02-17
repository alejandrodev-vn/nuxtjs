<template>
  <div class="products">
    <checkout-ordered-products-item
      v-for="product in products"
      :key="product.id"
      :product="product"
      @handleOpenProductDetail="handleOpenProductDetail"
    />
    <span class="branch">{{ $t('branch') }}: {{ branchName }}</span>
  </div>
</template>
<script>
export default {
  name: 'CheckoutOrderedProducts',
  props: {
    products: {
      type: Array,
      default: () => [],
    },
    branch: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    branchName() {
      return this.branch ? this.branch.name : '--'
    },
  },
  methods: {
    handleOpenProductDetail(product) {
      if (!product) return
      this.$emit('handleOpenProductDetail', product)
    },
  },
}
</script>
<style lang="less" scoped>
.products {
  .branch {
    color: @grey;
    font-style: italic;
    margin-block: 1.2rem 0.4rem;
    @apply inline-block;
  }
}
</style>
