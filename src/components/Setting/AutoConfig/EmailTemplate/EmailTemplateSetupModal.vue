<template>
  <a-modal
    :visible="visible"
    centered
    :footer="null"
    :mask-closable="true"
    width="35%"
    class="email-template-setup-modal"
    @cancel="hide"
  >
    <div class="setup-modal">
      <div class="setup-modal__header">
        {{ $t('title-email-template-setup-modal') }}
      </div>
      <div class="setup-modal__content">
        <p>{{ $t('content-1-email-template-setup-modal') }}</p>
        <p>{{ $t('content-2-email-template-setup-modal') }}</p>
      </div>
      <img
        src="@/assets/images/EmailTemplate/Image-set-language.png"
        alt="Prime CRM"
        class="setup-modal__image"
      />
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'EmailTemplateSetupModal',
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
.email-template-setup-modal {
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
    font-size: @size-20;
    margin-bottom: 1rem;
    @apply font-semibold text-center;
  }

  &__content {
    background-color: @primary-4;
    padding: 1.5rem;

    p {
      font-size: @size-16;
      color: @black;
      margin-bottom: 0;

      &:first-child {
        color: @primary;
        margin-bottom: 0.375rem;
        @apply font-semibold;
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
    font-size: 3rem;
    bottom: 0;
  }
}
</style>
