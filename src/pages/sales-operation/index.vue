<template>
  <div class="sales-operation-page">
    <nuxt-child></nuxt-child>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  asyncData({ app, redirect }) {
    const permissions = get(app, 'store.state.auth.user.permissions', []) || []
    if (!permissions.includes('sales ops')) {
      const defaultLocale = app.i18n.defaultLocale
      const locale = app.store.state.i18n.locale
      const url = locale === defaultLocale ? '/' : `/${locale}`

      redirect(url)
    }
  },
}
</script>
