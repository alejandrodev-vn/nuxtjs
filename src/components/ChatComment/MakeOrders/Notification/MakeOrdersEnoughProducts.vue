<template>
  <transition name="page">
    <div v-if="branchesEnough > 0" class="notification-enough">
      <a-icon type="check-circle" />
      <p>
        {{ branchesEnough }}/{{ allBranches }}
        {{ $t('enoughProduct') }}
      </p>
    </div>
    <div v-else class="notification-not-enough">
      <a-icon type="info-circle" />
      <p>
        {{ $t('notEnoughProduct') }}
      </p>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'MakeOrdersEnoughProducts',
  props: {
    allBranches: {
      type: Number,
      default: 0,
    },
    branchesEnough: {
      type: Number,
      default: 0,
    },
  },
}
</script>
<style lang="less" scoped>
.notification-enough {
  background-color: @green-2;
  border-color: @green;
  color: @green;
  @apply flex items-baseline py-2 px-4 border font-semibold m-4 rounded-md;
  .anticon {
    font-size: @size-18;
    @apply mr-2;
  }
  p {
    font-size: @size-14;
    @apply m-0;
  }
}
.notification-not-enough {
  background-color: @yellow-2;
  border-color: @yellow;
  color: @yellow;
  @apply flex items-baseline py-2 px-4 border font-semibold m-4 rounded-md;
  .anticon {
    font-size: @size-18;
    @apply mr-2;
  }
  p {
    font-size: @size-14;
    @apply m-0;
  }
}
</style>
