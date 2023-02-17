<template>
  <div class="account-page">
    <div class="account-page__header account-page-header">
      <div class="account-page-header__title">{{ $t('my-account') }}</div>
      <div class="account-page-header__tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ 'tab--active': activeTab === tab.key }"
          @click="handleClickTab(tab)"
        >
          <i :class="`${tab.icon} tab__icon`"></i>
          <div v-if="tab.title" class="tab__text">{{ tab.title }}</div>
        </div>
      </div>
    </div>
    <div class="account-page__content">
      <nuxt-child></nuxt-child>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'SettingAccountPage',
  data() {
    return {
      activeTab: null,
    }
  },
  computed: {
    tabs() {
      return [
        {
          key: 'edit',
          icon: 'fas fa-pen',
          title: '',
          endPoint: '',
        },
        {
          key: 'password',
          icon: 'fas fa-key',
          title: this.$t('change-password'),
          endPoint: 'change-password',
        },
      ]
    },
  },
  watch: {
    $route() {
      this.handleGetActiveTab()
    },
    activeTab() {
      if (this.activeTab) {
        this.$router.push(
          this.localePath({
            path: `/setting/account/${this.activeTab}`,
          })
        )
      } else {
        this.isShowDrawer = false
        this.$router.push(
          this.localePath({
            path: '/setting/account',
          })
        )
      }
    },
  },
  created() {
    this.handleGetActiveTab()
  },
  methods: {
    handleGetActiveTab() {
      const tabs = this.tabs.filter((tab) => {
        return this.$route.path.includes(tab.key)
      })
      const activeTab = tabs.length ? tabs[tabs.length - 1] : null
      this.activeTab = get(activeTab, 'key', null) || null
    },
    handleClickTab(tab) {
      const user = this.$auth.user
      const role = get(user, 'roles[0]', '') || ''
      if (role === 'owner') {
        window.open(
          `${process.env.DOMAIN_SSO}profile/${tab.endPoint}`,
          '_blank'
        )
      } else {
        this.activeTab = tab.key
      }
    },
  },
}
</script>

<style lang="less" scoped>
.account-page {
  height: 100%;
  padding: @padding-40 @padding-24;

  @apply flex flex-col;

  &__content {
    flex: 1;
    margin-top: 2rem;
    @apply relative;
  }
}

.account-page-header {
  padding: 2rem 1rem 0;
  @apply flex;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }

  &__tabs {
    margin-left: 1rem;
    @apply flex;
  }
}

.tab {
  background-color: @white;
  border: 1px solid @secondary-2;
  border-radius: @border-radius-base;
  color: @black;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  @apply flex items-center font-medium cursor-pointer;

  &--active {
    background-color: @primary-3;
    border-color: @primary;
    color: @primary;
  }

  &__text {
    margin-left: 0.5rem;
  }
}
</style>
