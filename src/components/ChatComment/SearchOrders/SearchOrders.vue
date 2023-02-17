<template>
  <div class="search-orders">
    <h5 class="search-orders__title">
      {{ $t('searchOrder') }}
    </h5>
    <div class="search-orders__body">
      <div class="flex items-center">
        <app-date-picker
          :value="filter.range"
          :disabled-date="disabledDate"
          :use-query-router="false"
          :clearable="false"
          :placeholder="$t('select-date-range')"
          :append-to-body="false"
          popup-class="placement-right"
          @input="handleChangeRange"
        />
      </div>
      <a-input
        v-model="filter.code"
        class="input-search-id"
        :placeholder="placeholderTypeSearch"
      >
        <a-icon slot="prefix" type="search" />
        <template #addonBefore>
          <a-select
            v-model="typeSearch"
            default-value=""
            style="width: 100%"
            dropdown-class-name="dropdown-search-order-id"
            @change="handleChangeTypeSearch"
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
      <a-checkbox v-model="filter.isSearchByGuest" class="custom-checkbox">
        {{ $t('only-show-orders-from-this-guest') }}
      </a-checkbox>
      <perfect-scrollbar
        :options="{ suppressScrollX: true }"
        class="scroll-order-list"
        @ps-y-reach-end="handleLoadMore"
      >
        <app-loading v-if="isLoading" />
        <div v-else-if="!orders.length" class="mt-4">
          <app-no-data :text="$t('no-data')" />
        </div>
        <search-orders-order-list
          v-else
          :orders="orders"
          @handleOpenOrderDetail="handleOpenOrderDetail"
        />
      </perfect-scrollbar>
    </div>
    <search-orders-order-detail
      v-if="isShowOrderDetail"
      :visible="isShowOrderDetail"
      :order="orderDetail"
      @handleCloseOrderDetail="handleCloseOrderDetail"
    />
  </div>
</template>
<script>
import { debounce } from 'lodash'
import { today, last30Days, convertLocalToUTC } from '@/utils/moment'

export default {
  name: 'SearchOrders',
  fetchOnServer: false,
  data() {
    return {
      isLoading: false,
      isLoadingMore: false,
      page: 1,
      limit: this.$store.state.limit,
      total: 0,
      filter: {
        range: [new Date(last30Days), new Date(today)],
        code: '',
        isSearchByGuest: false,
        channelIds: [this.$route.params.page],
      },
      typeSearch: 'order-id',
      isShowOrderDetail: false,
      orderDetail: null,
      orders: [],
    }
  },
  async fetch() {
    await this.fetchOrders()
  },
  computed: {
    guestId() {
      return this.$route.params.guest
    },
    noMoreResults() {
      return !this.isLoadingMore && this.page >= this.total
    },
    placeholderTypeSearch() {
      return this.typeSearch === 'customer-phone'
        ? this.$t('search-by-customer-phone')
        : this.$t('search-by-order-ID')
    },
    orderId() {
      return this.$route.query.order_id
    },
  },
  watch: {
    filter: {
      deep: true,
      handler() {
        this.handleFilter()
      },
    },
    async orderId() {
      if (
        (this.orderId?.length && !this.orderDetail) ||
        this.orderDetail?.code !== this.orderId
      ) {
        await this.fetchOrderDetail()
        if (!this.orderDetail) return
        this.isShowOrderDetail = true
      }
    },
  },
  async mounted() {
    if (
      (this.orderId?.length && !this.orderDetail) ||
      this.orderDetail?.code !== this.orderId
    ) {
      await this.fetchOrderDetail()
      if (!this.orderDetail) return
      this.isShowOrderDetail = true
    }
  },
  destroyed() {
    const query = {
      ...this.$route.query,
    }
    if (query.order_id) {
      delete query.order_id
    }
    this.$router.push({ query })
  },
  methods: {
    handleChangeTypeSearch(value) {
      this.filter.code = ''
    },
    handleLoadMore() {
      if (
        !this.$fetchState.pending &&
        !this.isLoadingMore &&
        !this.noMoreResults
      ) {
        this.isLoadingMore = true
        this.page++
        this.fetchOrders()
      }
    },
    async fetchOrders() {
      try {
        this.isLoadingMore = true
        const filterDate =
          !this.filter?.range[0] || !this.filter?.range[1]
            ? null
            : {
                date_from: convertLocalToUTC(
                  this.$moment(this.filter.range[0]),
                  'YYYY-MM-DD HH:mm'
                ),
                date_to: convertLocalToUTC(
                  this.$moment(this.filter.range[1]),
                  'YYYY-MM-DD HH:mm'
                ),
              }
        const socialChannelIds = !this.filter.channelIds.length
          ? null
          : this.filter.channelIds.length === 1
          ? { 'filter[social_channel_id]': this.filter.channelIds[0] }
          : { 'filter[social_channel_id]': [...this.filter.channelIds] }
        const search =
          this.typeSearch === 'customer-phone'
            ? this.filter.code?.length && {
                'search[0][field]': 'customer_phone',
                'search[0][value]': this.filter.code,
              }
            : this.filter.code?.length && {
                'search[0][field]': 'code',
                'search[0][value]': this.filter.code,
              }
        const params = {
          page: this.page,
          limit: this.limit,
          ...(search && search),
          ...(filterDate && { ...filterDate }),
          ...(socialChannelIds && { ...socialChannelIds }),
          ...(this.filter.isSearchByGuest &&
            this.guestId && {
              'filter[fan_id]': this.guestId,
            }),
          include:
            'social_channel,customer,delivery_provider,currency,shipping_address,order_details,payment_method,order_status',
          sort: '-created_at',
        }
        const { data, meta } = await this.$api.order.getOrders(params)
        if (data) {
          this.orders = [...this.orders, ...data]
          this.total = meta.pagination.total_pages
        }
      } catch (err) {
      } finally {
        this.isLoadingMore = false
      }
    },
    async fetchOrderDetail() {
      try {
        if (!this.orderId?.length) return
        const params = {
          'search[0][field]': 'code',
          'search[0][value]': this.orderId,
          include:
            'social_channel,customer,delivery_provider,currency,shipping_address,order_details,payment_method,order_status',
        }
        const { data } = await this.$api.order.getOrders(params)
        if (data?.length) {
          this.orderDetail = { ...data[0] }
        }
      } catch (err) {}
    },
    handleUpdateChannelIds(ids) {
      this.filter.channelIds = [...ids]
    },
    handleScrollOrderId(e) {
      const { target } = e
      if (
        !this.isLoadingMoreOrderId &&
        !this.noMoreResultsOrderId &&
        target.scrollTop + target.offsetHeight >= target.scrollHeight - 10
      ) {
        this.pageOrderId++
        this.fetchOrdersId()
      }
    },
    disabledDate(date) {
      return date > today
    },
    handleChangeRange(date = []) {
      this.filter.range = date
      if (!date[0] || !date[1]) {
        this.filter.range = [new Date(last30Days), new Date(today)]
      }
    },
    handleOpenOrderDetail(order) {
      this.orderDetail = { ...order }
      if (!this.orderDetail) return
      const query = {
        ...this.$route.query,
        order_id: this.orderDetail.code,
      }
      this.$router.push({ query })
      this.isShowOrderDetail = true
    },
    handleCloseOrderDetail() {
      const query = {
        ...this.$route.query,
      }
      if (query.order_id) {
        delete query.order_id
      }
      this.orderDetail = null
      this.$router.push({
        query,
      })
      this.isShowOrderDetail = false
    },
    handleFilter: debounce(async function () {
      this.page = 1
      this.total = 0
      this.orders = []
      this.isLoading = true
      await this.fetchOrders()
      this.isLoading = false
    }, 1000),
  },
}
</script>
<style lang="less" scoped>
.search-orders {
  @apply relative h-full flex flex-col;
  .p-section {
    border-color: @gray-4;
    padding: @padding-24;
    @apply border-b;
  }
  &__title {
    font-size: @size-20;
    color: @black;
    padding: @padding-24;
    border-color: @gray-4;
    @apply text-center font-semibold m-0 border-b;
  }
  &__body {
    padding-inline: @padding-16 @padding-24;
    padding-top: @padding-24;
    height: 100%;
    @apply flex flex-col;
    /deep/.mx-datepicker-range {
      width: 100%;
      height: @height-field;
      margin-bottom: @margin-24;
      .mx-input-wrapper {
        @apply h-full;
        .mx-input {
          border: 1px solid @secondary-2;
          color: @black;
          @apply h-full;
        }
      }
    }
    /deep/.input-search-id {
      height: @height-field;
      margin-bottom: @margin-16;
      .ant-input-group-addon {
        width: 40%;
        border: 1px solid @secondary-2;
        border-right: 1px solid @border-grey-fade;
        height: @height-field;
        background: none;
        padding: 0;
        color: @black;
      }
      .ant-input {
        border: 1px solid @secondary-2;
        border-left: none;
        height: @height-field;
        color: @black;
      }
    }
    /deep/.custom-checkbox {
      color: @black;
      margin-bottom: @margin-16;
      @apply font-medium;
      .ant-checkbox-inner {
        border: 2px solid @gray-4;
      }
    }
    .scroll-order-list {
      @apply flex-1;
    }
  }
}
</style>
<style lang="less">
.dropdown-search-order-id {
  width: 300px !important;
}
</style>
