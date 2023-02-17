<script>
export default {
  asyncData({ app, redirect, params }) {
    const guestId = params.guest
    const defaultLocale = app.i18n.defaultLocale
    const locale = app.store.state.i18n.locale
    const pageId = params.page
    const conversationType = params.type
    if (guestId === 'undefined' || guestId === undefined) {
      const url =
        locale === defaultLocale
          ? `/conversations/chat-comment/${pageId}/${conversationType}`
          : `/${locale}/conversations/chat-comment/${pageId}/${conversationType}`

      redirect(url)
    }
  },
  mounted() {
    const isDeactivePage = !this.$store.state.isActivePage
    const guestId = this.$route.params.guest
    const pageId = this.$route.params.page
    const conversationType = this.$route.params.type
    if (isDeactivePage) {
      const url = `/conversations/chat-comment/${pageId}/${conversationType}/${guestId}`
      this.$router.push(this.localePath({ path: url }))
    }
  },
}
</script>
