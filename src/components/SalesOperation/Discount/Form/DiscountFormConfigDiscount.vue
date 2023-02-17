<template>
  <div class="discount-form-config-discount">
    <div class="discount-form-config-discount__title">
      {{ $t('config-discount') }}
    </div>
    <a-form-model
      ref="formDiscountFormConfigDiscount"
      :model="form"
      :rules="rules"
      :colon="false"
      class="discount-form-config-discount__form discount-form-config-discount-form"
    >
      <a-form-model-item ref="type" :label="$t('discount-type')" prop="type">
        <a-select
          v-model="form.type"
          :disabled="disabled"
          @change="handleChangeDiscountType"
        >
          <a-select-option
            v-for="(item, index) in typeOptions"
            :key="index"
            :value="item.value"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item ref="value" :label="$t('discount-value')" prop="value">
        <a-input
          v-model="form.value"
          :disabled="disabled"
          :suffix="suffixDiscountValue"
        />
      </a-form-model-item>
      <a-form-model-item
        ref="min"
        :label="$t('minimum-payment-requirement')"
        prop="min"
      >
        <a-radio-group
          v-model="form.min"
          :disabled="isDisabledMin"
          @change="handleChangeMin"
        >
          <a-radio :style="radioStyle" value="no">
            {{ $t('none') }}
          </a-radio>
          <a-radio :style="radioStyle" value="yes" class="custom-radio-input">
            <a-form-model-item ref="minValue" prop="minValue">
              <a-input
                v-model="form.minValue"
                :suffix="suffixCurrency"
                :disabled="isDisabledMinInput"
              />
            </a-form-model-item>
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item
        ref="max"
        :label="$t('maximum-discount-value')"
        prop="max"
      >
        <a-radio-group
          v-model="form.max"
          :disabled="isDisabledMax"
          @change="handleChangeMax"
        >
          <a-radio :style="radioStyle" value="no">
            {{ $t('none') }}
          </a-radio>
          <a-radio :style="radioStyle" value="yes" class="custom-radio-input">
            <a-form-model-item ref="maxValue" prop="maxValue">
              <a-input
                v-model="form.maxValue"
                :suffix="suffixCurrency"
                :disabled="isDisabledMaxInput"
              />
            </a-form-model-item>
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { get, isEmpty } from 'lodash'

export default {
  name: 'DiscountFormConfigDiscount',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      radioStyle: {
        display: 'flex',
        alignItems: 'center',
        margin: '0.25rem 0',
      },
      suffixCurrency: 'VND',
      form: {
        type: this.$store.state.discountTypes['fixed-value-discount'],
        value: '',
        min: 'no',
        minValue: '',
        max: 'no',
        maxValue: '',
      },
    }
  },
  computed: {
    rules() {
      return {
        value: [{ validator: this.checkValue, trigger: 'blur' }],
        minValue: [{ validator: this.checkMinValue, trigger: 'blur' }],
        maxValue: [{ validator: this.checkMaxValue, trigger: 'blur' }],
      }
    },
    typeOptions() {
      const type = this.$store.state.discountTypes
      const types = Object.keys(type).map((item) => {
        return {
          name: this.$t(item),
          value: type[item],
        }
      })
      return types
    },
    suffixDiscountValue() {
      if (
        this.form.type ===
        this.$store.state.discountTypes['fixed-value-discount']
      ) {
        return this.suffixCurrency
      }

      return '%'
    },
    isDisabledMin() {
      return this.disabled
    },
    isDisabledMinInput() {
      return !(!this.isDisabledMin && this.form.min === 'yes')
    },
    isDisabledMax() {
      return (
        this.form.type ===
          this.$store.state.discountTypes['fixed-value-discount'] ||
        this.disabled
      )
    },
    isDisabledMaxInput() {
      return !(!this.isDisabledMax && this.form.max === 'yes')
    },
  },
  mounted() {
    if (!isEmpty(this.discount)) {
      const min = this.discount.is_min_payment
      const max = this.discount.is_max_discount_value
      this.form = {
        type:
          get(
            this.discount,
            'discount_type_id',
            this.$store.state.discountTypes['fixed-value-discount']
          ) || this.$store.state.discountTypes['fixed-value-discount'],
        value: this.discount.discount_value,
        min: min === 0 ? 'no' : 'yes',
        minValue: this.discount.min_payment,
        max: max === 0 ? 'no' : 'yes',
        maxValue: this.discount.max_discount_value,
      }
    }
  },
  methods: {
    handleChangeDiscountType(value) {
      if (value === this.$store.state.discountTypes['fixed-value-discount']) {
        this.form.max = 'no'
        this.form.maxValue = ''
        this.$refs.formDiscountFormConfigDiscount.validate()
      }
    },
    handleChangeMin(e) {
      const value = e.target.value
      if (value === 'no') {
        this.form.minValue = ''
        this.$refs.formDiscountFormConfigDiscount.validate()
      }
    },
    handleChangeMax(e) {
      const value = e.target.value
      if (value === 'no') {
        this.form.maxValue = ''
        this.$refs.formDiscountFormConfigDiscount.validate()
      }
    },
    checkValue(rule, value, callback) {
      if (value === '') {
        return callback(new Error(this.$t('field-is-required')))
      }
      const regEx = /[0-9]+$/
      if (!regEx.test(value)) {
        return callback(
          new Error(
            this.$t('format-required', {
              name: this.$t('discount-code'),
            })
          )
        )
      }
      if (this.form.value < 0) {
        this.form.value = 0
      } else if (
        this.form.type ===
          this.$store.state.discountTypes['percentage-discount'] &&
        this.form.value > 100
      ) {
        this.form.value = 100
      }
      return callback()
    },
    checkMinValue(rule, value, callback) {
      if (this.form.min === 'yes') {
        if (value === '') {
          return callback(new Error(this.$t('field-is-required')))
        }
        const regEx = /[0-9]+$/
        if (!regEx.test(value)) {
          return callback(
            new Error(
              this.$t('format-required', {
                name: this.$t('minimum-payment-requirement'),
              })
            )
          )
        }
        if (this.form.minValue < 0) {
          this.form.minValue = 0
        }
        return callback()
      } else {
        callback()
      }
    },
    checkMaxValue(rule, value, callback) {
      if (this.form.max === 'yes') {
        if (value === '') {
          return callback(new Error(this.$t('field-is-required')))
        }
        const regEx = /[0-9]+$/
        if (!regEx.test(value)) {
          return callback(
            new Error(
              this.$t('format-required', {
                name: this.$t('maximum-discount-value'),
              })
            )
          )
        }
        if (this.form.maxValue < 0) {
          this.form.maxValue = 0
        }
        return callback()
      } else {
        callback()
      }
    },
    handleValidate() {
      let isCompleted = false
      this.$refs.formDiscountFormConfigDiscount.validate((valid) => {
        if (valid) {
          isCompleted = true
        }
      })

      return isCompleted
    },
  },
}
</script>

<style lang="less" scoped>
.discount-form-config-discount {
  background-color: #f8f8f8;
  padding: @padding-24 @padding-20;

  &__title {
    font-size: @size-16;
    color: @black;
    margin-bottom: @margin-12;
    @apply font-medium;
  }
}

.discount-form-config-discount-form {
  /deep/.ant-radio-group {
    width: 100%;

    .custom-radio-input {
      span + span {
        flex: 1;
        padding-right: 0;

        .ant-form-item {
          margin-bottom: 0;
        }
      }
    }
  }

  /deep/.ant-select-selection {
    height: @height-field;

    &__rendered {
      line-height: @height-field;
    }
  }
}
</style>
