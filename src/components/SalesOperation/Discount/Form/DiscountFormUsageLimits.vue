<template>
  <div class="discount-form-usage-limits">
    <div class="discount-form-usage-limits__title">
      {{ $t('usage-limits') }}
    </div>
    <a-form-model
      ref="formDiscountFormUsageLimits"
      :model="form"
      :rules="rules"
      :colon="false"
      class="discount-form-usage-limits__form discount-form-usage-limits-form"
    >
      <a-radio-group
        v-model="form.limit"
        :disabled="disabled"
        @change="handleChangeUsageLimits"
      >
        <a-radio
          v-for="(item, index) in usageLimitsOptions"
          :key="index"
          :style="radioStyle"
          :value="item.value"
        >
          {{ item.name }}
        </a-radio>
      </a-radio-group>
      <a-form-model-item ref="limitValue" prop="limitValue">
        <a-input-number v-model="form.limitValue" :disabled="isDisabledInput" />
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { get, findIndex } from 'lodash'

export default {
  name: 'DiscountFormUsageLimits',
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
      form: {
        limit: this.$store.state.discountUsageLimits.unlimited,
        limitValue: '',
      },
    }
  },
  computed: {
    rules() {
      return {
        limit: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
        ],
        limitValue: [{ validator: this.checkLimitValue, trigger: 'blur' }],
      }
    },
    usageLimitsOptions() {
      const limit = this.$store.state.discountUsageLimits
      const limits = Object.keys(limit).map((item) => {
        return {
          name: this.$t(item),
          value: limit[item],
        }
      })

      const indexFrom = findIndex(limits, (item) => {
        return item.value === this.$store.state.discountUsageLimits.limited
      })
      const indexTo = limits.length - 1

      const element = limits[indexFrom]
      limits.splice(indexFrom, 1)
      limits.splice(indexTo, 0, element)

      return limits
    },
    isDisabledInput() {
      return !(
        !this.disabled &&
        this.form.limit === this.$store.state.discountUsageLimits.limited
      )
    },
  },
  mounted() {
    const limit = get(this.discount, 'is_limit')
    this.form = {
      limit:
        limit === undefined
          ? this.$store.state.discountUsageLimits.unlimited
          : limit,
      limitValue: get(this.discount, 'limit', '') || '',
    }
  },
  methods: {
    checkLimitValue(rule, value, callback) {
      if (this.form.limit === this.$store.state.discountUsageLimits.limited) {
        if (!value) {
          callback(new Error(this.$t('field-is-required')))
        } else {
          callback()
        }
      } else {
        callback()
      }
    },
    handleChangeUsageLimits(e) {
      const value = e.target.value
      if (value === this.$store.state.discountUsageLimits.unlimited) {
        this.form.limitValue = ''
        this.$refs.formDiscountFormUsageLimits.validate()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.discount-form-usage-limits {
  background-color: #f8f8f8;
  padding: @padding-24 @padding-20;

  &__title {
    font-size: @size-16;
    color: @black;
    margin-bottom: @margin-12;
    @apply font-medium;
  }
}

.discount-form-usage-limits-form {
  /deep/.ant-input-number {
    width: 100%;
    height: @height-field;

    input {
      height: @height-field;
    }
  }
}
</style>
