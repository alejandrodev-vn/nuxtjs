<template>
  <date-picker
    ref="DatePicker"
    v-model="date"
    class="custom-select"
    :clearable="clearable"
    range
    :type="type"
    :format="format"
    width="100%"
    range-separator=" - "
    :placeholder="placeholder"
    :lang="locales[$i18n.locale]"
    :disabled-date="disabledDate"
    :append-to-body="appendToBody"
    :popup-class="popupClass"
    :disabled="disabled"
    @change="handleChangeRange"
  >
    <template #sidebar>
      <button
        v-for="s in shortcutsDate"
        :key="s.text"
        class="mx-btn mx-btn-text mx-btn-shortcut"
        :class="{ pressed: currentShortcut === s.key }"
        @click="handleClickShortcut(s)"
      >
        {{ s.text }}
      </button>
    </template>
  </date-picker>
</template>

<script>
import moment from 'moment'
import { isEmpty } from 'lodash'
import {
  last7Days,
  yesterdayEnd,
  last3Days,
  last30Days,
  thisMonth,
  lastMonth,
  lastMonthEnd,
  lastQuarterEnd,
  lastQuarterStart,
  lastYear,
  lastYearEnd,
  thisQuarterStart,
  thisYear,
  today,
} from '@/utils/moment'

export default {
  name: 'AppDatePicker',
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    type: {
      type: String,
      default: 'datetime',
    },
    placeholder: {
      type: String,
      default() {
        this.$t('select-date-range')
      },
    },
    format: {
      type: String,
      default: 'HH:mm DD/MM/YYYY',
    },
    formatValue: {
      type: String,
      default: 'YYYY-MM-DD HH:mm',
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    value: {
      type: Array,
      default: () => [],
    },
    valueType: {
      type: String,
      default: 'datetime',
    },
    disabledDate: {
      type: Function,
      default: () => {},
    },
    appendToBody: {
      type: Boolean,
      default: true,
    },
    popupClass: {
      type: String,
      default: '',
    },
    useToday: {
      type: Boolean /* if false, date_from is end of yesterday */,
      default: true,
    },
    useQueryRouter: {
      type: Boolean /* if false, change range doesn't push to query  */,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // const now = moment()
    // const created_at = get(this.$store.state.store, 'created_at', '')
    // const todayTime = new Date(moment().startOf('day')).getTime()
    // const dateCreated = new Date(created_at).getTime()
    // const numberOfDay = Math.round(
    //   (todayTime - dateCreated) / (1000 * 60 * 60 * 24)
    // )
    // const createdDays = moment([now.year(), now.month(), now.date()])
    //   .subtract(numberOfDay, 'days')
    //   .toDate()
    return {
      date: [],
      last30Days,
      currentShortcut: '',
    }
  },
  fetch() {
    if (!isEmpty(this.value)) {
      this.date = this.value
    }
  },
  computed: {
    shortcutsDate() {
      return [
        {
          key: 'three-day-ago',
          text: this.$t('three-day-ago'),
          onClick() {
            return [last3Days, !this.useToday ? yesterdayEnd : today]
          },
          date: [last3Days, !this.useToday ? yesterdayEnd : today],
        },
        {
          key: 'week-ago',
          text: this.$t('week-ago'),
          onClick() {
            return [last7Days, !this.useToday ? yesterdayEnd : today]
          },
          date: [last7Days, !this.useToday ? yesterdayEnd : today],
        },
        {
          key: 'this-month',
          text: this.$t('this-month'),
          onClick() {
            return [thisMonth, !this.useToday ? yesterdayEnd : today]
          },
          date: [thisMonth, !this.useToday ? yesterdayEnd : today],
        },
        {
          key: 'previous-month',
          text: this.$t('previous-month'),
          onClick() {
            return [lastMonth, lastMonthEnd]
          },
          date: [lastMonth, lastMonthEnd],
        },
        {
          key: 'this-quarter',
          text: this.$t('this-quarter'),
          onClick() {
            return [thisQuarterStart, !this.useToday ? yesterdayEnd : today]
          },
          date: [thisQuarterStart, !this.useToday ? yesterdayEnd : today],
        },
        {
          key: 'previous-quarter',
          text: this.$t('previous-quarter'),
          onClick() {
            return [lastQuarterStart, lastQuarterEnd]
          },
          date: [lastQuarterStart, lastQuarterEnd],
        },
        {
          key: 'this-year',
          text: this.$t('this-year'),
          onClick() {
            return [thisYear, !this.useToday ? yesterdayEnd : today]
          },
          date: [thisYear, !this.useToday ? yesterdayEnd : today],
        },
        {
          key: 'previous-year',
          text: this.$t('previous-year'),
          onClick() {
            return [lastYear, lastYearEnd]
          },
          date: [lastYear, lastYearEnd],
        },
      ]
    },
    locales() {
      return {
        en: {
          formatLocale: {
            weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          },
        },
        ms: {
          formatLocale: {
            months: [
              'januari',
              'februari',
              'mac',
              'april',
              'mei',
              'jun',
              'julai',
              'ogos',
              'september',
              'oktober',
              'november',
              'disember',
            ],
            monthsShort: [
              'Januari',
              'Februari',
              'Mac',
              'April',
              'Mei',
              'Jun',
              'Julai',
              'Ogos',
              'September',
              'Oktober',
              'November',
              'Disember',
            ],
            weekdays: [
              'ahad',
              'isnin',
              'selasa',
              'rabu',
              'khamis',
              'jumaat',
              'sabtu',
            ],
            weekdaysShort: ['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'],
            weekdaysMin: ['Ah', 'Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa'],
            firstDayOfWeek: 1,
            firstWeekContainsDate: 4,
          },
        },
      }
    },
  },
  watch: {
    value(value) {
      this.date = value
    },
  },
  created() {
    if (this.value[0] && this.value[1]) {
      this.date = this.value
    }
  },
  methods: {
    formatDate(date) {
      return moment.utc(date).local().format(this.formatValue)
    },
    handleChangeRange(date) {
      let dateArray = [new Date(date[0]), new Date(date[1])]
      const query = {
        ...this.$route.query,
        date_from: moment(date[0]).format(this.formatValue),
        date_to: moment(date[1]).format(this.formatValue),
      }
      if (
        query.date_from === 'Invalid date' ||
        query.date_to === 'Invalid date'
      ) {
        delete query.date_from
        delete query.date_to
        dateArray = []
      }
      if (this.useQueryRouter) {
        this.$router.push({ query })
      }
      this.$emit('input', dateArray)
    },
    handleClickShortcut(shortcut) {
      this.currentShortcut = shortcut.key
      this.handleChangeRange(shortcut.date)
    },
    getPressed(shortcut) {
      const [sStart, sEnd] = shortcut
      if (!this.$refs.DatePicker) return
      const [start, end] = this.$refs.DatePicker.currentValue
      return (
        this.$moment(sStart).format('YYYY-MM-DD') ===
          this.$moment(start).format('YYYY-MM-DD') &&
        this.$moment(sEnd).format('YYYY-MM-DD') ===
          this.$moment(end).format('YYYY-MM-DD')
      )
    },
  },
}
</script>

<style lang="less">
.mx-datepicker {
  /deep/.mx-input {
    height: @height-field;
    color: @gray-1;
    font-size: @size-16;
    line-height: @size-24;
  }
  /deep/.mx-icon-calendar {
    color: @black;
    font-size: @size-16;
  }
  .mx-datepicker-popup {
    left: unset !important;
    right: 0;
  }
}
.mx-datepicker-popup {
  border-radius: 20px;
  @apply flex;
  .mx-datepicker-sidebar {
    height: 33rem !important;
    overflow: hidden scroll;
    width: max-content;
    padding: 0;
    padding-top: 1rem;
    &::-webkit-scrollbar {
      width: 6px;
      &:hover {
        width: 11px;
      }
    }
    &::-webkit-scrollbar-track {
      background-color: #eee;
      border-radius: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #aaa;
      border-radius: 6px;
      min-height: 50px;
      &:hover {
        background-color: #999;
      }
    }
    .mx-btn.mx-btn-text.mx-btn-shortcut {
      height: 4.4rem;
      width: 100%;
      padding-inline: 1rem;
      &.pressed {
        background-color: @primary-3;
      }
    }
  }
  .mx-datepicker-content {
    margin-left: 0;
  }
}
</style>
