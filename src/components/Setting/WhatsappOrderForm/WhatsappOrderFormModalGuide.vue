<template>
  <a-modal
    :visible="visible"
    centered
    :footer="null"
    :mask-closable="true"
    width="35%"
    class="whatsapp-order-form-modal-guide"
    @cancel="hide"
  >
    <div class="setup-modal">
      <div class="setup-modal__header">
        {{ $t('how-does-the-whatsapp-order-form-work') }}
      </div>
      <div class="setup-modal__content">
        <p>{{ $t('content-1-whatsapp-order-form-modal-guide') }}</p>
        <p>{{ $t('content-2-whatsapp-order-form-modal-guide') }}</p>
      </div>
      <img
        src="@/assets/images/WhatsApp/bg-guide-whatsapp.png"
        alt="Social CRM"
        class="setup-modal__image"
      />
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'WhatsappOrderFormModalGuide',
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    show() {
      this.visible = true
    },
    hide() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.whatsapp-order-form-modal-guide {
  /deep/.ant-modal-content {
    border-radius: 40px;

    .ant-modal-body {
      padding: 2.5rem 1.5rem 1.5rem;
      background-image: url('~/assets/images/EmailTemplate/Background-set-language.png');
      border-radius: 40px;
      @apply bg-top bg-no-repeat bg-cover;
    }
  }
}

.setup-modal {
  &__header {
    color: @black;
    font-size: @size-2;
    margin-bottom: 1rem;
    @apply font-semibold text-center;
  }

  &__content {
    background-color: @primary-4;
    padding: 1.5rem;

    p {
      font-size: @size-3;
      color: @primary;
      margin-bottom: 0.375rem;
      @apply font-semibold;
      &:first-child {
        margin-bottom: 2rem;
      }
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 2rem 1rem 1rem;
  }

  /deep/.anticon {
    color: @gray-3;
    font-size: 30px;
    bottom: 0;
  }
}
</style>
