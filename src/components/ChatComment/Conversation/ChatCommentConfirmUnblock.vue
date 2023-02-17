<template>
  <a-modal
    class="modal-confirm-unblock"
    centered
    :visible="visible"
    :closable="false"
    :cancel-text="$t('cancel')"
    :ok-text="$t('confirm')"
    destroy-on-close
    @cancel="handleCancel"
    @ok="handleConfirm"
  >
    <div class="modal-confirm-unblock__head">
      <icon-warning />
      <span class="title">{{ $t('confirmToUnblock') }}</span>
    </div>
    <p>{{ $t('descConfirmToUnblock') }} {{ nameUser }}</p>
  </a-modal>
</template>

<script>
export default {
  name: 'ChatCommentConfirmUnblock',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    nameUser: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleConfirm() {
      this.$emit('confirmUnblock')
    },
    handleCancel() {
      this.$emit('closeModalUnblock')
    },
  },
}
</script>

<style lang="less" scoped>
.modal-confirm-unblock {
  /deep/.ant-modal {
    width: 420px !important;
  }
  &__head {
    @apply flex items-center mb-2;
    .title {
      color: @black;
      font-size: @size-20;
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
    padding-top: 0 !important;
    .ant-btn {
      font-size: @size-14;
    }
  }
}
</style>
