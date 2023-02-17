<template>
  <a-dropdown
    v-model="visible"
    :trigger="['click']"
    class="layout-header-right__dropdown"
    :class="{ 'no-notification': totalUnread === 0 }"
  >
    <div @click="(e) => e.preventDefault()">
      <a-badge
        :count="totalUnread"
        :number-style="{ backgroundColor: '#fb4e4e' }"
      >
        <a-icon type="bell" />
      </a-badge>
    </div>
    <div
      slot="overlay"
      class="wrap-dropdown"
      @scroll="handleLoadMoreNotifications"
    >
      <div class="wrap-dropdown__header">
        <div class="layout-header-right__dropdown__header">
          <span class="layout-header-right__dropdown__header--title">
            {{ $t('notifications') }}
          </span>
          <span class="layout-header-right__dropdown__header--time">
            {{ $t('last-days-update', { days: 30 }) }}
          </span>
        </div>
        <div class="layout-header-right__dropdown__actions">
          <div class="left">
            <app-tag
              v-for="tab in tabs"
              :key="tab.key"
              :type="tabActive === tab.key ? 'primary' : 'secondary'"
              :class="{ active: tabActive === tab.key }"
              pointer
              nowrap
              @click="handleClickTab(tab.key)"
            >
              <span>{{ tab.title }}</span>
            </app-tag>
          </div>
          <div class="right">
            <a-tooltip
              overlay-class-name="custom-tooltip-light"
              placement="bottomLeft"
            >
              <template slot="title"> {{ $t('mark-all-as-read') }} </template>
              <app-tag
                type="secondary"
                pointer
                nowrap
                @click="handleMarkAllAsRead"
              >
                <i class="far fa-check-double"></i>
              </app-tag>
            </a-tooltip>
          </div>
        </div>
      </div>
      <app-loading v-if="$fetchState.pending" />
      <no-data-notifications
        v-else-if="
          !notifications.length ||
          (tabActive === 'unread' && !notificationsUnread.length)
        "
      />
      <div v-else class="layout-header-right__dropdown__body">
        <keep-alive>
          <component
            :is="tabActive"
            :notifications="notifications"
            :notifications-unread="notificationsUnread"
            @loadMore="handleLoadMoreNotifications"
            @update="handleUpdateNotificationItem"
          >
          </component>
        </keep-alive>
        <app-loading v-if="isLoading" />
      </div>
    </div>
  </a-dropdown>
</template>
<script>
import event from '@/utils/event'
import { actionTypes } from '@/constants/action-types-firebase'
import HeaderNotificationAll from '@/components/Layout/HeaderNotification/Status/HeaderNotificationAll'
import HeaderNotificationUnread from '@/components/Layout/HeaderNotification/Status/HeaderNotificationUnread'

export default {
  name: 'HeaderNotification',
  fetchOnServer: false,
  components: {
    all: HeaderNotificationAll,
    unread: HeaderNotificationUnread,
  },
  data() {
    return {
      tabActive: 'all',
      visible: false,
      notifications: [],
      notificationsUnread: [],
      limit: 10,
      page: 1,
      totalPages: 0,
      total: 0,
      pageUnread: 1,
      totalPagesUnread: 0,
      totalUnread: 0,
      isLoading: false,
    }
  },
  async fetch() {
    await Promise.all([
      this.fetchNotifications(),
      this.fetchNotificationsUnread(),
    ])
  },
  computed: {
    locale() {
      return this.$i18n.locale
    },
    tabs() {
      return [
        {
          key: 'all',
          title: this.$t('all'),
        },
        {
          key: 'unread',
          title: this.$t('unread'),
        },
      ]
    },
    userId() {
      return this.$auth.user.id
    },
    noMoreResults() {
      return !this.isLoading && this.page >= this.totalPages
    },
    noMoreResultsUnread() {
      return !this.isLoading && this.pageUnread >= this.totalPagesUnread
    },
  },
  watch: {
    locale() {
      this.page = 1
      this.notifications = []
      this.pageUnread = 1
      this.notificationsUnread = []
      this.$fetch()
    },
  },
  mounted() {
    if (!this.$firebase.connected) {
      this.$firebase.firebase.init()
    }
    event.$on(actionTypes.NOTIFY, (notify) => {
      if (!notify) return
      const isExisting = this.notifications.some(
        (item) => item.id === notify.id
      )
      if (isExisting) return
      const newNotifications = {
        ...notify,
        id: notify.id,
        data: {
          message: notify[`message_${this.locale}`],
          ...notify,
        },
      }
      this.notifications.unshift(newNotifications)
      this.notificationsUnread.unshift(newNotifications)
      this.totalUnread += 1
    })
  },
  methods: {
    handleClickTab(key) {
      this.tabActive = key
    },
    async handleResetNotifications() {
      this.page = 1
      this.pageUnread = 1
      this.notifications = []
      this.notificationsUnread = []
      await this.$fetch()
    },
    async handleMarkAllAsRead() {
      try {
        if (this.totalUnread === 0) return
        await this.$api.notifications.readAllNotications(this.userId)
        await this.handleResetNotifications()
        this.tabActive = 'all'
      } catch (e) {}
    },
    getPopupContainerDropdown() {
      return this.$el
    },
    handleUpdateNotificationItem(newObject) {
      const findIndex = this.notifications.findIndex(
        (item) => item.id === newObject.id
      )
      if (findIndex !== -1) {
        if (!this.notifications[findIndex].read_at && this.totalUnread > 0) {
          this.totalUnread -= 1
        }
        this.notifications.splice(findIndex, 1, {
          ...newObject,
        })
        if (newObject.read_at) {
          const findIndexUnread = this.notificationsUnread.findIndex(
            (item) => item.id === newObject.id
          )
          if (findIndexUnread !== -1) {
            this.notificationsUnread.splice(findIndexUnread, 1)
          }
        }
      }
    },
    handleLoadMoreNotifications(e) {
      const target = e.currentTarget
      const isBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 10
      if (this.tabActive === 'unread') {
        if (isBottom && !this.isLoading && !this.noMoreResultsUnread) {
          this.pageUnread += 1
          this.fetchNotificationsUnread()
        }
      } else if (isBottom && !this.isLoading && !this.noMoreResults) {
        this.page += 1
        this.fetchNotifications()
      }
    },
    async fetchNotifications() {
      try {
        if (!this.userId) return
        this.isLoading = true
        const params = {
          page: this.page,
          limit: this.limit,
          sort: '-created_at',
        }
        const { data, meta } = await this.$api.notifications.getNotifications(
          this.userId,
          params
        )
        if (data) {
          this.notifications = [...this.notifications, ...data]
          this.totalPages = meta?.pagination?.total_pages
          this.total = meta?.pagination?.total
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
    async fetchNotificationsUnread() {
      try {
        if (!this.userId) return
        this.isLoading = true
        const params = {
          page: this.pageUnread,
          limit: this.limit,
          status: this.$store.state.notify.status.unread,
          sort: '-created_at',
        }
        const { data, meta } = await this.$api.notifications.getNotifications(
          this.userId,
          params
        )
        if (data) {
          this.notificationsUnread = [...this.notificationsUnread, ...data]
          this.totalPagesUnread = meta?.pagination?.total_pages
          this.totalUnread = meta?.total_unread
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
<style lang="less" scoped>
.wrap-dropdown {
  background-color: @white;
  border-radius: 6px;
  width: 320px;
  max-height: 480px;
  overflow: hidden auto;
  @apply relative;
  &__header {
    top: 0;
    left: 0;
    width: 100%;
    background-color: @white;
    z-index: 5;
    @apply sticky;
  }
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
  @apply shadow-xl;
}
.layout-header-right {
  @apply flex items-center;

  &__dropdown {
    line-height: 1;
    padding-right: 2rem;

    &.no-notification {
      padding-right: 1rem;
      .anticon-bell {
        animation: unset;
      }
    }

    .anticon-bell {
      color: @black;
      font-size: @size-22;
      cursor: pointer;
      border-radius: 50%;
      padding: @padding-8;
      animation: ringBell 1s infinite linear;
      @apply duration-500;
      &:hover,
      &:active,
      &:focus {
        background-color: @gray-6;
      }
      @keyframes ringBell {
        0% {
          transform: rotate(-15deg);
        }
        25% {
          transform: rotate(15deg);
        }
        50% {
          transform: rotate(-15deg);
        }
        75% {
          transform: rotate(15deg);
        }
        100% {
          transform: rotate(-15deg);
        }
      }
    }
    &.ant-dropdown-open {
      .anticon-bell {
        background-color: @gray-6;
      }
    }
    /deep/.ant-badge-count {
      top: @size-8;
      right: @size-7;
      min-width: @size-20;
      height: @size-20;
      font-size: @size-12;
      line-height: @size-20;
      &.ant-badge-multiple-words {
        padding: 0 @padding-8;
      }
    }
    &__header {
      padding: @padding-12;
      @apply flex items-center justify-between;
      &--title {
        font-weight: 500;
        font-size: @size-16;
        line-height: @size-24;
        color: @black-blue;
      }
      &--time {
        font-weight: 400;
        font-size: @size-10;
        line-height: @size-16;
        color: @black-blue;
        font-style: italic;
      }
    }
    &__actions {
      padding-inline: @padding-12;
      padding-block: 0 @padding-12;
      @apply flex items-center justify-between;
      /deep/.app-tag {
        &--primary {
          background-color: @primary;
          color: @white;
        }
        &--secondary {
          background: #eff2f8;
          color: #595f90;
          border: none;
        }
      }
      .left {
        @apply flex items-center;
        .app-tag {
          &:first-child {
            margin-right: @margin-12;
          }
        }
      }
    }
  }
}
</style>
