<template>
  <div v-if="!$fetchState.pending" class="chat-comment-page">
    <div class="column-left">
      <app-loading v-if="isLoading" class="loading-change-guest" />
      <div v-if="isLoading" class="overlay-loading-change-guest"></div>
      <h2 class="column-left__title">{{ $t('conversation') }}</h2>
      <div class="flex items-center mb-6">
        <chat-comment-select-channel
          :channels="channels"
          class="flex-1 chat-comment-select-channel"
          :loading="isLoading"
          @change="handleChangeChannel"
        />
        <a-tooltip
          overlay-class-name="custom-tooltip-light"
          placement="rightBottom"
        >
          <template slot="title">
            {{ $t('tooltip-reload-conversation') }}
          </template>
          <a-button
            type="primary"
            class="btn-reload"
            :disabled="isDisableReload"
            @click="handleReload"
          >
            <a-icon v-if="!isDisableReload" type="reload" />
            <app-loading v-else />
          </a-button>
        </a-tooltip>
      </div>
      <div
        v-if="!isHiddenSwitchConversationType && currentInfoPage"
        class="mb-6"
      >
        <span
          class="conversation-type mr-2"
          :class="{ active: conversationType === 'comment' }"
        >
          {{ $t('comment') }}
        </span>
        <a-switch
          :checked="isChat"
          default-checked
          size="large"
          @click="handleChangeConversationType"
        />
        <span
          class="conversation-type ml-2"
          :class="{ active: conversationType === 'chat' }"
        >
          {{ $t('chat') }}
        </span>
      </div>
      <chat-comment-guests
        ref="chatCommentGuests"
        :channels="channels"
        @handleChangeLoadingGuests="handleChangeLoadingGuests"
      />
    </div>
    <div class="column-right">
      <nuxt-child :channels="channels"></nuxt-child>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
// import event from '@/utils/event'
Vue.use(notification)

export default {
  name: 'ChatCommentPage',
  fetchOnServer: false,
  data() {
    return {
      channels: [],
      isDisableReload: false,
      isLoading: false,
    }
  },
  async fetch() {
    await this.fetchSocialChannels()
  },
  computed: {
    conversationType() {
      return this.$route.params.type || 'chat'
    },
    infoFan() {
      return this.$store.state.currentInfoFan
    },
    isChat() {
      return this.conversationType === 'chat'
    },
    currentInfoPage() {
      return this.$store.state.currentInfoPage
    },
    isHiddenSwitchConversationType() {
      return this.currentInfoPage?.channel_type?.data?.code === 'shopee'
    },
  },
  // beforeDestroy() {
  //   if (this.infoFan?.id) {
  //     const payload = {
  //       fan_id: this.infoFan.id,
  //     }
  //     this.$api.fan.unBlockConversation(payload)
  //   }
  // },
  methods: {
    handleChangeLoadingGuests(value) {
      this.isLoading = value
    },
    async fetchSocialChannels() {
      try {
        this.isLoading = true
        const params = {
          paginate: false,
          sort: 'name',
        }
        const { data } = await this.$api.socialChannel.getSocialChannelsByUser(
          params
        )
        if (data) {
          this.channels = Object.freeze(data)
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
    handleChangeChannel(value) {
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/conversations/chat-comment/${value}/${this.conversationType}`,
          query,
        })
      )
    },
    handleChangeConversationType(checked) {
      const pageId = this.$route.params.page
      const guestId = this.$route.params.guest
      const conversationType = checked ? 'chat' : 'comment'
      const path = guestId
        ? `/conversations/chat-comment/${pageId}/${conversationType}/${guestId}`
        : `/conversations/chat-comment/${pageId}/${conversationType}`
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path,
          query,
        })
      )
    },
    handleReload() {
      if (this.isDisableReload) return
      this.isDisableReload = true
      setTimeout(() => {
        this.isDisableReload = false
      }, 3000)
      this.$refs.chatCommentGuests.$fetch()
      // event.$emit('triggerRefreshConversationHistory')
      notification.success({
        message: this.$t('updated-data-successfully'),
        class: 'notification-success',
      })
    },
  },
}
</script>

<style lang="less" scoped>
.chat-comment-page {
  height: 100%;
  flex: 1;
  @apply flex flex-wrap;

  .chat-comment-select-channel {
    width: 80%;
  }

  .column-left {
    height: 100%;
    width: 25%;
    padding-left: @padding-24;
    padding-top: @padding-40;
    overflow: hidden;
    border-color: @gray-4;
    @apply border-r flex flex-col relative;

    &__title {
      color: @black;
      font-size: @size-20;
      @apply font-semibold;
    }
    /deep/.loading-change-guest {
      position: absolute;
      left: 50%;
      height: 50%;
      transform: translateY(50%);
      z-index: 11;
    }
    /deep/.overlay-loading-change-guest {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      z-index: 10;
      background-color: @white;
      opacity: 0.5;
    }
  }

  .column-right {
    height: 100%;
    width: 75%;
    overflow: hidden;
    @apply flex;
  }

  /deep/.ant-switch {
    min-width: 3.6rem;
    height: 2rem;
    background-color: @primary;
    &::after {
      width: 1.6rem;
      height: 1.6rem;
      top: 0.1rem;
      background-color: @white;
      border-radius: 50%;
      transition: all 0.5s ease;
      @apply absolute;
    }
  }
}

.btn-reload {
  background-color: @gray-6;
  color: @black;
  font-size: @size-14;
  margin-inline: @margin-16 @margin-24;
  width: @height-field;
  height: @height-field;
  @apply p-0 border-0 rounded-xl flex items-center justify-center flex-shrink-0;
  &[disabled] {
    margin-left: 0;
  }
}
.conversation-type {
  &.active {
    color: @black;
  }
}
</style>
