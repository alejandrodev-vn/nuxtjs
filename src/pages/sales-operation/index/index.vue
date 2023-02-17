<script>
export default {
  fetch({ app, redirect }) {
    const defaultLocale = app.i18n.defaultLocale
    const locale = app.store.state.i18n.locale
    const url =
      locale === defaultLocale
        ? '/sales-operation/discount'
        : `/${locale}/sales-operation/discount`

    redirect(url)
  },
}
</script>
