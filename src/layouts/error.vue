<template>
  <section class="error">
    <app-error :status-code="error.statusCode" />
  </section>
</template>

<script>
export default {
  layout: 'callback',
  props: {
    error: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
<style lang="less" scoped>
.error {
  background-color: #fff;
  height: 100vh;
}
</style>
