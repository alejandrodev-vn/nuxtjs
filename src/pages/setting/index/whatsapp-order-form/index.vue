<template>
  <div class="whatsapp-order-form-page">
    <div
      class="whatsapp-order-form-page__header whatsapp-order-form-page-header"
    >
      <h6 class="whatsapp-order-form-page-header__title">
        {{ $t('whatsapp-order-form') }}
      </h6>
      <img
        src="@/assets/images/EmailTemplate/Icon-light-bulb.png"
        alt="Social CRM"
        class="custom-button-setup"
        @click="handleOpenModalSetup"
      />
    </div>
    <div class="whatsapp-order-form-page__body">
      <whatsapp-order-form-card />
    </div>
    <nuxt-child />
    <whatsapp-order-form-modal-guide ref="whatsappOrderFormModalGuide" />
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'WhatsappOrderForm',
  fetchOnServer: false,
  asyncData({ app, redirect }) {
    const permissions = get(app, 'store.state.auth.user.permissions', []) || []
    if (!permissions.includes('setting')) {
      const defaultLocale = app.i18n.defaultLocale
      const locale = app.store.state.i18n.locale
      const url =
        locale === defaultLocale
          ? '/setting/account'
          : `/${locale}/setting/account`

      redirect(url)
    }
  },
  methods: {
    handleOpenModalSetup() {
      this.$refs.whatsappOrderFormModalGuide.show()
    },
  },
}
</script>

<style lang="less" scoped>
.whatsapp-order-form-page {
  padding: 2rem 1rem;

  &__body {
    margin-top: 1rem;
    @apply flex flex-wrap;
  }
}

.whatsapp-order-form-page-header {
  @apply flex items-center;

  &__title {
    color: @black;
    font-size: @size-20;
    margin-right: 1rem;
    @apply font-semibold mb-0;
  }
  .custom-button-setup {
    width: @width-btn-trigger;
    height: @width-btn-trigger;
    cursor: pointer;
    @apply duration-500;
    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
