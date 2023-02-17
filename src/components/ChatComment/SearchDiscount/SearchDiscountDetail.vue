<template>
  <a-drawer
    placement="right"
    destroy-on-close
    get-container=".search-discount"
    width="100%"
    wrap-class-name="discount-detail"
    :class="{ visible }"
    :wrap-style="{ position: 'absolute', width: '100%' }"
    :mask="false"
    :closable="false"
    :visible="visible"
    @close="handleCloseDiscountDetail"
  >
    <template slot="title">
      <div class="discount-detail__head">
        <a-icon type="arrow-left" @click="handleCloseDiscountDetail" />
        <h5 class="discount-detail__head__title">
          {{ $t('discount-detail') }}
        </h5>
        <span></span>
      </div>
    </template>
    <perfect-scrollbar
      :options="{ suppressScrollX: true }"
      class="discount-detail__body"
    >
      <div class="info-item">
        <span class="title-left">{{ $t('discount-name') }}</span>
        <span class="content-right">{{ discount.name }}</span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('discount-code') }}</span>
        <span class="content-right">
          {{ discount.codes.data[0].code }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('status') }}</span>
        <div class="content-right">
          <app-tag :style="discountStatusTag">
            <span>{{ discountStatus }}</span>
          </app-tag>
        </div>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('discount-value') }}</span>
        <div class="content-right">
          <p
            v-if="
              discountTypes[discount.discount_type_id] === 'percentage-discount'
            "
          >
            {{ discountValue }} %
          </p>
          <app-currency
            v-else
            :price="discountValue"
            :currency="symbolCurrency"
          />
        </div>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('type-discount') }}</span>
        <span class="content-right">
          {{ $t(discountTypes[discount.discount_type_id]) }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('left-qty') }}</span>
        <span class="content-right">
          {{ leftQuantity }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('used-qty') }}</span>
        <span class="content-right">
          {{
            discount.codes.data[0].used
              ? `${discount.codes.data[0].used} ${$t('codes')}`
              : '--'
          }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('usage-limit') }}</span>
        <span class="content-right">
          {{
            discount.limit
              ? `${discount.limit} ${$t('codes')}`
              : $t('unlimited')
          }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('start-date') }}</span>
        <span class="content-right">
          {{
            $moment.utc(discount.start_date).local().format('HH:mm DD/MM/YYYY')
          }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('end-date') }}</span>
        <span class="content-right">
          {{
            $moment.utc(discount.end_date).local().format('HH:mm DD/MM/YYYY')
          }}
        </span>
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('minimum-order-value') }}</span>
        <app-currency
          class="content-right"
          :price="discount.min_payment ? discount.min_payment : 0"
          :currency="symbolCurrency"
        />
      </div>
      <div class="info-item">
        <span class="title-left">{{ $t('maximum-discount-value') }}</span>
        <app-currency
          class="content-right"
          :price="discount.max_discount_value ? discount.max_discount_value : 0"
          :currency="symbolCurrency"
        />
      </div>
      <a-button
        type="primary"
        class="btn-use-discount"
        :disabled="discount.status !== 1"
        @click="handleCopyDiscountCode"
      >
        {{ $t('use-this-discount') }}
      </a-button>
    </perfect-scrollbar>
  </a-drawer>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { invert } from 'lodash'
Vue.use(notification)

export default {
  name: 'MakeOrdersProductDetail',
  props: {
    visible: {
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
      quantity: 0,
    }
  },
  computed: {
    symbolCurrency() {
      return `${this.$store.state.configCurrency.vi.symbol} `
    },
    discountValue() {
      return this.discount.discount_value
    },
    discountTypes() {
      return invert(this.$store.state.discountTypes)
    },
    configDiscountStatus() {
      return invert(this.$store.state.discountStatus)
    },
    discountStatus() {
      return this.$t(this.configDiscountStatus[this.discount.status])
    },
    discountStatusTag() {
      const config = [
        {
          key: 0,
          color: '#01122280',
          background: '#0112220d',
        },
        {
          key: 1,
          color: '#488eff',
          background: '#488eff1a',
        },
        {
          key: 2,
          color: '#0112221a',
          background: '#0112220d',
        },
      ]
      const getCase = config.find((obj) => obj.key === this.discount.status)
      return !getCase
        ? {
            '--color': '#0112221a',
            '--background-color': '#0112220d',
          }
        : {
            '--color': getCase.color,
            '--background-color': getCase.background,
          }
    },
    leftQuantity() {
      if (!this.discount.is_limit) return '--'
      const calculateLeft = this.discount.codes?.data[0]
        ? this.discount.limit - this.discount.codes.data[0].used
        : this.discount.limit
      return calculateLeft > 1
        ? `${calculateLeft} ${this.$t('codes')}`
        : `${calculateLeft} ${this.$t('code')}`
    },
  },
  methods: {
    handleCloseDiscountDetail() {
      this.$emit('handleCloseDiscountDetail')
    },
    async handleCopyDiscountCode() {
      try {
        if (this.discount.status !== 1) return
        await navigator.clipboard.writeText(this.discount.codes.data[0].code)
        notification.success({
          message: this.$t('copied-this-discount-code'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: this.$t('cannot-use-this-discount'),
          class: 'notification-error',
        })
      }
    },
  },
}
</script>
<style lang="less" scoped>
.discount-detail {
  @apply hidden;
  &.visible {
    @apply block;
  }
  /deep/.ant-drawer-content-wrapper {
    width: 100% !important;
    box-shadow: none;
    .ant-drawer-header {
      @apply p-0;
    }
    .ant-drawer-wrapper-body {
      @apply flex flex-col;
    }
    .ant-drawer-body {
      overflow: hidden;
      @apply flex-1 p-0;
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
  }
  &__body {
    padding: @padding-24;
    @apply relative flex-1 w-full max-h-full;
    .info-item {
      margin-bottom: @margin-24;
      @apply w-full flex items-start;
      .title-left {
        color: @black;
        width: 50%;
        font-size: @size-16;
        @apply block mr-6;
      }
      .content-right {
        color: @grey;
        width: 50%;
        font-size: @size-16;
        @apply block text-left;
        /deep/.app-tag {
          width: fit-content;
        }
      }
    }

    .btn-use-discount {
      @apply mt-4 w-full;
    }

    /deep/.ps__rail-y {
      left: unset !important;
      right: 0 !important;
    }
  }
}
</style>
