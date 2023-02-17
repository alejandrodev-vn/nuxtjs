<template>
  <div class="discount-form-status">
    <div class="discount-form-status__title">
      {{ $t('status') }}
    </div>
    <div class="discount-form-status__content">
      <a-switch
        :checked="checked"
        :disabled="disabled"
        @change="handleChangeStatus"
      />
      <div class="discount-form-status__content--label">
        {{ $t(titleStatus) }}
      </div>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'DiscountFormStatus',
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
      checked: true,
      expired: false,
    }
  },
  computed: {
    titleStatus() {
      return this.expired ? 'expired' : this.checked ? 'active' : 'deactive'
    },
  },
  mounted() {
    const status = get(this.discount, 'status')
    this.expired = status === this.$store.state.discountStatus.expired
    this.checked =
      status === undefined
        ? true
        : status === this.$store.state.discountStatus.active
  },
  methods: {
    handleChangeStatus() {
      this.checked = !this.checked
    },
  },
}
</script>

<style lang="less" scoped>
.discount-form-status {
  background-color: #f8f8f8;
  padding: @padding-24 @padding-20;

  &__title {
    font-size: @size-16;
    color: @black;
    margin-bottom: @margin-12;
    @apply font-medium;
  }

  &__content {
    @apply flex items-center;

    &--label {
      margin-left: 0.5rem;
    }
  }
}
</style>
