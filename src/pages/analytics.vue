<template>
  <div class="analytics-page">
    <div class="analytics-page__title">{{ $t('analytics') }}</div>
    <div v-if="!$fetchState.pending" class="analytics-page__filters">
      <app-select-channel :channels="channels" />
      <app-date-picker
        :value="range"
        :disabled-date="disabledDate"
        :clearable="false"
        :use-today="false"
        format="DD/MM/YYYY"
        format-value="YYYY-MM-DD"
        type="date"
        value-type="date"
        @input="handleChangeRange"
      />
    </div>
    <div v-if="$fetchState.pending || loading" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div class="analytics-page__dashboard">
        <analytics-dashboard-card
          v-for="(item, index) in dashboards"
          :key="index"
          :dashboard="item"
        />
      </div>
      <div>
        <chart-line
          id="chartjs-tooltip"
          :data="lineChartData"
          :is-show-number-y-axes="channels.length > 0"
          class="chart-line-container"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { get } from 'lodash'
import {
  yesterdayEnd,
  last30Days,
  listLast30Days,
  getDays,
  oneYearAgo,
} from '@/utils/moment'
import { colorsChart } from '@/utils/chart'
const colors = colorsChart()

export default {
  name: 'AnalyticsPage',
  fetchOnServer: false,
  asyncData({ app, redirect }) {
    const permissions = get(app, 'store.state.auth.user.permissions', []) || []
    if (!permissions.includes('analytics')) {
      const defaultLocale = app.i18n.defaultLocale
      const locale = app.store.state.i18n.locale
      const url = locale === defaultLocale ? '/' : `/${locale}`

      redirect(url)
    }
  },
  data() {
    return {
      loading: false,
      range: [new Date(last30Days), new Date(yesterdayEnd)],
      channels: [],
      analytics: {},
      listIdChannelSelected: [],
      listDays: listLast30Days.sort((a, b) => {
        return new Date(a) - new Date(b)
      }),
    }
  },
  async fetch() {
    await this.fetchSocialChannels()
  },
  computed: {
    allChannelIds() {
      return this.channels.map((channel) => {
        return channel.social_channel_id
      })
    },
    dashboards() {
      return [
        {
          icon: 'far fa-list-alt',
          title: this.$t('conversations'),
          number: get(this.analytics, 'total_conversation', 0) || 0,
        },
        {
          icon: 'far fa-user',
          title: this.$t('guests'),
          number: get(this.analytics, 'total_guest', 0) || 0,
        },
        // {
        //   icon: 'far fa-clipboard-list',
        //   title: this.$t('crm-orders'),
        //   number: get(this.analytics, 'total_order', 0) || 0,
        // },
        {
          icon: 'fas fa-reply',
          title: this.$t('responses'),
          number: get(this.analytics, 'total_response', 0) || 0,
        },
      ]
    },
    dataChannels() {
      const dataChannels = {
        facebook: [],
        instagram: [],
        whatsapp: [],
        zalo: [],
        shopee: [],
      }
      this.listDays.forEach((day) => {
        const channels = get(this.analytics, `date[${day}]`, []) || []
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
            const isShopee = Object.prototype.hasOwnProperty.call(
              channel,
              'shopee'
            )
            if (isFacebook) {
              const number = get(channel, 'facebook.total_conversation', 0) || 0
              dataChannels.facebook = [...dataChannels.facebook, number]
            } else if (isInstagram) {
              const number =
                get(channel, 'instagram.total_conversation', 0) || 0
              dataChannels.instagram = [...dataChannels.instagram, number]
            } else if (isWhatsapp) {
              const number = get(channel, 'whatsapp.total_conversation', 0) || 0
              dataChannels.whatsapp = [...dataChannels.whatsapp, number]
            } else if (isZalo) {
              const number = get(channel, 'zalo.total_conversation', 0) || 0
              dataChannels.zalo = [...dataChannels.zalo, number]
            }
            if (isShopee) {
              const number = get(channel, 'shopee.total_conversation', 0) || 0
              dataChannels.shopee = [...dataChannels.shopee, number]
            }
          })
        } else {
          dataChannels.facebook = [...dataChannels.facebook, 0]
          dataChannels.instagram = [...dataChannels.instagram, 0]
          dataChannels.whatsapp = [...dataChannels.whatsapp, 0]
          dataChannels.zalo = [...dataChannels.zalo, 0]
          dataChannels.shopee = [...dataChannels.shopee, 0]
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
            pointRadius: 1,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.4,
          },
          // {
          //   label: this.$t('instagram'),
          //   data: [...this.dataChannels.instagram],
          //   borderColor: colors.instagram,
          //   backgroundColor: 'red',
          //   pointBackgroundColor: colors.instagram,
          //   pointRadius: 1,
          //   pointHoverRadius: 6,
          //   fill: false,
          //   tension: 0.4,
          // },
          // {
          //   label: this.$t('shopee'),
          //   data: [...this.dataChannels.shopee],
          //   borderColor: colors.shopee,
          //   backgroundColor: 'red',
          //   pointBackgroundColor: colors.shopee,
          //   pointRadius: 1,
          //   pointHoverRadius: 6,
          //   fill: false,
          //   tension: 0.4,
          // },
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
    '$route.query': {
      immediate: true,
      handler() {
        this.handlerFilter()
      },
    },
  },
  created() {
    this.handlerFilter()
  },
  methods: {
    renderTitleChannel(code = 'facebook') {
      return (
        <div>
          <img
            src={`~assets/images/Icon/Icon-${code}.png`}
            width="30px"
            height="30px"
            alt=""
          />
          {this.$t(code)}
        </div>
      )
    },
    async fetchSocialChannels() {
      try {
        const params = {
          paginate: false,
        }
        const { data } = await this.$api.socialChannel.getSocialChannelsByUser(
          params
        )
        if (data) {
          this.channels = data
        }
      } catch (e) {}
    },
    async fetchAnalytics() {
      this.loading = true
      try {
        const { channel_ids, date_from, date_to } = this.$route.query
        const socialChannelIds = channel_ids
          ? channel_ids.split(',').map((id) => {
              return parseInt(id)
            })
          : null
        if (!socialChannelIds) {
          this.analytics = []
          return
        }
        if (date_from || date_to) {
          const startDate = this.$moment(
            this.$moment(date_from).format('YYYY-MM-DD')
          )
          const endDate = this.$moment(
            this.$moment(date_to).format('YYYY-MM-DD')
          )
          const listDays = endDate.diff(startDate, 'days')
          const getDatesBetweenDates = getDays(endDate, listDays).sort(
            (a, b) => {
              return new Date(a) - new Date(b)
            }
          )
          this.listDays = [...getDatesBetweenDates]
          this.range = [new Date(date_from), new Date(date_to)]
        }
        const params = {
          social_channel_ids: [...socialChannelIds],
          date_from: this.$moment(date_from).format('YYYY-MM-DD') || last30Days,
          date_to: this.$moment(date_to).format('YYYY-MM-DD') || yesterdayEnd,
        }
        const { data } = await this.$api.analytics.getStatistics(params)
        if (data) {
          this.analytics = data
        }
      } catch (e) {
      } finally {
        this.loading = false
      }
    },
    handlerFilter() {
      const { date_from, date_to } = this.$route.query
      if (date_from && date_to) {
        this.handleChangeRange([new Date(date_from), new Date(date_to)])
      } else {
        this.handleChangeRange([])
      }
      this.fetchAnalytics()
    },
    handleChangeRange(date = []) {
      this.range = date
      const query = {
        ...this.$route.query,
        date_from: this.$moment(date[0]).format('YYYY-MM-DD HH:mm'),
        date_to: this.$moment(date[1]).format('YYYY-MM-DD HH:mm'),
      }
      if (
        query.date_from === 'Invalid date' ||
        query.date_to === 'Invalid date' ||
        !date[0] ||
        !date[1]
      ) {
        query.date_from = this.$moment(new Date(last30Days)).format(
          'YYYY-MM-DD HH:mm'
        )
        query.date_to = this.$moment(yesterdayEnd).format('YYYY-MM-DD HH:mm')
        this.range = [new Date(last30Days), new Date(yesterdayEnd)]
      }
      this.$router.push({ query })
    },
    disabledDate(date) {
      return date > this.$moment(yesterdayEnd) || date < oneYearAgo
    },
    handleUpdateChannelIds(ids) {
      this.listIdChannelSelected = [...ids]
    },
  },
}
</script>

<style lang="less" scoped>
.analytics-page {
  padding: 37px @padding-24;
  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }

  &__filters {
    padding-top: 1rem;
    @apply flex items-center;
  }

  &__dashboard {
    margin-top: 2rem;
    margin-bottom: 35px;
    @apply grid grid-cols-1 gap-6;
    .desktop({
      @apply grid-cols-2;
    });
    .full-hd({
      @apply grid-cols-4;
    });
    .widescreen({
      @apply grid-cols-4;
    });
  }
  /deep/.mx-datepicker {
    width: 38rem;
    .mx-input {
      height: @height-field;
      color: @gray-1;
      font-size: @size-16;
      line-height: @size-24;
    }
    .mx-icon-calendar {
      color: @black;
      font-size: @size-16;
    }
  }
}

.chart-line-container {
  height: 350px;
  position: relative;
  border: 1px solid @secondary-3;
  border-radius: @border-radius-lg;
  padding: 1rem;
  cursor: pointer;
}
</style>
