<template>
  <div class="customer-detail-statistics">
    <div class="customer-detail-statistics__header">
      <div class="customer-detail-statistics__header__left">
        <span class="customer-detail-statistics__header__left--title">
          {{ $t('transaction-statistics') }}
        </span>
      </div>
      <div class="customer-detail-statistics__header__right">
        <app-date-picker
          :value="range"
          :use-query-router="false"
          :placeholder="$t('select-date-range')"
          :append-to-body="false"
          popup-class="placement-right"
          @input="handleChangeRange"
        />
      </div>
    </div>
    <div class="customer-detail-statistics__body">
      <div class="customer-detail-statistics__body__left">
        <customer-detail-chart-total-orders
          :range="range"
          :customer="customer"
        />
      </div>
      <div class="customer-detail-statistics__body__right">
        <customer-detail-chart-total-spending
          :range="range"
          :customer="customer"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { today, last30Days, listLast30Days } from '@/utils/moment'
export default {
  name: 'CustomerDetailStatistics',
  props: {
    customer: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      range: [new Date(last30Days), new Date(today)],
      listDays: listLast30Days.sort((a, b) => {
        return new Date(a) - new Date(b)
      }),
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(query) {
        const { date_from, date_to } = query
        if (date_from && date_to) {
          this.range = [new Date(date_from), new Date(date_to)]
        }
      },
    },
    range: {
      immediate: true,
      handler() {
        this.$emit('changeDateRange', [...this.range])
      },
    },
  },
  methods: {
    handleChangeRange(date = []) {
      this.range = date
      if (!date[0] || !date[1]) {
        this.range = [new Date(last30Days), new Date(today)]
      }
    },
    disabledDate(date) {
      return date > today
    },
  },
}
</script>
<style lang="less" scoped>
.customer-detail-statistics {
  &__header {
    margin-bottom: 16px;
    padding: 14px 16px;
    border-radius: 8px;
    border: 1px solid @gray-5;
    @apply flex items-center justify-between;
    &__left {
      padding-block: calc(24px - 14px);
      &--title {
        font-size: @size-20;
        line-height: @size-24;
        color: @black;
        @apply font-medium;
      }
    }
    &__right {
      /deep/ .custom-datepicker {
        .ant-select-selection-selected-value {
          @apply flex items-center;
        }
        .mx-input {
          height: @height-field;
          font-size: @size-16;
          color: @black;
        }
        .mx-icon-calendar {
          color: @black;
        }
      }
    }
  }
  &__body {
    @apply flex;
    @media screen and(max-width: 1200px) {
      @apply flex-col;
    }
    &__left {
      width: calc(50% - 16px);
      margin-right: 16px;
      border: 1px solid @gray-5;
      border-radius: 8px;
      padding: 24px 16px;
      @media screen and(max-width: 1200px) {
        width: 100%;
        margin-bottom: 16px;
      }
    }
    &__right {
      width: calc(50%);
      border: 1px solid @gray-5;
      border-radius: 8px;
      padding: 24px 16px;
      @media screen and(max-width: 1200px) {
        width: 100%;
      }
    }
  }
}
</style>
