<template>
  <div class="no-data-notifications">
    <div class="no-data-notifications__icon">
      <icon-no-data-notifications />
    </div>
    <p class="no-data-notifications__text">{{ $t('no-new-notifications') }}</p>
  </div>
</template>
<script>
export default {
  name: 'NoDataNotifications',
}
</script>
<style lang="less" scoped>
.no-data-notifications {
  padding: @padding-24;
  @apply w-full flex flex-col items-center justify-center;
  &__icon {
    svg {
      width: 6.4rem;
      height: 5.4rem;
    }
  }
  &__text {
    font-size: @size-16;
    line-height: @size-24;
    @apply font-medium;
  }
}
</style>
