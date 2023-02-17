<template>
  <div class="auto-config-page">
    <div class="auto-config-page__header auto-config-page-header">
      <h6 class="auto-config-page-header__title">
        {{ $t('automation-configuration') }}
      </h6>
    </div>
    <div class="auto-config-page__body">
      <auto-config-card />
    </div>
    <nuxt-child></nuxt-child>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'AutomationConfiguration',
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
}
</script>

<style lang="less" scoped>
.auto-config-page {
  padding: @padding-40 @padding-24;

  &__body {
    margin-top: 1rem;
    @apply flex flex-wrap;
  }
}

.auto-config-page-header {
  @apply flex items-center justify-between;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
}
</style>
