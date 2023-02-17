<template>
  <div class="redirect">
    <div class="redirect-container">
      <div class="logo-loading">
        <img
          :src="require('~/assets/images/Logo/Logo-Prime-CRM-Redirect.png')"
          alt="Prime CRM"
          class="image"
        />
        <div class="logo-loading__loader"></div>
        <div class="logo-loading__text">{{ $t('redirecting') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  layout: 'callback',
  auth: false,
  data() {
    return {
      redirectUrlKey: 'redirect_uri',
      authKey: 'auth_key',
      addChannelSuccessKey: 'add_channel_success',
      errorMessageAddChannel: 'error_message_add_channel',
    }
  },
  computed: {
    loginUrl() {
      try {
        return atob(this.$route.query.loginUrl)
      } catch (e) {
        return null
      }
    },
    redirecUrl() {
      try {
        return atob(this.$route.query.redirecUrl)
      } catch (e) {
        return null
      }
    },
    redirectAuth() {
      try {
        return atob(this.$route.query.auth)
      } catch (e) {
        return null
      }
    },
  },
  mounted() {
    if (this.redirecUrl && this.loginUrl) {
      window.localStorage.setItem(this.redirectUrlKey, this.redirecUrl)
      localStorage.setItem(this.authKey, this.redirectAuth)
      window.location.href = this.loginUrl
    } else {
      // Redirect to main website
      this.handleAfterShopeeCallBack()
    }
  },
  methods: {
    async handleAfterShopeeCallBack() {
      try {
        const code = this.$route.query.code
        const shop_id = parseInt(this.$route.query.shop_id)
        const error = this.$route.query.error

        if (code && shop_id) {
          const auth = localStorage.getItem(this.authKey)
          await this.insertChannelAccount(code, shop_id, auth)
        } else if (error) {
          this.$router.push(this.localePath({ path: '/setting/channel' }))
        }
      } catch (e) {
        this.$router.push(this.localePath({ path: '/' }))
      }
    },
    async insertChannelAccount(code, shop_id, auth) {
      const redirectUrl = localStorage.getItem(this.redirectUrlKey)
      try {
        const data = await this.$api.socialChannel.insertChannelShopee(
          code,
          shop_id,
          auth,
          'shopee'
        )
        if (data) {
          localStorage.setItem(this.addChannelSuccessKey, true)
          localStorage.removeItem(this.authKey)
          localStorage.removeItem(this.redirectUrlKey)
          if (data.length) {
            data.forEach(async (channel) => {
              await this.handleStartChannel(channel)
            })
          }
          window.location.href = redirectUrl
        }
      } catch (e) {
        localStorage.setItem(this.addChannelSuccessKey, false)
        localStorage.setItem(
          this.errorMessageAddChannel,
          getResponseErrorMessage(e)
        )
        setTimeout(() => {
          this.$router.push(this.localePath({ path: '/setting/channel' }))
        }, 1000)
      }
    },
    async handleStartChannel(channel) {
      try {
        const payload = {
          name: channel.name,
          social_id: channel.id,
          oauth_info: {
            access_token: channel.access_token,
          },
        }
        const type = 'shopee'
        await this.$api.socialChannel.startHandleShopee(payload, type)
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.redirect {
  width: 100%;
  height: 100vh;
}

.redirect-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes animateCircle {
  0% {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(1turn);
  }
}

@keyframes zoomIn {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.logo-loading {
  animation: zoomIn 1s;
  animation-fill-mode: both;
  width: 300px;
  height: 300px;
  line-height: 300px;
  background: transparent;
  text-align: center;
}

.logo-loading__loader {
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  border: 12px solid #bdc3c7;
  border-top-color: @primary;
  border-radius: 50%;
  animation: animateCircle 1.2s linear infinite;
}

.logo-loading .image {
  position: absolute;
  top: calc(50% - 2px);
  left: calc(50% - 2px);
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  width: auto;
  height: 120px;
}

.logo-loading__text {
  margin-top: -3em;
  font-size: 2em;
}
</style>
