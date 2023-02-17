<template>
  <div class="resolution-history">
    <h5 class="resolution-history__title">
      {{ $t('resolutionHistory') }}
    </h5>
    <app-loading v-if="$fetchState.pending" />
    <app-no-data
      v-else-if="!$fetchState.pending && !histories.length"
      :text="$t('noDataFound')"
    />
    <div v-else class="resolution-history__body">
      <a-timeline>
        <a-timeline-item v-for="(history, index) in histories" :key="index">
          <div class="timeline-item">
            <span class="timeline-item__action"
              >{{ getAction(history.action_type) }}
              {{ history.action_by.name }}</span
            >
            <time class="timeline-item__time">{{
              $moment
                .utc(history.action_time)
                .local()
                .format('HH:mm DD/MM/YYYY')
            }}</time>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ResolutionHistory',
  fetchOnServer: false,
  data() {
    return {
      histories: [],
    }
  },
  async fetch() {
    await this.fetchResolutionHistory()
  },
  computed: {
    guestId() {
      return this.$route.params.guest
    },
  },
  watch: {
    guestId() {
      this.fetchResolutionHistory()
    },
  },
  methods: {
    async fetchResolutionHistory() {
      try {
        if (!this.guestId) return
        const params = {
          include: 'resolution_histories',
        }
        const { data } = await this.$api.fan.getGuestDetail(
          this.guestId,
          params
        )
        if (data) {
          this.histories = Object.freeze(data.resolution_histories?.data)
        }
      } catch (err) {}
    },
    getAction(type) {
      const types = [
        { key: 1, text: this.$t('openedBy') },
        { key: 2, text: this.$t('blockedBy') },
        { key: 3, text: this.$t('unblockedBy') },
        { key: 4, text: this.$t('updatedNoteBy') },
        { key: 5, text: this.$t('updatedNoteBy') },
        { key: 6, text: this.$t('updatedNoteBy') },
        { key: 7, text: this.$t('createdOrderBy') },
        { key: 8, text: this.$t('updatedGuestInformationBy') },
        { key: 9, text: this.$t('updatedTagsBy') },
      ]
      const getCase = types.find((obj) => obj.key === type)
      return !getCase ? 'Unknown action by' : getCase.text
    },
  },
}
</script>
<style lang="less" scoped>
.resolution-history {
  @apply h-full flex flex-col;
  &__title {
    font-size: @size-20;
    color: @black;
    border-color: @gray-4;
    padding: @padding-24;
    @apply text-center font-semibold border-b;
  }
  &__body {
    overflow: hidden auto;
    padding: @padding-40 @padding-24;
    &::-webkit-scrollbar {
      width: 8px;
      &:hover {
        width: 11px;
      }
    }
    &::-webkit-scrollbar-track {
      background-color: #eee;
      border-radius: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #aaa;
      border-radius: 6px;
      min-height: 50px;
      &:hover {
        background-color: #999;
      }
    }
    @apply flex-1;
    /deep/.ant-timeline-item-tail {
      border-color: @primary;
      margin-top: @margin-8;
    }
    /deep/.ant-timeline-item-head {
      color: @primary;
      background-color: @primary;
      border-color: @primary;
      font-size: @size-12;
      margin-top: @margin-8;
    }
    .timeline-item {
      @apply flex flex-col;
      &__action {
        color: @black;
        font-size: @size-16;
        @apply font-semibold;
      }
      &__time {
        color: @gray-2;
        font-size: @size-14;
        @apply font-normal;
      }
    }
  }
}
</style>
