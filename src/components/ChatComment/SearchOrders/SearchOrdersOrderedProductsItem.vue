<template>
  <div class="product-item">
    <div class="product-item__left">
      <div class="product-img">
        <img
          v-if="product.image.length"
          :src="product.image"
          :alt="product.name"
        />
        <img
          v-else
          src="@/assets/images/Icon/No-Image.png"
          :alt="product.name"
        />
      </div>
      <div class="product-info">
        <a-tooltip>
          <template slot="title">{{ product.name }}</template>
          <p class="product-info__name">
            {{ product.name }}
          </p>
        </a-tooltip>
        <div class="flex items-center">
          <span class="mr-2">x{{ product.quantity }}</span>
          <div class="product-info__unit-price">
            <app-currency :price="product.price" :currency="currency.symbol" />
          </div>
        </div>
      </div>
    </div>
    <div class="product-item__right">
      <span class="total-price">
        <app-currency
          :price="product.total_price"
          :currency="currency.symbol"
        />
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SearchOrdersOrderedProductsItem',
  props: {
    product: {
      type: Object,
      default: () => {},
    },
    currency: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    symbolCurrency() {
      return this.currency.symbol
        ? `${this.currency.symbol} `
        : `${this.$store.state.configCurrency.vi.symbol} `
    },
  },
}
</script>
<style lang="less" scoped>
.product-item {
  border-bottom: 0.5px solid @border-grey-fade;
  @apply py-2 mt-2 flex items-end justify-between;
  &__left {
    width: 70%;
    @apply flex;
    .product-img {
      width: 50px;
      height: 50px;
      border: 0.5px solid @border-grey-fade;
      @apply rounded-md overflow-hidden mr-2 flex-shrink-0;
      img {
        @apply object-cover;
      }
    }
    .product-info {
      color: @grey;
      @apply flex flex-col justify-between truncate flex-1;
      &__name {
        @apply truncate m-0;
      }
      &__unit-price {
        @apply font-medium;
      }
    }
  }
  &__right {
    color: @black;
    @apply font-medium text-right;
  }
}
</style>
