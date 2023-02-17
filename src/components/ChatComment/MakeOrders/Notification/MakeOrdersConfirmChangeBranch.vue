<template>
  <a-modal
    class="modal-confirm-change-branch"
    centered
    :visible="visible"
    :closable="false"
    :cancel-text="$t('cancel')"
    :ok-text="$t('confirm')"
    destroy-on-close
    @cancel="handleCancel"
    @ok="handleConfirm"
  >
    <p>
      {{ $t('descConfirmChangeBranch') }}
    </p>
  </a-modal>
</template>

<script>
export default {
  name: 'MakeOrdersConfirmChangeBranch',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    branch: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    handleConfirm() {
      this.$emit('confirmChangeBranch', this.branch)
    },
    handleCancel() {
      this.$emit('closeConfirmChangeBranch')
    },
  },
}
</script>

<style lang="less" scoped>
.modal-confirm-change-branch {
  /deep/.ant-modal {
    width: 420px !important;
  }
  p {
    color: @gray-1;
    font-size: @font-size-base;
  }
  /deep/.ant-modal-footer {
    border: 0;
    padding: 1.5rem !important;
    padding-top: 0 !important;
  }
}
</style>
