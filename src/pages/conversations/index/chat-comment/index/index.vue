<script>
import { get } from 'lodash'

export default {
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
  },
  fetch() {
    if (this.pageId) {
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/conversations/chat-comment/${this.pageId}`,
          query,
        })
      )
    }
  },
  computed: {
    primaryPageId() {
      return get(this.channels, '0.id', '') || ''
    },
    pageId() {
      return this.$route.params.page || this.primaryPageId
    },
  },
}
</script>
