<template>
  <a-drawer
    :visible="isShow"
    :closable="false"
    width="50vw"
    class="drawer-shipping-fee-setup"
    @close="handleClose"
  >
    <span class="drawer-shipping-fee-setup__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="drawer-shipping-fee-setup__content">
      <div class="drawer-shipping-fee-setup__content--title">
        <div class="drawer-shipping-fee-setup__content--title__left">
          {{ $t('shipping-fee-calculation') }}
          <app-tag type="primary">
            <span>{{ $t('fixed-fee') }}</span>
          </app-tag>
        </div>
        <div class="drawer-shipping-fee-setup__content--title__right">
          <img
            v-if="srcImage"
            :src="srcImage"
            alt="Social CRM"
            class="article-all-name__image"
          />
        </div>
      </div>
      <div
        class="drawer-shipping-fee-setup__content--body drawer-shipping-fee-setup-content-body"
      >
        <div class="drawer-shipping-fee-setup-content-body__content">
          <a-form-model
            ref="form"
            :rules="rules"
            :model="form.shipping_fee_config"
          >
            <div>
              <a-form-model-item
                :label="$t('choose')"
                class="form-field"
                :colon="false"
              >
                <a-select
                  v-model="form.shipping_fee_config.condition_type"
                  style="width: 100%"
                  size="large"
                  class="custom-select"
                  :placeholder="$t('choose')"
                  @change="handleChangeType"
                >
                  <template v-for="(option, index) in optionsType">
                    <a-select-option :key="index" :value="option.value">
                      {{ option.label }}
                    </a-select-option>
                  </template>
                </a-select>
              </a-form-model-item>
              <a-form-model-item
                v-if="
                  form.shipping_fee_config.condition_type ===
                  shippingFeeConfig.fixed
                "
                ref="shipping_fee"
                prop="shipping_fee"
                :colon="false"
                :label="$t('shipping-fee')"
                class="form-field"
              >
                <!-- <input-number
                  ref="shippingFee"
                  :value="form.shipping_fee_config.shipping_fee"
                  @change="handleUpdateValue"
                >
                  <template #suffix>
                    {{ locale }}
                  </template>
                </input-number> -->
                <a-input
                  v-model.number="form.shipping_fee_config.shipping_fee"
                  :suffix="locale"
                >
                </a-input>
              </a-form-model-item>
              <div v-else>
                <template
                  v-for="(item, index) in form.shipping_fee_config
                    .condition_value"
                >
                  <shipping-fee-condition
                    :key="item.id"
                    :ref="`shippingFeeCondition${item.id}`"
                    :id-render="keyUpdate"
                    :condition-value="form.shipping_fee_config.condition_value"
                    :condition="item"
                    :is-delete="index !== 0"
                    :is-last="
                      index ===
                      form.shipping_fee_config.condition_value.length - 1
                    "
                    @add="handleAddCondition"
                    @update="handleUpdateCondition"
                    @delete="handleDeleteCondition"
                  />
                </template>
              </div>
            </div>
          </a-form-model>
        </div>
        <div class="drawer-shipping-fee-setup-content-body__actions">
          <a-button @click="handleClose">
            {{ $t('cancel') }}
          </a-button>
          <a-button type="primary" @click="handleSave">
            <a-icon v-if="loading" type="loading" />
            {{ $t('save') }}
          </a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { get } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import ShippingFeeCondition from '@/components/Setting/Delivery/ShippingFeeCondition'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'ShippingFeeSetup',
  components: { ShippingFeeCondition },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    delivery: {
      type: Object,
      default: () => {},
    },
    integratedDelivery: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },
      form: {
        shipping_fee_method: '',
        shipping_fee_config: {
          condition_type: [],
          shipping_fee: null,
          condition_value: [],
        },
      },
      keyUpdate: 0,
    }
  },
  computed: {
    deliveryMethod() {
      return this.$store.state.deliveryMethod
    },
    shippingFeeMethod() {
      return this.$store.state.shippingFeeMethod
    },
    shippingFeeConfig() {
      return this.$store.state.shippingFeeConfig
    },
    rules() {
      return {
        shipping_fee: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          { validator: this.checkNumberShippingFee, trigger: 'blur' },
        ],
      }
    },
    locale() {
      return this.$store.state.configCurrency.vi.currency
    },
    optionsRequirement() {
      return [
        {
          value: this.shippingFeeMethod.fixed,
          label: this.$t('fixed-fee'),
          disabled: false,
        },
        {
          value: this.shippingFeeMethod.dynamic,
          label: this.$t('dynamic-fee'),
          disabled: !this.integratedDelivery,
        },
      ]
    },
    defaultRequirement() {
      return this.optionsRequirement[0].value
    },
    optionsType() {
      return [
        {
          value: this.shippingFeeConfig.fixed,
          label: this.$t('one-fixed-fee-for-any-sub-total-value'),
        },
        {
          value: this.shippingFeeConfig.custom,
          label: this.$t('different-fixed-fee-based-on-sub-total-value'),
        },
      ]
    },
    defaultType() {
      return this.optionsType[0].value
    },
    currentRequirement() {
      return this.form.shipping_fee_method ===
        this.deliveryMethod['self-delivery']
        ? this.$t('fixed-fee')
        : this.$t('dynamic-fee')
    },
    srcImage() {
      return this.delivery.delivery_provider?.data?.large_image
    },
  },
  watch: {
    'form.shipping_fee_config.shipping_fee'(value) {
      this.form.shipping_fee_config.shipping_fee =
        value >= 1000000000000000
          ? 999999999999999
          : value || !isNaN(value)
          ? parseInt(value)
          : 0
    },
  },
  created() {
    this.initData()
  },
  methods: {
    checkNumberShippingFee(rule, value, callback) {
      if (typeof value !== 'number') {
        callback(new Error(this.$t('please-input-numeric')))
      } else if (value && value < 0) {
        callback(new Error(this.$t('invalid-input-value-number-positive')))
      } else {
        callback()
        this.form.shipping_fee_config.shipping_fee = parseInt(
          this.form.shipping_fee_config.shipping_fee
        )
      }
    },
    initData() {
      this.form.shipping_fee_method =
        get(this.delivery, 'shipping_fee_method', this.defaultRequirement) ||
        this.defaultRequirement

      this.form.shipping_fee_config.condition_type = parseInt(
        get(
          this.delivery,
          'shipping_fee_config.condition_type',
          this.defaultType
        ) || this.defaultType
      )
      this.form.shipping_fee_config.shipping_fee =
        this.delivery.shipping_fee_config.shipping_fee
      this.form.shipping_fee_config.condition_value = this.delivery
        .shipping_fee_config.condition_value.length
        ? this.delivery.shipping_fee_config.condition_value.map(
            (item, index) => {
              return {
                id: index,
                ...item,
              }
            }
          )
        : [
            {
              id: 0,
              sub_total_from: 0,
              sub_total_to: '--',
              shipping_fee: '',
            },
          ]
    },
    handleClose() {
      this.$emit('close')
    },
    handleChangeType() {
      this.form.shipping_fee_config.shipping_fee =
        this.delivery.shipping_fee_config.shipping_fee
      this.form.shipping_fee_config.condition_value = this.delivery
        .shipping_fee_config.condition_value.length
        ? this.delivery.shipping_fee_config.condition_value.map(
            (item, index) => {
              return {
                id: index,
                ...item,
              }
            }
          )
        : [
            {
              id: 0,
              sub_total_from: 0,
              sub_total_to: '--',
              shipping_fee: '',
            },
          ]
    },
    handleUpdateValue(value) {
      this.form.shipping_fee_config.shipping_fee = value
    },
    handleAddCondition() {
      const lastId =
        this.form.shipping_fee_config.condition_value[
          this.form.shipping_fee_config.condition_value.length - 1
        ].id
      const item = {
        id: lastId + 1,
        sub_total_from: '',
        sub_total_to: '--',
        shipping_fee: '',
      }
      this.form.shipping_fee_config.condition_value = [
        ...this.form.shipping_fee_config.condition_value,
        item,
      ]
    },
    handleUpdateCondition(condition) {
      const position = this.form.shipping_fee_config.condition_value.findIndex(
        (item) => item.id === condition.id
      )
      this.form.shipping_fee_config.condition_value[position].sub_total_from =
        condition.sub_total_from
      if (position > 0 && condition.sub_total_from > 1) {
        this.form.shipping_fee_config.condition_value[
          position - 1
        ].sub_total_to = condition.sub_total_from - 1
        this.keyUpdate += 10
      }
      this.form.shipping_fee_config.condition_value[position].shipping_fee =
        condition.shipping_fee
    },
    handleDeleteCondition(condition) {
      const position = this.form.shipping_fee_config.condition_value.findIndex(
        (item) => item.id === condition.id
      )
      const previousItem = position - 1
      if (this.form.shipping_fee_config.condition_value.length === 1) {
        this.form.shipping_fee_config.condition_value[0].sub_total_to = '--'
        this.keyUpdate += 10
      } else if (
        position > 1 &&
        position === this.form.shipping_fee_config.condition_value.length - 1
      ) {
        this.form.shipping_fee_config.condition_value[
          previousItem
        ].sub_total_to = '--'
        this.keyUpdate += 10
      } else {
        this.form.shipping_fee_config.condition_value[
          previousItem
        ].sub_total_to = condition.sub_total_to
        this.keyUpdate += 10
      }
      this.form.shipping_fee_config.condition_value =
        this.form.shipping_fee_config.condition_value.filter(
          (item) => item.id !== condition.id
        )
    },
    handleSave() {
      let payload = null
      if (this.form.shipping_fee_method === this.shippingFeeMethod.dynamic) {
        payload = {
          shipping_fee_method: this.form.shipping_fee_method,
        }
      } else if (
        this.form.shipping_fee_method === this.shippingFeeMethod.fixed &&
        this.form.shipping_fee_config.condition_type ===
          this.shippingFeeConfig.fixed
      ) {
        let error = false
        this.$refs.form.validate((valid) => {
          if (valid) {
            error = false
          } else {
            error = true
          }
        })

        if (!error) {
          this.form.shipping_fee_config.shipping_fee = parseInt(
            this.form.shipping_fee_config.shipping_fee
          )
          payload = {
            shipping_fee_method: this.form.shipping_fee_method,
            shipping_fee_config: {
              condition_type: this.form.shipping_fee_config.condition_type,
              shipping_fee: this.form.shipping_fee_config.shipping_fee,
            },
          }
        }
      } else {
        let errorNumber = 0
        this.form.shipping_fee_config.condition_value.forEach((item) => {
          let error = false
          if (item.id > 0) {
            error =
              this.$refs[`shippingFeeCondition${item.id}`][0].handleValidate()
          } else if (
            item.id === 0 &&
            (item.shipping_fee === 0 ||
              item.shipping_fee === '' ||
              typeof item.shipping_fee !== 'number' ||
              item.shipping_fee < 0)
          ) {
            this.$refs[`shippingFeeCondition${item.id}`][0].handleValidate()
            error = true
          }
          if (error) {
            errorNumber++
          }
        })

        if (errorNumber === 0) {
          payload = {
            shipping_fee_method: this.form.shipping_fee_method,
            shipping_fee_config: {
              condition_type: this.form.shipping_fee_config.condition_type,
              condition_value:
                this.form.shipping_fee_config.condition_value.map((item) => {
                  return {
                    sub_total_from: item.sub_total_from,
                    sub_total_to: item.sub_total_to,
                    shipping_fee: item.shipping_fee,
                  }
                }),
            },
          }
        }
      }

      if (payload) {
        this.handleSubmit(payload)
      }
    },
    async handleSubmit(payload) {
      try {
        if (!this.delivery?.id || !payload) return
        this.loading = true
        const { data } = await this.$api.delivery.updateDeliveryShops(
          payload,
          this.delivery.id
        )
        if (data) {
          this.$emit('reload')
          this.handleClose()
          notification.success({
            message: `${this.$t('saved')}!`,
            class: 'notification-success',
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.drawer-shipping-fee-setup {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    cursor: pointer;
    z-index: 10;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }
  &__content {
    height: 100%;
    @apply flex flex-col;
    &--title {
      font-size: @size-20;
      @apply flex justify-between items-center;
      &__left {
        color: @black;
        font-size: @size-20;
        @apply font-semibold flex items-center;
        /deep/.app-tag {
          width: fit-content;
          @apply ml-2;
        }
      }
      &__right {
        img {
          width: 140px;
          height: 4.5rem;
          object-fit: cover;
        }
      }
    }
    &--body {
      flex: 1;
      /deep/.ant-radio-wrapper {
        color: @black;
      }
      /deep/.ant-select-selection-selected-value {
        color: @black;
      }
    }
  }
  &.ant-drawer-open {
    /deep/ .ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-body {
        height: 100%;
        padding: @padding-40 @padding-24;
        @apply overflow-auto;
      }
    }
  }
}

.drawer-shipping-fee-setup-content-body {
  @apply flex flex-col;
  &__content {
    flex: 1;
    padding-bottom: 1.5rem;
    &--title {
      margin-bottom: 0.5rem;
      color: @black;
      font-size: @size-16;
      @apply font-medium;
    }
  }
  /deep/.ant-input-affix-wrapper {
    .ant-input {
      padding-right: @padding-40;
    }
  }
  /deep/.custom-select {
    .ant-select-selection {
      border-color: @black-gray;
      height: @height-field;
      &__rendered {
        line-height: @height-field;
        font-size: @size-16;
      }
    }
  }
  &__actions {
    padding-bottom: 1rem;
    @apply text-right;
    /deep/.ant-btn {
      .anticon {
        @apply align-baseline;
      }
    }
  }
}

.integrated-delivery-alert-info {
  margin-top: 1rem;
  /deep/.ant-alert {
    background-color: white;
    border-color: @gray-2;
    .anticon,
    .ant-alert-message {
      color: @gray-2;
    }
  }
}

/deep/.ant-radio-group {
  .anticon {
    @apply align-baseline;
  }
}
</style>

<style lang="less">
.ant-popover {
  max-width: 35rem;
}
</style>
