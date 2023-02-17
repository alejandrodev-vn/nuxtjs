<template>
  <div class="response-history-page">
    <div class="response-history-page__title">
      {{ $t('response-history') }}
    </div>
    <div class="response-history-page__content">
      <response-history />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponseHistoryPage',
}
</script>

<style lang="less" scoped>
.response-history-page {
  padding: @padding-40 @padding-24;
  overflow: hidden auto;
  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
  &__content {
    padding-top: 1rem;
  }
}
</style>
