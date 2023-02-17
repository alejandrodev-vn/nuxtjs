<template>
  <div class="discount-form-active-dates">
    <div class="discount-form-active-dates__title">
      {{ $t('active-dates') }}
    </div>
    <div class="discount-form-active-dates__content">
      <div class="discount-form-active-dates__content--label">
        {{ $t('from-to') }}
      </div>
      <date-picker
        v-model="range"
        type="datetime"
        range
        :disabled-date="disabledDate"
        :clearable="false"
        :placeholder="$t('select-range')"
        :disabled="disabled"
        format="HH:mm DD/MM/YYYY"
        range-separator=" - "
      >
      </date-picker>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'
import { tomorrow, nextThreeDay, convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'DiscountFormActiveDates',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      range: [new Date(tomorrow), new Date(nextThreeDay)],
    }
  },
  mounted() {
    const startDate = get(this.discount, 'start_date')
    const fromDate = startDate
      ? convertUTCToLocal(startDate, 'YYYY-MM-DD HH:mm')
      : tomorrow
    const endDate = get(this.discount, 'end_date')
    const toDate = endDate
      ? convertUTCToLocal(endDate, 'YYYY-MM-DD HH:mm')
      : nextThreeDay
    this.range = [new Date(fromDate), new Date(toDate)]
  },
  methods: {
    disabledDate(date) {
      return date < new Date(new Date().setHours(0, 0, 0, 0))
    },
  },
}
</script>

<style lang="less" scoped>
.discount-form-active-dates {
  background-color: #f8f8f8;
  padding: @padding-24 @padding-20;

  &__title {
    font-size: @size-16;
    color: @black;
    margin-bottom: @margin-12;
    @apply font-medium;
  }

  &__content {
    &--label {
      font-size: @size-14;
      margin-bottom: 0.25rem;
      @apply font-medium;
    }

    /deep/.mx-datepicker-range {
      width: 100%;
    }
  }
}
</style>
