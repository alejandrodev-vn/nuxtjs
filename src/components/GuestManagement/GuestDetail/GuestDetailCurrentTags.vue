<template>
  <div class="guest-detail-current-tags">
    <div class="guest-detail-current-tags__header">
      <div class="guest-detail-current-tags__header--title">
        {{ $t('currentTags') }}
      </div>
      <div
        v-if="historyTags.length"
        class="guest-detail-current-tags__header--history"
        @click="handleShowDrawer"
      >
        <i class="fas fa-history"></i>
      </div>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <div
      v-else-if="!$fetchState.pending && currentTags.length"
      class="guest-detail-current-tags__content"
    >
      <template v-for="(tag, index) in currentTags">
        <app-tag
          :key="index"
          type="secondary"
          class="guest-detail-current-tags__content--tag"
        >
          {{ tag.name }}
        </app-tag>
      </template>
    </div>

    <a-drawer
      :visible="isShowDrawer"
      :closable="false"
      width="30vw"
      class="drawer-guest-detail-current-tags"
      @close="handleCloseDrawer"
    >
      <span
        class="drawer-guest-detail-current-tags__close"
        @click="handleCloseDrawer"
      >
        <icon-right class="btn-trigger-collapse" />
      </span>
      <div
        class="drawer-guest-detail-current-tags__content drawer-guest-detail-current-tags-content"
      >
        <div class="drawer-guest-detail-current-tags-content__title">
          {{ $t('history-tags') }}
        </div>
        <div class="drawer-guest-detail-current-tags-content__timeline">
          <a-timeline>
            <a-timeline-item v-for="(item, index) in historyTags" :key="index">
              <div class="timeline-item">
                <div class="timeline-item__action">{{ item.action }}</div>
                <div class="timeline-item__time">{{ item.time }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { get, invert } from 'lodash'
import { convertUTCToLocal } from '@/utils/moment'

export default {
  name: 'GuestDetailCurrentTags',
  fetchOnServer: false,
  props: {
    guest: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isShowDrawer: false,
      currentTags: [],
    }
  },
  async fetch() {
    await this.fetchCurrentTags()
  },
  computed: {
    historyTags() {
      const tags = get(this.guest, 'tag_histories.data', []) || []
      return tags.map((item) => {
        const types = {
          'history-tag-add': 1,
          'history-tag-edit': 2,
          'history-tag-remove': 3,
        }
        const invertTypes = invert(types)
        const name = get(item, 'tag', '') || ''
        const actionBy = get(item, 'action_by.name', '') || ''
        const actionType = item.action_type
        return {
          name,
          time: convertUTCToLocal(item.action_time, 'HH:mm DD/MM/YYYY'),
          action: this.$t(invertTypes[actionType], {
            tag: name,
            name: actionBy,
          }),
        }
      })
    },
  },
  methods: {
    async fetchCurrentTags() {
      try {
        const params = {
          fan_id: this.guest.id,
        }
        const { data } = await this.$api.tagsGuest.getCurrentTags(params)
        if (data) {
          this.currentTags = Object.freeze(data)
        }
      } catch (err) {}
    },
    handleShowDrawer() {
      this.isShowDrawer = true
    },
    handleCloseDrawer() {
      this.isShowDrawer = false
    },
  },
}
</script>

<style lang="less" scoped>
.guest-detail-current-tags {
  border: 1px solid @secondary-2;
  border-radius: @border-radius-lg;
  padding: @padding-24;

  &__header {
    @apply flex;

    &--title {
      color: @black;
      font-size: @size-20;
      @apply font-semibold;
    }

    &--history {
      background-color: @white;
      border: 1px solid @secondary-2;
      border-radius: @border-radius-base;
      color: @black;
      padding: 0.5rem;
      margin-left: 1rem;
      @apply flex items-center font-medium cursor-pointer;
    }
  }

  &__content {
    margin: 1rem -0.25rem 0;

    &--tag {
      margin: 0.25rem;
      @apply inline-block;
    }
  }
}

.drawer-guest-detail-current-tags {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    cursor: pointer;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }
  &__content {
    height: 100%;
    padding: @padding-40 @padding-24;
    @apply overflow-auto;
  }
  &.ant-drawer-open {
    /deep/.ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        @apply overflow-auto;
      }
    }
  }
}

.drawer-guest-detail-current-tags-content {
  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: 2rem;
    @apply font-semibold;
  }

  &__timeline {
    /deep/.ant-timeline-item-tail {
      border-color: @primary;
    }

    /deep/.ant-timeline-item-head {
      color: @primary;
      background-color: @primary;
      border-color: @primary;
    }
    .timeline-item {
      margin-left: 0.5rem;

      &__action {
        color: @black;
        font-size: @size-16;
        @apply font-medium;
      }

      &__time {
        color: @secondary-1;
        font-size: @size-12;
      }
    }
  }
}
</style>
