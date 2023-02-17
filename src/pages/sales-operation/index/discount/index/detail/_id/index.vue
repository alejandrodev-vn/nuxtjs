<template>
  <div class="discount-detail-page">
    <div class="discount-detail-page__header">
      <div class="discount-detail-page__header--title">
        {{ $t('discount-detail') }}
      </div>
      <div
        v-if="isEditDiscount"
        class="discount-detail-page__header--edit"
        @click="handleEdit"
      >
        <i class="fas fa-pen"></i>
      </div>
      <a-popover v-else placement="right">
        <template slot="content">
          {{ $t('expired-promotion-cannot-be-edited') }}
        </template>
        <div class="discount-detail-page__header--edit">
          <i class="fas fa-pen"></i>
        </div>
      </a-popover>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <div v-else class="discount-detail-page__body discount-detail-page-body">
      <div class="discount-detail-page-body__left">
        <discount-form-general
          ref="formGeneral"
          :discount="discount"
          :disabled="true"
        />
        <discount-form-config-discount
          ref="formConfigDiscount"
          :discount="discount"
          :disabled="true"
          class="mt-4"
        />
      </div>
      <div class="discount-detail-page-body__right">
        <discount-form-status
          ref="formStatus"
          :discount="discount"
          :disabled="true"
        />
        <discount-form-active-dates
          ref="formActiveDates"
          :discount="discount"
          :disabled="true"
          class="mt-4"
        />
        <discount-form-usage-limits
          ref="formUsageLimits"
          :discount="discount"
          :disabled="true"
          class="mt-4"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscountDetailPage',
  fetchOnServer: false,
  data() {
    return {
      discount: {},
    }
  },
  async fetch() {
    await this.fetchDiscountDetail()
  },
  computed: {
    discountID() {
      return this.$route.params.id
    },
    isEditDiscount() {
      const status = this.discount.status
      return status !== this.$store.state.discountStatus.expired
    },
  },
  methods: {
    async fetchDiscountDetail() {
      try {
        const params = {
          include: 'codes',
        }
        const { data } = await this.$api.discount.getDiscountDetail(
          this.discountID,
          params
        )
        if (data) {
          this.discount = data
        }
      } catch (e) {}
    },
    handleEdit() {
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/sales-operation/discount/detail/${this.discountID}/edit`,
          query,
        })
      )
    },
  },
}
</script>

<style lang="less" scoped>
.discount-detail-page {
  padding: @padding-40;

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

.discount-detail-page-body {
  @apply grid grid-cols-1 gap-4;
  @media (min-width: theme('screens.lg')) {
    @apply grid-cols-2;
  }
}
</style>
