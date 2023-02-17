<template>
  <div class="analytics-dashboard-card">
    <div class="analytics-dashboard-card__icon">
      <i :class="dashboard.icon"></i>
    </div>
    <div class="analytics-dashboard-card__content">
      <div class="analytics-dashboard-card__content--number">
        <app-number :number="dashboard.number" />
      </div>
      <div class="analytics-dashboard-card__content--title">
        {{ dashboard.title }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsDashboardCard',
  props: {
    dashboard: {
      type: Object,
      default: () => {},
    },
  },
}
</script>

<style lang="less" scoped>
.analytics-dashboard-card {
  border-radius: @border-radius-xl;
  box-shadow: 0 3px 20px @secondary-4;
  padding: @padding-24;
  @apply flex items-center;

  &__icon {
    flex: 0 0 4rem;
    padding: 2.8rem;
    background-color: @primary-4;
    border-radius: @border-radius-xl;
    @apply flex items-center justify-center;

    i {
      font-size: @size-30;
      color: @primary;
    }
  }

  &__content {
    margin-left: @margin-20;
    &--number {
      color: @black;
      font-size: @size-32;
      line-height: @size-32;
      @apply font-bold;
    }

    &--title {
      color: @secondary-1;
      font-size: @size-16;
      margin-top: @margin-8;
    }
  }
}
</style>
