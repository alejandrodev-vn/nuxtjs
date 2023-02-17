<template>
  <div class="chat-comment-guests">
    <div class="chat-comment-guests__filters">
      <a-input
        :value="search"
        class="custom-search"
        allow-clear
        :disabled="isLoading"
        :placeholder="$t('search-by-guest-name')"
        @pressEnter="handleSearchByName"
        @change="onChangeSearch($event)"
      >
        <a-icon slot="prefix" type="search" />
        <a-icon
          v-if="$fetchState.pending || isLoading"
          slot="suffix"
          type="loading"
        />
      </a-input>

      <a-button type="primary" class="btn-filter" @click="handleTriggerFilter">
        <icon-filter />
      </a-button>
      <chat-comment-filter
        :is-visible="isVisibleFilter"
        :channels="channels"
        @filters="handleFilters"
        @close="handleTriggerFilter"
      />
    </div>
    <div class="wrapper-tabs">
      <a-dropdown placement="bottomLeft" :trigger="['click']">
        <div class="wrapper-tabs__icon-sort" @click="(e) => e.preventDefault()">
          <icon-sort-order
            :style="{
              transform: sort === 1 ? 'rotate(180deg)' : 'rotate(0deg)',
            }"
          />
        </div>

        <a-menu slot="overlay">
          <a-menu-item key="oldest" @click="handleSort('oldest')">
            <div class="flex items-center">
              <span
                rel="noopener noreferrer"
                class="chat-comment-guests-dropdown--item"
              >
                {{ $t('oldest') }}
              </span>
              <a-icon v-if="sort === 1" type="check" class="ml-2" />
            </div>
          </a-menu-item>
          <a-menu-item key="newest" @click="handleSort('newest')">
            <div class="flex items-center">
              <span
                rel="noopener noreferrer"
                class="chat-comment-guests-dropdown--item"
              >
                {{ $t('newest') }}
              </span>
              <a-icon v-if="sort === -1" type="check" class="ml-2" />
            </div>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
      <a-tabs
        v-model="activeCountTab"
        tab-position="top"
        :style="{ height: '100%' }"
      >
        <a-tab-pane v-for="tab in displayTabs" :key="tab.key">
          <template slot="tab">
            <div class="tabs-item">
              <span>{{ tab.title }}</span>
              <span
                v-if="tab.key === 'unhandled'"
                class="unseen unseen--red"
                :class="{ '!opacity-100': totalUnhandled > 0 }"
              >
                {{ totalUnhandled }}
              </span>
              <span
                v-else-if="tab.key === 'waiting-escalate'"
                class="unseen unseen--yellow"
                :class="{ '!opacity-100': totalWaitingEscalate > 0 }"
              >
                {{ totalWaitingEscalate }}
              </span>
            </div>
          </template>
        </a-tab-pane>
      </a-tabs>
    </div>
    <perfect-scrollbar
      :options="{ suppressScrollX: true }"
      class="scroll-guests"
      @ps-y-reach-end="handleLoadMore"
    >
      <!-- <app-loading v-if="$fetchState.pending" /> -->
      <app-no-data
        v-if="!$fetchState.pending && !guests.length"
        :text="$t('noConversation')"
        class="mt-8"
      />
      <div v-else class="guests__body">
        <!-- <app-loading
          v-if="isBlockingAreaGuestList"
          class="loading-change-guest"
        />
        <div
          v-if="isBlockingAreaGuestList"
          class="overlay-loading-change-guest"
        ></div> -->
        <chat-comment-guest-card
          v-for="(guest, index) in guests"
          :key="index"
          :guest="guest"
          :is-blocking-event-click="isBlockingAreaGuestList"
          @handleBlockAreaGuestList="handleBlockAreaGuestList"
        />
        <app-loading v-if="isLoadingMore" />
      </div>
    </perfect-scrollbar>
  </div>
</template>

<script>
import { get, debounce } from 'lodash'
import { convertLocalToUTC } from '@/utils/moment'
import event from '@/utils/event'
import { actionTypes } from '@/constants/action-types-firebase'
import enumEventEmit from '@/constants/enum-event-emit'

export default {
  name: 'ChatCommentGuests',
  fetchOnServer: false,
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isLoadingMore: false,
      isLoading: false,
      page: 1,
      limit: 10,
      guests: [],
      total: 0,
      isVisibleFilter: false,
      isBlockingAreaGuestList: false,
      search: '',
      filters: {},
      activeCountTab: 'unhandled',
      totalUnhandled: 0,
      totalWaitingEscalate: 0,
      sort: 1,
    }
  },
  async fetch() {
    this.resetData()
    await this.fetchGuests()
    await this.getTotalCountConversation()
  },
  computed: {
    configConversations() {
      return this.$store.state.configConversations
    },
    primaryPageId() {
      return get(this.channels, '0.id', '') || ''
    },
    pageId() {
      return this.$route.params.page || this.primaryPageId
    },
    conversationType() {
      return this.$route.params.type || 'chat'
    },
    noMoreResults() {
      return !this.isLoadingMore && this.page >= this.total
    },
    socialProfileId() {
      return this.$store.state.currentInfoFan?.social_profile_id
    },
    infoPage() {
      return this.$store.state.currentInfoPage || {}
    },
    infoFan() {
      return this.$store.state.currentInfoFan || {}
    },
    displayTabs() {
      return [
        {
          key: 'unhandled',
          title: this.$t('unhandled'),
        },
        {
          key: 'waiting-escalate',
          title: this.$t('waiting-escalate'),
        },
        {
          key: 'all',
          title: this.$t('all'),
        },
      ]
    },
    filterConversationStatus() {
      if (this.activeCountTab === 'unhandled') {
        return this.configConversations.status.opening
      }
      if (this.activeCountTab === 'waiting-escalate') {
        return this.configConversations.status.waiting_escalate
      }
      return false
    },
  },
  watch: {
    pageId() {
      this.$fetch()
    },
    conversationType() {
      this.$fetch()
    },
    activeCountTab() {
      this.$fetch()
    },
    '$fetchState.pending'() {
      this.$emit('handleChangeLoadingGuests', this.$fetchState.pending)
    },
  },
  mounted() {
    event.$on('triggerRefreshGuestsList', this.$fetch)
    event.$on(actionTypes.MESSAGE, (data) => {
      this.handlePushNewMessage(data)
    })
    event.$on(
      enumEventEmit.conversation.UPDATE_COUNT_GUEST,
      ({ guestId, payload, socialPostId }) => {
        this.handleUpdateCountGuest({ guestId, payload, socialPostId })
      }
    )
    event.$on('updateLatestConversation', ({ newReply, guestId }) => {
      if (!newReply || !guestId) return
      if (
        newReply.conversation_type === this.configConversations.type.comment ||
        newReply.conversation_type === this.configConversations.type.reply
      ) {
        const findIndex = this.guests.findIndex(
          (guest) =>
            guest.id === guestId &&
            newReply.social_post_id &&
            guest.latest_conversation.data.social_post_id ===
              newReply.social_post_id
        )
        if (findIndex !== -1) {
          this.guests[findIndex].latest_conversation.data = { ...newReply }
          if (findIndex !== 0) {
            const getElementWantToMove = this.guests.splice(findIndex, 1)[0]
            this.guests.splice(0, 0, getElementWantToMove)
          }
        }
      } else {
        const findIndex = this.guests.findIndex((guest) => guest.id === guestId)
        if (findIndex !== -1) {
          this.guests[findIndex].latest_conversation.data = { ...newReply }
          if (findIndex !== 0) {
            const getElementWantToMove = this.guests.splice(findIndex, 1)[0]
            this.guests.splice(0, 0, getElementWantToMove)
          }
        }
      }
    })
  },
  beforeDestroy() {
    event.$off('triggerRefreshGuestsList')
    event.$off('updateLatestConversation')
    event.$off(enumEventEmit.conversation.UPDATE_COUNT_GUEST)
    // event.$off(actionTypes.MESSAGE)
  },
  methods: {
    onChangeSearch(e) {
      const { value } = e.target
      if (this.search?.length && !value?.length) {
        this.search = value
        this.$fetch()
      }
      this.search = value
    },
    handleSearchByName: debounce(function () {
      this.$fetch()
    }, 1000),
    handleSort(sortOrder) {
      if (this.$fetchState.pending) return
      if (sortOrder === 'newest') {
        this.sort = -1
        this.$fetch()
        return
      }
      this.sort = 1
      this.$fetch()
    },
    handlePushNewMessage(data) {
      if (!data) return
      const { message } = data
      let isErrorConversationType = false
      if (this.conversationType === 'chat') {
        isErrorConversationType =
          message.conversation_type === this.configConversations.type.comment ||
          message.conversation_type === this.configConversations.type.reply
      } else {
        isErrorConversationType =
          message.conversation_type === this.configConversations.type.chat
      }
      if (
        isErrorConversationType ||
        parseInt(this.pageId) !== message.social_channel_id ||
        message.from_id === this.infoPage.social_id
      )
        return
      if (
        message.conversation_type === this.configConversations.type.comment ||
        message.conversation_type === this.configConversations.type.reply
      ) {
        const findIndex = this.guests.findIndex(
          (guest) =>
            guest.social_profile_id === message.from_id &&
            message.social_post_id &&
            guest.latest_conversation.data.social_post_id ===
              message.social_post_id
        )
        if (findIndex !== -1) {
          this.guests[findIndex].latest_conversation.data = {
            ...this.guests[findIndex].latest_conversation.data,
            ...message,
          }
          this.guests[findIndex].total_pending += 1
          if (findIndex !== 0 && this.sort === -1) {
            const getElementWantToMove = this.guests.splice(findIndex, 1)[0]
            this.guests.splice(0, 0, getElementWantToMove)
          }
        }
      } else {
        const findIndex = this.guests.findIndex(
          (guest) => guest.social_profile_id === message.from_id
        )
        if (findIndex !== -1) {
          this.guests[findIndex].latest_conversation.data = { ...message }
          this.guests[findIndex].total_pending += 1
          if (findIndex !== 0 && this.sort === -1) {
            const getElementWantToMove = this.guests.splice(findIndex, 1)[0]
            this.guests.splice(0, 0, getElementWantToMove)
          }
        }
      }
      this.totalUnhandled += 1
    },
    handleUpdateCountGuest({ guestId, payload, socialPostId }) {
      if (socialPostId) {
        const findIndex = this.guests.findIndex(
          (guest) =>
            guest.social_profile_id === guestId &&
            guest.social_posts?.social_post_id === socialPostId
        )
        if (findIndex !== -1) {
          this.guests[findIndex].total_pending += payload.total_pending
          this.guests[findIndex].total_waiting += payload.total_waiting
          this.totalUnhandled += payload.total_pending
          this.totalWaitingEscalate += payload.total_waiting
          if (
            this.guests[findIndex].total_pending < 1 &&
            this.filterConversationStatus ===
              this.configConversations.status.opening
          ) {
            this.guests.filter((guest) => guest.social_profile_id !== guestId)
          }
          if (
            this.guests[findIndex].total_waiting < 1 &&
            this.filterConversationStatus ===
              this.configConversations.status.waiting_escalate
          ) {
            this.guests.filter((guest) => guest.social_profile_id !== guestId)
          }
        }
      } else {
        const findIndex = this.guests.findIndex(
          (guest) => guest.social_profile_id === guestId
        )
        if (findIndex !== -1) {
          this.guests[findIndex].total_pending += payload.total_pending
          this.guests[findIndex].total_waiting += payload.total_waiting
          this.totalUnhandled += payload.total_pending
          this.totalWaitingEscalate += payload.total_waiting
          if (
            this.guests[findIndex].total_pending < 1 &&
            this.filterConversationStatus ===
              this.configConversations.status.opening
          ) {
            this.guests.filter((guest) => guest.social_profile_id !== guestId)
          }
          if (
            this.guests[findIndex].total_waiting < 1 &&
            this.filterConversationStatus ===
              this.configConversations.status.waiting_escalate
          ) {
            this.guests.filter((guest) => guest.social_profile_id !== guestId)
          }
        }
      }
    },
    handlePushNewResponse(data) {
      if (!data) return
      const { message } = data
      const findIndex = this.guests.findIndex(
        (guest) => guest.social_profile_id === message.from_id
      )
      if (
        this.configConversations.type[this.conversationType] !==
          parseInt(message.conversation_type) ||
        parseInt(this.pageId) !== message.social_channel_id
      )
        return
      if (findIndex !== -1) {
        const targetGuest = this.guests[findIndex]
        if (
          this.$moment(message.time * 1000) <
          this.$moment(new Date().setMilliseconds(0))
        )
          return
        targetGuest.latest_conversation.data = {
          ...targetGuest.latest_conversation.data,
          ...message,
          actions: [message.actions],
        }
        if (
          targetGuest?.tracking_unseen &&
          targetGuest?.tracking_unseen?.data &&
          this.socialProfileId &&
          this.socialProfileId !== message.from_id
        ) {
          targetGuest.tracking_unseen.data.unseen_message += 1
        } else if (
          this.socialProfileId &&
          this.socialProfileId !== message.from_id
        ) {
          targetGuest.tracking_unseen = {
            data: { unseen_message: 1 },
          }
        }
        if (findIndex !== 0) {
          const getElementWantToMove = this.guests.splice(findIndex, 1)[0]
          this.guests.splice(0, 0, getElementWantToMove)
        }
      }
    },
    handleSeenConversation(guestId) {
      const findIndex = this.guests.findIndex((guest) => guest.id === guestId)
      if (findIndex !== -1) {
        if (this.conversationType === 'comment') {
          this.guests[findIndex].tracking_unseen = {
            data: { unseen_comment: 0 },
          }
        } else {
          this.guests[findIndex].tracking_unseen = {
            data: { unseen_message: 0 },
          }
        }
        // this.seenConversation(guestId)
      }
    },
    // async seenConversation(fanId) {
    //   try {
    //     if (!fanId) return
    //     const payload = {
    //       fan_id: fanId,
    //       conversation_type:
    //         this.conversationType === 'comment' ? 'comment' : 'message',
    //     }
    //     await this.$api.fan.seenConversation(payload)
    //   } catch (err) {}
    // },
    handleBlockAreaGuestList() {
      this.$emit('handleChangeLoadingGuests', true)
      setTimeout(() => {
        this.$emit('handleChangeLoadingGuests', false)
      }, 1000)
    },
    async getTotalCountConversation() {
      const isChat = this.conversationType === 'chat'
      const params = {
        conversation_type: isChat ? 1 : 2,
        social_channel_id: this.pageId,
        ...(this.search?.length && { search_columns: this.search }),
        ...this.filters,
      }
      const { data } = await this.$api.fan.getTotalCountConversation(params)
      if (data) {
        this.totalUnhandled = data.total_conversation_opening
        this.totalWaitingEscalate = data.total_conversation_waiting_escalate
      }
    },
    async fetchGuests() {
      try {
        const isChat = this.conversationType === 'chat'
        const params = {
          ...(this.search?.length && { search_columns: this.search }),
          social_channel_id: this.pageId,
          conversation_type: isChat ? 1 : 2,
          include: 'tracking_unseen,latest_conversation',
          ...(this.filterConversationStatus && {
            conversation_status: this.filterConversationStatus,
          }),
          page: this.page,
          sort: this.sort,
          limit: this.limit,
          ...this.filters,
        }
        const { data, meta } = await this.$api.fan.getGuestListConversation(
          params
        )
        if (data) {
          this.guests = [...this.guests, ...data]
          this.total = meta.pagination.total_pages
        }
      } catch (e) {}
    },
    async handleLoadMore() {
      if (!this.isLoading && !this.isLoadingMore && !this.noMoreResults) {
        this.isLoadingMore = true
        this.$emit('handleChangeLoadingGuests', this.isLoadingMore)
        this.page++
        await this.fetchGuests()
        this.isLoadingMore = false
        this.$emit('handleChangeLoadingGuests', this.isLoadingMore)
      }
    },
    resetData() {
      this.page = 1
      this.total = 0
      this.guests.splice(0, this.guests.length)
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text
        .toLowerCase()
        .includes(input.toLowerCase())
    },
    handleChangeGuest(value) {
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/conversations/chat-comment/${this.pageId}/${this.conversationType}/${value}`,
          query,
        })
      )
    },
    handleFilters(filters = {}) {
      const params = {
        ...(filters.postId && { social_post_id: filters.postId }),
        ...(filters.range?.length && {
          'conversation_date[from]': convertLocalToUTC(
            this.$moment(filters.range[0]),
            'YYYY-MM-DD HH:mm'
          ),
          'conversation_date[to]': convertLocalToUTC(
            this.$moment(filters.range[1]),
            'YYYY-MM-DD HH:mm'
          ),
        }),
        ...(filters.status && { lock_status: filters.status }),
        ...(filters.tags?.length && {
          tag_id: filters.tags[filters.tags.length - 1],
        }),
      }
      this.filters = {
        ...params,
      }

      if (filters.channel !== this.pageId) {
        const query = {
          ...this.$route.query,
        }
        this.$router.push(
          this.localePath({
            path: `/conversations/chat-comment/${filters.channel}/${filters.conversationType}`,
            query,
          })
        )
      } else if (
        filters.channel === this.pageId &&
        filters.conversationType !== this.conversationType
      ) {
        const guestId = this.$route.params.guest || ''
        const query = {
          ...this.$route.query,
        }
        this.$router.push(
          this.localePath({
            path: `/conversations/chat-comment/${filters.channel}/${filters.conversationType}/${guestId}`,
            query,
          })
        )
      } else {
        this.$fetch()
      }
    },
    handleTriggerFilter() {
      this.isVisibleFilter = !this.isVisibleFilter
    },
  },
}
</script>

<style lang="less" scoped>
.chat-comment-guests {
  @apply flex flex-col overflow-hidden;
  &__filters {
    @apply flex mb-4;
  }
  .scroll-guests {
    @apply flex-1;
    .guests__body {
      position: relative;
      .loading-change-guest {
        position: absolute;
        left: 50%;
        height: 50%;
        transform: translateY(50%);
        z-index: 11;
      }
    }
  }
}
.custom-search {
  height: @height-field;

  /deep/.ant-input {
    height: @height-field;
  }
}

.btn-filter {
  background-color: @gray-6;
  color: @black;
  margin-inline: @margin-16 @margin-24;
  width: @height-field;
  height: @height-field;
  @apply p-0 border-0 rounded-xl inline-flex items-center justify-center;
  svg {
    width: @size-14;
    height: @size-14;
  }
}

.wrapper-tabs {
  font-weight: 500;
  @apply flex justify-center;
  &__icon-sort {
    margin-right: 24px;
    font-size: @size-16;
    height: 42px;
    z-index: 5;
    transition: 0.25s linear;
    @apply relative flex items-center cursor-pointer;
  }
  /deep/.ant-tabs {
    margin-left: -40px;
    width: 100%;
    .ant-tabs-bar {
      padding-left: 12px;
      .ant-tabs-nav-wrap {
        padding-left: 24px;
      }
    }
    .ant-tabs-tab {
      margin-right: 0;
    }
    .ant-tabs-nav-container-scrolling {
      padding-left: 0;
      .ant-tabs-tab {
        margin-right: 0;
        &:last-child {
          margin: 0 32px 0 0;
        }
      }
    }
    .tabs-item {
      @apply flex items-center;
    }
    .unseen {
      min-width: 26px;
      font-size: @size-11;
      color: @white;
      opacity: 0;
      transition: 0.25s linear;
      margin-left: 0.5rem;
      @apply text-center block rounded-xl;
      &--red {
        background-color: @red;
      }
      &--yellow {
        background-color: @yellow;
      }
    }
  }
}
</style>
