<template>
  <div class="customer-page">
    <div class="customer-page__title">{{ $t('customer') }}</div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div class="customer-page__actions">
        <div class="customer-page-filters">
          <div class="customer-page-filters__left">
            <a-input
              v-model="filter.search"
              :placeholder="$t('search-by-customer-name-or-customer-number')"
            >
              <a-icon slot="prefix" type="search" />
            </a-input>
            <app-loading v-if="$fetchState.pending" />
            <customer-select-channel
              v-else
              :key="keyComponentSelectChannel"
              :channels="channels"
              :ids="filter.checkedChannelIds"
              @input="handleUpdateChannelIds"
            />
            <a-select
              v-model="filter.rank"
              style="width: 150px"
              @change="handleChangeRank"
            >
              <a-select-option
                v-for="(item, index) in rankOptions"
                :key="index"
                :value="item.value"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <app-date-picker
              :value="filter.range"
              :disabled-date="disabledDate"
              :clearable="false"
              :placeholder="$t('select-date-range')"
              @input="handleChangeRange"
            />
            <a-button
              type="primary"
              class="btn-filter"
              @click="handleShowFilter"
            >
              <icon-filter />
            </a-button>
            <customer-filter-advanced
              :is-show="isShowFilter"
              :is-loading="isLoading"
              :channels="channels"
              :ranks="ranks"
              @close="handleCloseFilter"
            />
          </div>
          <div class="customer-page-filters__right">
            <export-data-customer :filters="exportFilters" />
          </div>
        </div>
      </div>
      <div class="customer-page__content">
        <customer-table
          :customers="customers"
          :total="total"
          :is-loading="isLoading"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { today, last30Days, convertLocalToUTC } from '@/utils/moment'

export default {
  name: 'CustomerPage',
  fetchOnServer: false,
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      ranks: [],
      range: [new Date(last30Days), new Date(today)],
      channels: [],
      customers: [],
      total: 0,
      exportFilters: {},
      isLoading: false,
      isShowFilter: false,
      keyComponentSelectChannel: 0,
      sort: '',
      filter: {
        search: '',
        checkedChannelIds: [],
        rank: '',
        orderedBy: '',
        totalSpendingFrom: '',
        totalSpendingToo: '',
        completeRateFrom: '',
        completeRateTo: '',
        range: [new Date(last30Days), new Date(today)],
      },
    }
  },
  async fetch() {
    await Promise.all([this.fetchSocialChannels(), this.fetchRanks()])
  },
  computed: {
    rankOptions() {
      const ranks = this.ranks.map((item) => {
        return {
          key: item.id,
          name: item.name,
          value: `${item.id}`,
        }
      })
      return [{ key: '', value: '', name: this.$t('all-ranks') }, ...ranks]
    },
  },
  watch: {
    '$route.query': {
      handler() {
        this.handlerFilter()
      },
    },
    'filter.search'() {
      this.handleSearch()
    },
  },
  created() {
    this.handlerFilter()
  },
  methods: {
    async fetchSocialChannels() {
      try {
        const params = {
          paginate: false,
        }
        const { data } = await this.$api.socialChannel.getSocialChannelsByUser(
          params
        )
        if (data) {
          if (!this.$route.query.channel_ids?.length) {
            const channelIds = await data
              .map((item) => {
                return item.social_channel_id
              })
              .sort((a, b) => {
                return a - b
              })
            const query = {
              ...this.$route.query,
              channel_ids: channelIds.join(','),
            }
            this.$router.push({ query })
          }
          this.channels = data
        }
      } catch (e) {}
    },
    async fetchRanks() {
      try {
        const { data } = await this.$api.customer.getRanks()
        if (data) {
          this.ranks = data
        }
      } catch (e) {}
    },
    async fetchCustomers() {
      try {
        this.isLoading = true
        const socialChannelIds = this.filter.checkedChannelIds.join(',')
        const params = {
          ...(this.filter.search?.length && {
            search_columns: this.filter.search,
          }),
          ...(this.filter.rank?.length && {
            'filter[rank_id]': this.filter.rank,
          }),
          date_from: convertLocalToUTC(
            this.filter.range[0],
            'YYYY-MM-DD HH:mm'
          ),
          date_to: convertLocalToUTC(this.filter.range[1], 'YYYY-MM-DD HH:mm'),
          ...(socialChannelIds?.length && {
            'filter[social_channel_id]': socialChannelIds,
          }),
          ...(this.filter.totalSpendingFrom?.length &&
            !isNaN(this.filter.totalSpendingFrom) && {
              'total_spending[from]': this.filter.totalSpendingFrom,
            }),
          ...(this.filter.totalSpendingTo?.length &&
            !isNaN(this.filter.totalSpendingTo) && {
              'total_spending[to]': this.filter.totalSpendingTo,
            }),
          ...(this.filter.completeRateFrom?.length &&
            !isNaN(this.filter.completeRateFrom) && {
              'complete_rate[from]': this.filter.completeRateFrom,
            }),
          ...(this.filter.completeRateTo?.length &&
            !isNaN(this.filter.completeRateTo) && {
              'complete_rate[to]': this.filter.completeRateTo,
            }),
          ...(this.sort?.length && { sort: this.sort }),
          limit: this.limit,
          page: this.page,
        }
        this.exportFilters = { ...params }
        const { data, meta } = await this.$api.customer.getCustomers(params)
        if (data) {
          this.customers = data
          this.total = meta.pagination.total
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
    handlerFilter() {
      const {
        page = 1,
        limit = this.$store.state.limit,
        rank = '',
        date_from,
        date_to,
        channel_ids = '',
        total_spending_from = '',
        total_spending_to = '',
        complete_rate_from = '',
        complete_rate_to = '',
        sort = '',
      } = this.$route.query
      this.page = Number(page)
      this.limit = Number(limit)
      this.filter.rank = rank
      this.filter.totalSpendingFrom = total_spending_from
      this.filter.totalSpendingTo = total_spending_to
      this.filter.completeRateFrom = complete_rate_from
      this.filter.completeRateTo = complete_rate_to
      this.filter.checkedChannelIds = channel_ids?.length
        ? channel_ids?.split(',').map((id) => {
            return parseInt(id)
          })
        : []
      if (date_from && date_to) {
        this.filter.range = [new Date(date_from), new Date(date_to)]
        const checkDateFrom = this.$moment(date_from).format('YYYY-MM-DD HH:mm')
        const checkDateTo = this.$moment(date_to).format('YYYY-MM-DD HH:mm')
        if (
          checkDateFrom === 'Invalid date' ||
          checkDateTo === 'Invalid date'
        ) {
          this.handleChangeRange([])
        }
      } else {
        this.handleChangeRange([])
      }
      if (sort.length > 0) {
        this.sort = sort
      }
      this.keyComponentSelectChannel += 1
      if (this.filter.checkedChannelIds?.length) {
        this.fetchCustomers()
      } else {
        this.customers = []
      }
    },
    handleUpdateChannelIds(ids) {
      const query = {
        ...this.$route.query,
        channel_ids: ids.join(','),
        page: 1,
      }
      if (!query.channel_ids?.length) {
        delete query.channel_ids
      }
      this.$router.push({ query })
    },
    handleChangeRank(value) {
      const query = {
        ...this.$route.query,
        page: 1,
        rank: value,
      }
      if (!query.rank?.length) {
        delete query.rank
      }
      this.$router.push({ query })
    },
    handleChangeRange(date = []) {
      this.filter.range = date
      const query = {
        ...this.$route.query,
        date_from: this.$moment(date[0]).format('YYYY-MM-DD HH:mm'),
        date_to: this.$moment(date[1]).format('YYYY-MM-DD HH:mm'),
        page: 1,
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
        query.date_to = this.$moment(today).format('YYYY-MM-DD HH:mm')
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
      this.$router.push({ query })
    },
    disabledDate(date) {
      return date > today
    },
    handleSearch: debounce(function () {
      const query = {
        ...this.$route.query,
        page: 1,
        search: this.filter.search,
      }
      if (!query.search?.length) {
        delete query.search
      }
      this.$router.push({ query })
    }, 1000),
    handleShowFilter() {
      this.isShowFilter = true
    },
    handleCloseFilter() {
      this.isShowFilter = false
    },
  },
}
</script>

<style lang="less" scoped>
.customer-page {
  padding: @padding-40 @padding-24;
  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: @margin-16;
    @apply font-semibold;
  }
  &__content {
    margin-top: 24px;
  }
  .btn-filter {
    background-color: @gray-6;
    color: @black;
    width: @height-field;
    height: @height-field;
    @apply p-0 border-0 rounded-xl ml-2 inline-flex items-center justify-center;
    svg {
      font-size: @size-14;
      width: @size-14;
      height: @size-14;
    }
  }
}

.customer-page-filters {
  @apply flex items-center justify-between flex-wrap;
  &__left {
    @apply flex items-center;
  }

  /deep/.ant-input-affix-wrapper {
    width: 30rem;
    margin-right: 12px;

    .ant-input {
      height: @height-field;
      color: @black;
      border-color: @black-gray;
    }
  }

  /deep/.ant-select {
    margin-right: 12px;

    .ant-select-selection {
      height: @height-field;
      border-color: @black-gray;

      &__rendered {
        line-height: @height-field;
        color: @black;
      }
      .ant-select-arrow {
        color: @black;
      }
    }
  }

  /deep/.mx-datepicker {
    width: 38rem;
    margin-right: 12px;

    .mx-input {
      height: @height-field;
      color: @black;
      border-color: @black-gray;
    }
  }

  /deep/.popover-button {
    height: @height-field;
    &__text {
      color: @black;
    }
    /deep/.anticon.anticon-down {
      font-size: @size-12;
    }
  }
}
</style>
