<template>
  <div class="customer-detail-order-history">
    <div class="customer-detail-order-history__header">
      <span class="customer-detail-order-history__header__title">
        {{ $t('order-history') }}
      </span>
      <a-tooltip overlay-class-name="custom-tooltip-light">
        <template slot="title">
          <span>
            {{ $t('tooltip-order-history') }}
          </span>
        </template>
        <a-icon class="ml-2" type="info-circle" />
      </a-tooltip>
    </div>
    <div class="customer-detail-order-history__table">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :locale="locale"
        :loading="isLoading"
      >
        <template slot="channel" slot-scope="channel">
          <div
            v-if="channel.type"
            class="customer-detail-order-history__table__channel"
          >
            <img
              :src="require(`~/assets/images/Icon/Icon-${channel.type}.png`)"
              alt="Social CRM"
              class="customer-detail-order-history__table__channel__icon"
            />
            <a-tooltip overlay-class-name="custom-tooltip-light">
              <template slot="title"> {{ channel.name }} </template>
              <p class="customer-detail-order-history__table__channel__name">
                {{ channel.name }}
              </p>
            </a-tooltip>
          </div>
          <div
            v-else
            class="customer-detail-order-history__table__channel justify-center"
          >
            --
          </div>
        </template>
        <template slot="orderValue" slot-scope="orderValue, record">
          <app-currency :price="orderValue" :currency="`${record.currency} `" />
        </template>
        <template slot="status" slot-scope="status">
          <app-tag :style="getStyleOrderStatus(status)" square nowrap>
            {{ $t(status) }}
          </app-tag>
        </template>
        <template #footer>
          <div class="app-pagination">
            <div class="app-pagination__limit">
              <span class="app-pagination__limit--label">
                {{ $t('items-per-page') }}
              </span>
              <a-dropdown :trigger="['click']">
                <span class="app-pagination__limit--number">
                  {{ limit }}
                  <a-icon type="caret-down"></a-icon>
                </span>
                <a-menu slot="overlay">
                  <a-menu-item
                    v-for="(valueLimit, index) in limitOptions"
                    :key="index"
                    @click="() => handleChangeLimit(valueLimit)"
                  >
                    {{ valueLimit }}
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </div>
            <a-pagination
              :current="page"
              :page-size="limit"
              :total="total"
              @change="handleChangePage"
            />
          </div>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script>
import { get, invert, debounce } from 'lodash'
import { convertUTCToLocal, today, last30Days } from '@/utils/moment'

export default {
  name: 'CustomerDetailOrderHistory',
  props: {
    customer: {
      type: Object,
      default: () => {},
    },
    range: {
      type: Array,
      default: () => [new Date(last30Days), new Date(today)],
    },
  },
  data() {
    return {
      limitOptions: [5, 10, 15],
      orders: [],
      isLoading: false,
      page: 1,
      total: 0,
      limit: this.$store.state.limit,
      sort: '-created_at',
    }
  },
  computed: {
    locale() {
      return {
        emptyText: <app-no-data text={this.$t('no-data')} />,
      }
    },
    columns() {
      return [
        {
          title: this.$t('order-ID'),
          key: 'orderId',
          dataIndex: 'orderId',
          scopedSlots: { customRender: 'orderId' },
        },
        {
          title: this.$t('channel'),
          key: 'channel',
          dataIndex: 'channel',
          scopedSlots: { customRender: 'channel' },
        },
        {
          title: this.$t('product-qty'),
          key: 'productQty',
          dataIndex: 'productQty',
          scopedSlots: { customRender: 'productQty' },
          align: 'right',
        },
        {
          title: this.$t('order-value'),
          key: 'orderValue',
          dataIndex: 'orderValue',
          scopedSlots: { customRender: 'orderValue' },
          sort: true,
          align: 'right',
        },
        {
          title: this.$t('status'),
          key: 'status',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          slots: { title: 'status' },
        },
        {
          title: this.$t('payment'),
          key: 'payment',
          dataIndex: 'payment',
          scopedSlots: { customRender: 'payment' },
          slots: { title: 'payment' },
        },
        {
          title: this.$t('delivery-provider'),
          key: 'deliveryProvider',
          dataIndex: 'deliveryProvider',
          scopedSlots: { customRender: 'deliveryProvider' },
          slots: { title: 'deliveryProvider' },
        },
        {
          title: this.$t('order-date'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          align: 'center',
          sorter: (a, b, sortOrder) => {
            this.sort = sortOrder === 'ascend' ? 'created_at' : '-created_at'
          },
        },
      ]
    },
    orderStatus() {
      return invert(this.$store.state.orderStatus)
    },
    orderStatusColor() {
      return this.$store.state.orderStatusColor
    },
    dataSource() {
      return this.orders.map((item) => {
        const channel = {
          type:
            get(item, 'social_channel.data.channel_type.data.code', '') || '',
          name: get(item, 'social_channel.data.name', '') || '',
        }
        const products = get(item, 'order_details.data', []) || []
        let productQuantity = 0
        products.forEach((item) => {
          productQuantity = productQuantity + item.quantity
        })
        const order = {
          key: item.id,
          id: item.id,
          orderId: item.code,
          channel,
          productQty: productQuantity,
          orderValue: item.total,
          currency:
            get(item, 'currency.symbol', '') ||
            this.$store.state.configCurrency.my.symbol,
          status: this.orderStatus[item.status],
          payment: item.payment_method?.data?.code
            ? this.$t(item.payment_method?.data?.code)
            : '--',
          deliveryProvider: item.delivery_provider?.data?.code
            ? this.$t(item.delivery_provider?.data?.code)
            : '--',
          date: item.created_at
            ? convertUTCToLocal(item.created_at, 'HH:mm DD/MM/YYYY')
            : '--',
        }

        return order
      })
    },
  },
  watch: {
    sort() {
      this.fetchOrders()
    },
    page() {
      this.fetchOrders()
    },
    limit() {
      this.fetchOrders()
    },
    range: {
      immediate: true,
      handler: debounce(function () {
        this.fetchOrders()
      }, 1000),
    },
  },
  methods: {
    async fetchOrders() {
      try {
        const dateFrom = this.range[0]
          ? this.$moment(this.range[0]).format('YYYY-MM-DD')
          : ''
        const dateTo = this.range[1]
          ? this.$moment(this.range[1]).format('YYYY-MM-DD')
          : ''
        if (!this.customer?.id) return
        this.isLoading = true
        const params = {
          page: this.page,
          limit: this.limit,
          'filter[customer_id]': this.customer.id,
          date_from: dateFrom,
          date_to: dateTo,
          include:
            'social_channel,customer,delivery_provider,currency,shipping_address,order_details,payment_method,order_status',
          sort: this.sort,
        }
        const { data, meta } = await this.$api.order.getOrders(params)
        if (data) {
          this.orders = [...data]
          this.total = meta.pagination.total
        }
      } catch (err) {
      } finally {
        this.isLoading = false
      }
    },
    getStyleOrderStatus(status) {
      return {
        '--color': 'white',
        '--background-color': this.orderStatusColor[status],
      }
    },
    handleChangeLimit(limit) {
      this.limit = limit
    },
    handleChangePage(page) {
      this.page = page
    },
  },
}
</script>
<style lang="less" scoped>
.customer-detail-order-history {
  border: 1px solid @gray-5;
  border-radius: 8px;
  &__header {
    padding: 24px 16px 16px 16px;
    color: @black;
    font-weight: 600;
    font-size: @size-20;
    line-height: @size-24;
    @apply flex items-center;
  }

  &__table {
    /deep/.ant-table-content {
      .ant-table-body {
        table {
          thead {
            tr {
              height: @height-table;

              th {
                font-weight: 500;
                font-size: @size-14;
                line-height: @size-18;
                color: @black;
                background-color: #f2f3f4;
                padding: @padding-12 @padding-16;
              }
            }
          }
          tbody {
            tr {
              height: 6.4rem;

              td {
                font-size: @size-14;
                line-height: @size-22;
                color: @color-table;
                padding: @padding-16;
              }
            }
          }
        }
      }
    }

    /deep/.app-tag {
      font-size: @size-14;
      @apply inline-block;
    }
    &__channel {
      @apply flex items-center;

      &__icon {
        flex: 0 0 1.5rem;
        width: @size-32;
        height: @size-32;
        object-fit: contain;
        margin-right: @margin-12;
      }
      &__name {
        @apply mb-0 truncate;
      }
    }
  }
}
.app-pagination {
  font-size: @size-4;
  @apply flex items-center justify-end;
  &__limit {
    margin-right: 1rem;
    &--label {
      color: @black;
      margin-right: 0.5rem;
      font-size: @size-12;
    }
    &--number {
      color: @black;
      @apply font-medium;
      i {
        @apply cursor-pointer align-middle;
      }
    }
  }
}

/deep/.ant-pagination {
  .ant-pagination-item-active {
    background-color: rgba(@primary, 0.1);
  }
}
/deep/.ant-pagination-item-link {
  @apply flex items-center justify-center;
}
</style>
