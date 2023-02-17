<template>
  <div class="guest-information__current-tags p-section">
    <div class="flex items-center justify-between mb-4">
      <h6 class="title-section">{{ $t('currentTags') }}</h6>
      <nuxt-link class="btn-see-more" :to="localePath({ path: 'tags' })">
        {{ $t('seeMore') }} <a-icon type="right" />
      </nuxt-link>
    </div>
    <app-loading v-if="$fetchState.pending" />
    <div v-else class="flex items-center flex-wrap">
      <app-tag
        v-for="tag in tags"
        :key="tag.id"
        type="secondary"
        class="mr-2 mb-2"
      >
        <span>{{ tag.name }}</span>
      </app-tag>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuestInformationCurrentTagsDetail',
  fetchOnServer: false,
  data() {
    return {
      tags: [],
    }
  },
  async fetch() {
    await this.fetchCurrentTags()
  },
  computed: {
    guestId() {
      return this.$route.params.guest
    },
  },
  methods: {
    async fetchCurrentTags() {
      try {
        if (!this.guestId) return
        const params = {
          fan_id: this.guestId,
        }
        const { data } = await this.$api.tagsGuest.getCurrentTags(params)
        if (data) {
          this.tags = Object.freeze(data.slice(0, 3))
        }
      } catch (err) {}
    },
  },
}
</script>

<style lang="less" scoped>
.guest-information {
  &__current-tags {
    /deep/.app-tag {
      padding: 6px 12px;
      font-size: @size-14;
      margin-right: @margin-16;
    }
    .btn-see-more {
      color: @black;
      @apply inline-flex items-center font-bold hover:underline;
      .anticon {
        @apply ml-2;
      }
    }
  }
}
</style>
