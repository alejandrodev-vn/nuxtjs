<template>
  <div class="product-item">
    <div class="product-item__left">
      <div class="product-img">
        <img
          v-if="product.product_sku_image.url.length"
          :src="product.product_sku_image.url"
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
        <a-tooltip placement="bottom">
          <template slot="title">{{ $t('variant') }}: {{ variant }}</template>
          <p class="product-info__variant m-0">
            {{ $t('variant') }}: {{ variant }}
          </p>
        </a-tooltip>
      </div>
    </div>
    <div class="product-item__right">
      <span class="mr-2">x{{ product.quantity }}</span>
      <span>
        <app-currency :price="product.price" :currency="symbolCurrency" />
      </span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CheckoutOrderedProductsItem',
  props: {
    product: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    symbolCurrency() {
      return `${
        this.product.currency
          ? this.product.currency
          : this.$store.state.configCurrency.vi.symbol
      } `
    },
    variant() {
      return this.product.variants?.data?.length
        ? this.product.variants.data[0].value.data.name
        : '--'
    },
  },
  methods: {
    handleOpenProductDetail() {
      this.$emit('handleOpenProductDetail', this.product)
    },
  },
}
</script>
<style lang="less" scoped>
.product-item {
  border-bottom: 0.5px solid @border-grey-fade;
  @apply py-2 mt-2 flex items-baseline justify-between;
  &__left {
    @apply w-7/12 flex;
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
      &__name,
      &__variant {
        @apply truncate m-0;
      }
    }
  }
  &__right {
    color: @grey;
    @apply font-medium flex-1 text-right;
  }
}
</style>
