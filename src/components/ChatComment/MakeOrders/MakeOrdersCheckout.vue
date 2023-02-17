<template>
  <a-drawer
    placement="right"
    get-container=".make-orders"
    width="100%"
    wrap-class-name="checkout"
    :wrap-style="{ position: 'absolute', width: '100%' }"
    :mask="false"
    :closable="false"
    :visible="visible"
    @close="handleCloseCheckout"
  >
    <template slot="title">
      <div class="checkout__head">
        <a-icon type="arrow-left" @click="handleCloseCheckout" />
        <h5 class="checkout__head__title">{{ $t('titleCheckout') }} (2/2)</h5>
        <a-button type="secondary" class="btn-printer" @click="onPrintPDF">
          <a-icon type="printer" />
        </a-button>
      </div>
    </template>
    <perfect-scrollbar :options="{ suppressScrollX: true }" class="checkout">
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
          <template #header="props">
            <div class="wrap-header flex items-center">
              <span class="mr-4">{{ $t('ordered-products') }}</span>
              <app-tag v-if="!props.isActive" type="primary">
                <span>{{ products.length }}</span>
              </app-tag>
            </div>
          </template>
          <checkout-ordered-products
            :branch="branch"
            :products="products"
            @handleOpenProductDetail="handleOpenProductDetail"
          />
        </a-collapse-panel>
        <a-collapse-panel key="2">
          <template #header="props">
            <div class="wrap-header">
              <span class="mr-4">{{ $t('delivery-provider') }}</span>
              <div v-if="!props.isActive" class="logo-delivery">
                <img :src="logoDelivery()" />
              </div>
            </div>
          </template>
          <checkout-delivery-provider
            :is-loading="$fetchState.pending"
            :deliveries="deliveries"
            :delivery-selected="deliverySelected"
            :sub-total="subTotal"
            @handleChangeFixedShippingFee="handleChangeFixedShippingFee"
            @handleChangeDelivery="handleChangeDelivery"
          />
        </a-collapse-panel>
        <a-collapse-panel key="3">
          <template #header="props">
            <div class="wrap-header flex items-center">
              <span class="mr-4">{{ $t('receiver-information') }} </span>
              <img
                v-if="props.isActive && imageRankCustomer.length"
                width="24"
                :src="imageRankCustomer"
              />
              <app-tag v-else type="primary">
                <span v-if="props.isActive && !imageRankCustomer.length">
                  {{ $t('new-customer') }}
                </span>
                <span v-else>{{ enteredField }}/{{ totalForm }}</span>
              </app-tag>
            </div>
          </template>
          <checkout-receiver-information
            :delivery="deliverySelected"
            :payment-method="paymentMethod"
            :products="products"
            @handleChangeInitForm="handleChangeInitForm"
            @handleChangeForm="handleChangeForm"
            @handleInputValue="handleInputValue"
            @handleChangeDynamicShippingFee="handleChangeDynamicShippingFee"
            @handleChangeImageRankCustomer="handleChangeImageRankCustomer"
          />
        </a-collapse-panel>
        <a-collapse-panel key="4">
          <template #header="props">
            <div class="wrap-header flex items-center">
              <span class="mr-4">{{ $t('discount-code') }}</span>
              <app-tag
                v-if="!props.isActive && discountCode.length"
                type="primary"
              >
                <span>{{ discountCode }}</span>
              </app-tag>
            </div>
          </template>
          <checkout-discount-code
            :sub-total="subTotal"
            @onApplyDiscount="handleApplyDiscount"
          />
        </a-collapse-panel>
        <a-collapse-panel key="5">
          <template #header="props">
            <div class="wrap-header flex items-center">
              <span class="mr-4">{{ $t('payment-method') }}</span>
              <app-tag v-if="!props.isActive" type="primary">
                <span>
                  {{
                    paymentMethod === configPaymentThod.type.bank_transfer
                      ? $t('bank-transfer')
                      : $t('cod')
                  }}
                </span>
              </app-tag>
            </div>
          </template>
          <checkout-payment-method
            :payment-method="paymentMethod"
            @handleChangePaymentMethod="handleChangePaymentMethod"
            @handleChangePaymentProofImage="handleChangePaymentProofImage"
          />
        </a-collapse-panel>
      </a-collapse>
      <checkout-footer
        :can-make-order="canMakeOrder"
        :sub-total="subTotal"
        :shipping-fee="shippingFee"
        :payment-method="paymentMethod"
        :customer="form"
        :delivery="deliverySelected"
        :discount="discountValue"
        :discount-code="discountCode"
        :products="products"
        :branch="branch"
        :list-proof-images="listProofImages"
        @onCloseCheckout="handleCloseCheckout"
        @resetCart="resetCart"
      />
    </perfect-scrollbar>
    <div ref="printBill">
      <preview-bill
        :form="form"
        :products="products"
        :discount-code="discountCode"
        :discount-value="discountValue"
        :sub-total="subTotal"
        :shipping-fee="shippingFee"
        :payment-method="paymentMethod"
        :delivery="deliverySelected"
      />
    </div>
  </a-drawer>
</template>
<script>
import { Printd } from 'printd'
import { styles } from '@/constants/style-preview-bill'
export default {
  name: 'MakeOrdersCheckout',
  fetchOnServer: false,
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    products: {
      type: Array,
      default: () => [],
    },
    branch: {
      type: Object,
      default: () => {},
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    canMakeOrder: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeKey: ['1', '2', '3', '4', '5'],
      deliverySelected: null,
      paymentMethod: 1,
      listProofImages: [],
      discountCode: '',
      discountValue: 0,
      deliveries: [],
      enteredKey: [],
      formInit: {},
      form: {},
      shippingFee: 0,
      discount: {},
      imageRankCustomer: '',
    }
  },
  async fetch() {
    await this.fetchDeliveryShops()
  },
  computed: {
    totalForm() {
      return Object.keys(this.formInit).length
    },
    enteredField() {
      return this.enteredKey.length
    },
    configPaymentThod() {
      return this.$store.state.configPaymentMethod
    },
    configDelivery() {
      return this.$store.state.configDelivery
    },
    discountTypes() {
      return this.$store.state.discountTypes
    },
  },
  watch: {
    subTotal() {
      if (!this.discount) return
      if (
        this.discount.is_min_payment &&
        this.discount.min_payment > this.subTotal
      ) {
        for (const prop of Object.getOwnPropertyNames(this.discount)) {
          delete this.discount[prop]
        }
        this.discountCode = ''
        this.discountValue = 0
      }
    },
  },
  mounted() {},
  methods: {
    onPrintPDF() {
      const d = new Printd()
      d.print(this.$refs.printBill, styles)
    },
    handleChangeImageRankCustomer(image) {
      this.imageRankCustomer = image
    },
    async fetchDeliveryShops() {
      try {
        const params = {
          include: 'delivery_provider',
        }
        const { data } = await this.$api.delivery.getDeliveryShops(params)
        if (data) {
          const deliveriesReadyToUse = [
            ...data.filter((delivery) => delivery.config_status === 1),
          ]
          this.deliveries = Object.freeze(deliveriesReadyToUse)
          if (deliveriesReadyToUse.length) {
            this.deliverySelected = deliveriesReadyToUse[0]
          }
        }
      } catch (error) {}
    },
    handleCloseCheckout() {
      this.$emit('handleCloseCheckout')
    },
    handleOpenProductDetail(product) {
      if (!product) return
      this.$emit('handleOpenProductDetail', product)
    },
    handleChangeDelivery(delivery) {
      this.deliverySelected = { ...delivery }
    },
    handleApplyDiscount(discount) {
      this.discountValue = 0
      this.discountCode = discount.codes.data[0].code
      this.discount = { ...discount }
      this.calculateDiscount(discount)
    },
    calculateDiscount(discount) {
      switch (discount.discount_type_id) {
        case this.discountTypes['percentage-discount']:
          {
            const discountValue =
              this.subTotal * (discount.discount_value / 100)
            if (discount.is_max_discount_value) {
              this.discountValue =
                discountValue > discount.max_discount_value
                  ? discount.max_discount_value
                  : discountValue
            } else {
              this.discountValue = discountValue
            }
          }
          break
        case this.discountTypes['fixed-value-discount']:
          this.discountValue = discount.discount_value
          break
        default:
          this.discountValue = 0
      }
    },
    handleChangePaymentMethod(method) {
      this.paymentMethod = method
    },
    logoDelivery() {
      if (!this.deliverySelected?.delivery_provider?.data?.code) return
      return require(`~/assets/images/Delivery/${this.deliverySelected.delivery_provider.data.code}.png`)
    },
    handleChangeInitForm(form) {
      this.formInit = { ...form }
      this.form = { ...form }
      this.enteredKey = []
      this.imageRankCustomer = ''
    },
    handleInputValue(name, value) {
      const indexKeyExist = this.enteredKey.indexOf(name)
      if (this.formInit[name] !== value && indexKeyExist === -1) {
        this.enteredKey.push(name)
      }
      if (this.formInit[name] === value && indexKeyExist !== -1) {
        this.enteredKey.splice(indexKeyExist, 1)
      }
    },
    handleChangeForm(form) {
      this.form = { ...form }
      const receiverInformation = {
        guestId: this.$route.params.guest,
        form: { ...this.form },
      }
      localStorage.setItem(
        'receiverInformation',
        JSON.stringify(receiverInformation)
      )
    },
    handleChangeFixedShippingFee(shippingFee) {
      this.shippingFee = shippingFee
    },
    handleChangeDynamicShippingFee(shippingFee) {
      if (
        this.deliverySelected.shipping_fee_method ===
        this.configDelivery.shipping_fee_method.dynamic
      ) {
        this.shippingFee = shippingFee
      }
    },
    handleChangePaymentProofImage({ fileList = [] }) {
      if (!fileList.length) return
      this.listProofImages = [...fileList]
    },
    resetCart() {
      this.$emit('resetCart')
    },
  },
}
</script>
<style lang="less" scoped>
.checkout {
  @apply flex flex-col justify-between h-full;
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
      line-height: @size-20;
      @apply m-0 font-semibold;
    }
    .btn-printer {
      height: 4rem;
      width: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: @gray-6;
      border: none;
      color: @black;
      @apply rounded-md;
    }
  }
  /deep/.ant-collapse {
    background-color: transparent;
    .ant-collapse-item {
      border: none;
      border-bottom: 1px solid @black-gray;
      padding: @padding-16 @padding-24;
      .ant-collapse-header {
        font-size: @size-16;
        min-height: 3rem;
        @apply p-0 m-0 font-semibold;
        .ant-collapse-arrow {
          width: @size-12;
          height: @size-12;
          @apply right-0;
        }
        .wrap-header {
          height: 3rem;
          @apply flex items-center;
          /deep/.app-tag {
            font-size: @size-14;
          }
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
