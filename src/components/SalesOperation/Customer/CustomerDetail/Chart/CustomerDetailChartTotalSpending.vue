<template>
  <div class="customer-detail-chart-total-spending">
    <div class="customer-detail-chart-total-spending__header">
      <div class="customer-detail-chart-total-spending__header__title">
        <span>{{ $t('total-spending') }}</span>
        <a-tooltip overlay-class-name="custom-tooltip-light" placement="right">
          <template slot="title">
            {{ $t('tooltip-total-order-customer') }}
          </template>
          <a-icon type="info-circle" />
        </a-tooltip>
      </div>
      <span class="customer-detail-chart-total-spending__header__total">
        <app-currency
          :price="totalSpending.total_spending"
          :currency="symbolCurrency"
        />
      </span>
    </div>
    <div v-if="!totalSpending.total_spending" class="chart-pie-nodata"></div>
    <chart-pie-total-spending
      v-else
      id="chartjs-pie"
      :data="lineChartData"
      :range="range"
      class="chart-pie-container"
    />
  </div>
</template>
<script>
import { debounce } from 'lodash'
import { colorsChart } from '@/utils/chart'
import { today, last30Days } from '@/utils/moment'

const colors = colorsChart()

export default {
  name: 'CustomerDetailChartTotalSpending',
  props: {
    range: {
      type: Array,
      default: () => [new Date(last30Days), new Date(today)],
    },
    customer: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      totalSpending: {},
      dataChart: [],
      isLoading: false,
    }
  },
  computed: {
    symbolCurrency() {
      return `${
        this.totalSpending?.symbol
          ? this.totalSpending?.symbol
          : this.$store.state.configCurrency.my.symbol
      } `
    },
    lineChartData() {
      return {
        labels: [
          this.$t('facebook'),
          this.$t('instagram'),
          // this.$t('whatsapp'),
          // this.$t('zalo'),
        ],
        datasets: [
          {
            label: this.$t('total-spending'),
            data: [...this.dataChart],
            backgroundColor: [colors.facebook, colors.instagram],
            borderWidth: 0,
          },

          // {
          //   label: this.$t('whatsapp'),
          //   data: [...this.dataChannels.whatsapp],
          //   borderColor: colors.whatsapp,
          //   pointBackgroundColor: colors.whatsapp,
          //   pointRadius: 0,
          //   fill: false,
          // lineTension: 0,
          // },
          // {
          //   label: this.$t('zalo'),
          //   data: [...this.dataChannels.zalo],
          //   borderColor: colors.zalo,
          //   pointBackgroundColor: colors.zalo,
          //   pointRadius: 0,
          //   fill: false,
          // lineTension: 0,
          // },
        ],
      }
    },
  },
  watch: {
    range: {
      immediate: true,
      handler: debounce(function () {
        this.fetchStatisticTotalSpending()
      }, 1000),
    },
    totalSpending: {
      deep: true,
      handler() {
        const dataChannels = {
          facebook: 0,
          instagram: 0,
          // whatsapp: 0,
          // zalo: 0,
        }
        const mapData = Object.keys(dataChannels).map((key) => {
          return this.totalSpending[key]?.total_spending
            ? this.totalSpending[key]?.total_spending
            : 0
        })
        this.dataChart = [...mapData]
      },
    },
  },
  methods: {
    async fetchStatisticTotalSpending() {
      try {
        if (!this.customer?.id || !this.range[0] || !this.range[1]) return
        this.isLoading = true
        const params = {
          date_from: this.$moment(this.range[0]).format('YYYY-MM-DD'),
          date_to: this.$moment(this.range[1]).format('YYYY-MM-DD'),
        }
        const { data } = await this.$api.customer.getStatisticTotalSpending(
          this.customer.id,
          params
        )
        if (data) {
          this.totalSpending = { ...data }
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
<style lang="less" scoped>
.customer-detail-chart-total-spending {
  &__header {
    margin-bottom: 24px;
    &__title {
      margin-bottom: 16px;
      @apply flex items-center;
      > span {
        color: @black;
        font-size: @size-20;
        line-height: @size-24;
        @apply font-semibold;
      }
      .anticon {
        font-size: @size-20;
        color: @black;
        margin-left: 10px;
      }
    }
    &__total {
      color: @black;
      font-size: 32px;
      line-height: 39px;
      @apply block font-semibold;
    }
  }
}
.chart-pie-container {
  height: 300px;
  position: relative;
  cursor: pointer;
}
.chart-pie-nodata {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: #eff2f8;
  margin-left: 15%;
}
</style>
