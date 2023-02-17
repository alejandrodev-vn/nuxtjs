<template>
  <a-form-model
    ref="form"
    :model="form"
    :rules="rules"
    :colon="false"
    hide-required-mark
  >
    <a-form-model-item ref="phone" :label="$t('phone')" prop="phone">
      <a-input v-model="form.phone" name="phone" @change="handleInputValue">
        <a-icon slot="suffix" type="search" />
      </a-input>
    </a-form-model-item>
    <a-form-model-item ref="fullName" :label="$t('full-name')" prop="fullName">
      <a-input
        v-model="form.fullName"
        name="fullName"
        @change="handleInputValue"
      ></a-input>
    </a-form-model-item>
    <a-form-model-item ref="email" :label="$t('email')" prop="email">
      <a-input
        v-model="form.email"
        name="email"
        @change="handleInputValue"
      ></a-input>
    </a-form-model-item>
    <a-form-model-item ref="address" :label="$t('address')" prop="address">
      <a-input
        v-model="form.address"
        name="address"
        @change="handleInputValue"
      ></a-input>
    </a-form-model-item>
    <a-form-model-item ref="province" prop="province" :label="$t('state')">
      <a-select
        v-model="form.province"
        show-search
        size="large"
        option-filter-prop="children"
        class="custom-select"
        @change="handleChangeProvince"
      >
        <a-select-option
          v-for="item in provinces"
          :key="item.id"
          :value="item.id"
          @click="
            handleInputValue({ target: { name: 'province', value: item.id } })
          "
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item ref="city" :label="$t('city')" prop="city">
      <a-select
        v-model="form.district"
        show-search
        option-filter-prop="children"
        size="large"
        class="custom-select"
        @change="handleGetShippingFee"
      >
        <a-select-option
          v-for="item in districts"
          :key="item.id"
          :value="item.id"
          @click="
            handleInputValue({ target: { name: 'district', value: item.id } })
          "
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item ref="postCode" :label="$t('post-code')" prop="postCode">
      <a-input
        v-model="form.postCode"
        name="postCode"
        @change="handleInputValue"
        @input="handleGetShippingFee"
      ></a-input>
    </a-form-model-item>
    <a-form-model-item ref="note" :label="$t('note')" prop="note">
      <a-input
        v-model="form.note"
        name="note"
        @change="handleInputValue"
      ></a-input>
    </a-form-model-item>
  </a-form-model>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { debounce } from 'lodash'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'ReceiverInformationNinjaVan',
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
      form: {
        phone: '',
        fullName: '',
        email: '',
        address: '',
        province: null,
        district: null,
        postCode: '',
        note: '',
      },
      provinces: [],
      districts: [],
      loadingProvince: false,
      loadingDistrict: false,
      isLoadingCustomer: false,
    }
  },
  async fetch() {
    await this.fetchProvinces()
  },
  computed: {
    configDelivery() {
      return this.$store.state.configDelivery
    },
    configPaymentMethod() {
      return this.$store.state.configPaymentMethod
    },
    productSkus() {
      return this.products.map((product) => {
        return { sku: product.sku, quantity: product.quantity }
      })
    },
    rules() {
      return {
        phone: [
          {
            message: this.$t('field-is-required'),
            required: true,
            trigger: 'change',
          },
          {
            // pattern: /(^84|^60)[0-9]{8,9}\s*$/g,
            pattern: /^[0-9]*\s*$/g,
            message: this.$t('validateFormatPhone'),
            trigger: 'change',
          },
          {
            max: 11,
            message: this.$t('validateFormatPhoneMax'),
            trigger: 'change',
          },
          {
            min: 10,
            message: this.$t('validateFormatPhoneMin'),
            trigger: 'change',
          },
        ],
        fullName: [
          {
            min: 1,
            message: this.$t('field-is-required'),
            required: true,
            trigger: 'blur',
          },
        ],
        email: [
          {
            message: this.$t('field-is-required'),
            required: true,
          },
          {
            type: 'email',
            message: this.$t('validateFormatEmail'),
            trigger: 'blur',
          },
        ],
        address: [
          {
            message: this.$t('field-is-required'),
            trigger: 'blur',
            required: true,
          },
          {
            max: 200,
            message: this.$t('validate-length-address', { length: '200' }),
            trigger: 'blur',
          },
        ],
        province: [
          {
            message: this.$t('field-is-required'),
            trigger: 'blur',
            required: true,
          },
        ],
        district: [
          {
            message: this.$t('field-is-required'),
            trigger: 'blur',
            required: true,
          },
        ],
        postCode: [
          {
            message: this.$t('field-is-required'),
            trigger: 'change',
            required: true,
          },
          {
            pattern: /[0-9]\s*$/g,
            message: this.$t('post-code-must-be-number'),
            trigger: 'change',
          },
        ],
        note: [
          {
            trigger: 'blur',
            max: 200,
          },
        ],
      }
    },
  },
  watch: {
    form: {
      deep: true,
      handler() {
        this.$emit('handleChangeForm', { ...this.form })
      },
    },
    'form.phone': {
      handler: debounce(function () {
        const pattern = /^[0-9]{10,11}\s*$/g
        if (!this.form.phone?.length || !pattern.test(this.form.phone)) return
        this.fetchCustomerByPhone()
      }, 1000),
    },
    paymentMethod() {
      this.handleGetShippingFee()
    },
    products: {
      deep: true,
      handler() {
        this.handleGetShippingFee()
      },
    },
  },
  created() {
    this.$emit('handleChangeInitForm', { ...this.form })
    const receiverInformation = JSON.parse(
      localStorage.getItem('receiverInformation')
    )
    if (receiverInformation?.guestId !== this.$route.params.guest) {
      localStorage.removeItem('receiverInformation')
    } else {
      this.form = { ...receiverInformation.form }
    }
  },
  methods: {
    async fetchCustomerByPhone() {
      try {
        this.isLoadingCustomer = true
        const params = {
          search_columns: this.form.phone,
          include: 'last_order.shipping_address',
        }
        const { data } = await this.$api.customer.getCustomers(params)
        if (data?.length) {
          const oldCustomer = data[0]
          this.form.fullName = oldCustomer.last_order.data.customer_name
          this.form.email = oldCustomer.last_order.data.customer_email
          this.form.address =
            oldCustomer.last_order.data.shipping_address.data.address
          this.form.province =
            oldCustomer.last_order.data.shipping_address.data.province_id
          await this.handleChangeProvince(this.form.province)
          this.form.district =
            oldCustomer.last_order.data.shipping_address.data.district_id
          this.form.postCode =
            oldCustomer.last_order.data.shipping_address.data.post_code
          this.form.note = oldCustomer.comment?.length || ''
          Object.keys(this.form).forEach((key) => {
            this.handleInputValue({
              target: { name: key, value: this.form[key] },
            })
          })
          this.$emit(
            'handleChangeImageRankCustomer',
            oldCustomer.rank.data.image
          )
          this.handleGetShippingFee()
        }
      } catch (e) {
      } finally {
        this.isLoadingCustomer = false
      }
    },
    async fetchProvinces() {
      try {
        this.loadingProvince = true
        const params = {
          paginate: false,
          'filter[country_id]': 2,
        }
        const { data } = await this.$api.location.getProvinces(params)
        if (data) {
          this.provinces = Object.freeze(data)
        }
      } catch (e) {
      } finally {
        this.loadingProvince = false
      }
    },
    async fetchDistricts() {
      try {
        this.loadingDistrict = true
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
      } catch (e) {
      } finally {
        this.loadingDistrict = false
      }
    },
    async handleChangeProvince(value) {
      if (value) {
        this.form.district = null
        this.districts = []
        this.$emit('handleInputValue', 'district', null)
        if (!this.form.province) return
        await this.fetchDistricts()
      }
    },
    handleInputValue(e) {
      const { name, value } = e.target
      this.$emit('handleInputValue', name, value)
    },
    async getShippingFee() {
      try {
        const payload = {
          delivery_provider_id: this.delivery.delivery_provider_id,
          post_code: this.form.postCode,
          district_id: this.form.district,
          payment_method_id: this.paymentMethod,
          province_id: this.form.province,
          products: [...this.productSkus],
        }
        const data = await this.$api.delivery.getShippingFee(payload)
        if (data) {
          this.$emit('handleChangeDynamicShippingFee', data.shipping_fee)
          notification.success({
            message: this.$t('shipping-fee-changed'),
            class: 'notification-success',
          })
        } else {
          notification.error({
            message: this.$t('post-code-must-be-number'),
            class: 'notification-error',
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    handleGetShippingFee: debounce(function () {
      // const pattern = /[0-9]\s*$/g
      // if (
      //   !this.form.postCode.trim().length ||
      //   !pattern.test(this.form.postCode) ||
      //   !this.form.province ||
      //   !this.form.district
      // )
      //   return
      // this.getShippingFee()
    }, 1000),
  },
}
</script>
