<template>
  <div class="preview-bill" :style="{ fontFamily: 'san-serif' }">
    <div class="preview-bill__header">
      <div
        v-if="socialChannel.channel_type"
        class="flex items-center justify-center"
      >
        <img
          :src="
            require(`~/assets/images/Icon/Icon-${socialChannel.channel_type.data.code}.png`)
          "
          class="icon-social-channel"
        />
        <span :style="{ color: '#52575c', marginLeft: '1rem', fontSize: 16 }">
          {{ socialChannel.name }}
        </span>
      </div>
      <h2 class="preview-bill__header--title">{{ $t('order-bill') }}</h2>
    </div>
    <div class="preview-bill__receiver-information">
      <h3 class="title">{{ $t('receiver-information') }}</h3>
      <div class="flex justify-between">
        <div class="preview-bill__receiver-information--col">
          <div class="receiver-information-item">
            <p class="text-left">{{ $t('full-name') }}</p>
            <p class="text-right">{{ customer.name }}</p>
          </div>
          <div class="receiver-information-item">
            <p class="text-left">{{ $t('phone') }}</p>
            <p class="text-right">{{ customer.phone }}</p>
          </div>
          <div class="receiver-information-item">
            <p class="text-left">{{ $t('note') }}</p>
            <p class="text-right">{{ customer.note }}</p>
          </div>
        </div>
        <div class="preview-bill__receiver-information--col">
          <div class="receiver-information-item">
            <p class="text-left">{{ $t('address') }}</p>
            <p class="text-right">
              {{ customer.address }}
            </p>
          </div>
          <!-- <div class="receiver-information-item">
            <p class="text-left">{{ $t('post-code') }}</p>
            <p class="text-right">
              {{ customer.postCode }}
            </p>
          </div> -->
        </div>
      </div>
    </div>
    <div class="order-information">
      <div style="width: 100%" class="flex items-center justify-between">
        <h3 class="title">{{ $t('order-information') }}</h3>
        <span style="font-size: 16px" class="text-gray">
          {{ $t('order-date') }}: {{ orderDate }}
        </span>
      </div>
      <table class="table-products">
        <thead>
          <th>{{ $t('product-name') }}</th>
          <th>{{ $t('qty') }}</th>
          <th>{{ $t('unit-cost') }}</th>
          <th>{{ $t('total') }}</th>
        </thead>
        <tbody>
          <template v-if="orderedProducts.length">
            <tr v-for="product in orderedProducts" :key="product.id">
              <td>
                <p>{{ product.name }}</p>
                <span class="text-gray">
                  {{ $t('variant') }}: {{ getVariant(product) }}
                </span>
              </td>
              <td>{{ product.quantity }}</td>
              <td>
                <app-currency
                  :price="product.price"
                  :currency="symbolCurrency"
                />
              </td>
              <td>
                <app-currency
                  :price="product.total_price"
                  :currency="symbolCurrency"
                />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="product in products" :key="product.id">
              <td>
                <p>{{ product.name }}</p>
                <span class="text-gray">
                  {{ $t('variant') }}: {{ getVariant(product) }}
                </span>
              </td>
              <td>{{ product.quantity }}</td>
              <td>
                <app-currency
                  :price="product.price"
                  :currency="symbolCurrency"
                />
              </td>
              <td>
                <app-currency
                  :price="product.subTotal"
                  :currency="symbolCurrency"
                />
              </td>
            </tr>
          </template>
        </tbody>
        <tfoot>
          <td colspan="4">
            <div class="flex items-center justify-between">
              <span class="text-left">{{ $t('sub-total') }}</span>
              <span class="text-right">
                <app-currency :price="subTotal" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-left">{{ $t('discount') }}</span>
                <div class="tag-discount-code">
                  <span>{{ discountCode }}</span>
                </div>
              </div>
              <span class="text-right discount-value">
                <app-currency
                  :price="-discountValue"
                  :currency="symbolCurrency"
                />
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-left">{{ $t('shipping-fee') }}</span>
              <span class="text-right">
                <app-currency :price="shippingFee" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-left">{{ $t('total') }}</span>
              <span class="text-right total-value">
                <app-currency :price="total" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-left">{{ $t('pre-paid') }}</span>
              <span class="text-right">
                <app-currency :price="prePaid" :currency="symbolCurrency" />
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-left">{{ $t('pay-at-delivery') }}</span>
              <span class="text-right">
                <app-currency
                  :price="payAtDelivery"
                  :currency="symbolCurrency"
                />
              </span>
            </div>
          </td>
        </tfoot>
      </table>
      <div class="delivery-information">
        <div class="delivery-information__col">
          <div class="delivery-information__col--item">
            <span class="text-left">
              {{ $t('payment-method') }}
            </span>
            <span class="text-right">
              {{
                paymentMethod === configPaymentThod.type.bank_transfer
                  ? $t('bank-transfer')
                  : $t('cod')
              }}
            </span>
          </div>
        </div>
        <div class="delivery-information__col">
          <div class="delivery-information__col--item">
            <span class="text-left">
              {{ $t('delivery-provider') }}
            </span>
            <span class="text-right"> {{ deliveryName }} </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'PreviewBill',
  props: {
    form: {
      type: Object,
      default: () => {},
    },
    products: {
      type: Array,
      default: () => [],
    },
    discountCode: {
      type: String,
      default: '',
    },
    discountValue: {
      type: Number,
      default: 0,
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: Number,
      default: 1,
    },
    delivery: {
      type: Object,
      default: () => {},
    },
    orderedFullAddress: {
      type: String,
      default: '',
    },
    orderedSocialChannel: {
      type: Object,
      default: () => {},
    },
    orderedProducts: {
      type: Array,
      default: () => [],
    },
    invoiceDate: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      provinces: [],
      districts: [],
      wards: [],
    }
  },
  async fetch() {
    await this.fetchProvinces()
  },
  computed: {
    configPaymentMethod() {
      return this.$store.state.configPaymentMethod
    },
    configDelivery() {
      return this.$store.state.configDelivery
    },
    symbolCurrency() {
      return `${this.$store.state.configCurrency.vi.symbol}`
    },
    orderDate() {
      return this.invoiceDate?.length > 0
        ? this.$moment(this.invoiceDate).format('DD/MM/YYYY')
        : this.$moment().format('DD/MM/YYYY')
    },
    currentInfoFan() {
      return this.$store.state.currentInfoFan
    },
    socialChannel() {
      if (this.orderedSocialChannel) return this.orderedSocialChannel
      return !this.currentInfoFan ? {} : this.currentInfoFan.social_channel.data
    },
    provinceString() {
      if (!this.form.province) return ''
      const provinceId = this.form.province
      const findProvince = this.provinces.find(
        (province) => province.id === provinceId
      )
      return !findProvince ? '' : findProvince.name
    },
    districtString() {
      if (!this.form.district && !this.form.city) return ''
      const districtId = this.form.district || this.form.city
      const findDistrict = this.districts.find(
        (district) => district.id === districtId
      )
      return !findDistrict ? '' : findDistrict.name
    },
    wardString() {
      if (!this.form.ward) return ''
      const wardId = this.form.ward
      const findWard = this.wards.find((ward) => ward.id === wardId)
      return !findWard ? '' : findWard.name
    },
    fullAddress() {
      const array = []
      if (this.form.address?.length) array.push(this.form.address)
      if (this.provinceString?.length) array.push(this.provinceString)
      if (this.districtString?.length) array.push(this.districtString)
      if (this.wardString?.length) array.push(this.wardString)
      return array.join(', ').replace(',,', ',')
    },
    customer() {
      return {
        name: this.form.fullName?.length ? this.form.fullName : '--',
        phone: this.form.phone?.length ? this.form.phone : '--',
        note: this.form.note?.length ? this.form.note : '--',
        postCode: this.form.postCode?.length ? this.form.postCode : '--',
        address: this.orderedFullAddress?.length
          ? this.orderedFullAddress
          : this.fullAddress?.length
          ? this.fullAddress
          : '--',
      }
    },
    configPaymentThod() {
      return this.$store.state.configPaymentMethod
    },
    total() {
      return this.subTotal - this.discountValue + this.shippingFee
    },
    prePaid() {
      return this.paymentMethod === this.configPaymentThod.type.cod
        ? 0
        : this.total
    },
    payAtDelivery() {
      return this.paymentMethod === this.configPaymentThod.type.bank_transfer
        ? 0
        : this.total
    },
    deliveryName() {
      return this.delivery?.delivery_provider?.data?.name
        ? this.delivery?.delivery_provider?.data?.name
        : '--'
    },
  },
  watch: {
    'form.province'() {
      this.handleChangeProvince(this.form.province)
    },
  },
  methods: {
    async fetchProvinces() {
      try {
        const params = {
          paginate: false,
          'filter[country_id]': 1,
        }
        const { data } = await this.$api.location.getProvinces(params)
        if (data) {
          this.provinces = Object.freeze(data)
        }
      } catch (e) {}
    },
    async fetchDistricts() {
      try {
        const params = {
          paginate: false,
        }
        const { data } = await this.$api.location.getDistricts(
          this.form.province,
          params
        )
        if (data) {
          this.districts = Object.freeze(data)
        }
      } catch (e) {}
    },
    async fetchWards() {
      try {
        const params = {
          paginate: false,
        }
        const { data } = await this.$api.location.getWards(
          this.form.province,
          this.form.district,
          params
        )
        if (data) {
          this.wards = Object.freeze(data)
        }
      } catch (e) {}
    },
    async handleChangeProvince(value) {
      if (value) {
        this.districts = []
        if (!this.form.province) return
        await this.fetchDistricts()
      }
    },
    async handleChangeDistrict(value) {
      if (value) {
        this.wards = []
        if (!this.form.province || !this.form.district) return
        await this.fetchWards()
      }
    },
    getVariant(product) {
      if (product.variant) {
        return product.variant?.length ? product.variant[0] : '--'
      }
      return product.variants?.data?.length
        ? product.variants.data[0].value.data.name
        : '--'
    },
  },
}
</script>
<style lang="less" scoped>
.preview-bill {
  font-family: 'Inter', sans-serif;
  width: 90%;
  border-radius: 15px;
  border: 0.5px solid #bdbdbd;
  padding: 3rem 2rem;
  p {
    margin: 0;
    margin-bottom: 0.5rem;
  }
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-between {
    justify-content: space-between;
  }
  .text-gray {
    color: #01122280;
  }
  .title {
    color: #22313f;
    font-weight: 600;
    font-size: 16px;
  }
  .preview-bill__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .preview-bill__header img {
    width: @size-32;
  }
  .preview-bill__header--title {
    font-weight: 600;
    font-size: 22px;
    font-family: 'Inter', sans-serif;
    margin-block: 1rem;
  }
  .preview-bill__receiver-information--col {
    width: 45%;
  }
  .receiver-information-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .receiver-information-item p {
    margin-bottom: 1rem;
  }
  .receiver-information-item .text-left {
    color: #22313f;
    font-size: 16px;
    width: 30%;
  }
  .receiver-information-item .text-right {
    color: #01122280;
    font-size: 16px;
    width: 70%;
    text-align: left;
    padding-left: 1rem;
    line-height: 18px;
  }
  .table-products {
    font-family: 'Inter', sans-serif;
    border-collapse: collapse;
    width: 100%;
  }
  .table-products td,
  .table-products thead th {
    padding: 8px;
    color: #22313f;
    font-size: 14px;
    border: 1px solid #e8e8e8;
  }
  .table-products td {
    vertical-align: top;
    text-align: center;
    border: 1px solid #e8e8e8;
  }
  .table-products td:first-child {
    text-align: left;
    padding-left: 1rem;
  }
  .table-products thead th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: center;
    vertical-align: center;
    color: #22313f;
    border-bottom: 0;
  }
  .table-products thead th:first-child {
    text-align: left;
    padding-left: 1rem;
  }
  .table-products tfoot .text-left,
  .table-products tfoot .text-right {
    display: inline-block;
    margin: 0.5rem;
  }
  .table-products tfoot .text-left {
    text-align: left;
    color: #52575c;
    font-size: 14px;
    font-weight: 500;
  }
  .table-products tfoot .text-right {
    text-align: right;
    color: #22313f;
    font-size: 14px;
  }
  .table-products tfoot .discount-value {
    text-align: right;
    color: #fb4e4e;
    font-size: 14px;
  }
  .table-products tfoot .total-value {
    text-align: right;
    color: #22313f;
    font-size: 14px;
    font-weight: 700;
  }
  .table-products tfoot .tag-discount-code {
    font-weight: 500;
    color: #488eff;
  }
  .delivery-information {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }
  .delivery-information__col {
    width: 45%;
  }
  .delivery-information__col--item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .delivery-information__col--item .text-left {
    color: #22313f;
    font-size: 16px;
  }
  .delivery-information__col--item .text-right {
    color: #01122280;
    font-size: 16px;
  }
}
</style>
