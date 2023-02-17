<template>
  <app-filter-advanced
    :is-show="isShow"
    :is-loading="isLoading"
    @close="handleClose"
    @save="handleSave"
    @setDefault="handleSetDefault"
  >
    <template slot="form">
      <a-form-model ref="form" class="discount-filter" :colon="false">
        <a-form-model-item
          ref="discountType"
          prop="discountType"
          :label="$t('discount-types')"
        >
          <a-select
            v-model="filter.discountType"
            class="custom-select"
            @change="handleChangeDiscountType"
          >
            <template v-for="item in discountTypeOptions">
              <a-select-option :key="item.value" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-model-item>
        <a-form-model-item ref="status" prop="status" :label="$t('status')">
          <a-select v-model="filter.status" class="custom-select">
            <template v-for="item in statusOptions">
              <a-select-option :key="item.value" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select></a-form-model-item
        >
        <a-form-model-item
          ref="usageLimits"
          prop="usageLimits"
          :label="$t('usage-limits')"
        >
          <a-select v-model="filter.usageLimits" class="custom-select">
            <template v-for="item in usageLimitOptions">
              <a-select-option :key="item.value" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-model-item>
        <a-form-model-item ref="range" prop="range" :label="$t('date-range')">
          <app-date-picker
            :value="filter.range"
            :use-query-router="false"
            :placeholder="$t('all-time')"
            :append-to-body="false"
            popup-class="placement-right"
            @input="handleChangeRange"
          />
        </a-form-model-item>
        <a-form-model-item :label="$t('fixed-value-discount')">
          <div class="wrap-input-half">
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('from') }}</span>
              <a-input
                v-model="filter.fixedFrom"
                class="custom-input"
                :disabled="
                  filter.discountType ===
                  configDiscountType['percentage-discount'] + ''
                "
                @change="handleReplaceWord(filter.fixedFrom, 'fixedFrom')"
              />
            </div>
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('to') }}</span>
              <a-input
                v-model="filter.fixedTo"
                class="custom-input"
                :disabled="
                  filter.discountType ===
                  configDiscountType['percentage-discount'] + ''
                "
                @change="handleReplaceWord(filter.fixedTo, 'fixedTo')"
              />
            </div>
          </div>
        </a-form-model-item>
        <a-form-model-item :label="$t('percentage-discount')">
          <div class="wrap-input-half">
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('from') }}</span>
              <a-input
                v-model="filter.percentageFrom"
                class="custom-input"
                :disabled="
                  filter.discountType ===
                  configDiscountType['fixed-value-discount'] + ''
                "
                @change="
                  handleReplaceWord(filter.percentageFrom, 'percentageFrom')
                "
              >
                <template slot="suffix">
                  <a-icon type="percentage" />
                </template>
              </a-input>
            </div>
            <div class="wrap-input-half-item">
              <span class="wrap-input-half-item__label">{{ $t('to') }}</span>
              <a-input
                v-model="filter.percentageTo"
                class="custom-input"
                :disabled="
                  filter.discountType ===
                  configDiscountType['fixed-value-discount'] + ''
                "
                @change="handleReplaceWord(filter.percentageTo, 'percentageTo')"
              >
                <template slot="suffix">
                  <a-icon type="percentage" />
                </template>
              </a-input>
            </div>
          </div>
        </a-form-model-item>
      </a-form-model>
    </template>
  </app-filter-advanced>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import regexText from '@/mixins/regexText'
Vue.use(notification)

export default {
  name: 'DiscountFilterAdvanced',
  mixins: [regexText],
  fetchOnServer: false,
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      filter: {
        discountType: '',
        status: '',
        usageLimits: '',
        range: [],
        fixedFrom: '',
        fixedTo: '',
        percentageFrom: '',
        percentageTo: '',
      },
      filterInit: {
        discountType: '',
        status: '',
        usageLimits: '',
        range: [],
        fixedFrom: '',
        fixedTo: '',
        percentageFrom: '',
        percentageTo: '',
      },
    }
  },
  computed: {
    configDiscountType() {
      return this.$store.state.discountTypes
    },
    discountTypeOptions() {
      const type = { ...this.configDiscountType }
      const types = Object.keys(type).map((item) => {
        return {
          key: item,
          name: this.$t(item),
          value: `${type[item]}`,
        }
      })
      return [
        { key: '', value: '', name: this.$t('all-discount-types') },
        ...types,
      ]
    },
    statusOptions() {
      const status = this.$store.state.discountStatus
      const listStatus = Object.keys(status).map((item) => {
        return {
          key: item,
          name: this.$t(item),
          value: `${status[item]}`,
        }
      })
      return [
        { key: '', value: '', name: this.$t('all-status') },
        ...listStatus,
      ]
    },
    usageLimitOptions() {
      const limit = this.$store.state.discountUsageLimits
      const limits = Object.keys(limit).map((item) => {
        return {
          key: item,
          name: this.$t(item),
          value: `${limit[item]}`,
        }
      })
      return [
        { key: '', value: '', name: this.$t('all-usage-limits') },
        ...limits,
      ]
    },
    rangeValueDiscount() {
      const rangeValueDiscount = {
        ...(this.filter.fixedFrom?.length &&
          !isNaN(this.filter.fixedFrom) && {
            fixed_from: this.filter.fixedFrom,
          }),
        ...(this.filter.fixedTo?.length &&
          !isNaN(this.filter.fixedTo) && {
            fixed_to: this.filter.fixedTo,
          }),
        ...(this.filter.percentageFrom?.length &&
          !isNaN(this.filter.percentageFrom) && {
            percentage_from: this.filter.percentageFrom,
          }),
        ...(this.filter.percentageTo?.length &&
          !isNaN(this.filter.percentageTo) && {
            percentage_to: this.filter.percentageTo,
          }),
      }

      return rangeValueDiscount
    },
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler() {
        this.handlerFilter()
      },
    },
  },
  methods: {
    handleReplaceWord(value, key) {
      this.filter[key] = this.replaceWord(value)
    },
    handleClose() {
      this.handlerFilter()
      this.$emit('close')
    },
    handleChangeDiscountType(value) {
      if (value?.length) return
      if (parseInt(value) === this.configDiscountType['percentage-discount']) {
        this.filter.fixedFrom = ''
        this.filter.fixedTo = ''
      } else if (
        parseInt(value) === this.configDiscountType['fixed-value-discount']
      ) {
        this.filter.percentageFrom = ''
        this.filter.percentageTo = ''
      }
    },
    handleChangeRange(date = []) {
      this.filter.range = date
      if (!date[0] || !date[1]) {
        this.filter.range = []
      }
    },
    handlerFilter() {
      const {
        discount_type = '',
        status = '',
        usage_limits = '',
        date_from,
        date_to,
        fixed_from = '',
        fixed_to = '',
        percentage_from = '',
        percentage_to = '',
      } = this.$route.query
      this.filter.discountType = discount_type
      this.filter.status = status
      this.filter.usageLimits = usage_limits
      this.filter.fixedFrom = fixed_from
      this.filter.fixedTo = fixed_to
      this.filter.percentageFrom = percentage_from
      this.filter.percentageTo = percentage_to
      if (date_from && date_to) {
        this.filter.range = [new Date(date_from), new Date(date_to)]
      } else {
        this.filter.range = []
      }
    },
    handleSave() {
      const fromDate = this.filter.range[0]
        ? this.$moment(this.filter.range[0]).format('YYYY-MM-DD HH:mm')
        : null
      const toDate = this.filter.range[1]
        ? this.$moment(this.filter.range[1]).format('YYYY-MM-DD HH:mm')
        : null
      const query = {
        ...(this.$route.query.search?.length && {
          search: this.$route.query.search,
        }),
        ...(this.filter.discountType?.length && {
          discount_type: this.filter.discountType,
        }),
        ...(this.filter.status?.length && {
          status: this.filter.status,
        }),
        ...(this.filter.usageLimits?.length && {
          usage_limits: this.filter.usageLimits,
        }),
        ...this.rangeValueDiscount,
        ...(fromDate && { date_from: fromDate }),
        ...(toDate && { date_to: toDate }),
        page: 1,
      }
      this.$router.push({ query })
      this.handleClose()
    },
    handleSetDefault() {
      this.filter = {
        ...this.filterInit,
      }
    },
  },
}
</script>
<style lang="less" scoped>
.discount-filter {
  /deep/.wrap-input-half {
    @apply flex items-center justify-between;
    &-item {
      @apply flex items-center;
      &:first-child {
        margin-right: 24px;
      }
      &__label {
        font-size: @size-16;
        line-height: @size-24;
        color: @black;
      }
      .custom-input,
      .custom-input.ant-input-affix-wrapper {
        height: @height-field;
        flex: 1;
        margin-left: @margin-12;
        @apply mr-2;
        .ant-input {
          color: @black;
          height: 100%;
          .ant-input-suffix {
            font-size: @size-16;
            color: @black;
          }
        }
      }
    }
  }
}
</style>
