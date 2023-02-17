<template>
  <div class="customer-detail-chart-total-orders">
    <div class="customer-detail-chart-total-orders__header">
      <div class="customer-detail-chart-total-orders__header__title">
        <span>{{ $t('total-orders') }}</span>
        <a-tooltip overlay-class-name="custom-tooltip-light" placement="right">
          <template slot="title">
            {{ $t('tooltip-total-order-customer') }}
          </template>
          <a-icon type="info-circle" />
        </a-tooltip>
      </div>
      <span class="customer-detail-chart-total-orders__header__total">
        {{ totalOrders.total_order ? totalOrders.total_order : 0 }}
        {{ $t('orders') }}
      </span>
    </div>
    <app-loading v-if="isLoading" />
    <chart-line-total-orders
      v-else
      id="chartjs-tooltip"
      :data="lineChartData"
      :has-data="totalOrders.total_order > 0"
      class="chart-line-container"
    />
  </div>
</template>
<script>
import { get, debounce } from 'lodash'
import { today, last30Days, listLast30Days } from '@/utils/moment'
import { colorsChart } from '@/utils/chart'

const colors = colorsChart()

export default {
  name: 'CustomerDetailChartTotalOrders',
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
      totalOrders: {},
      listDays: listLast30Days.sort((a, b) => {
        return new Date(a) - new Date(b)
      }),
      isLoading: false,
    }
  },
  computed: {
    dataChannels() {
      const dataChannels = {
        facebook: [],
        instagram: [],
        whatsapp: [],
        zalo: [],
      }
      this.listDays.forEach((day) => {
        const channels = get(this.totalOrders, `date[${day}]`, []) || []
        if (channels.length) {
          channels.forEach((channel) => {
            const isFacebook = Object.prototype.hasOwnProperty.call(
              channel,
              'facebook'
            )
            const isInstagram = Object.prototype.hasOwnProperty.call(
              channel,
              'instagram'
            )
            const isWhatsapp = Object.prototype.hasOwnProperty.call(
              channel,
              'whatsapp'
            )
            const isZalo = Object.prototype.hasOwnProperty.call(channel, 'zalo')
            if (isFacebook) {
              const number = get(channel, 'facebook.total_order', 0) || 0
              dataChannels.facebook = [...dataChannels.facebook, number]
            } else if (isInstagram) {
              const number = get(channel, 'instagram.total_order', 0) || 0
              dataChannels.instagram = [...dataChannels.instagram, number]
            } else if (isWhatsapp) {
              const number = get(channel, 'whatsapp.total_order', 0) || 0
              dataChannels.whatsapp = [...dataChannels.whatsapp, number]
            } else if (isZalo) {
              const number = get(channel, 'zalo.total_order', 0) || 0
              dataChannels.zalo = [...dataChannels.zalo, number]
            }
          })
        } else {
          dataChannels.facebook = [...dataChannels.facebook, 0]
          dataChannels.instagram = [...dataChannels.instagram, 0]
          dataChannels.whatsapp = [...dataChannels.whatsapp, 0]
          dataChannels.zalo = [...dataChannels.zalo, 0]
        }
      })
      return dataChannels
    },
    lineChartData() {
      return {
        labels: [...this.listDays],
        datasets: [
          {
            label: this.$t('facebook'),
            data: [...this.dataChannels.facebook],
            borderColor: colors.facebook,
            backgroundColor: 'red',
            pointBackgroundColor: colors.facebook,
            pointRadius: 0,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.4,
          },
          {
            label: this.$t('instagram'),
            data: [...this.dataChannels.instagram],
            borderColor: colors.instagram,
            backgroundColor: 'red',
            pointBackgroundColor: colors.instagram,
            pointRadius: 0,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.4,
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
        this.fetchStatisticTotalOrder()
      }, 1000),
    },
  },
  methods: {
    async fetchStatisticTotalOrder() {
      try {
        if (!this.customer?.id || !this.range[0] || !this.range[1]) return
        this.isLoading = true
        const params = {
          date_from: this.$moment(this.range[0]).format('YYYY-MM-DD'),
          date_to: this.$moment(this.range[1]).format('YYYY-MM-DD'),
        }
        const { data } = await this.$api.customer.getStatisticTotalOrder(
          this.customer.id,
          params
        )
        if (data) {
          this.totalOrders = { ...data }
          const listDays = Object.keys({ ...data.date }).map((date) => date)
          this.listDays = listDays
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
.customer-detail-chart-total-orders {
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
.chart-line-container {
  height: 300px;
  position: relative;
  cursor: pointer;
}
</style>
