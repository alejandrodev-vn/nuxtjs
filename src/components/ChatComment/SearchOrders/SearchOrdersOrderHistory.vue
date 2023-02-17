<template>
  <app-no-data v-if="!histories.length" :text="$t('noDataFound')" />
  <a-timeline v-else class="order-history">
    <a-timeline-item>
      <div class="timeline-item">
        <span class="timeline-item__action">
          {{ getAction(history.action_type) }}
        </span>
        <time class="timeline-item__time">
          {{
            $moment.utc(history.action_time).local().format('HH:mm DD/MM/YYYY')
          }}
        </time>
      </div>
    </a-timeline-item>
  </a-timeline>
</template>
<script>
export default {
  name: 'SearchOrdersOrderHistory',
  props: {
    histories: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    getAction(type) {
      const types = [
        { key: 1, text: this.$t('ordered') },
        { key: 2, text: this.$t('confirmed') },
        { key: 3, text: this.$t('unblockedBy') },
        { key: 4, text: this.$t('updatedNoteBy') },
      ]
      const getCase = types.find((obj) => obj.key === type)
      return !getCase ? 'Unknown action' : getCase.text
    },
  },
}
</script>
<style lang="less" scoped>
.order-history {
  @apply mt-6;
  /deep/.ant-timeline-item-tail {
    border-color: @green;
  }
  /deep/.ant-timeline-item-head {
    color: @green;
    background-color: @green;
    border-color: @green;
  }
  .timeline-item {
    @apply flex flex-col;
    &__action {
      color: @black;
      font-size: @size-3;
      @apply font-semibold;
    }
    &__time {
      color: @gray-2;
      font-size: @size-4;
      @apply font-normal;
    }
  }
}
</style>
