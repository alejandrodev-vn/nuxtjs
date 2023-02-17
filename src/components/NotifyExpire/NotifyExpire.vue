<template>
  <transition name="fade">
    <div>
      <div
        v-if="isShowNotificationExpireSubscription"
        class="notification-expire-subscription"
      >
        <component
          :is="isComponent"
          @closeNotification="closeNotificationExpireSubscription"
        ></component>
      </div>
      <notify-page-expired-token
        v-if="isShowNotificationExpireToken"
        :count="countPageExpiredToken"
        :style="
          !isShowNotificationExpireSubscription ? { marginBottom: 0 } : {}
        "
        @closeNotification="closeNotificationExpireToken"
      />
    </div>
  </transition>
</template>

<script>
import WillExpireSoon from './WillExpireSoon'
import ExpiresSoon from './ExpiresSoon'

export default {
  name: 'NotificationExpire',
  components: {
    'will-expire-soon': WillExpireSoon,
    'expires-soon': ExpiresSoon,
  },
  data() {
    return {
      isComponent: '',
      isShowNotificationExpireSubscription: false,
      isShowNotificationExpireToken: false,
      socialChannels: [],
    }
  },
  async fetch() {
    await this.fetchSocialChannels()
  },
  computed: {
    isOwner() {
      return (
        this.$auth.user.roles?.length && this.$auth.user.roles[0] === 'owner'
      )
    },
    countPageExpiredToken() {
      return this.socialChannels.filter((channel) => channel.token_status !== 1)
        .length
    },
  },
  watch: {
    countPageExpiredToken() {
      this.handleShowNotifyExpireToken()
    },
  },
  created() {
    this.handleShowNotifyExpireSubscription()
  },
  methods: {
    async fetchSocialChannels() {
      try {
        const params = {
          sort: 'name',
          paginate: false,
        }
        const { data } = await this.$api.socialChannel.getSocialChannelsByUser(
          params
        )
        if (data) {
          this.socialChannels = Object.freeze(data)
        }
      } catch (e) {}
    },
    handleShowNotifyExpireToken() {
      const closeNotifyToken = this.$auth.$storage.getCookie(
        'closeNotifyExpiredToken'
      )
      this.isShowNotificationExpireToken = this.countPageExpiredToken > 0
      if (closeNotifyToken?.id === this.$auth.user.id) {
        this.isShowNotificationExpireToken = false
      }
    },
    closeNotificationExpireToken() {
      this.isShowNotificationExpireToken = false
      this.$auth.$storage.setCookie(
        'closeNotifyExpiredToken',
        { id: this.$auth.user.id },
        {
          path: '/',
          maxAge: 60 * 60 * 24,
        }
      )
    },
    handleShowNotifyExpireSubscription() {
      const closeNotifySubscription = this.$auth.$storage.getCookie(
        'closeNotifyExpiredSubscription'
      )
      this.isShowNotificationExpireSubscription =
        this.$auth.user.is_nearly_expired
      if (closeNotifySubscription?.id === this.$auth.user.id) {
        this.isShowNotificationExpireSubscription = false
      }
      if (this.isShowNotificationExpireSubscription) {
        this.isComponent = this.isOwner ? 'will-expire-soon' : 'expires-soon'
      }
    },
    closeNotificationExpireSubscription() {
      this.isShowNotificationExpireSubscription = false
      this.$auth.$storage.setCookie(
        'closeNotifyExpiredSubscription',
        { id: this.$auth.user.id },
        {
          path: '/',
          maxAge: 60,
        }
      )
    },
  },
}
</script>

<style lang="less" scoped>
.notification-expire-subscription {
  position: fixed;
  bottom: 2.125rem;
  right: 2.125rem;
  width: 65rem;
  height: 40rem;
  background-color: @white;
  box-shadow: 0 4px 30px rgba(13, 41, 141, 0.1);
  border-radius: 8px;
  z-index: 100;
}
.notification-expire-token {
  position: fixed;
  bottom: 2.125rem;
  right: 2.125rem;
  width: 65rem;
  background-color: @white;
  box-shadow: 0 4px 30px rgba(13, 41, 141, 0.1);
  border-radius: 8px;
  z-index: 99999;
  margin-bottom: 42rem;
  @apply flex items-center;
}
</style>
