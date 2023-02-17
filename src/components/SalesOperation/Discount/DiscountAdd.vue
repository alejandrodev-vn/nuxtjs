<template>
  <a-drawer
    width="70vw"
    :closable="false"
    :visible="isShow"
    class="discount-add"
    @close="handleClose"
  >
    <span class="discount-add__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="discount-add__content">
      <div class="discount-add-content">
        <div class="discount-add-content__title">
          {{ $t('add-discount') }}
        </div>
        <div class="discount-add-content__form discount-add-content-form">
          <div class="discount-add-content-form__left">
            <discount-form-general ref="formGeneral" />
            <discount-form-config-discount
              ref="formConfigDiscount"
              class="mt-4"
            />
          </div>
          <div class="discount-add-content-form__right">
            <discount-form-status ref="formStatus" />
            <discount-form-active-dates ref="formActiveDates" class="mt-4" />
            <discount-form-usage-limits ref="formUsageLimits" class="mt-4" />
          </div>
        </div>
        <div class="discount-add-content__actions">
          <a-button @click="handleClose">
            {{ $t('cancel') }}
          </a-button>
          <a-button type="primary" :disabled="loading" @click="handleSave">
            <a-icon v-if="loading" type="loading" />
            {{ $t('save') }}
          </a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { convertLocalToUTC } from '@/utils/moment'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'DiscountAdd',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
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
        const { data } = await this.$api.discount.addDiscount(payload)

        if (data) {
          const query = {
            ...this.$route.query,
          }
          delete query.date_from
          delete query.date_to
          this.$router.push({ query })
          this.$emit('reload')
          this.handleClose()
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
.discount-add {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    z-index: 10;
    cursor: pointer;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }
  &.ant-drawer-open {
    /deep/ .ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        @apply overflow-auto;
      }
    }
  }
}

.discount-add-content {
  min-height: 100vh;
  padding: @padding-40;
  @apply relative;

  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: @margin-12;
    @apply font-semibold;
  }

  &__form {
    @apply grid grid-cols-1 gap-4;
    @media (min-width: theme('screens.lg')) {
      @apply grid-cols-2;
    }
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
</style>
