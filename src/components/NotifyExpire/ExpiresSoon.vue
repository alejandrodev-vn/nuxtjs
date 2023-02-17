<template>
  <div class="notification-expire-inner">
    <button
      class="notification-expire-inner__close"
      @click="handleCloseNotification"
    >
      <i class="far fa-times" />
    </button>
    <div class="notification-expire-inner-left">
      <img
        class="notification-expire-inner-left__img"
        src="~assets/images/has-expired.png"
        alt="Expires Soon"
      />
    </div>
    <div class="notification-expire-inner-right">
      <h3 class="notification-expire-inner-right__title">
        {{ $t('your-subscription-plan') }}
      </h3>
      <h2
        class="notification-expire-inner-right__title notification-expire-inner-right__title--blue"
      >
        {{ $t('expires-soon') }}
      </h2>
      <p class="notification-expire-inner-right__content">
        {{ $t('will-expire-desc') }}
      </p>

      <div class="notification-expire-inner-right__group-button">
        <button
          class="notification-expire-inner-right__later"
          @click="handleCloseNotification"
        >
          {{ $t('remind-me-later') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpiresSoon',
  methods: {
    handleClickUpgradeNow() {
      const role = this.$auth.user?.roles[0]
      if (role === 'owner') {
        window.open(`${process.env.DOMAIN_SSO}billing/plans`, '_blank')
      }
    },
    handleCloseNotification() {
      this.$emit('closeNotification')
    },
  },
}
</script>

<style lang="less" scoped>
.notification-expire {
  z-index: 1;
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
      width: 48%;
      margin-right: 2%;
      &__img {
        width: 100%;
        object-fit: contain;
      }
    }
    &-right {
      width: 48%;
      height: auto;
      text-align: center;
      &__title {
        font-weight: 500;
        font-size: 24px;
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
        padding: 0 1rem;
      }
      &__upgrade {
        display: block;
        font-weight: 600;
        font-size: @size-16;
        line-height: @size-24;
        color: @white;
        background: @primary;
        border-radius: 4px;
        @apply mx-auto;
        &:hover {
          color: @white !important;
        }
      }
      &__later {
        margin-top: 10px;
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
