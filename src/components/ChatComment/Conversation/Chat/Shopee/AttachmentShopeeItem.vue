<template>
  <div class="shopee-item-wrapper">
    <span class="shopee-item-wrapper__title">{{ $t('product') }}</span>
    <div class="shopee-item">
      <div class="shopee-item__thumbnail">
        <img :src="item.item_image" :alt="item.item_name" />
      </div>
      <div class="shopee-item__info">
        <p class="shopee-item__info__name">{{ item.item_name }}</p>
        <div class="shopee-item__info__price">
          <app-currency
            :price="item.priceMin"
            :currency="currencySymbol"
            :locale="item.currency === 'VND' ? 'vi' : 'en'"
          />
          <template v-if="item.priceMax">
            <div class="mx-4">-</div>
            <app-currency
              :price="item.priceMax"
              :currency="currencySymbol"
              :locale="item.currency === 'VND' ? 'vi' : 'en'"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'AttachmentShopeeItem',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    currencySymbol() {
      return this.data.currency_symbol
        ? this.data.currency_symbol
        : this.data.currency === 'VND'
        ? this.$store.state.configCurrency.vi.symbol
        : this.$store.state.configCurrency.my.symbol
    },
    item() {
      let priceMin = 0
      let priceMax = 0
      if (this.data.current_price_min !== this.data.current_price_max) {
        priceMin = parseFloat(this.data.current_price_min)
        priceMax = parseFloat(this.data.current_price_max)
      } else {
        priceMin = parseFloat(this.data.current_price_min)
      }
      return {
        ...this.data,
        priceMin,
        priceMax,
      }
    },
  },
}
</script>
<style lang="less" scoped>
.shopee-item-wrapper {
  max-width: 500px;
  margin-bottom: @margin-8;
  &__title {
    font-size: @size-16;
    counter-reset: @black;
    margin-bottom: @margin-8;
    text-transform: uppercase;
    @apply font-semibold block;
  }
  .shopee-item {
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
        font-size: @size-24;
        color: @red;
        margin-left: @margin-8;
        white-space: nowrap;
        line-height: 1;
        @apply font-medium flex items-center;
      }
    }
  }
}
</style>
