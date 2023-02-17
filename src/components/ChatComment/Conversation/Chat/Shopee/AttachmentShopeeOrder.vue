<template>
  <div class="shopee-order-wrapper">
    <span class="shopee-order-wrapper__title">{{ $t('order') }}</span>
    <div class="shopee-order">
      <div class="shopee-order__thumbnail">
        <img :src="item.item_image" :alt="item.item_name" />
      </div>
      <div class="shopee-order__info">
        <p class="shopee-order__info__name">{{ item.item_name }}</p>
        <div class="shopee-order__info__status">
          {{ item.orderStatus }}
        </div>
        <div class="shopee-order__info__price">
          <span class="mr-2">{{ $t('order-total') }}: </span>
          <app-currency
            :price="parseFloat(item.total_amount)"
            :currency="currencySymbol"
            :locale="item.currency === 'VND' ? 'vi' : 'en'"
          />
        </div>
      </div>
    </div>
    <div class="shopee-order-wrapper__footer">
      <div class="flex-1">
        <div class="shopee-order-wrapper__footer__item">
          <span class="shopee-order-wrapper__footer__item__left">
            {{ $t('order-ID') }}:
          </span>
          <div class="shopee-order-wrapper__footer__item__right">
            <span> {{ item.item_id }}</span>
          </div>
        </div>
        <div class="shopee-order-wrapper__footer__item">
          <span class="shopee-order-wrapper__footer__item__left">
            {{ $t('order-date') }}:
          </span>
          <div class="shopee-order-wrapper__footer__item__right">
            <span>
              {{
                $moment().utc(item.item_id).local().format('HH:mm DD/MM/YYYY')
              }}
            </span>
          </div>
        </div>
      </div>
      <div class="shopee-order-icon-copy">
        <i class="far fa-clone cursor-pointer" @click="handleCopyLink"></i>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { invert } from 'lodash'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'AttachmentShopeeOrder',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    configOrderStatus() {
      return invert(this.$store.state.orderStatus)
    },
    currencySymbol() {
      return this.data.currency_symbol
        ? this.data.currency_symbol
        : this.data.currency === 'VND'
        ? this.$store.state.configCurrency.vi.symbol
        : this.$store.state.configCurrency.my.symbol
    },
    item() {
      const orderStatus = this.$t(
        this.configOrderStatus[this.data.order_status]
      )
      return {
        ...this.data,
        orderStatus,
      }
    },
  },
  methods: {
    async handleCopyLink() {
      await navigator.clipboard.writeText(this.item.item_id)
      notification.success({
        message: this.$t('copied-to-clipboard'),
        class: 'notification-success',
      })
    },
  },
}
</script>
<style lang="less" scoped>
.shopee-order-wrapper {
  max-width: 500px;
  &__title {
    font-size: @size-16;
    counter-reset: @black;
    margin-bottom: @margin-8;
    text-transform: uppercase;
    @apply font-semibold block;
  }
  .shopee-order {
    background-color: @white;
    border-radius: 0.8rem;
    padding: @padding-12;
    @apply flex;
    &__thumbnail {
      width: 13.5rem;
      height: 9rem;
      border-radius: 0.8rem;
      @apply overflow-hidden flex-shrink-0;
      img {
        object-fit: cover;
        width: 100%;
        height: 100%;
      }
    }
    &__info {
      margin-left: @margin-24;
      @apply flex flex-col justify-center overflow-hidden;
      &__name {
        font-size: @size-20;
        color: @black;
        margin-bottom: 0.5rem;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        @apply font-medium overflow-hidden;
      }
      &__price {
        color: @black;
        font-size: @size-16;
        @apply flex items-center font-medium;
      }
      &__status {
        font-size: @size-24;
        color: @red;
        white-space: nowrap;
        line-height: 1;
        margin-bottom: @margin-4;
        @apply font-medium flex items-center;
      }
    }
  }
  &__footer {
    @apply flex w-full;
    &__item {
      @apply mt-2 flex items-center justify-between;
      span {
        font-size: @size-14;
        color: @black;
        @apply font-medium;
      }
    }
    .shopee-order-icon-copy {
      color: @primary;
      margin-left: @margin-16;
      margin-top: @margin-4;
    }
  }
}
</style>
