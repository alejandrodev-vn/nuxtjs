<template>
  <div class="make-orders__footer">
    <div class="make-orders__footer__left">
      <div class="icon-cart">
        <icon-cart />
        <span v-if="totalQuantity > 0" class="icon-cart__product-quantity">
          {{ totalQuantity }}
        </span>
      </div>
      <span class="title-total">{{ $t('total') }}</span>
    </div>
    <div class="make-orders__footer__right">
      <div v-if="subTotal > 0" class="total">
        <app-currency :price="subTotal" :currency="symbolCurrency" />
      </div>
      <a-button
        type="primary"
        class="btn-checkout"
        :class="{
          disabled: isDisableCheckout,
        }"
        @click="onClickCheckout"
      >
        {{ $t('checkout') }}
      </a-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'MakeOrdersFooter',
  props: {
    cart: {
      type: Array,
      default: () => [],
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    branchesEnough: {
      type: Number,
      default: 0,
    },
    canMakeOrder: {
      type: Boolean,
      default: false,
    },
    isFilterAllBranches: {
      type: Boolean,
      default: false,
    },
    totalQuantity: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    symbolCurrency() {
      return `${this.$store.state.configCurrency.vi.symbol} `
    },
    isDisableCheckout() {
      return (
        (this.isFilterAllBranches && this.branchesEnough === 0) ||
        this.totalQuantity === 0 ||
        !this.canMakeOrder
      )
    },
  },
  methods: {
    onClickCheckout() {
      if (this.isDisableCheckout) return
      this.$emit('onClickCheckout')
    },
  },
}
</script>
<style lang="less" scoped>
.make-orders {
  &__footer {
    padding-inline: @padding-16;
    padding-block: @padding-8 @padding-16;
    @apply flex items-center justify-between shadow-2xl;
    &__left {
      @apply flex items-center;
      .icon-cart {
        @apply relative mr-4;
        &__product-quantity {
          min-width: @size-26;
          width: max-content;
          font-size: @size-11;
          background-color: @red;
          border: 0.5px solid @white;
          color: @white;
          top: -0.6rem;
          right: -0.6rem;
          padding: 0 0.1rem;
          @apply absolute rounded-xl text-center;
        }
        > svg {
          width: @size-32;
          height: @size-32;
        }
      }
      .title-total {
        color: @black;
        font-size: @size-16;
        line-height: @size-16;
        @apply font-medium;
      }
    }
    &__right {
      @apply flex items-center justify-end;
      .total {
        color: @black;
        font-size: @size-20;
        @apply font-semibold mr-4;
      }
      .btn-checkout {
        height: @height-field;
        &.disabled {
          background-color: @gray-5;
        }
      }
    }
  }
}
</style>
