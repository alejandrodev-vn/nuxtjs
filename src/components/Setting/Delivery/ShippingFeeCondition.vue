<template>
  <a-form-model
    ref="form"
    :model="form"
    :rules="rules"
    class="shipping-fee-condition"
  >
    <a-row :gutter="24" class="shipping-fee-condition-wrap">
      <a-col :span="7">
        <a-form-model-item
          ref="sub_total_from"
          :label="$t('sub-total-value-from')"
          class="form-field"
          prop="sub_total_from"
          :colon="false"
        >
          <a-input
            v-model.number="form.sub_total_from"
            :disabled="condition.id === 0"
          >
            <template #suffix>
              {{ locale }}
            </template>
          </a-input>
        </a-form-model-item>
      </a-col>
      <a-col :span="7">
        <a-form-model-item
          ref="sub_total_to"
          :label="$t('sub-total-value-to')"
          class="form-field"
          prop="sub_total_to"
          :colon="false"
        >
          <a-input v-model.number="form.sub_total_to" disabled>
            <template #suffix>
              {{ locale }}
            </template>
          </a-input>
        </a-form-model-item>
      </a-col>
      <a-col :span="7">
        <a-form-model-item
          ref="shipping_fee"
          :label="$t('shipping-fee')"
          class="form-field"
          prop="shipping_fee"
          :colon="false"
        >
          <a-input v-model.number="form.shipping_fee">
            <template #suffix>
              {{ locale }}
            </template>
          </a-input>
        </a-form-model-item>
      </a-col>
      <a-col :span="3">
        <a-form-model-item
          class="shipping-fee-condition-actions"
          :colon="false"
        >
          <div v-if="isDelete" class="shipping-fee-condition-actions__delete">
            <i
              class="far fa-minus-circle cursor-pointer"
              @click="handleDelete"
            ></i>
          </div>
          <div v-if="isLast" class="shipping-fee-condition-actions__add">
            <i class="far fa-plus-circle cursor-pointer" @click="handleAdd"></i>
          </div>
        </a-form-model-item>
      </a-col>
    </a-row>
  </a-form-model>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'ShippingFeeCondition',
  props: {
    condition: {
      type: Object,
      default: () => {},
    },
    conditionValue: {
      type: Array,
      default: () => [],
    },
    isDelete: {
      type: Boolean,
      default: true,
    },
    isLast: {
      type: Boolean,
      default: false,
    },
    idRender: {
      type: Number,
      default: () => 0,
    },
  },
  data() {
    const checkNumberSubTotal = (rule, value, callback) => {
      const position = this.conditionValue.findIndex(
        (item) => item.id === this.condition.id
      )
      const previousItem = position - 1
      if (!value && !this.form.sub_total_from && position > 0) {
        callback(new Error(this.$t('field-is-required')))
      } else if (typeof value !== 'number') {
        callback(new Error(this.$t('please-input-numeric')))
      } else if (value && value < 0) {
        callback(new Error(this.$t('invalid-input-value-number-positive')))
      } else if (
        (this.condition.id > 0 &&
          this.conditionValue[previousItem].sub_total_from >=
            this.form.sub_total_from) ||
        (this.condition.id > 0 && parseInt(this.form.sub_total_from) === 1)
      ) {
        callback(new Error(this.$t('error-sub-total-value-from')))
      } else {
        callback()
        this.form.sub_total_from = parseInt(this.form.sub_total_from)
      }
    }
    const checkNumberShippingFee = (rule, value, callback) => {
      const position = this.conditionValue.findIndex(
        (item) => item.id === this.condition.id
      )
      const previousItem = position - 1
      if (this.form.shipping_fee === '') {
        callback(new Error(this.$t('field-is-required')))
      } else if (typeof value !== 'number') {
        callback(new Error(this.$t('please-input-numeric')))
      } else if (value && value < 0) {
        callback(new Error(this.$t('invalid-input-value-number-positive')))
      } else if (
        this.condition.id > 0 &&
        parseInt(this.conditionValue[previousItem].shipping_fee) <=
          parseInt(this.form.shipping_fee)
      ) {
        callback(new Error(this.$t('error-less-shipping-fee')))
      } else if (this.condition.id === 0 && this.form.shipping_fee === 0) {
        callback(new Error(this.$t('error-first-shipping-fee')))
      } else {
        callback()
        this.form.shipping_fee = parseInt(this.form.shipping_fee)
      }
    }
    return {
      form: {
        id: this.condition.id,
        sub_total_from: this.condition.sub_total_from
          ? this.condition.sub_total_from
          : this.condition.sub_total_from === 0
          ? this.condition.sub_total_from
          : '',
        sub_total_to: this.condition.sub_total_to
          ? this.condition.sub_total_to
          : '--',
        shipping_fee: this.condition.shipping_fee,
      },
      rules: {
        sub_total_from: [{ validator: checkNumberSubTotal, trigger: 'blur' }],
        shipping_fee: [{ validator: checkNumberShippingFee, trigger: 'blur' }],
      },
    }
  },
  computed: {
    locale() {
      return this.$store.state.configCurrency.vi.currency
    },
  },
  watch: {
    idRender() {
      this.form.id = this.condition.id
      // this.form.sub_total_from = this.condition.sub_total_from
      this.form.sub_total_to = this.condition.sub_total_to
      // this.form.shipping_fee = this.condition.shipping_fee
    },
    'form.sub_total_from'(value) {
      this.form.sub_total_from =
        value >= 1000000000000000
          ? 999999999999999
          : value || !isNaN(value)
          ? parseInt(value)
          : 0
      this.handleUpdate()
    },
    'form.sub_total_to'(value) {
      this.form.sub_total_to = value || !isNaN(value) ? parseInt(value) : 0
      this.handleUpdate()
    },
    'form.shipping_fee'(value) {
      this.form.shipping_fee =
        value >= 1000000000000000
          ? 999999999999999
          : value || !isNaN(value)
          ? parseInt(value)
          : 0
      this.handleUpdate()
    },
  },
  methods: {
    onlyForTwoDecimal(e) {
      // @keypress
      const stringValue = e.target.value.toString()
      const checkDecimal = stringValue.indexOf('.')
      if (
        stringValue != null &&
        checkDecimal > -1 &&
        stringValue.split('.')[1].length > 1
      ) {
        e.preventDefault()
      }
    },
    handleAdd() {
      this.$emit('add')
    },
    handleUpdate() {
      this.$emit('update', this.form)
    },
    handleDelete() {
      this.$emit('delete', this.form)
    },
    handleValidate() {
      let error = false
      this.$refs.form.validate((valid) => {
        if (!valid) {
          error = true
        } else {
          error = false
        }
      })

      return error
    },
  },
}
</script>

<style lang="less" scoped>
.shipping-fee-condition-wrap {
  @apply flex;
}

.shipping-fee-condition-actions {
  margin-top: 24px;
  @apply mb-0;
  /deep/.ant-form-item-children {
    @apply flex items-center;
  }
  &__add {
    i {
      font-size: @size-14;
      color: @primary !important;
      vertical-align: baseline;
    }
  }
  &__delete {
    margin-right: 1rem;
    i {
      vertical-align: baseline;
      font-size: @size-14;
    }
  }
}
</style>
