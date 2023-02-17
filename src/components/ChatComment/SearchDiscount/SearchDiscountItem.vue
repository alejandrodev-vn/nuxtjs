<template>
  <div class="discount-item" @click="handleOpenDiscountDetail">
    <div class="discount-item__left">
      <div class="discount-item__left__discount-code">
        <p class="mb-0">{{ discount.codes.data[0].code }}</p>
      </div>
      <p class="discount-item__left__name">{{ discount.name }}</p>
      <div class="discount-item__left__value-discount">
        <img :src="iconTypeDiscount" />
        <span
          v-if="
            discountTypes[discount.discount_type_id] === 'percentage-discount'
          "
        >
          {{ discountValue }} %
        </span>
        <app-currency
          v-else
          :price="discountValue"
          :currency="symbolCurrency"
        />
      </div>
    </div>
    <div class="discount-item__right">
      <app-tag :style="discountStatusTag">
        <span>{{ discountStatus }}</span>
      </app-tag>
      <span class="discount-item__right__invoice-date">
        {{
          $moment.utc(discount.start_date).local().format('HH:mm DD/MM/YYYY')
        }}
        -
        {{ $moment.utc(discount.end_date).local().format('HH:mm DD/MM/YYYY') }}
      </span>
    </div>
  </div>
</template>
<script>
import { invert } from 'lodash'

export default {
  name: 'SearchDiscountItem',
  props: {
    discount: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    symbolCurrency() {
      return `${this.$store.state.configCurrency.vi.symbol} `
    },
    configDiscountStatus() {
      return invert(this.$store.state.discountStatus)
    },
    discountTypes() {
      return invert(this.$store.state.discountTypes)
    },
    iconTypeDiscount() {
      return require(`~/assets/images/Discount/Discount-type-${
        this.discountTypes[this.discount.discount_type_id]
      }.png`)
    },
    discountValue() {
      return this.discount.discount_value
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
  },
  methods: {
    handleOpenDiscountDetail() {
      this.$emit('handleOpenDiscountDetail', this.discount)
    },
  },
}
</script>
<style lang="less" scoped>
.discount-item {
  border-color: @gray-4;
  padding: @padding-16;
  @apply flex items-center justify-between border-b cursor-pointer duration-500;
  &:hover {
    background-color: @primary-4;
  }
  &__left {
    width: 50%;
    &__discount-code {
      color: @black;
      font-size: @size-16;
      margin-bottom: @margin-12;
      @apply font-medium;
    }
    &__value-discount {
      color: @primary;
      @apply flex items-center my-2 font-semibold;
      img {
        width: @size-24;
        height: @size-24;
        @apply mr-2;
      }
    }
    &__name {
      color: @grey;
      font-size: @size-12;
      margin-bottom: @margin-8;
    }
  }

  &__right {
    @apply flex flex-col items-end;
    /deep/.app-tag {
      margin-bottom: @margin-16;
    }
    &__invoice-date {
      color: @grey;
      font-size: @size-12;
      @apply text-right;
    }
  }
}
</style>
