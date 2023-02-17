<template>
  <app-auth-container>
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
        <div class="auth-form__title">{{ $t('reset-password') }}</div>
        <div class="auth-form__form-model">
          <a-form-model ref="form" :model="form" :rules="rules" :colon="false">
            <a-form-model-item
              ref="password"
              :label="$t('new-password')"
              prop="password"
            >
              <a-input-password
                v-model="form.password"
                :placeholder="$t('password')"
              ></a-input-password>
            </a-form-model-item>
            <a-form-model-item
              ref="password_confirmation"
              :label="$t('repeat-password')"
              prop="password_confirmation"
            >
              <a-input-password
                v-model="form.password_confirmation"
                :placeholder="$t('password')"
              ></a-input-password>
            </a-form-model-item>
            <a-form-model-item>
              <a-button
                type="primary"
                block
                :disabled="loading"
                @click="handleConfirm"
              >
                <a-icon v-if="loading" type="loading" />
                {{ $t('confirm') }}
              </a-button>
            </a-form-model-item>
          </a-form-model>
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
    </template>
  </app-auth-container>
</template>

<script>
import { get } from 'lodash'
import Vue from 'vue'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'ResetPasswordPage',
  layout: 'fullscreen',
  auth: 'guest',
  data() {
    const checkNewPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('field-is-required')))
      } else if (value.length < 6 || value.length > 50) {
        callback(new Error(this.$t('password-min-max-length-required')))
      } else if (value !== this.form.password) {
        callback(new Error(this.$t('new-password-does-not-match')))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      form: {
        password: '',
        password_confirmation: '',
      },
      rules: {
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
        password_confirmation: [
          { validator: checkNewPassword, trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    currentLocale() {
      const current = this.$i18n.locales.find(
        (locale) => locale.code === this.$i18n.locale
      )
      this.$axios.setHeader('X-localization', current.code)
      return current
    },
    token() {
      return get(this.$route, 'query.token', '')
    },
    email() {
      return get(this.$route, 'query.email', '')
    },
  },
  methods: {
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleSubmit()
        }
      })
    },
    async handleSubmit() {
      this.loading = true
      const payload = {
        password: this.form.password,
        password_confirmation: this.form.password_confirmation,
        token: this.token,
        email: this.email,
      }
      try {
        await this.$axios.post('reset-password', payload)

        this.$router.push(
          this.localePath({
            path: '/auth/reset-password-success',
          })
        )
      } catch (err) {
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
  background-color: white;
  background-image: url('~/assets/images/Auth/Auth-Reset-Password.png');
  @apply bg-center bg-no-repeat bg-contain;
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
    margin-bottom: 5rem;

    @apply text-center;
    .desktop({
      height: 70px;
      margin: 3rem 0 2rem;
      margin-bottom: 13.5rem;

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

  &__form-model {
    margin-bottom: 4rem;
  }
}

.select-languages-button {
  width: 100%;
  border-radius: @border-radius-base;
  border-color: @secondary-2;
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
