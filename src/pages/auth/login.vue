<template>
  <div class="login-page">
    <loading-page v-if="loadingLoginSuccess"></loading-page>
    <app-auth-container v-else>
      <template #auth-background>
        <div class="auth-background" />
      </template>
      <template #auth-form>
        <div class="auth-form">
          <div class="auth-form__logo">
            <img
              :src="require('~/assets/images/Logo/Logo-Prime-CRM.png')"
              alt="Prime CRM"
            />
          </div>
          <div class="auth-form__title">{{ $t('login') }}</div>
          <div class="auth-form__form-model">
            <a-form-model
              ref="form"
              data-cy="form-login"
              :model="form"
              :rules="rules"
              :colon="false"
            >
              <a-form-model-item ref="email" :label="$t('email')" prop="email">
                <a-input
                  v-model="form.email"
                  :placeholder="$t('email')"
                  data-cy="input-login-email"
                  @pressEnter="handleSubmit"
                ></a-input>
              </a-form-model-item>
              <a-form-model-item
                ref="password"
                :label="$t('password')"
                prop="password"
              >
                <a-input-password
                  v-model="form.password"
                  :placeholder="$t('password')"
                  data-cy="input-login-password"
                  @pressEnter="handleSubmit"
                ></a-input-password>
              </a-form-model-item>
              <a-form-model-item>
                <a-button
                  type="primary"
                  block
                  :disabled="loading"
                  data-cy="button-login-submit"
                  @click="handleSubmit"
                >
                  <a-icon v-if="loading" type="loading" />
                  {{ $t('login') }}
                </a-button>
              </a-form-model-item>
            </a-form-model>
          </div>
          <div class="auth-form__forgot-password">
            <nuxt-link
              :to="localePath({ path: '/auth/forget-password' })"
              class=""
            >
              {{ $t('forget-password') }}
            </nuxt-link>
          </div>
          <div v-if="false" class="auth-form__signup">
            <span class="auth-form__signup--title">
              {{ $t('not-registered-yet') }}
            </span>
            <span class="auth-form__signup--link" @click="handleCreateAccount">
              {{ $t('create-an-account') }}
            </span>
          </div>
          <div class="auth-form__languages">
            <a-dropdown :trigger="['click']">
              <a-menu slot="overlay">
                <a-menu-item v-for="locale in $i18n.locales" :key="locale.code">
                  <nuxt-link
                    :to="switchLocalePath(locale.code)"
                    class="select-languages-option"
                  >
                    <country-flag
                      :country="locale.flag"
                      size="normal"
                      class="select-languages-option__flag"
                      rounded
                    ></country-flag>
                    <span class="select-languages-option__name">
                      {{ locale.name }}
                    </span>
                  </nuxt-link>
                </a-menu-item>
              </a-menu>
              <a-button class="select-languages-button">
                <country-flag
                  :country="currentLocale.flag"
                  size="normal"
                  rounded
                  class="select-languages-button__flag"
                ></country-flag>
                <span class="select-languages-button__name">
                  {{ currentLocale.name }}
                </span>
                <a-icon type="down" class="select-languages-button__icon" />
              </a-button>
            </a-dropdown>
          </div>
        </div>

        <vue-recaptcha
          ref="recaptcha"
          class="g-recaptcha"
          size="invisible"
          :sitekey="siteKey"
          @expired="handleReCaptchaExpired"
          @verify="handleReCaptchaVerified"
        />
      </template>
    </app-auth-container>
  </div>
</template>

<script>
import { get } from 'lodash'
import VueRecaptcha from 'vue-recaptcha'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'LoginPage',
  components: {
    VueRecaptcha,
  },
  layout: 'fullscreen',
  auth: 'guest',
  asyncData(context) {
    const { isDev } = context
    return { isDev }
  },
  data() {
    return {
      loadingLoginSuccess: false,
      loading: false,
      recaptchaToken: '',
      form: {
        email: '',
        password: '',
      },
      rules: {
        email: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            // eslint-disable-next-line no-useless-escape
            pattern: /^[a-z0-9.]{4,30}@[a-z0-9-]+\.[a-z0-9-.]{2,}$/,
            // pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: this.$t('email-format-required'),
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: this.$t('field-is-required'),
            trigger: 'blur',
          },
          {
            min: 6,
            max: 50,
            message: this.$t('password-min-max-length-required'),
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    siteKey() {
      return process.env.SITE_KEY
    },
    currentLocale() {
      const current = this.$i18n.locales.find(
        (locale) => locale.code === this.$i18n.locale
      )
      this.$axios.setHeader('X-localization', current.code)
      return current
    },
  },
  methods: {
    handleCreateAccount() {
      window.open(`${process.env.DOMAIN_SSO}auth/register`, '_blank')
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return false
        if (this.isDev) {
          this.handleLoginWith()
        } else {
          this.handleExecuteRecaptcha()
        }
      })
    },
    handleExecuteRecaptcha() {
      return process.browser && this.$refs.recaptcha?.execute()
    },
    handleResetRecaptcha() {
      return process.browser && this.$refs.recaptcha?.reset()
    },
    handleReCaptchaExpired() {
      process.browser && this.$refs.recaptcha?.reset()
    },
    async handleReCaptchaVerified(recaptchaToken) {
      this.recaptchaToken = recaptchaToken
      await this.handleLoginWith()
      this.handleResetRecaptcha()
    },
    async handleLoginWith() {
      this.loading = true
      const data = {
        username: this.form.email,
        password: this.form.password,
        g_recaptcha_response: this.recaptchaToken,
      }
      try {
        await this.$auth.loginWith('local', { data })
        this.loadingLoginSuccess = true
        setTimeout(async () => {
          // await this.$store.dispatch('fetchCommon')
          // await this.$store.dispatch('fetchStore')
          await this.$router.push(this.localePath({ path: '/' }))
        }, 1000)
      } catch (err) {
        this.error = get(err, 'response.data', {})
        notification.error({
          message: `${err.response.data.message}`,
          class: 'notification-error',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped lang="less">
.auth-background {
  min-height: 100vh;
  height: 100%;
  background-color: @white;
  background-image: url('~/assets/images/Auth/Auth-Login.jpg');
  @apply bg-center bg-no-repeat bg-cover;
}

.auth-form {
  .desktop({
    padding: 0 3rem;
  });
  .widescreen({
    padding: 0 6rem;
  });

  &__logo {
    height: 50px;
    margin: 1rem 0;
    @apply text-center;
    .desktop({
      height: 70px;
      margin: 3rem 0 2rem;
    });

    img {
      width: auto;
      height: 100%;
      margin: 0 auto;
    }
  }

  &__title {
    font-size: @size-1;
    color: @black;
    margin-bottom: 1rem;
    @apply text-center font-bold;
  }

  &__forgot-password {
    margin-bottom: 7rem;
    @apply text-center;

    a {
      color: @black;
      font-size: @size-3;
      @apply font-medium underline;
    }
  }

  &__signup {
    font-size: @size-3;
    margin-bottom: 2rem;
    @apply text-center;
    .desktop({
      margin-bottom: 2.5rem;
    });

    &--title {
      color: @secondary-1;
      margin-right: 0.5rem;
    }

    &--link {
      color: @primary;
      @apply inline-block font-medium cursor-pointer;
    }
  }

  &__footer {
    margin-top: 2rem;
    @apply text-center;

    &--logo {
      width: 10rem;
      margin: 0 auto;
    }

    &--content {
      font-size: @size-4;
    }
  }
}

.select-languages-button {
  width: 100%;
  border-radius: @border-radius-base;
  border-color: @secondary-2;
  height: @height-field;
  @apply flex items-center;

  &__flag {
    &.flag {
      border-radius: @border-radius-base;
      margin: 0 -0.25rem 0 -1rem;
    }
  }

  &__name {
    color: @black;
    line-height: 1;
    @apply font-normal;
  }

  &__icon {
    &.anticon {
      color: @black;
      margin-left: auto;
    }
  }
}

.select-languages-option {
  @apply flex items-center;

  &__flag {
    &.flag {
      border-radius: @border-radius-base;
      margin: 0 -0.25rem 0 -0.75rem;
    }
  }

  &__name {
    color: @black;
    line-height: 1;
  }
}
</style>
