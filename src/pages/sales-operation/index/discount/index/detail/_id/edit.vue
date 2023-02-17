<template>
  <div class="discount-detail-edit-page">
    <div class="discount-detail-edit-page__header">
      <div class="discount-detail-edit-page__header--title">
        {{ $t('discount-detail') }}
      </div>
      <div class="discount-detail-edit-page__header--edit">
        <i class="fas fa-pen"></i>
      </div>
    </div>
    <div class="discount-detail-edit-page__body discount-detail-edit-page-body">
      <div class="discount-detail-edit-page-body__left">
        <discount-form-general
          ref="formGeneral"
          :discount="discount"
          :disabled="!isEditDiscount"
        />
        <discount-form-config-discount
          ref="formConfigDiscount"
          :discount="discount"
          :disabled="!isEditDiscount"
          class="mt-4"
        />
      </div>
      <div class="discount-detail-edit-page-body__right">
        <discount-form-status
          ref="formStatus"
          :discount="discount"
          :disabled="false"
        />
        <discount-form-active-dates
          ref="formActiveDates"
          :discount="discount"
          :disabled="!isEditDiscount"
          class="mt-4"
        />
        <discount-form-usage-limits
          ref="formUsageLimits"
          :discount="discount"
          :disabled="!isEditDiscount"
          class="mt-4"
        />
      </div>
    </div>
    <div class="discount-detail-edit-page__actions">
      <a-button @click="handleCancel">
        {{ $t('cancel') }}
      </a-button>
      <a-button type="primary" :disabled="loading" @click="handleSave">
        <a-icon v-if="loading" type="loading" />
        {{ $t('save') }}
      </a-button>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { convertUTCToLocal, convertLocalToUTC } from '@/utils/moment'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'DiscountDetailEditPage',
  async asyncData({ app, redirect, params }) {
    const discountID = params.id
    try {
      const params = {
        include: 'codes',
      }
      const { data } = await app.$axios.$get(`discounts/${discountID}`, {
        params,
      })
      if (data) {
        const status = get(data, 'status')
        if (status === app.store.state.discountStatus.expired) {
          const defaultLocale = app.i18n.defaultLocale
          const locale = app.store.state.i18n.locale
          const url =
            locale === defaultLocale
              ? `/sales-operation/discount/detail/${discountID}`
              : `/${locale}/sales-operation/discount/detail/${discountID}`

          redirect(url)
        }

        return { discount: data }
      }
    } catch (e) {}
  },
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    discountID() {
      return this.$route.params.id
    },
    startDate() {
      const date = this.discount.start_date
      return convertUTCToLocal(date, 'YYYY-MM-DD HH:mm')
    },
    endDate() {
      const date = this.discount.end_date
      return convertUTCToLocal(date, 'YYYY-MM-DD HH:mm')
    },
    today() {
      return this.$moment(new Date()).format('YYYY-MM-DD HH:mm')
    },
    isEditDiscount() {
      const startDate = new Date(this.startDate)
      const today = new Date(this.today)
      return startDate.getTime() > today.getTime()
    },
  },
  methods: {
    handleCancel() {
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/sales-operation/discount/detail/${this.discountID}`,
          query,
        })
      )
    },
    async handleSave() {
      let payload = {}
      const isCompletedGeneral = await this.$refs.formGeneral.handleValidate()
      const isCompletedConfigDiscount =
        await this.$refs.formConfigDiscount.handleValidate()

      if (isCompletedGeneral && isCompletedConfigDiscount) {
        const formConfigDiscount = this.$refs.formConfigDiscount.form
        const payloadConfigDiscount = {
          discount_type_id: formConfigDiscount.type,
          discount_value: formConfigDiscount.value,
          is_min_payment: formConfigDiscount.min === 'yes' ? 1 : 0,
          ...(formConfigDiscount.min === 'yes' && {
            min_payment: formConfigDiscount.minValue,
          }),
          is_max_discount_value: formConfigDiscount.max === 'yes' ? 1 : 0,
          ...(formConfigDiscount.max === 'yes' && {
            max_discount_value: formConfigDiscount.maxValue,
          }),
        }
        const payloadActiveDates = {
          start_date: convertLocalToUTC(
            this.$moment(this.$refs.formActiveDates.range[0]),
            'YYYY-MM-DD HH:mm'
          ),
          end_date: convertLocalToUTC(
            this.$moment(this.$refs.formActiveDates.range[1]),
            'YYYY-MM-DD HH:mm'
          ),
        }
        const payloadStatus = {
          status: this.$refs.formStatus.checked ? 1 : 0,
        }
        const formUsageLimits = this.$refs.formUsageLimits.form
        const payloadUsageLimits = {
          is_limit: formUsageLimits.limit,
          ...(formUsageLimits.limit ===
            this.$store.state.discountUsageLimits.limited && {
            limit: formUsageLimits.limitValue,
          }),
        }

        payload = {
          ...this.$refs.formGeneral.form,
          ...payloadConfigDiscount,
          ...payloadStatus,
          ...payloadActiveDates,
          ...payloadUsageLimits,
        }

        this.handleSubmit(payload)
      }
    },
    async handleSubmit(payload) {
      this.loading = true
      try {
        const { data } = this.isEditDiscount
          ? await this.$api.discount.updateDiscount(this.discountID, payload)
          : await this.$api.discount.updateDiscountStatus(this.discountID, {
              status: payload.status,
            })

        if (data) {
          this.handleCancel()
          notification.success({
            message: this.$t('success'),
            class: 'notification-success',
          })
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.discount-detail-edit-page {
  padding: @padding-40;
  @apply relative;

  &__header {
    @apply flex;

    &--title {
      color: @black;
      font-size: @size-20;
      @apply font-semibold;
    }

    &--edit {
      background-color: @primary-3;
      border: 1px solid @primary;
      border-radius: @border-radius-base;
      color: @primary;
      padding: 0.5rem;
      margin-left: 1rem;
      @apply flex items-center font-medium cursor-pointer;
    }
  }

  &__body {
    margin-top: 1rem;
  }

  &__actions {
    width: 100%;
    left: 0;
    bottom: 0;
    background-color: @white;
    padding: 1rem 1.5rem;
    box-shadow: 8px 0 24px rgba(25, 32, 56, 0.04);
    @apply absolute text-right;
  }
}

.discount-detail-edit-page-body {
  @apply grid grid-cols-1 gap-4;
  @media (min-width: theme('screens.lg')) {
    @apply grid-cols-2;
  }
}
</style>
