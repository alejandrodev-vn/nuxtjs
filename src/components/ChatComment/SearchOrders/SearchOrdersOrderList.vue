te
<template>
  <div class="order-list">
    <search-orders-order-item
      v-for="order in orders"
      :key="order.id"
      :order="order"
      @handleOpenOrderDetail="handleOpenOrderDetail"
    />
  </div>
</template>
<script>
export default {
  name: 'SearchOrdersOrderList',
  props: {
    orders: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleOpenOrderDetail(order) {
      this.$emit('handleOpenOrderDetail', order)
    },
  },
}
</script>
<style lang="less" scoped>
.order-list {
  border-color: @gray-4;
  @apply mr-4 border rounded-md;
}
</style>
