<template>
  <div class="customer-table">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :bordered="true"
      :locale="locale"
      :loading="isLoading"
      :custom-row="handleClickRow"
    >
      <template #rankTitle>
        <div class="customer-table-rank-title">
          <span class="mr-2">{{ $t('rank') }}</span>
          <a-popover :content="$t('tooltip-rank-customer')">
            <a-icon type="info-circle" />
          </a-popover>
        </div>
      </template>
      <template #totalOrderTitle>
        <div class="customer-table-total-order-title">
          <span class="mr-2">{{ $t('total-order') }}</span>
          <a-popover :content="$t('tooltip-total-order-customer')">
            <a-icon type="info-circle" />
          </a-popover>
        </div>
      </template>
      <template #totalSpendingTitle>
        <div class="customer-table-total-spending-title">
          <span class="mr-2">{{ $t('total-spending') }}</span>
          <a-popover :content="$t('tooltip-total-spending-customer')">
            <a-icon type="info-circle" />
          </a-popover>
        </div>
      </template>
      <template #completeRateTitle>
        <div class="customer-table-complete-rate-title">
          <span class="mr-2">{{ $t('complete-rate') }}</span>
          <a-popover :content="$t('tooltip-complete-rate-customer')">
            <a-icon type="info-circle" />
          </a-popover>
        </div>
      </template>
      <template #failedRateTitle>
        <div class="customer-table-failed-rate-title">
          <span class="mr-2">{{ $t('failed-rate') }}</span>
          <a-popover :content="$t('tooltip-failed-rate-customer')">
            <a-icon type="info-circle" />
          </a-popover>
        </div>
      </template>
      <template slot="rank" slot-scope="rank">
        <div class="customer-table-rank-content">
          <img
            v-if="rank"
            :src="require(`~/assets/images/Icon/Icon-${rank}.png`)"
            alt="Prime CRM"
            class="customer-table-rank-content__icon"
          />
          <span v-else>--</span>
        </div>
      </template>
      <template slot="channels" slot-scope="channels">
        <div class="customer-table-channels-content">
          <a-popover
            v-for="(channel, key) in channels"
            :key="key"
            placement="right"
          >
            <template slot="content">
              <span
                v-for="pageAccount in channel"
                :key="pageAccount.id"
                class="block py-1"
              >
                {{ pageAccount.name }}
              </span>
            </template>
            <img
              :src="require(`~/assets/images/Icon/Icon-${key}.png`)"
              alt="Social CRM"
              class="customer-table-channels-content__item"
            />
          </a-popover>
        </div>
      </template>
      <template slot="totalSpending" slot-scope="totalSpending">
        <app-currency :price="totalSpending" :currency="currencySymbol" />
      </template>
      <template #footer>
        <app-pagination :page="page" :page-size="limit" :total="total" />
      </template>
    </a-table>
    <a-drawer
      :visible="isShowDrawer"
      :closable="false"
      width="70vw"
      destroy-on-close
      class="drawer-customer-detail"
      @close="handleCloseDrawer"
    >
      <span class="drawer-customer-detail__close" @click="handleCloseDrawer">
        <icon-right class="btn-trigger-collapse" />
      </span>
      <div class="drawer-customer-detail__content">
        <nuxt-child></nuxt-child>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { get, invert } from 'lodash'
import { convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'CustomerTable',
  props: {
    customers: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      page: 1,
      limit: this.$store.state.limit,
      sort: '',
      isShowDrawer: false,
    }
  },
  computed: {
    columns() {
      return [
        {
          key: 'rank',
          dataIndex: 'rank',
          scopedSlots: { customRender: 'rank' },
          slots: { title: 'rankTitle' },
          sorter: (a, b, sortOrder) => {
            this.sort = sortOrder === 'ascend' ? 'rank_id' : '-rank_id'
          },
          defaultSortOrder:
            this.sort === 'rank_id'
              ? 'ascend'
              : this.sort === '-rank_id'
              ? 'descend'
              : null,
          align: 'center',
        },
        {
          title: this.$t('customer-name'),
          key: 'customerName',
          dataIndex: 'customerName',
          scopedSlots: { customRender: 'customerName' },
        },
        {
          title: this.$t('ordered-channel'),
          key: 'channels',
          dataIndex: 'channels',
          scopedSlots: { customRender: 'channels' },
        },
        {
          title: this.$t('customer-number'),
          key: 'customerNumber',
          dataIndex: 'customerNumber',
          scopedSlots: { customRender: 'customerNumber' },
          align: 'right',
        },
        {
          key: 'totalOrder',
          dataIndex: 'totalOrder',
          scopedSlots: { customRender: 'totalOrder' },
          slots: { title: 'totalOrderTitle' },
          align: 'right',
          sorter: (a, b, sortOrder) => {
            this.sort = sortOrder === 'ascend' ? 'total_order' : '-total_order'
          },
          defaultSortOrder:
            this.sort === 'total_order'
              ? 'ascend'
              : this.sort === '-total_order'
              ? 'descend'
              : null,
        },
        {
          key: 'totalSpending',
          dataIndex: 'totalSpending',
          scopedSlots: { customRender: 'totalSpending' },
          slots: { title: 'totalSpendingTitle' },
          align: 'right',
          sorter: (a, b, sortOrder) => {
            this.sort =
              sortOrder === 'ascend' ? 'total_spending' : '-total_spending'
          },
          defaultSortOrder:
            this.sort === 'total_spending'
              ? 'ascend'
              : this.sort === '-total_spending'
              ? 'descend'
              : null,
        },
        {
          key: 'completeRate',
          dataIndex: 'completeRate',
          scopedSlots: { customRender: 'completeRate' },
          slots: { title: 'completeRateTitle' },
          align: 'center',
          sorter: (a, b, sortOrder) => {
            this.sort =
              sortOrder === 'ascend' ? 'complete_rate' : '-complete_rate'
          },
          defaultSortOrder:
            this.sort === 'complete_rate'
              ? 'ascend'
              : this.sort === '-complete_rate'
              ? 'descend'
              : null,
        },
        {
          key: 'failedRate',
          dataIndex: 'failedRate',
          scopedSlots: { customRender: 'failedRate' },
          slots: { title: 'failedRateTitle' },
          align: 'center',
          sorter: (a, b, sortOrder) => {
            this.sort = sortOrder === 'ascend' ? 'failed_rate' : '-failed_rate'
          },
          defaultSortOrder:
            this.sort === 'failed_rate'
              ? 'ascend'
              : this.sort === '-failed_rate'
              ? 'descend'
              : null,
        },
        {
          title: this.$t('creation-date'),
          key: 'order_date',
          dataIndex: 'order_date',
          scopedSlots: { customRender: 'order_date' },
          align: 'right',
        },
        {
          title: this.$t('last-order'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          align: 'right',
        },
      ]
    },
    locale() {
      return {
        emptyText: <app-no-data text={this.$t('no-data')} />,
      }
    },
    customerRank() {
      return invert(this.$store.state.customerRank)
    },
    currencySymbol() {
      return `${this.$store.state.configCurrency.vi.symbol} `
    },
    dataSource() {
      return this.customers.map((item) => {
        const rank = get(item, 'rank.data.level', '') || ''
        const dateOrder = get(item, 'last_order.data.created_at', '') || ''
        const channels = get(item, 'social_channels.data', []) || []
        const formatChannels = channels.length
          ? channels.reduce((group, channel) => {
              const { code } = channel.channel_type.data
              group[code] = group[code] || []
              group[code].push(channel)
              return group
            }, {})
          : {}
        const customer = {
          key: item.id,
          id: item.id,
          rank: this.customerRank[rank],
          customerName: item.name,
          channels: formatChannels,
          customerNumber: item.phone,
          totalOrder: item.total_order,
          totalSpending: item.total_spending,
          completeRate: `${item.complete_rate}%`,
          failedRate: `${item.failed_rate}%`,
          currencySymbol: `${
            item.currency?.data?.symbol
              ? item.currency.data.symbol
              : this.currencySymbol
          } `,
          date: dateOrder
            ? convertUTCToLocal(dateOrder, 'HH:mm DD/MM/YYYY')
            : '--',
          order_date: item.order_date
            ? convertUTCToLocal(item.order_date, 'HH:mm DD/MM/YYYY')
            : '--',
        }

        return customer
      })
    },
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(query) {
        const { page = 1, limit = this.$store.state.limit, sort } = query
        this.page = Number(page)
        this.limit = Number(limit)
        this.sort = sort
      },
    },
    sort() {
      const query = {
        ...this.$route.query,
        sort: this.sort,
      }
      this.$router.push({ query })
    },
  },
  created() {
    const customerId = this.$route.params.id
    if (customerId) {
      this.isShowDrawer = true
    }
  },
  methods: {
    handleClickRow(record) {
      return {
        on: {
          click: () => {
            this.isShowDrawer = true
            const query = {
              ...this.$route.query,
            }
            this.$router.push(
              this.localePath({
                path: `/sales-operation/customer/detail/${record.id}`,
                query,
              })
            )
          },
        },
      }
    },
    handleCloseDrawer() {
      this.isShowDrawer = false
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({ path: '/sales-operation/customer', query })
      )
    },
  },
}
</script>

<style lang="less" scoped>
.customer-table-rank-title,
.customer-table-total-order-title,
.customer-table-total-spending-title,
.customer-table-complete-rate-title,
.customer-table-failed-rate-title {
  @apply flex items-center;
}

.customer-table-rank-content {
  &__icon {
    width: @size-24;
    height: @size-24;
    margin: 0 auto;
  }
}

.customer-table-channels-content {
  @apply flex items-center;

  &__item {
    width: @size-32;
    height: @size-32;
    margin-right: @margin-12;
  }
}
.customer-table {
  /deep/.ant-table {
    .ant-table-body {
      table {
        thead {
          tr {
            height: @height-table;
            th {
              background-color: #f2f3f4;
              font-weight: 500;
              font-size: @font-size-base;
              line-height: @size-22;
              color: @black;
              padding: 1rem;
            }
          }
        }
        tbody {
          tr {
            height: @height-table;
            @apply cursor-pointer;
            td {
              padding-inline: @padding-16;
              font-size: @font-size-base;
              line-height: @size-22;
              color: @color-table;
            }
          }
        }
      }
    }
  }
}

.drawer-customer-detail {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    z-index: 10;
    cursor: pointer;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }
  /deep/.ant-drawer-content {
    overflow: unset;
  }
  /deep/.ant-drawer-body {
    padding: @padding-40 @padding-24 @padding-24 @padding-24;
    min-height: 100%;
  }
}
</style>
