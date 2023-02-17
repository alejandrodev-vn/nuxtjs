<template>
  <div class="order-detail-page">
    <div class="order-detail-page__title">
      {{ $t('order-detail') }}
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <div v-else class="order-detail-page__body order-detail-page-body">
      <order-detail-info :order="order" />
      <div class="order-detail-page-body__row mt-4">
        <order-detail-products
          :order="order"
          class="order-detail-page-body__row--products"
        />
        <order-detail-customer
          :order="order"
          class="order-detail-page-body__row--customer"
        />
      </div>
      <order-detail-payment :order="order" class="mt-4" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderDetailPage',
  fetchOnServer: false,
  data() {
    return {
      order: {},
    }
  },
  async fetch() {
    await this.fetchOrderDetail()
  },
  computed: {
    orderID() {
      return this.$route.params.id
    },
  },
  methods: {
    async fetchOrderDetail() {
      try {
        const params = {
          include:
            'social_channel,delivery_provider,customer,shipping_address,order_details',
        }
        const { data } = await this.$api.order.getOrderDetail(
          this.orderID,
          params
        )
        if (data) {
          this.order = data
        }
      } catch (e) {}
    },
  },
}
</script>

<style lang="less" scoped>
.order-detail-page {
  padding: @padding-40 @padding-24;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }

  &__body {
    margin-top: 1rem;
  }
}

.order-detail-page-body {
  &__row {
    @apply flex flex-wrap;

    &--products {
      width: 100%;

      .desktop({
        width: 55%;
      });
    }

    &--customer {
      width: 100%;

      .desktop({
        margin-left: 1rem;
        width: calc(45% - 1rem);
      });
    }
  }
}
</style>
