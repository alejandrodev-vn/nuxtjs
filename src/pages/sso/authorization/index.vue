<template>
  <div class="redirect">
    <div class="redirect-container">
      <div class="logo-loading">
        <img
          :src="require('~/assets/images/Logo/Logo-Prime-CRM-Redirect.png')"
          alt="Social CRM"
          class="image"
        />
        <div class="logo-loading__loader"></div>
        <div class="logo-loading__text">{{ $t('redirecting') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  auth: false,
  layout: 'callback',
  computed: {
    urlCallback() {
      return process.env.DOMAIN_SSO || ''
    },
    accessToken() {
      // eslint-disable-next-line camelcase
      const { access_token = '' } = this.$route.query
      const bearer = access_token.split(' ')
      return bearer[bearer.length - 1]
    },
    noToken() {
      return this.accessToken.length === 0
    },
  },
  mounted() {
    if (this.noToken) {
      window.location.href = this.urlCallback
      return
    }
    this.$auth
      .setUserToken(this.accessToken)
      .then(() => {
        this.$router.push(this.localePath({ path: '/' }))
      })
      .catch((e) => {
        window.location.href = this.urlCallback
      })
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
