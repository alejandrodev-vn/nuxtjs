<template>
  <a-drawer
    :visible="true"
    :closable="false"
    width="80vw"
    class="whatsapp-order-form-setup"
    @close="handleCloseDrawer"
  >
    <span class="whatsapp-order-form-setup__close" @click="handleCloseDrawer">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="whatsapp-order-form-setup-content">
      <div class="whatsapp-order-form-setup-content__header">
        <h6 class="whatsapp-order-form-setup-content__header__title">
          {{ $t('whatsapp-order-form') }}
        </h6>
        <div class="whatsapp-order-form-setup-content__header__switch">
          <app-switch
            ref="switchStatus"
            :checked="status === 1"
            :item="{ status }"
            :title="getTitleSwitchStatus(status)"
            :content="getContentSwitchStatus(status)"
            @confirm="handleUpdateStatus"
          />
          <span
            class="whatsapp-order-form-setup-content__header__switch__title"
          >
            {{ $t('on') }}
          </span>
          <a-popover placement="bottom">
            <template slot="content">
              {{ $t('tooltip-whatsapp-order-form') }}
            </template>
            <i class="fal fa-info-circle custom-icon-info"></i>
          </a-popover>
        </div>
      </div>
      <div class="whatsapp-order-form-setup-content__body">
        <whatsapp-order-form-setup-form
          ref="form"
          :order-form="orderForm"
          :status="status"
        />
      </div>
      <div
        v-if="status === 1"
        class="whatsapp-order-form-setup-content__footer"
      >
        <a-button @click="handleCloseDrawer">
          {{ $t('cancel') }}
        </a-button>
        <a-button
          type="primary"
          :disabled="loading || !canSave"
          @click="handleSave"
        >
          <a-icon v-if="loading" type="loading" />
          {{ $t('save') }}
        </a-button>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '../../../utils'
Vue.use(notification)

export default {
  name: 'WhatsappOrderFormSetup',
  data() {
    return {
      status: 0,
      loading: false,
      orderForm: null,
    }
  },
  async fetch() {
    await this.fetchOrderForm()
  },
  computed: {
    canSave() {
      if (!this.orderForm) return true
      const formUpdate = { ...this.$refs.form.getForm() }
      return (
        this.orderForm.name !== formUpdate.displayName ||
        this.orderForm.phone !== formUpdate.phoneNumber ||
        this.orderForm.title !== formUpdate.title ||
        this.orderForm.short_title !== formUpdate.shortTitle
      )
    },
  },
  methods: {
    async createNewOrderForm() {
      try {
        this.loading = true
        const form = { ...this.$refs.form.getForm() }
        if (!form) return
        const payload = {
          phone: form.phoneNumber,
          name: form.displayName,
          title: form.title,
          short_title: form.shortTitle,
        }
        const { data } = await this.$api.orderForm.createOrderForm(payload)
        if (!data) return
        this.$fetch()
        notification.success({
          message: this.$t('saved-successfully'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
    async updateOrderForm() {
      try {
        this.loading = true
        const form = { ...this.$refs.form.getForm() }
        if (!form || !this.orderForm?.id) return
        const payload = {
          ...(this.orderForm.name !== form.displayName && {
            name: form.displayName,
          }),
          ...(this.orderForm.phone !== form.phoneNumber && {
            phone: form.phoneNumber,
          }),
          ...(this.orderForm.title !== form.title && {
            title: form.title,
          }),
          ...(this.orderForm.short_title !== form.shortTitle && {
            short_title: form.shortTitle,
          }),
        }
        const { data } = await this.$api.orderForm.updateOrderForm(
          this.orderForm.id,
          payload
        )
        if (!data) return
        this.$fetch()
        notification.success({
          message: this.$t('saved-successfully'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
    async fetchOrderForm() {
      try {
        const { data } = await this.$api.orderForm.getOrderForms()
        if (!data?.length) return
        this.orderForm = { ...data[0] }
        this.status = this.orderForm.status
      } catch (e) {}
    },
    handleSubmit() {
      if (!this.canSave) return
      if (!this.orderForm) {
        this.createNewOrderForm()
        return
      }
      this.updateOrderForm()
    },
    handleSave() {
      const valid = this.$refs.form?.handleSave()
      const validOrderFormLink = this.$refs.form?.validateOrderFormLink()
      if (!valid || !validOrderFormLink) return false
      this.handleSubmit()
    },
    handleCloseDrawer() {
      this.$router.push(
        this.localePath({
          path: '/setting/whatsapp-order-form',
        })
      )
    },
    getTitleSwitchStatus(status) {
      if (status === 1) {
        return this.$t('unpublish-whatsapp-order-form')
      }
      return this.$t('publish-whatsapp-order-form')
    },
    getContentSwitchStatus(status) {
      if (status === 1) {
        return this.$t('unpublish-whatsapp-order-form-desc')
      }
      return this.$t('publish-whatsapp-order-form-desc')
    },
    async handleUpdateStatus(value) {
      const status = value.status === 1 ? 0 : 1
      try {
        this.loading = true
        this.status = status
        const payload = {
          status,
        }
        this.$refs.switchStatus.handleCloseModal()
        if (!this.orderForm) return
        await this.$api.orderForm.updateOrderForm(this.orderForm.id, payload)
        notification.success({
          message: this.$t('saved-successfully'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
        this.$refs.switchStatus.handleCloseModal()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.whatsapp-order-form-setup {
  /deep/ .ant-drawer-wrapper-body {
    overflow: unset;
  }
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    cursor: pointer;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }
  &-content {
    height: 100%;
    padding: 2rem;
    @apply overflow-auto;
    /deep/i {
      color: @black;
      @apply font-medium;
    }
    &__header {
      margin-bottom: 12px;
      @apply flex items-center;
      &__title {
        color: @black;
        font-size: @size-2;
        @apply font-semibold mb-0;
      }
      &__switch {
        margin-left: 2rem;
        @apply flex items-center justify-between;

        &__title {
          color: @black;
          margin: 0 0.5rem 0 0.75rem;
          @apply block font-semibold;
        }
      }
    }
    &__footer {
      width: 100%;
      background-color: #fff;
      left: 0;
      bottom: 0;
      padding: 1rem 1.5rem;
      box-shadow: 8px 0 24px rgb(25 32 56 / 4%);
      position: absolute;
      text-align: right;
      z-index: 10;
    }
  }
  &.ant-drawer-open {
    /deep/.ant-drawer-content {
      overflow: unset;
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        overflow: unset;
        position: relative;
      }
    }
  }
}
</style>
