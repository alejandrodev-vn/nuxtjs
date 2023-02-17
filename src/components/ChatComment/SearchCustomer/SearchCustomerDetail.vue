<template>
  <a-drawer
    placement="right"
    destroyed-on-close
    get-container=".search-customer"
    width="100%"
    wrap-class-name="customer-detail"
    :wrap-style="{ position: 'absolute', width: '100%' }"
    :mask="false"
    :closable="false"
    :visible="visible"
    @close="handleCloseCustomerDetail"
  >
    <template slot="title">
      <div class="customer-detail__head">
        <a-icon type="arrow-left" @click="handleCloseCustomerDetail" />
        <h5 class="customer-detail__head__title">
          {{ $t('customer-detail') }}
        </h5>
        <span></span>
      </div>
    </template>
    <perfect-scrollbar
      :options="{ suppressScrollX: true }"
      class="customer-detail"
    >
      <div class="customer-detail__body">
        <div class="customer-detail-info">
          <app-no-data v-if="!customer" :text="$t('noDataFound')" />
          <customer-detail-card v-else :customer="customer" />
        </div>
        <div class="order-history">
          <div class="order-history__title">
            {{ $t('order-history') }}
          </div>
          <a-input v-model="search" :placeholder="$t('search-order-ID')">
            <a-icon slot="prefix" type="search" />
          </a-input>
          <div class="order-history__body">
            <app-no-data v-if="!orders.length" :text="$t('noDataFound')" />
            <div v-else class="scroll-orders my-4" @scroll="detectScroll">
              <template v-for="order in orders">
                <order-history-card
                  :key="order.id"
                  :order="order"
                ></order-history-card>
              </template>
            </div>
          </div>
        </div>
      </div>
    </perfect-scrollbar>
  </a-drawer>
</template>

<script>
import { debounce } from 'lodash'
export default {
  name: 'SearchCustomerDetail',
  props: {
    customer: {
      type: Object,
      default: () => {},
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      total: 0,
      isLoading: false,
      isLoadingMore: false,
      search: '',
      orders: [],
    }
  },
  computed: {
    noMoreResults() {
      return !this.isLoadingMore && this.page >= this.total
    },
    customerId() {
      return this.$route.query.customer_id
    },
  },
  watch: {
    search() {
      this.handleSearchOrder()
    },
    customerId() {
      this.orders = []
      this.page = 1
      this.total = 0
      this.fetchOrders()
    },
  },
  mounted() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      try {
        if (!this.customer?.id) return
        this.isLoadingMore = true
        const params = {
          page: 1,
          limit: this.limit,
          ...(this.search.length && {
            'search[0][field]': 'code',
            'search[0][value]': this.search,
          }),
          'filter[customer_id]': this.customer.id,
          include:
            'social_channel,customer,delivery_provider,currency,shipping_address,order_details,payment_method,order_status',
          sort: '-created_at',
        }
        const { data, meta } = await this.$api.order.getOrders(params)
        if (data) {
          this.orders = [...data]
          this.total = meta.pagination.total_pages
        }
      } catch (err) {
      } finally {
        this.isLoadingMore = false
      }
    },
    async fetchMoreOrders() {
      try {
        if (!this.customer?.id) return
        this.isLoadingMore = true
        const params = {
          page: this.page,
          limit: this.limit,
          ...(this.search.length && {
            'search[0][field]': 'code',
            'search[0][value]': this.search,
          }),
          'filter[customer_id]': this.customer.id,
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
    detectScroll(e) {
      const target = e.currentTarget
      const isBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 10
      if (isBottom && !this.noMoreResults) {
        this.handleLoadMore()
      }
    },
    async handleLoadMore() {
      if (
        !this.$fetchState.pending &&
        !this.isLoadingMore &&
        !this.noMoreResults
      ) {
        this.isLoadingMore = true
        this.page++
        await this.fetchCustomers()
        this.isLoadingMore = false
      }
    },
    handleSearchOrder: debounce(async function () {
      this.page = 1
      this.total = 0
      this.orders = []
      this.isLoadingMore = true
      await this.fetchOrders()
      this.isLoadingMore = false
    }, 1000),
    handleCloseCustomerDetail() {
      this.$emit('handleCloseCustomerDetail')
    },
  },
}
</script>

<style lang="less" scoped>
.customer-card {
  padding: 1rem;
  @apply flex items-start cursor-pointer;
}

.rank {
  width: 1.5rem;
  height: auto;
}

.infomation {
  flex: 1;
  padding-left: 1rem;

  &__row {
    @apply flex justify-between;
  }
}

.name {
  line-height: 1;
  font-size: @size-4;
  color: @black;
  @apply font-medium;
}

.channel {
  width: 1.5rem;
  height: auto;
  margin-left: 0.5rem;
}

.phone {
  font-size: @size-4;
  color: @secondary-1;
}

.date {
  font-size: @size-4;
  color: @secondary-1;
  margin-left: 0.5rem;
}
.customer-detail {
  @apply h-full flex flex-col;
  /deep/.ant-drawer-content-wrapper {
    width: 100% !important;
    box-shadow: none;
    .ant-drawer-wrapper-body {
      @apply flex flex-col overflow-hidden;
      .ant-drawer-header {
        @apply p-0;
      }
      .ant-drawer-body {
        @apply p-0 flex-1 overflow-hidden;
      }
    }
  }
  &__head {
    padding: @padding-24;
    @apply flex items-center justify-between;
    /deep/.anticon-arrow-left {
      font-size: @size-16;
    }
    &__title {
      font-size: @size-20;
      line-height: @size-20;
      @apply m-0 font-semibold text-center;
    }
  }
  &__header {
    border-color: @gray-4;
    @apply px-4 py-6 border-b flex items-center justify-between;

    &--back {
      color: @black;
    }

    &--title {
      font-size: @size-20;
      color: @black;
      @apply text-center font-semibold;
    }
  }
  /deep/.ant-input-affix-wrapper {
    padding-right: @padding-12;
    .ant-input {
      font-size: @size-16;
      height: @height-field;
    }
  }
  &__body {
    @apply flex-1 flex flex-col overflow-hidden;
  }
}

.customer-detail-info {
  border-color: @gray-4;
  padding: @padding-16 @padding-24;
  @apply border-b;
}

.order-history {
  padding-top: @padding-24;
  padding-left: @padding-24;
  @apply flex-1 h-full flex flex-col overflow-hidden;

  &__title {
    color: @black;
    font-size: @size-16;
    margin-bottom: @margin-8;
    @apply font-semibold;
  }
  &__body {
    @apply h-full flex flex-col overflow-hidden;
  }
  .scroll-orders {
    overflow: hidden scroll;
    @apply flex-1 h-full flex flex-col;

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
  }
}
</style>
