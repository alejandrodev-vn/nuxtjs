<template>
  <div class="status-history">
    <div class="status-history-header">
      <div class="title">
        <span class="title__name">{{ $t('status-history') }}</span>
      </div>
    </div>
    <div class="status-history-body">
      <app-no-data v-if="!histories.length" />
      <a-timeline v-else>
        <a-timeline-item v-for="(history, index) in histories" :key="index">
          <div class="timeline-item">
            <span class="timeline-item__action">
              {{ getAction(history.action) }}
            </span>
            <time class="timeline-item__time">{{
              $moment.utc(history.created_at).local().format('HH:mm DD/MM/YYYY')
            }}</time>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>
  </div>
</template>
<script>
import { invert } from 'lodash'
import AppNoData from '../../App/AppNoData.vue'
export default {
  components: { AppNoData },
  name: 'ResponseHistoryDetailStatusHistory',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    configConversation() {
      return this.$store.state.configConversations
    },
    histories() {
      return this.data?.statusHistories || []
    },
  },
  methods: {
    getAction(action) {
      const invertConfigStatus = invert(this.configConversation.action_type)
      return this.$t(invertConfigStatus[action])
    },
  },
}
</script>
<style lang="less" scoped>
.status-history {
  border-radius: 8px;
  border: 1px solid @gray-5;
  overflow: hidden;
  margin-bottom: @margin-12;
  &-header {
    background-color: @gray-6;
    padding: @padding-8 2.2rem;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    @apply flex items-center justify-between;
    .title {
      @apply flex items-center;
      &__name {
        color: @black;
        font-size: @size-20;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        @apply font-semibold;
      }
    }
  }
  &-body {
    padding: @padding-24;
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
