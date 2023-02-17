<template>
  <response-history-detail
    :is-visible="isVisible"
    :data-detail="dataDetail"
    :is-loading="isLoading"
    @close="$emit('close')"
  />
</template>
<script>
export default {
  name: 'ResponseHistoryDetailPage',
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
