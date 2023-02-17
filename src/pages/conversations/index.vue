<template>
  <div class="conversation-page">
    <nuxt-child></nuxt-child>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'ConversationPage',
  asyncData({ app, redirect }) {
    const permissions = get(app, 'store.state.auth.user.permissions', []) || []
    if (!permissions.includes('conversation')) {
      const defaultLocale = app.i18n.defaultLocale
      const locale = app.store.state.i18n.locale
      const url = locale === defaultLocale ? '/' : `/${locale}`

      redirect(url)
    }
  },
}
</script>

<style lang="less" scoped>
.conversation-page {
  height: calc(
    100vh - @height-header - @height-footer - @padding-container - 2px
  );

  @apply flex flex-col;
}
</style>
