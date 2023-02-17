<template>
  <div class="order-page">
    <div class="order-page__title">{{ $t('order') }}</div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <template v-else>
      <div class="order-page__actions">
        <div class="order-page-filters">
          <div class="order-page-filters__left">
            <a-input
              v-model="filter.search"
              class="input-search-id"
              :placeholder="placeholderSearchType"
            >
              <a-icon slot="prefix" type="search" />
              <template #addonBefore>
                <a-select
                  v-model="searchType"
                  default-value=""
                  style="width: 100%"
                  dropdown-class-name="dropdown-search-order-id"
                  @change="handleChangeSearchType"
                >
                  <a-select-option value="order-id">
                    {{ $t('order-ID') }}
                  </a-select-option>
                  <a-select-option value="customer-phone">
                    {{ $t('customer-phone') }}
                  </a-select-option>
                </a-select>
              </template>
            </a-input>
            <a-select
              v-model="filter.status"
              class="custom-select"
              @change="handleChangeStatus"
            >
              <template v-for="(item, index) in statusOptions">
                <a-select-option :key="index" :value="item.value">
                  {{ item.name }}
                </a-select-option>
              </template>
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
            <order-filter-advanced
              :is-show="isShowFilter"
              :is-loading="isLoading"
              :channels="channels"
              :users="users"
              @close="handleCloseFilter"
            />
          </div>
          <div class="order-page-filters__right">
            <export-data-order :filters="exportFilters" />
          </div>
        </div>
      </div>
      <div class="order-page__content">
        <order-table
          :orders="orders"
          :total="total"
          :is-loading="isLoading"
        ></order-table>
      </div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { get, debounce } from 'lodash'
import { getResponseErrorMessage } from '@/utils'
import { today, last30Days, convertLocalToUTC } from '@/utils/moment'
Vue.use(notification)

export default {
  name: 'OrderPage',
  fetchOnServer: false,
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      isShowFilter: false,
      channelIds: null,
      channels: [],
      users: [],
      orders: [],
      total: 0,
      exportFilters: {},
      isLoading: false,
      searchType: 'order-id',
      filter: {
        channelIds: [],
        search: '',
        status: '',
        orderedBy: '',
        orderValueFrom: '',
        orderValueTo: '',
        quantityFrom: '',
        quantityTo: '',
        range: [new Date(last30Days), new Date(today)],
      },
    }
  },
  async fetch() {
    await Promise.all([this.fetchSocialChannels(), this.fetchUsers()])
  },
  computed: {
    searchTypes() {
      return [
        {
          label: this.$t('order-ID'),
          value: 'order-id',
        },
        {
          label: this.$t('customer-phone'),
          value: 'customer-phone',
        },
      ]
    },
    placeholderSearchType() {
      return this.searchType === 'customer-phone'
        ? this.$t('search-by-customer-phone')
        : this.$t('search-by-order-ID')
    },
    statusOptions() {
      const status = this.$store.state.orderStatus
      const listStatus = Object.keys(status).map((item) => {
        return {
          key: item,
          name: this.$t(item),
          value: `${status[item]}`,
        }
      })
      return [
        { key: '', value: '', name: this.$t('all-status') },
        ...listStatus,
      ]
    },
    isStaff() {
      const user = this.$auth.user
      const role = get(user, 'roles[0]', '') || ''
      return role === 'member' || role === 'crew'
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
          this.channels = [...data]
          if (!this.filter.channelIds?.length) {
            const channelIds = data
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
        }
      } catch (e) {}
    },
    async fetchOrders() {
      try {
        this.isLoading = true
        const socialChannelIds = this.filter.channelIds.join(',')
        const params = {
          sort: '-created_at',
          ...(this.filter.search?.length && {
            'search[0][field]':
              this.searchType === 'customer-phone' ? 'customer_phone' : 'code',
            'search[0][value]': this.filter.search,
          }),
          ...(this.filter.orderedBy?.length && {
            'filter[created_by]': this.filter.orderedBy,
          }),
          ...(this.filter.status?.length && {
            'filter[status]': this.filter.status,
          }),
          date_from: convertLocalToUTC(
            this.filter.range[0],
            'YYYY-MM-DD HH:mm'
          ),
          date_to: convertLocalToUTC(this.filter.range[1], 'YYYY-MM-DD HH:mm'),
          ...(this.filter.channelIds?.length && {
            'filter[social_channel_id]': socialChannelIds,
          }),
          ...(this.filter.orderValueFrom?.length &&
            !isNaN(this.filter.orderValueFrom) && {
              'order_value[from]': this.filter.orderValueFrom,
            }),
          ...(this.filter.orderValueTo?.length &&
            !isNaN(this.filter.orderValueTo) && {
              'order_value[to]': this.filter.orderValueTo,
            }),
          ...(this.filter.quantityFrom?.length &&
            !isNaN(this.filter.quantityFrom) && {
              'product_quantity[from]': this.filter.quantityFrom,
            }),
          ...(this.filter.quantityTo?.length &&
            !isNaN(this.filter.quantityTo) && {
              'product_quantity[to]': this.filter.quantityTo,
            }),
          include: 'social_channel,order_details',
          limit: this.limit,
          page: this.page,
        }
        this.exportFilters = { ...params }
        const { data, meta } = await this.$api.order.getOrders(params)
        if (data) {
          this.orders = data
          this.total = meta.pagination.total
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoading = false
      }
    },
    handlerFilter() {
      const {
        page = 1,
        limit = this.$store.state.limit,
        status = '',
        search_type = 'order-id',
        search = '',
        ordered_by = '',
        channel_ids = '',
        date_from,
        date_to,
        order_value_from = '',
        order_value_to = '',
        quantity_from = '',
        quantity_to = '',
      } = this.$route.query
      this.page = Number(page)
      this.limit = Number(limit)
      this.searchType =
        search_type === 'order-id' || search_type === 'customer-phone'
          ? search_type
          : 'order-id'
      this.filter.search = search
      this.filter.status = status
      this.filter.orderedBy = ordered_by
      this.filter.orderValueFrom = order_value_from
      this.filter.orderValueTo = order_value_to
      this.filter.quantityFrom = quantity_from
      this.filter.quantityTo = quantity_to

      this.filter.channelIds = channel_ids?.length
        ? channel_ids.split(',').map((id) => {
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
      if (this.filter.channelIds?.length) {
        this.fetchOrders()
      } else {
        this.orders = []
      }
    },
    handleShowFilter() {
      this.isShowFilter = true
      // this.isTypeComponent = 'filters'
    },
    handleCloseFilter() {
      this.isShowFilter = false
      this.isTypeComponent = ''
    },
    handleChangeSearchType(value) {
      const query = {
        ...this.$route.query,
        page: 1,
        search_type: value,
      }
      this.$router.push({ query })
    },
    handleChangeStatus(value) {
      const query = {
        ...this.$route.query,
        page: 1,
        status: value,
      }
      if (!query.status?.length) {
        delete query.status
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
        search_type: this.searchType,
        search: this.filter.search,
      }
      if (!this.filter.search?.length) {
        delete query.search
      }
      this.$router.push({ query })
    }, 1000),
    async fetchUsers() {
      try {
        const { data } = this.isStaff
          ? await this.$api.user.getUserMe()
          : await this.$api.user.getStaffs()
        if (data) {
          this.users = Object.freeze(data)
        }
      } catch (e) {}
    },
  },
}
</script>

<style lang="less" scoped>
.order-page {
  padding: @padding-40 @padding-24;
  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: 1rem;
    @apply font-semibold;
  }
  &__content {
    margin-top: 24px;
  }
}

.order-page-filters {
  @apply flex items-center justify-between flex-wrap;

  /deep/.ant-input-group-compact {
    width: 35%;
  }
  /deep/.input-search-id {
    height: @height-field;
    width: 45rem;
    margin-right: 12px;
    .ant-input-group-addon {
      width: 40%;
      border: 1px solid @black-gray;
      border-right: 1px solid @border-grey-fade;
      height: @height-field;
      background: none;
      padding: 0;
      color: @black;
      .ant-select-arrow {
        color: @black;
      }
    }
    .ant-input {
      border: 1px solid @black-gray;
      border-left: none;
      height: @height-field;
      color: @black;
    }
  }
  /deep/.custom-select {
    color: @black;
    font-size: @size-16;
    min-width: 22rem;
    width: fit-content;
    height: @height-field;
    border-color: @black-gray;
    margin-right: 12px;
    .ant-select-selection {
      border-color: @black-gray;
      height: 100%;
      &__rendered {
        height: 100%;
        line-height: @height-field;
      }
      .ant-select-selection-selected-value {
        max-width: 25rem;
        @apply pr-2;
      }
      .ant-select-arrow-icon {
        color: @black;
      }
    }
  }

  /deep/.ant-select {
    .ant-select-selection {
      height: @height-field;

      &__rendered {
        line-height: @height-field;
        color: @gray-1;
      }

      &__placeholder {
        color: @gray-1;
      }
    }
  }

  /deep/.mx-datepicker {
    width: 38rem;
    margin-right: 12px;
    border-color: @black-gray;

    .mx-input {
      height: @height-field;
      color: @black;
      font-size: @size-16;
    }
  }
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
</style>
