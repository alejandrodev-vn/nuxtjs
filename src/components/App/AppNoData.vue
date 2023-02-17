<template>
  <div class="no-data">
    <img src="@/assets/images/Icon/no-data.png" alt="No Data" />
    <p class="mt-2">{{ text }}</p>
  </div>
</template>
<script>
export default {
  name: 'AppNoData',
  props: {
    text: {
      type: String,
      default: 'No data',
    },
  },
}
</script>
<style lang="less" scoped>
.no-data {
  color: @black-gray;
  @apply flex flex-col justify-center items-center w-full h-full;
}
</style>
