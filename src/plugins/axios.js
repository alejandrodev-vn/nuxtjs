export default function ({ $axios, app, redirect }) {
  const locale = app.store.state.i18n.locale || app.i18n.defaultLocale

  $axios.setHeader('X-localization', locale)
}
