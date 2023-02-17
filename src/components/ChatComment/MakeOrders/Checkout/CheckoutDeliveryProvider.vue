<template>
  <div class="delivery-provider">
    <a-select
      v-model="deliveryId"
      size="large"
      class="custom-select"
      :loading="isLoading"
    >
      <template #suffixIcon>
        <icon-right :style="{ transform: 'rotate(90deg)' }" />
      </template>
      <template v-for="delivery in deliveries">
        <a-select-option
          v-if="delivery.delivery_provider.data.code !== 'ghn'"
          :key="delivery.delivery_provider_id"
          :value="delivery.delivery_provider_id"
          @click="handleChangeDelivery(delivery)"
        >
          {{ $t(delivery.delivery_provider.data.code) }}
          <template
            v-if="
              delivery.shipping_fee_method ===
              configDelivery.shipping_fee_method.fixed
            "
          >
            (<app-currency
              :price="calculateFixedShippingFee(delivery)"
              :currency="symbolCurrency"
            />)
          </template>
        </a-select-option>
      </template>
    </a-select>
  </div>
</template>
<script>
export default {
  name: 'CheckoutDeliveryProvider',
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
    deliveries: {
      type: Array,
      default: () => [],
    },
    deliverySelected: {
      type: Object,
      default: () => {},
    },
    subTotal: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      deliveryId: null,
      shippingFee: 0,
    }
  },
  computed: {
    symbolCurrency() {
      return `${this.$store.state.configCurrency.vi.symbol} `
    },
    configDelivery() {
      return this.$store.state.configDelivery
    },
  },
  watch: {
    deliverySelected() {
      if (this.deliverySelected) {
        this.deliveryId = this.deliverySelected.delivery_provider_id
        this.shippingFee = this.calculateFixedShippingFee(this.deliverySelected)
      }
    },
    subTotal() {
      if (this.deliverySelected) {
        this.deliveryId = this.deliverySelected.delivery_provider_id
        this.shippingFee = this.calculateFixedShippingFee(this.deliverySelected)
      }
    },
    shippingFee() {
      this.$emit('handleChangeFixedShippingFee', this.shippingFee)
    },
  },
  created() {
    if (this.deliverySelected) {
      this.deliveryId = this.deliverySelected.delivery_provider_id
    }
  },
  methods: {
    handleChangeDelivery(delivery) {
      this.$emit('handleChangeDelivery', delivery)
    },
    calculateFixedShippingFee(delivery) {
      if (
        delivery.shipping_fee_method !==
        this.configDelivery.shipping_fee_method.fixed
      )
        return 0
      if (delivery.shipping_fee_config?.condition_type === 2) {
        const caseSubTotal = delivery.shipping_fee_config?.condition_value.find(
          (condition) =>
            parseInt(condition.sub_total_from) <= this.subTotal &&
            this.subTotal <= parseInt(condition.sub_total_to)
        )
        return caseSubTotal ? parseInt(caseSubTotal.shipping_fee) : 0
      } else if (delivery.shipping_fee_config?.shipping_fee) {
        return parseInt(delivery.shipping_fee_config?.shipping_fee)
      } else return 0
    },
  },
}
</script>
<style lang="less" scoped>
.delivery-provider {
  /deep/.custom-select {
    height: @height-field;
    @apply w-full mt-2;
    .ant-select-selection {
      height: @height-field;
      border-color: @black-gray;
      &__rendered {
        line-height: @height-field;
      }
    }
    .ant-select-selection-selected-value {
      @apply flex items-center;
    }
    .mx-input {
      height: 38px;
    }
  }
}
</style>
