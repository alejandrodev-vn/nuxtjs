<template>
  <div class="search-customer">
    <div class="search-customer__header">
      <div class="search-customer__header--title">
        {{ $t('searchCustomer') }}
      </div>
    </div>

    <div class="search-customer__body">
      <div class="grid gap-4 mb-4">
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
        v-model="filter.search"
        size="large"
        :placeholder="$t('search-customer-name-or-phone')"
      >
        <a-icon slot="prefix" type="search" />
      </a-input>
      <div v-if="$fetchState.pending || isLoading" class="mt-8">
        <app-loading />
      </div>
      <div v-else-if="!customers.length" class="mt-8">
        <app-no-data :text="$t('noDataFound')" />
      </div>
      <div v-else class="scroll-customers my-4" @scroll="detectScroll">
        <template v-for="customer in customers">
          <search-customer-card
            :key="customer.id"
            :customer="customer"
            @handleOpenCustomerDetail="handleOpenCustomerDetail"
          />
        </template>
      </div>
    </div>
    <search-customer-detail
      v-if="isShowCustomerDetail"
      :visible="isShowCustomerDetail"
      :customer="customerDetail"
      @handleCloseCustomerDetail="handleCloseCustomerDetail"
    />
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { convertLocalToUTC, today, last30Days } from '@/utils/moment'
export default {
  name: 'SearchCustomer',
  fetchOnServer: false,
  data() {
    return {
      filter: {
        search: '',
        channelIds: [this.$route.params.page],
        range: [new Date(last30Days), new Date(today)],
      },
      channels: [],
      page: 1,
      limit: this.$store.state.limit,
      total: 0,
      isLoading: false,
      isLoadingMore: false,
      customers: [],
      customerDetail: null,
      isShowCustomerDetail: false,
    }
  },
  async fetch() {
    await this.fetchSocialChannels()
    await this.fetchCustomers()
  },
  computed: {
    noMoreResults() {
      return !this.isLoadingMore && this.page >= this.total
    },
    customerId() {
      return this.$route.query.customer_id
    },
    pageId() {
      return this.$route.params.page
    },
    conversationType() {
      return this.$route.params.type
    },
    guestId() {
      return this.$route.params.guest
    },
  },
  watch: {
    filter: {
      deep: true,
      handler() {
        if (this.$fetchState.pending) return
        this.handleFilter()
      },
    },
    async customerId() {
      if (
        (this.customerId?.length && !this.customerDetail) ||
        this.customerDetail?.id + '' !== this.customerId
      ) {
        await this.fetchCustomerDetail()
        if (!this.customerDetail) return
        this.isShowCustomerDetail = true
      }
    },
  },
  async mounted() {
    if (
      (this.customerId?.length && !this.customerDetail) ||
      this.customerDetail?.id + '' !== this.customerId
    ) {
      await this.fetchCustomerDetail()
      if (!this.customerDetail) return
      this.isShowCustomerDetail = true
    }
  },
  destroyed() {
    const query = {
      ...this.$route.query,
    }
    if (query.customer_id) {
      delete query.customer_id
    }
    this.$router.push({ query })
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
          this.channels = data
        }
      } catch (e) {}
    },
    async fetchCustomers() {
      try {
        const socialChannelIds = this.filter.channelIds.join(',')
        const params = {
          page: this.page,
          limit: this.limit,
          'filter[social_channel_id]': socialChannelIds,
          ...(this.filter.range[0] && {
            date_from: convertLocalToUTC(
              this.filter.range[0],
              'YYYY-MM-DD HH:mm'
            ),
          }),
          ...(this.filter.range[1] && {
            date_to: convertLocalToUTC(
              this.filter.range[1],
              'YYYY-MM-DD HH:mm'
            ),
          }),
          ...(this.filter.search.length && {
            search_columns: this.filter.search,
          }),
        }
        const { data, meta } = await this.$api.customer.getCustomers(params)
        if (data) {
          this.customers = [...this.customers, ...data]
          this.total = meta.pagination.total_pages
        }
      } catch (e) {}
    },
    async fetchCustomerDetail() {
      try {
        if (!this.customerId?.length) return
        const { data } = await this.$api.customer.getCustomerDetail(
          this.customerId
        )
        if (data) {
          this.customerDetail = { ...data }
        }
      } catch (e) {}
    },
    handleOpenCustomerDetail(customer) {
      this.customerDetail = { ...customer }
      if (!this.customerDetail) return
      const query = {
        ...this.$route.query,
        customer_id: this.customerDetail.id,
      }
      this.$router.push(
        this.localePath({
          path: `/conversations/chat-comment/${this.pageId}/${this.conversationType}/${this.guestId}/search-customer`,
          query,
        })
      )
      this.isShowCustomerDetail = true
    },
    handleCloseCustomerDetail() {
      const query = {
        ...this.$route.query,
      }
      if (query.customer_id) {
        delete query.customer_id
      }
      this.customerDetail = null
      this.$router.push({
        query,
      })
      this.isShowCustomerDetail = false
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
    handleUpdateChannelIds(ids) {
      this.filter.channelIds = [...ids]
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
    handleFilter: debounce(async function () {
      this.page = 1
      this.total = 0
      this.customers = []
      this.isLoading = true
      await this.fetchCustomers()
      this.isLoading = false
    }, 1000),
  },
}
</script>

<style lang="less" scoped>
.search-customer {
  @apply relative h-full flex flex-col;
  &__header {
    border-color: @gray-4;
    padding: @padding-24;
    @apply border-b;

    &--title {
      font-size: @size-24;
      color: @black;
      @apply text-center font-semibold;
    }
  }

  &__body {
    padding: @padding-24;
    @apply h-full flex flex-col;

    /deep/.mx-datepicker-range {
      width: 100%;
      height: @height-field;
      margin-bottom: @margin-16;
      .mx-input-wrapper {
        @apply h-full;
        .mx-input {
          border: 1px solid @secondary-2;
          color: @black;
          @apply h-full;
        }
      }
    }
    /deep/.ant-input-affix-wrapper {
      margin-bottom: @margin-16;
      .ant-input {
        height: @height-field;
        font-size: @size-16;
      }
    }
  }
}

.scroll-customers {
  border-color: @gray-4;
  overflow: hidden scroll;
  @apply border rounded-md flex-1;
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

  .customer-card {
    border-bottom: 1px solid @gray-4;
  }
}
</style>
