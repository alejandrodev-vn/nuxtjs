<template>
  <div class="search-facebook-page-page">
    <div class="search-facebook-page-page__title">
      Search other Facebook pages to see more insights
    </div>
    <div class="search-facebook-page-page__content">
      <search-facebook-table />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchFacebookPage',
}
</script>

<style lang="less" scoped>
.search-facebook-page-page {
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
