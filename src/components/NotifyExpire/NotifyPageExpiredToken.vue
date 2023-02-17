<template>
  <div class="notification-expire-token">
    <button
      class="notification-expire-token-inner__close"
      @click="handleCloseNotify"
    >
      <i class="far fa-times" />
    </button>
    <div class="notification-expire-token-inner-left">
      <img
        class="notification-expire-token-inner-left__img"
        src="~assets/images/expired-token.png"
        alt="Will Expire Soon"
      />
    </div>
    <div class="notification-expire-token-inner-right">
      <h3 class="notification-expire-token-inner-right__title">
        {{ countChannelAccount }}
      </h3>
      <h2
        class="notification-expire-token-inner-right__title notification-expire-token-inner-right__title--blue"
      >
        {{ content }}
      </h2>
      <div class="notification-expire-token-inner-right__group-button">
        <nuxt-link
          v-if="canProceed"
          class="notification-expire-token-inner-right__upgrade"
          :to="localePath({ path: '/setting/channel' })"
        >
          {{ $t('proceed-now') }}
        </nuxt-link>
        <button
          class="notification-expire-token-inner-right__later"
          @click="handleCloseNotify"
        >
          {{ $t('remind-me-later') }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'NotifyPageExpiredToken',
  props: {
    count: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    canProceed() {
      return this.$auth.user?.permissions?.includes('setting')
    },
    countChannelAccount() {
      return `${this.count} ${
        this.count < 2
          ? this.$t('channel-account').toLowerCase()
          : this.$t('channel-accounts').toLowerCase()
      }: `
    },
    content() {
      return this.count < 2
        ? this.$t('token-has-expired')
        : this.$t('tokens-have-expired')
    },
  },
  methods: {
    handleCloseNotify() {
      this.$emit('closeNotification')
    },
  },
}
</script>
<style lang="less" scoped>
.notification-expire-token {
  &-inner {
    padding: 1rem;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    &__close {
      position: absolute;
      top: 15px;
      right: 15px;
      background-color: transparent;
      border-color: transparent;
      padding: 0;
      font-size: @size-20;
      color: @gray-2;
      line-height: 1;
      &:hover {
        opacity: 0.8;
      }
    }
    &-left {
      flex: 1;
      margin-right: 4%;
      &__img {
        width: 100%;
        object-fit: contain;
      }
    }
    &-right {
      min-width: 54%;
      height: auto;
      padding-right: 1rem;
      &__title {
        font-weight: 500;
        font-size: @size-20;
        line-height: calc(27 / 20);
        color: @gray-3;
        margin-bottom: 0;
        &--blue {
          font-weight: 700;
          font-size: 33px;
          line-height: @height-table;
          color: @primary;
          margin-bottom: 1rem;
        }
      }
      &__content {
        color: @black;
        margin-bottom: 15px;
        line-height: 20px;
        padding: 0 1rem;
      }
      &__group-button {
        margin-top: 10px;
        @apply flex items-center;
      }
      &__upgrade {
        display: block;
        font-weight: 600;
        font-size: @size-16;
        line-height: @size-24;
        color: @white;
        background: @primary;
        border-radius: 4px;
        padding: 0.5rem 1.5rem;
        width: fit-content;
        margin-right: @margin-24;

        &:hover {
          color: @white !important;
        }
      }
      &__later {
        border: none;
        outline: none;
        background: none;
        font-weight: normal;
        font-size: @size-14;
        line-height: @size-24;
        text-decoration: underline;
        color: @primary;
        &:hover,
        &:focus {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
