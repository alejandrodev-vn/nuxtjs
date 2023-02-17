<template>
  <div class="layout-footer">
    {{ $t('copyright-text', { year: currentYear }) }}
  </div>
</template>

<script>
export default {
  name: 'LayoutFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },
}
</script>

<style scoped lang="less">
.layout-footer {
  width: 100%;
  height: @height-footer;
  font-size: @size-5;
  color: @secondary-1;
  @apply flex items-center font-medium;
}
</style>
