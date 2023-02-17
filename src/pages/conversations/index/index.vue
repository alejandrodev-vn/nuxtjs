<script>
export default {
  fetch({ app, redirect }) {
    const defaultLocale = app.i18n.defaultLocale
    const locale = app.store.state.i18n.locale
    const url =
      locale === defaultLocale
        ? '/conversations/chat-comment'
        : `/${locale}/conversations/chat-comment`

    redirect(url)
  },
}
</script>
