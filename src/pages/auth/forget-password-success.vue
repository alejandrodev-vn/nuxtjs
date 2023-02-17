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
        <div class="auth-form__content">
          <div
            class="auth-form__content--message"
            v-html="$t('forget-password-success-message', { email: email })"
          ></div>
          <div class="auth-form__content--resend">
            <span class="resend-text">
              {{ $t('have-not-received-an-email') }}
            </span>
            <nuxt-link
              :to="localePath({ path: '/auth/forget-password' })"
              class="resend-link"
            >
              {{ $t('resend') }}
            </nuxt-link>
          </div>
        </div>
        <div class="auth-form__back">
          <nuxt-link :to="localePath({ path: '/auth/login' })">
            <a-icon type="left" />
            {{ $t('back-to-login') }}
          </nuxt-link>
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

export default {
  name: 'ForgetPasswordSuccessPage',
  layout: 'fullscreen',
  auth: 'guest',
  computed: {
    currentLocale() {
      const current = this.$i18n.locales.find(
        (locale) => locale.code === this.$i18n.locale
      )
      this.$axios.setHeader('X-localization', current.code)
      return current
    },
    email() {
      return get(this.$route, 'query.email', '')
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

  &__content {
    font-size: @size-3;
    color: @black;

    &--message {
      margin: 2rem 0 1rem;
    }

    &--resend {
      .resend-link {
        @apply font-medium;
      }
    }
  }

  &__back {
    margin: 2rem 0 3rem;
    @apply text-right;
    .desktop({
      margin: 3rem 0 4rem;
    });

    a {
      @apply flex items-center justify-end font-semibold;

      i {
        margin-right: 0.5rem;
      }
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
