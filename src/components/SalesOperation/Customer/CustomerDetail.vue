<template>
  <div class="customer-detail-page">
    <div class="customer-detail-page__header">
      <h6 class="customer-detail-page__header--title">
        {{ $t('customer-detail') }}
      </h6>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <div v-else class="customer-detail-page__body customer-detail-page-body">
      <div class="customer-detail-page-body__info">
        <customer-detail-information :customer="customer" />
      </div>
      <div class="customer-detail-page-body__note">
        <customer-detail-note :customer="customer" />
      </div>
      <div class="customer-detail-page-body__statistics">
        <customer-detail-statistics
          :customer="customer"
          @changeDateRange="handleChangeDateRange"
        />
      </div>
      <div class="customer-detail-page-body__conversation">
        <customer-detail-order-history :customer="customer" :range="range" />
      </div>
    </div>
  </div>
</template>
<script>
import { today, last30Days } from '@/utils/moment'
export default {
  name: 'CustomerDetail',
  fetchOnServer: false,
  data() {
    return {
      customer: null,
      range: [new Date(last30Days), new Date(today)],
    }
  },
  async fetch() {
    await this.fetchCustomerDetail()
  },
  computed: {
    customerId() {
      return this.$route.params.id
    },
  },
  methods: {
    async fetchCustomerDetail() {
      try {
        const { data } = await this.$api.customer.getCustomerDetail(
          this.customerId
        )
        if (data) {
          this.customer = { ...data }
        }
      } catch (e) {
        return this.$nuxt.error({ statusCode: 404 })
      }
    },
    handleChangeDateRange(range) {
      this.range = [...range]
    },
  },
}
</script>
<style lang="less" scoped>
.customer-detail-page {
  &__header {
    @apply flex;

    &--title {
      color: @black;
      font-size: @size-20;
      @apply font-semibold;
    }

    &--edit {
      background-color: @white;
      border: 1px solid @secondary-2;
      border-radius: @border-radius-base;
      color: @black;
      padding: 0.5rem;
      margin-left: 1rem;
      @apply flex items-center font-medium cursor-pointer;
    }
  }

  &__body {
    margin-top: 1rem;
  }
}

.customer-detail-page-body {
  &__info,
  &__note,
  &__statistics {
    margin-bottom: 16px;
  }
}
</style>
