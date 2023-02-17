<template>
  <div class="discount-list">
    <search-discount-item
      v-for="discount in discounts"
      :key="discount.id"
      :discount="discount"
      @handleOpenDiscountDetail="handleOpenDiscountDetail"
    />
  </div>
</template>
<script>
export default {
  name: 'SearchDiscountList',
  props: {
    discounts: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleOpenDiscountDetail(discount) {
      this.$emit('handleOpenDiscountDetail', discount)
    },
  },
}
</script>
<style lang="less" scoped>
.discount-list {
  border-color: @gray-4;
  @apply h-full mr-4 border rounded-md;
}
</style>
