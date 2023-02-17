<template>
  <div class="receiver-information">
    <component
      :is="isTypeComponentDelivery"
      :delivery="delivery"
      :payment-method="paymentMethod"
      :products="products"
      @handleChangeInitForm="handleChangeInitForm"
      @handleChangeForm="handleChangeForm"
      @handleInputValue="handleInputValue"
      @handleChangeDynamicShippingFee="handleChangeDynamicShippingFee"
      @handleChangeImageRankCustomer="handleChangeImageRankCustomer"
    />
  </div>
</template>
<script>
import ReceiverInformationGiaoHangNhanh from '@/components/ChatComment/MakeOrders/Checkout/ReceiverInformation/ReceiverInformationGiaoHangNhanh'
import ReceiverInformationSelfDelivery from '@/components/ChatComment/MakeOrders/Checkout/ReceiverInformation/ReceiverInformationSelfDelivery'
import ReceiverInformationJnTExpress from '@/components/ChatComment/MakeOrders/Checkout/ReceiverInformation/ReceiverInformationJnTExpress'
import ReceiverInformationGDEX from '@/components/ChatComment/MakeOrders/Checkout/ReceiverInformation/ReceiverInformationGDEX'
import ReceiverInformationNinjaVan from '@/components/ChatComment/MakeOrders/Checkout/ReceiverInformation/ReceiverInformationNinjaVan'

export default {
  name: 'CheckoutReceiverInformation',
  components: {
    ghn: ReceiverInformationGiaoHangNhanh,
    self_delivery: ReceiverInformationSelfDelivery,
    jnt: ReceiverInformationJnTExpress,
    gdex: ReceiverInformationGDEX,
    ninjavan: ReceiverInformationNinjaVan,
  },
  props: {
    delivery: {
      type: Object,
      default: () => {},
    },
    paymentMethod: {
      type: Number,
      default: 0,
    },
    products: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isTypeComponentDelivery: '',
    }
  },
  watch: {
    delivery() {
      if (!this.delivery) return
      this.isTypeComponentDelivery = this.delivery.delivery_provider.data.code
    },
  },
  created() {
    if (!this.delivery) return
    this.isTypeComponentDelivery = this.delivery.delivery_provider.data.code
  },
  methods: {
    handleChangeInitForm(form) {
      this.$emit('handleChangeInitForm', { ...form })
    },
    handleInputValue(name, value) {
      this.$emit('handleInputValue', name, value)
    },
    handleChangeForm(form) {
      this.$emit('handleChangeForm', { ...form })
    },
    handleChangeDynamicShippingFee(shippingFee) {
      this.$emit('handleChangeDynamicShippingFee', shippingFee)
    },
    handleChangeImageRankCustomer(image) {
      this.$emit('handleChangeImageRankCustomer', image)
    },
  },
}
</script>
<style lang="less" scoped>
.receiver-information {
  /deep/.custom-select {
    color: @black;
    font-size: @size-3;
    height: @height-field;
    @apply mb-2;
    &.ant-select-disabled {
      .ant-select-selection {
        background-color: @white;
        cursor: default;
      }
    }
    .ant-select-selection {
      height: @height-field;
      border-color: @gray-4;
      &__rendered {
        line-height: @height-field;
      }
    }
    .ant-select-arrow {
      color: @black;
      font-size: @size-10;
      top: 55%;
    }
  }
  /deep/.ant-form-item-children {
    .ant-input {
      color: @black;
      border-color: @gray-4;
      font-size: @size-3;
      @apply mb-2;
      &[disabled] {
        background-color: @white;
        cursor: default;
      }
    }
    .ant-input-suffix {
      top: 44%;
      color: @black;
    }
  }
}
</style>
