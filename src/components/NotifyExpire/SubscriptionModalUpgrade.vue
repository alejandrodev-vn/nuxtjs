<template>
  <a-modal
    class="modal-subscription-upgrade"
    centered
    :visible="isVisible"
    :closable="false"
    :cancel-text="$t('no-thanks')"
    :ok-text="$t('see-plans')"
    destroy-on-close
    @cancel="handleCancel"
    @ok="handleConfirm"
  >
    <div class="modal-subscription-upgrade__head">
      <icon-warning />
      <span class="title">{{ $t('upgrade-required') }}</span>
    </div>
    <p>{{ $t('desc-upgrade-required') }}</p>
  </a-modal>
</template>

<script>
import event from '@/utils/event'
export default {
  name: 'SubscriptionModalUpgrade',
  data() {
    return {
      isVisible: false,
    }
  },
  mounted() {
    event.$on('openModalUpgradeRequired', this.handleOpen)
  },
  methods: {
    handleOpen() {
      this.isVisible = true
    },
    handleConfirm() {
      const role = this.$auth.user?.roles[0]
      if (role === 'owner') {
        window.open(`${process.env.DOMAIN_SSO}billing/plans`, '_blank')
        return
      }
      this.handleCancel()
    },
    handleCancel() {
      this.isVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.modal-subscription-upgrade {
  /deep/.ant-modal {
    width: 400px !important;
  }
  &__head {
    @apply flex items-center pt-2 mb-2;
    .title {
      color: @black;
      font-size: @size-2;
      @apply ml-2 font-semibold;
    }
  }
  p {
    color: @gray-1;
    font-size: @font-size-base;
  }
  /deep/.ant-modal-footer {
    border: 0;
    padding: 1.5rem !important;
    padding-top: 3rem;
    .ant-btn:first-child {
      color: @black;
      font-size: 1rem;
      font-weight: 500;
    }
    .ant-btn:last-child {
      color: @white;
      font-size: 1rem;
      font-weight: 500;
    }
  }
}
</style>
