<template>
  <nuxt-child
    :is-visible="isVisible"
    :data-detail="dataDetail"
    :is-loading="isLoading"
    @close="$emit('close')"
  ></nuxt-child>
</template>
<script>
export default {
  name: 'ResponseHistoryDetailId',
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    dataDetail: {
      type: Object,
      default: () => {},
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
