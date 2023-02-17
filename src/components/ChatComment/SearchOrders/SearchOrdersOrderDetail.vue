<template>
  <a-drawer
    placement="right"
    destroyed-on-close
    get-container=".search-orders"
    width="100%"
    wrap-class-name="order-detail"
    :wrap-style="{ position: 'absolute', width: '100%' }"
    :mask="false"
    :closable="false"
    :visible="visible"
    @close="handleCloseOrderDetail"
  >
    <template slot="title">
      <div class="order-detail__head">
        <a-icon type="arrow-left" @click="handleCloseOrderDetail" />
        <h5 class="order-detail__head__title">{{ $t('order-detail') }}</h5>
        <span></span>
      </div>
    </template>
    <perfect-scrollbar
      :options="{ suppressScrollX: true }"
      class="order-detail"
    >
      <div class="order-detail-overview">
        <div class="order-detail-overview__item">
          <div class="order-detail-overview__item__left">
            <div class="order-detail-overview__item__left__social-channel">
              <img
                :src="
                  require(`~/assets/images/Icon/Icon-${order.social_channel.data.channel_type.data.code}.png`)
                "
              />
              <p>{{ order.social_channel.data.name }}</p>
            </div>
          </div>
          <div class="order-detail-overview__item__right">
            <app-tag :type="orderStatusTag" square>
              <span>{{ orderStatus }}</span>
            </app-tag>
          </div>
        </div>
        <div class="order-detail-overview__item">
          <div class="order-detail-overview__item__left">
            <span class="text-left">{{ $t('order-ID') }}</span>
          </div>
          <div class="order-detail-overview__item__right">
            <span class="text-right">{{ order.code }}</span>
          </div>
        </div>
        <div class="order-detail-overview__item">
          <div class="order-detail-overview__item__left">
            <span class="text-left">{{ $t('order-value') }}</span>
          </div>
          <div class="order-detail-overview__item__right">
            <div class="text-right">
              <app-currency :price="order.total" :currency="symbolCurrency" />
            </div>
          </div>
        </div>
        <div class="order-detail-overview__item">
          <div class="order-detail-overview__item__left">
            <span class="text-left">{{ $t('order-date') }}</span>
          </div>
          <div class="order-detail-overview__item__right">
            <span class="text-right">
              {{
                $moment.utc(order.created_at).local().format('HH:mm DD/MM/YYYY')
              }}
            </span>
          </div>
        </div>
        <div class="order-detail-overview__item">
          <div class="order-detail-overview__item__left">
            <span class="text-left">{{ $t('payment-method') }}</span>
          </div>
          <div class="order-detail-overview__item__right">
            <span class="text-right">
              {{ paymentMethod }}
            </span>
          </div>
        </div>
        <div class="order-detail-overview__item">
          <div class="order-detail-overview__item__left">
            <span class="text-left">{{ $t('delivery-ID') }}</span>
          </div>
          <div class="order-detail-overview__item__right">
            <span class="text-right">
              {{ order.tracking_code ? order.tracking_code : '--' }}
            </span>
          </div>
        </div>
        <div class="order-detail-overview__item">
          <div class="order-detail-overview__item__left">
            <span class="text-left">{{ $t('delivery-provider') }}</span>
          </div>
          <div class="order-detail-overview__item__right">
            <img
              v-if="order.delivery_provider"
              class="logo-delivery"
              :src="logoDelivery()"
              :alt="order.delivery_provider.data.name"
            />
            <span v-else>--</span>
          </div>
        </div>
      </div>
      <a-collapse
        v-model="activeKey"
        expand-icon-position="right"
        :bordered="false"
      >
        <template #expandIcon="props">
          <icon-right
            class="duration-500"
            :style="{
              transform: props.isActive ? 'rotate(-90deg)' : 'rotate(90deg)',
              top: '35%',
            }"
          />
        </template>
        <a-collapse-panel key="1">
          <template #header>
            <div class="wrap-header flex items-center">
              <span class="mr-4">{{ $t('ordered-products') }}</span>
            </div>
          </template>
          <search-orders-ordered-products
            :products="order.order_details.data"
            :currency="order.currency.data"
            :total="order.total"
          />
        </a-collapse-panel>
        <a-collapse-panel key="2">
          <template #header>
            <div class="wrap-header">
              <span class="mr-4">{{ $t('order-history') }}</span>
            </div>
          </template>
          <search-orders-order-history />
        </a-collapse-panel>
        <a-collapse-panel key="3">
          <template #header>
            <div class="wrap-header flex items-center">
              <span class="mr-4">{{ $t('customer') }} </span>
              <img :src="order.customer.data.rank.data.image" width="24" />
            </div>
          </template>
          <search-orders-customer
            :customer="{
              ...order.shipping_address.data,
              full_name: order.customer_name,
              email: order.customer_email,
            }"
          />
        </a-collapse-panel>
      </a-collapse>
    </perfect-scrollbar>
  </a-drawer>
</template>
<script>
export default {
  name: 'SearchOrdersOrderDetail',
  fetchOnServer: false,
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      activeKey: [],
    }
  },
  async fetch() {
    await this.fetchAllDeliveryProviders()
  },
  computed: {
    symbolCurrency() {
      return this.order.currency.data.symbol
        ? `${this.order.currency.data.symbol} `
        : `${this.$store.state.configCurrency.vi.symbol} `
    },
    orderStatus() {
      const type = this.order?.order_status?.data?.id
      const types = [
        { key: 1, text: this.$t('unpaid') },
        { key: 2, text: this.$t('pending') },
        { key: 3, text: this.$t('ready-to-ship') },
        { key: 4, text: this.$t('shipping') },
        { key: 5, text: this.$t('delivered') },
        { key: 6, text: this.$t('canceled') },
        { key: 7, text: this.$t('returned') },
        { key: 8, text: this.$t('failed') },
        { key: 9, text: this.$t('others') },
      ]
      const getCase = types.find((obj) => obj.key === type)
      return !getCase ? '--' : getCase.text
    },
    orderStatusTag() {
      const type = this.order?.order_status?.data?.id
      const types = [
        { key: 1, type: 'primary-status-order' },
        { key: 2, type: 'primary-status-order' },
        { key: 3, type: 'primary-status-order' },
        { key: 4, type: 'primary-status-order' },
        { key: 5, type: 'delivered-status-order ' },
        { key: 6, type: 'fade-status-order' },
        { key: 7, type: 'fade-status-order' },
        { key: 8, type: 'fade-status-order' },
        { key: 9, type: 'fade-status-order' },
      ]
      const getCase = types.find((obj) => obj.key === type)
      return !getCase ? '--' : getCase.type
    },
    paymentMethod() {
      return this.order.payment_method.data.code === 'bank_transfer'
        ? this.$t('bank-transfer')
        : this.$t('cod')
    },
  },
  methods: {
    async fetchAllDeliveryProviders() {
      try {
        const { data } = await this.$api.delivery.getAllDeliveryProviders()
        if (data) {
          this.deliveries = Object.freeze(data)
          this.deliverySelected = data[0]
        }
      } catch (error) {}
    },
    handleCloseOrderDetail() {
      this.$emit('handleCloseOrderDetail')
    },
    logoDelivery() {
      if (!this.order.delivery_provider) return
      return this.order.delivery_provider?.data?.image
        ? this.order.delivery_provider.data.image
        : ''
    },
  },
}
</script>
<style lang="less" scoped>
.order-detail {
  @apply flex flex-col h-full;
  &-overview {
    padding: @padding-24;
    border-color: #0112221a;
    @apply flex flex-col border-b;
    &__item {
      &:not(:last-child) {
        margin-bottom: @margin-12;
      }
      @apply flex items-center justify-between;
      &__left {
        color: @black;
        font-size: @size-16;

        &__social-channel {
          font-size: @size-16;
          @apply flex items-center font-medium;
          img {
            width: @size-32;
            height: @size-32;
            margin-right: @margin-8;
          }
          p {
            @apply font-medium m-0 truncate;
          }
        }
      }
      &__right {
        color: @grey;
        font-size: @size-14;
        @apply text-right;
        .logo-delivery {
          width: @size-32;
        }
      }
    }
  }
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
    .anticon-arrow-left {
      font-size: @size-16;
    }
    &__title {
      font-size: @size-20;
      @apply m-0 font-semibold text-center;
    }
  }
  /deep/.ant-collapse {
    background-color: transparent;
    .ant-collapse-item {
      border: none;
      border-bottom: 1px solid @black-gray;
      padding: @padding-16;
      .ant-collapse-header {
        font-size: @size-16;
        line-height: @size-24;
        min-height: 30px;
        @apply p-0 m-0 font-semibold;
        .anticon {
          @apply right-0;
        }
        .wrap-header {
          height: 30px;
          @apply flex items-center;
        }
      }
      .ant-collapse-content-box {
        @apply p-0 mt-2;
      }
    }
  }
  /deep/.ps__rail-y {
    left: unset !important;
    right: 0 !important;
  }
}
</style>
