<template>
  <div class="guest-information__crm-order p-section">
    <h6 class="title-section">{{ $t('crmOrder') }}</h6>
    <div class="flex items-center mb-4">
      <span class="text-left">{{ $t('totalOrders') }}:</span>
      <span class="text-right">{{ totalOrders }}</span>
    </div>
    <div class="flex items-center">
      <span class="text-left">{{ $t('completeRate') }}:</span>
      <span class="text-right">{{ completeRate }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuestInformationOrdersDdetail',
  props: {
    infoFan: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    pageId() {
      return this.$route.params.page
    },
    totalOrders() {
      return !this.infoFan?.order_count
        ? `0 ${this.$t('order')}`
        : this.infoFan?.order_count < 2
        ? `${this.infoFan?.order_count} ${this.$t('order')}`
        : `${this.infoFan?.order_count} ${this.$t('orders')}`
    },
    completeRate() {
      return !this.infoFan?.complete_rate
        ? '0%'
        : `${this.infoFan?.complete_rate}%`
    },
  },
  created() {
    if (!this.infoFan?.phone?.length) return
    this.fetchCustomerDetail()
  },
  methods: {
    async fetchCustomerDetail() {
      try {
        const params = {
          social_channel_ids: [this.pageId],
          search_columns: this.infoFan.phone,
        }
        const { data } = await this.$api.customer.getCustomers(params)
        if (data?.length) {
          this.customer = { ...data[0] }
        }
      } catch (e) {}
    },
  },
}
</script>

<style lang="less" scoped>
.guest-information {
  &__crm-order {
    .title-section {
      margin-bottom: @margin-16;
    }
    .text-left {
      color: @black;
      @apply font-medium mr-2;
    }
    .text-right {
      color: @gray-1;
    }
  }
}
</style>
