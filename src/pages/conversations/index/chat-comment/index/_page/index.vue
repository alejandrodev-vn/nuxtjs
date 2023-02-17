<script>
export default {
  fetch() {
    const path = this.$route.path
    const formatPath = path.length ? path.slice(0, -1) : path
    const query = {
      ...this.$route.query,
    }
    this.$router.push(
      this.localePath({
        path: `${formatPath}/${this.conversationType}`,
        query,
      })
    )
  },
  computed: {
    conversationType() {
      return this.$route.params.type || 'chat'
    },
  },
}
</script>
