<template>
  <div class="guest-detail-page">
    <div class="guest-detail-page__header">
      <div class="guest-detail-page__header--title">
        {{ $t('guest-detail') }}
      </div>
      <div class="guest-detail-page__header--edit" @click="handleEdit">
        <i class="fas fa-pen"></i>
      </div>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <div v-else class="guest-detail-page__body guest-detail-page-body">
      <div class="guest-detail-page-body__info">
        <guest-detail-information :guest="guest" />
        <div v-if="false" class="flex flex-col">
          <guest-detail-order :guest="guest" />
          <guest-detail-current-tags :guest="guest" class="flex-1 mt-4" />
        </div>
      </div>
      <div class="guest-detail-page-body__conversation">
        <guest-detail-conversation-history :guest="guest" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuestDetailPage',
  fetchOnServer: false,
  data() {
    return {
      guest: {},
    }
  },
  async fetch() {
    await this.fetchGuestDetail()
  },
  computed: {
    guestID() {
      return this.$route.params.id
    },
  },
  methods: {
    async fetchGuestDetail() {
      try {
        const params = {
          include: 'tag_histories,conversation_histories,social_channel',
        }
        const { data } = await this.$api.fan.getGuestDetail(
          this.guestID,
          params
        )
        if (data) {
          this.guest = data
        }
      } catch (e) {}
    },
    handleEdit() {
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/conversations/guest-management/guest/${this.guestID}/edit`,
          query,
        })
      )
    },
  },
}
</script>

<style lang="less" scoped>
.guest-detail-page {
  padding: @padding-40 @padding-24;

  &__header {
    @apply flex;

    &--title {
      color: @black;
      font-size: @size-20;
      @apply font-semibold;
    }

    &--edit {
      background-color: @white;
      border: 1px solid @secondary-2;
      border-radius: @border-radius-base;
      color: @black;
      padding: 0.5rem;
      margin-left: 1rem;
      @apply flex items-center font-medium cursor-pointer;
    }
  }

  &__body {
    margin-top: 1rem;
  }
}

.guest-detail-page-body {
  &__info {
    @apply grid grid-cols-2 gap-4;
  }

  &__conversation {
    margin-top: 1rem;
  }
}
</style>
