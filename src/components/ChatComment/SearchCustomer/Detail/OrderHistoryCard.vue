<template>
  <div class="order-history-card">
    <div class="flex items-center justify-between">
      <div class="code">
        {{ orderInline.code }}
      </div>
      <app-currency
        :price="orderInline.price"
        :currency="`${orderInline.currency} `"
        class="app-currency"
      />
    </div>
    <div class="flex items-center mt-2">
      <img
        v-if="channelCode"
        :src="require(`~/assets/images/Icon/Icon-${channelCode}.png`)"
        alt="Prime CRM"
        class="channel-type"
      />
      <span v-else> -- </span>
      <div class="channel-name">{{ orderInline.channel.name }}</div>
      <div class="date">{{ orderInline.date }}</div>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'
import { convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'OrderHistoryCard',
  props: {
    order: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    orderInline() {
      const channel = {
        type:
          get(this.order, 'social_channel.data.channel_type.data.code', '') ||
          '',
        name: get(this.order, 'social_channel.data.name', '') || '',
      }
      const products = get(this.order, 'order_details.data', []) || []
      let price = 0
      products.forEach((item) => {
        price = price + item.total_price
      })
      return {
        code: this.order.code,
        currency:
          this.order?.currency?.data?.symbol ||
          this.$store.state.configCurrency.my.symbol,
        channel,
        price,
        date: this.order.created_at
          ? convertUTCToLocal(this.order.created_at, 'HH:mm DD/MM/YYYY')
          : '--',
      }
    },
    channelCode() {
      return this.orderInline?.channel?.type
    },
  },
}
</script>

<style lang="less" scoped>
.order-history-card {
  border-color: @gray-4;
  padding-block: @padding-16;
  margin-right: @margin-24;
  @apply border-b;
}

.code,
.app-currency {
  font-size: @size-14;
  color: @black;
  @apply font-medium;
}

.channel-type {
  width: @size-24;
  height: @size-24;
  margin-right: @margin-8;
}

.channel-name {
  font-size: @size-14;
  color: @black;
}

.date {
  font-size: @size-14;
  color: @secondary-1;
  @apply ml-auto pl-2;
}
</style>
