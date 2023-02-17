/*eslint-disable*/
const vue_fb = {}
const fb = {}
vue_fb.install = function install(Vue, options) {
  ;(function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0]
    if (d.getElementById(id)) {
      return
    }
    js = d.createElement(s)
    js.id = id
    js.src = '//connect.facebook.net/en_US/sdk.js'
    fjs.parentNode.insertBefore(js, fjs)
  })(document, 'script', 'facebook-jssdk')

  window.fbAsyncInit = function onSDKInit() {
    FB.init(options)
    FB.AppEvents.logPageView()
    Vue.FB = FB
    window.dispatchEvent(new Event('fb-sdk-ready'))
    vue_fb.sdk = FB // do not forget this line
  }
  Vue.FB = undefined
}

import Vue from 'vue'

Vue.use(vue_fb, {
  appId: '293621547730764',
  xfbml: true,
  version: 'v8.0',
})

export default ({ app }, inject) => {
  inject('fb', vue_fb)
}
