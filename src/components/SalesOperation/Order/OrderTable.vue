<template>
  <div class="order-table">
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
      :bordered="true"
      :custom-row="handleClickRow"
      :locale="locale"
      :loading="isLoading"
    >
      <template slot="action" slot-scope="record">
        <div
          class="order-table-actions"
          @click.stop="(e) => e.preventDefault()"
        >
          <a-dropdown placement="bottomLeft" :trigger="['click']">
            <a
              class="order-table-actions__dropdown"
              @click.stop="(e) => e.preventDefault()"
            >
              <i class="fas fa-ellipsis-v"></i>
            </a>
            <a-menu slot="overlay">
              <a-menu-item key="print">
                <a
                  rel="noopener noreferrer"
                  class="order-table-actions__dropdown--item"
                  @click="handlePrintBillOrder(record)"
                >
                  {{ $t('print-bill') }}
                </a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
      </template>
      <template slot="channel" slot-scope="channel">
        <div v-if="channel.type" class="order-table-channel">
          <img
            :src="require(`~/assets/images/Icon/Icon-${channel.type}.png`)"
            alt="Prime CRM"
            class="order-table-channel__icon"
          />
          <p class="order-table-channel__name">
            {{ channel.name }}
          </p>
        </div>
        <div v-else class="order-table-channel justify-center">--</div>
      </template>
      <template slot="value" slot-scope="value, record">
        <app-currency :price="value" :currency="`${record.currency} `" />
      </template>
      <template slot="status" slot-scope="status">
        <app-tag :style="getStyleOrderStatus(status)" square nowrap>
          {{ $t(status) }}
        </app-tag>
      </template>
      <template #footer>
        <app-pagination :page="page" :page-size="limit" :total="total" />
      </template>
    </a-table>

    <a-drawer
      :visible="isShowDrawer"
      :closable="false"
      width="80vw"
      class="drawer-order-detail"
      @close="handleCloseDrawer"
    >
      <span class="drawer-order-detail__close" @click="handleCloseDrawer">
        <icon-right class="btn-trigger-collapse" />
      </span>
      <div class="drawer-order-detail__content">
        <nuxt-child></nuxt-child>
      </div>
    </a-drawer>
    <div
      :style="{
        position: 'fixed',
        bottom: '-99999px',
        right: '-99999px',
        visibility: 'hidden',
      }"
    >
      <div ref="printBill">
        <preview-bill
          :form="printData.customer"
          :discount-code="printData.discountCode"
          :discount-value="printData.discountValue"
          :sub-total="printData.subTotal"
          :shipping-fee="printData.shippingFee"
          :payment-method="printData.paymentMethod"
          :invoice-date="printData.invoiceDate"
          :delivery="printData.delivery"
          :ordered-full-address="printData.fullAddress"
          :ordered-social-channel="printData.socialChannel"
          :ordered-products="printData.products"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { get, invert } from 'lodash'
import { Printd } from 'printd'
import { convertUTCToLocal } from '@/utils/moment'
import { styles } from '@/constants/style-preview-bill'

export default {
  name: 'OrderTable',
  props: {
    orders: {
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
      isShowDrawer: false,
      page: 1,
      limit: this.$store.state.limit,
      printData: {
        customer: {},
        products: [],
        discountCode: '',
        discountValue: 0,
        subTotal: 0,
        shippingFee: 0,
        paymentMethod: 1,
        delivery: {},
        socialChannel: {},
        invoiceDate: '',
      },
    }
  },
  computed: {
    orderStatusColor() {
      return this.$store.state.orderStatusColor
    },
    columns() {
      return [
        {
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
        {
          title: this.$t('order-ID'),
          key: 'id',
          dataIndex: 'id',
          scopedSlots: { customRender: 'id' },
        },
        {
          title: this.$t('channel'),
          key: 'channel',
          dataIndex: 'channel',
          scopedSlots: { customRender: 'channel' },
        },
        {
          title: this.$t('product-qty'),
          key: 'product',
          dataIndex: 'product',
          scopedSlots: { customRender: 'product' },
          // sorter: true,
          align: 'right',
        },
        {
          title: this.$t('order-value'),
          key: 'value',
          dataIndex: 'value',
          scopedSlots: { customRender: 'value' },
          // sorter: true,
          align: 'right',
        },
        {
          title: this.$t('status'),
          key: 'status',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: this.$t('customer-name'),
          key: 'customerName',
          dataIndex: 'customerName',
          scopedSlots: { customRender: 'customerName' },
        },
        {
          title: this.$t('customer-number'),
          key: 'customerNumber',
          dataIndex: 'customerNumber',
          scopedSlots: { customRender: 'customerNumber' },
          align: 'right',
        },
        {
          title: this.$t('guest-name'),
          key: 'guestName',
          dataIndex: 'guestName',
          scopedSlots: { customRender: 'guestName' },
        },
        {
          title: this.$t('ordered-by'),
          key: 'by',
          dataIndex: 'by',
          scopedSlots: { customRender: 'by' },
        },
        {
          title: this.$t('order-date'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
          // sorter: true,
          align: 'right',
        },
      ]
    },
    locale() {
      return {
        emptyText: <app-no-data text={this.$t('no-data')} />,
      }
    },
    orderStatus() {
      return invert(this.$store.state.orderStatus)
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
        let orderValue = 0
        products.forEach((item) => {
          productQuantity = productQuantity + item.quantity
          orderValue = orderValue + item.total_price
        })
        const discount = {
          key: item.id,
          id: item.code,
          channel,
          product: productQuantity,
          value: item.total,
          currency: get(item, 'currency.symbol', '') || '',
          status: this.orderStatus[item.status],
          customerName: item.customer_name,
          customerNumber: item.customer_phone,
          guestName: item.fan_name || '--',
          by: item.created_by_name,
          date: item.created_at
            ? convertUTCToLocal(item.created_at, 'HH:mm DD/MM/YYYY')
            : '--',
        }
        return discount
      })
    },
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(query) {
        const { page = 1, limit = this.$store.state.limit } = query
        this.page = Number(page)
        this.limit = Number(limit)
      },
    },
  },
  created() {
    const orderID = this.$route.params.id
    if (orderID) {
      this.isShowDrawer = true
    }
  },
  methods: {
    getStyleOrderStatus(status) {
      return {
        '--color': 'white',
        '--background-color': this.orderStatusColor[status],
      }
    },
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
                path: `/sales-operation/order/detail/${record.key}`,
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
        this.localePath({ path: '/sales-operation/order', query })
      )
    },
    async handlePrintBillOrder(record) {
      try {
        if (!record?.key) return
        const params = {
          include:
            'social_channel,delivery_provider,customer,shipping_address,order_details',
        }
        const orderDetail = await this.fetchOrderDetail(record.key, params)
        if (!orderDetail) return
        this.printData = {
          ...this.printData,
          customer: {
            id: record.key,
            fullName: orderDetail.customer_name,
            phone: orderDetail.customer_phone,
            ...(orderDetail.comment?.length && { note: orderDetail.comment }),
            postCode: orderDetail.shipping_address?.data?.post_code,
          },
          fullAddress: orderDetail.shipping_address?.data?.full_address,
          products: orderDetail.order_details?.data
            ? [...orderDetail.order_details.data]
            : [],
          discountCode: orderDetail.promotion_code,
          discountValue: orderDetail.total_discount,
          subTotal: orderDetail.sub_total,
          shippingFee: orderDetail.total_shipping,
          paymentMethod: orderDetail.payment_method_id,
          delivery: { delivery_provider: { ...orderDetail.delivery_provider } },
          ...(orderDetail.social_channel?.data && {
            socialChannel: { ...orderDetail.social_channel.data },
          }),
          invoiceDate: orderDetail.invoice_date,
        }
        if (!this.$refs.printBill) return
        setTimeout(() => {
          const d = new Printd()
          d.print(this.$refs.printBill, styles)
        }, 500)
      } catch (e) {}
    },
    async fetchOrderDetail(orderId) {
      try {
        const params = {
          include:
            'social_channel,delivery_provider,customer,shipping_address,order_details',
        }
        const { data } = await this.$api.order.getOrderDetail(orderId, params)
        if (data) {
          return data
        }
      } catch (e) {}
    },
  },
}
</script>

<style lang="less" scoped>
.order-table {
  /deep/.ant-table-content {
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
              &:nth-child(6) {
                width: 150px;
              }
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
              &:first-child {
                padding: 0;
                @apply cursor-default text-center;
              }
            }
          }
        }
      }
    }
  }

  /deep/.app-tag {
    font-size: @size-14;
    border-radius: 6px;
    @apply w-full text-center inline-block;
  }
}

.order-table-actions {
  &__dropdown {
    color: @secondary-1;
    line-height: 1;
    margin: 0 0.5rem;

    &--item {
      width: 9rem;
      @apply text-center;
    }
  }
}

.order-table-channel {
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

.drawer-order-detail {
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
  &__content {
    height: 100%;
    @apply overflow-auto;
  }
  &.ant-drawer-open {
    /deep/.ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        @apply overflow-auto;
      }
    }
  }
}
</style>
