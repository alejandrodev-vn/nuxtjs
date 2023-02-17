<template>
  <div class="order-item" @click="handleOpenOrderDetail">
    <div class="order-item__left">
      <div class="order-item__left__order-id">
        <p>{{ order.code }}</p>
      </div>
      <div class="order-item__left__social-channel">
        <img
          :src="
            require(`~/assets/images/Icon/Icon-${order.social_channel.data.channel_type.data.code}.png`)
          "
        />
        <p>{{ order.social_channel.data.name }}</p>
      </div>
      <p class="order-item__left__customer-phone">{{ order.customer_phone }}</p>
    </div>
    <div class="order-item__right">
      <div class="order-item__right__total">
        <app-currency :price="order.total" :currency="symbolCurrency" />
      </div>
      <app-tag :type="orderStatusTag" square>
        <span>{{ orderStatus }}</span>
      </app-tag>
      <span class="order-item__right__invoice-date">
        {{ $moment.utc(order.created_at).local().format('HH:mm DD/MM/YYYY') }}
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SearchOrdersOrderItem',
  props: {
    order: {
      type: Object,
      default: () => {},
    },
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
  methods: {
    handleOpenOrderDetail() {
      this.$emit('handleOpenOrderDetail', this.order)
    },
  },
}
</script>
<style lang="less" scoped>
.order-item {
  border-color: @gray-4;
  padding: @padding-16;
  @apply flex items-end justify-between border-b cursor-pointer duration-500;
  &:hover {
    background-color: @primary-4;
  }
  &__left {
    &__order-id {
      color: @black;
      font-size: @size-14;
      @apply font-medium;
    }
    &__social-channel {
      color: @black;
      font-size: @size-14;
      @apply flex items-center my-2;
      img {
        width: @size-24;
        height: @size-24;
        @apply mr-2;
      }
    }
    &__customer-phone {
      color: @grey;
      font-size: @size-14;
    }
    /deep/p {
      @apply m-0 truncate;
    }
  }

  &__right {
    @apply flex flex-col items-end;
    &__total {
      color: @black;
      @apply font-medium text-right;
    }
    /deep/.app-tag {
      font-size: @size-12;
      @apply my-2;
    }
    &__invoice-date {
      color: @grey;
      font-size: @size-14;
    }
  }
}
</style>
