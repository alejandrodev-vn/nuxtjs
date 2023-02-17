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
        <div class="auth-form__title">{{ $t('forget-password') }}</div>
        <div class="auth-form__form-model">
          <a-form-model ref="form" :model="form" :rules="rules" :colon="false">
            <a-form-model-item ref="email" :label="$t('email')" prop="email">
              <a-input
                v-model="form.email"
                :placeholder="$t('email')"
              ></a-input>
            </a-form-model-item>
            <a-form-model-item class="text-right">
              <a-button type="link" @click="handleBack">
                {{ $t('back') }}
              </a-button>
              <a-button
                type="primary"
                :disabled="loading"
                @click="handleConfirm"
              >
                <a-icon v-if="loading" type="loading" />
                {{ $t('confirm') }}
              </a-button>
            </a-form-model-item>
          </a-form-model>
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
    </template>
  </app-auth-container>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'ForgetPasswordPage',
  layout: 'fullscreen',
  auth: 'guest',
  data() {
    return {
      loading: false,
      form: {
        email: '',
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
            pattern: /^\w+([\.+-]?\w+)*@\w+([\.+-]?\w+)*(\.\w{2,9})+$/,
            // pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: this.$t('email-format-required'),
            trigger: 'blur',
          },
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
  },
  methods: {
    handleCreateAccount() {
      window.open('', '_blank')
    },
    handleBack() {
      this.$router.go(-1)
    },
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleSubmit()
        }
      })
    },
    async handleSubmit() {
      this.loading = true
      try {
        const { data } = await this.$axios.post('forgot-password', {
          email: this.form.email,
        })
        if (data) {
          this.$router.push(
            this.localePath({
              path: `/auth/forget-password-success?email=${this.form.email}`,
            })
          )
        }
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
  background-image: url('~/assets/images/Auth/Auth-Forget-Password.png');
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

  &__signup {
    font-size: @size-3;
    margin-bottom: 2rem;
    @apply text-right;
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
}

.select-languages-button {
  width: 100%;
  border-radius: @border-radius-base;
  border-color: @secondary-2;
  margin-top: 10rem;
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
