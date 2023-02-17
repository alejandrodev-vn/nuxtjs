<template>
  <div class="tags">
    <h5 class="tags__title">
      {{ $t('tags') }}
    </h5>
    <tags-guest-current-tags />
    <tags-guest-history />
  </div>
</template>
<script>
export default {
  name: 'TagsGuestPage',
  data() {
    return {
      isLoading: false,
      canEdit: true,
      currentTags: [],
    }
  },
  computed: {
    guestId() {
      return this.$route.params.guest
    },
    infoFan() {
      return this.$store.state.currenInfoFan
    },
  },
  watch: {
    infoFan() {
      this.canEdit =
        !this.infoFan.locked_by ||
        (this.infoFan.locked_by &&
          this.$auth.user.id === this.infoFan.locked_by.id)
    },
  },
  async created() {
    await Promise.all([this.fetchCurrentTags()])
  },
  methods: {
    async fetchCurrentTags() {
      try {
        this.isLoading = true
        if (!this.guestId) return
        const params = {
          fan_id: this.guestId,
        }
        const { data } = await this.$api.tagsGuest.getCurrentTags(params)
        if (data) {
          this.currentTags = Object.freeze(data)
        }
      } catch (err) {
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
<style lang="less" scoped>
.tags {
  @apply h-full flex flex-col;
  &__title {
    font-size: @size-20;
    color: @black;
    padding: @padding-24 !important;
    border-color: @gray-4;
    margin-bottom: 0;
    @apply border-b text-center font-semibold;
  }
  /deep/.title-section {
    font-size: @size-20;
    line-height: @size-20;
    @apply m-0 mb-4 font-semibold;
  }
}
</style>
