<template>
  <div class="tag-histories">
    <h6 class="title-section">{{ $t('history') }}</h6>
    <app-loading v-if="isLoading" />
    <app-no-data
      v-else-if="!histories.length || !currentFanId"
      :text="$t('noDataTagHistories')"
    />
    <perfect-scrollbar
      v-else
      :options="{ suppressScrollX: true }"
      class="tag-histories__body"
    >
      <a-timeline>
        <a-timeline-item v-for="(history, index) in histories" :key="index">
          <div class="timeline-item">
            <span class="timeline-item__action">{{ getAction(history) }}</span>
            <time class="timeline-item__time">
              {{
                $moment
                  .utc(history.action_time)
                  .local()
                  .format('HH:mm DD/MM/YYYY')
              }}
            </time>
          </div>
        </a-timeline-item>
      </a-timeline>
    </perfect-scrollbar>
  </div>
</template>
<script>
import { get } from 'lodash'
import event from '@/utils/event'
export default {
  name: 'TagsGuestHistory',
  data() {
    return {
      isLoading: false,
      histories: [],
    }
  },
  computed: {
    currentFanId() {
      return this.$route.params.guest
    },
  },
  watch: {
    currentFanId() {
      this.fetchTagHistories()
    },
  },
  created() {
    this.fetchTagHistories()
    event.$on('triggerFetchTagHistories', this.fetchTagHistories)
  },
  methods: {
    async fetchTagHistories() {
      try {
        this.isLoading = true
        if (!this.currentFanId) return
        const { data } = await this.$api.fan.getTagHistories(this.currentFanId)
        if (data) {
          const tagHistories = get(data, 'tag_histories.data', [])
          this.histories = Object.freeze(tagHistories)
        }
      } catch (err) {
      } finally {
        this.isLoading = false
      }
    },
    getAction(action) {
      const types = [
        {
          key: 1,
          text: this.$t('actionTag.add', {
            name: action.action_by.name,
            tag: action.tag,
          }),
        },
        {
          key: 2,
          text: this.$t('actionTag.edit', {
            name: action.action_by.name,
            oldTag: action.old_tag,
            tag: action.tag,
          }),
        },
        {
          key: 3,
          text: this.$t('actionTag.remove', {
            name: action.action_by.name,
            tag: action.tag,
          }),
        },
      ]
      const getCase = types.find((obj) => obj.key === action.action_type)
      return !getCase ? '--' : getCase.text
    },
  },
}
</script>
<style lang="less" scoped>
.tag-histories {
  height: 49%;
  padding: @padding-24;

  @apply flex flex-col;
  &__body {
    @apply flex-1 p-4;
    /deep/.ant-timeline-item-tail {
      border-color: @primary;
    }
    /deep/.ant-timeline-item-head {
      color: @primary;
      background-color: @primary;
      border-color: @primary;
      font-size: @size-12;
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
