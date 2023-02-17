<template>
  <div class="setting-page">
    <div class="setting-page__title">{{ $t('setting') }}</div>
    <div class="setting-page__content">
      <div class="setting-page-tabs">
        <div
          v-for="tab in tabs"
          v-show="!tab.isHidden"
          :key="tab.key"
          :class="{ 'tab--disable': tab.disable }"
          class="tab"
          @click="handleOpenTab(tab)"
        >
          <i :class="`${tab.icon} tab__icon`"></i>
          <div class="tab__content">
            <p class="tab__content--title">{{ tab.title }}</p>
            <p class="tab__content--sub-title">{{ tab.subTitle }}</p>
          </div>
        </div>
      </div>
    </div>

    <a-drawer
      :visible="isShowDrawer"
      :closable="false"
      width="80vw"
      class="drawer-setting-page"
      @close="handleCloseDrawer"
    >
      <span class="drawer-setting-page__close" @click="handleCloseDrawer">
        <icon-right class="btn-trigger-collapse" />
      </span>
      <div class="drawer-setting-page__content">
        <div class="setting-page-drawer">
          <div class="setting-page-drawer__tabs">
            <a-tabs v-model="activeTab" tab-position="left">
              <template v-for="tab in tabs">
                <a-tab-pane
                  v-if="!tab.isHidden"
                  :key="tab.key"
                  :tab="tab.title"
                  :disabled="tab.disable"
                >
                </a-tab-pane>
              </template>
            </a-tabs>
          </div>
          <div class="setting-page-drawer__content">
            <nuxt-child></nuxt-child>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'SettingPage',
  data() {
    return {
      isShowDrawer: false,
      activeTab: null,
      disabled: true,
    }
  },
  computed: {
    tabs() {
      const permissions =
        get(this.$store, 'state.auth.user.permissions', []) || []
      if (!permissions.includes('setting')) {
        return [
          {
            key: 'account',
            icon: 'fas fa-user-circle',
            title: this.$t('my-account'),
            subTitle: this.$t('my-account-description'),
            disable: false,
          },
        ]
      }

      return [
        {
          key: 'account',
          icon: 'far fa-user-circle',
          title: this.$t('my-account'),
          subTitle: this.$t('my-account-description'),
          disable: false,
        },
        {
          key: 'staff',
          icon: 'far fa-user-friends',
          title: this.$t('staff-management'),
          subTitle: this.$t('staff-management-description'),
          disable: false,
        },
        {
          key: 'channel',
          icon: 'far fa-code-merge',
          title: this.$t('channel-integration'),
          subTitle: this.$t('channel-integration-description'),
          disable: false,
        },
        {
          key: 'tag',
          icon: 'far fa-tag',
          title: this.$t('tagging-management'),
          subTitle: this.$t('tagging-management-description'),
          disable: false,
        },
        {
          key: 'keyword-management',
          icon: 'far fa-key',
          title: this.$t('keyword-management'),
          subTitle: this.$t('keyword-management-description'),
          disable: false,
        },
        {
          key: 'template',
          icon: 'far fa-server',
          title: this.$t('responseTemplate'),
          subTitle: this.$t('response-template-description'),
          disable: false,
        },
        {
          key: 'templates',
          icon: 'far fa-server',
          title: this.$t('responseTemplate'),
          subTitle: this.$t('response-template-description'),
          disable: true,
          isHidden: true,
        },
        {
          key: 'unsafe-keyword',
          icon: 'fas fa-hashtag',
          title: this.$t('unsafe-keyword'),
          subTitle: this.$t('unsafe-keyword-description'),
          disable: false,
        },
        {
          key: 'level',
          icon: 'far fa-trophy-alt',
          title: this.$t('guest-level'),
          subTitle: this.$t('guest-level-description'),
          disable: false,
        },
        {
          key: 'delivery',
          icon: 'far fa-truck',
          title: this.$t('delivery'),
          subTitle: this.$t('delivery-description'),
          disable: false,
          isHidden: true,
        },
        {
          key: 'auto-config',
          icon: 'far fa-file-alt',
          title: this.$t('automation-configuration'),
          subTitle: this.$t('auto-config-description'),
          disable: false,
          isHidden: true,
        },
        {
          key: 'whatsapp-order-form',
          icon: 'fab fa-whatsapp',
          title: this.$t('whatsapp-order-form'),
          subTitle: this.$t('whatsapp-order-form-description'),
          disable: false,
          isHidden: true,
        },
      ]
    },
  },
  watch: {
    activeTab() {
      if (this.activeTab) {
        this.isShowDrawer = true
        this.$router.push(
          this.localePath({
            path: `/setting/${this.activeTab}`,
            // query: {
            //   ...this.$route.query,
            // },
          })
        )
      } else {
        this.isShowDrawer = false
        this.$router.push(
          this.localePath({
            path: '/setting',
          })
        )
      }
    },
    $route() {
      const tabs = this.tabs.filter((tab) => {
        return this.$route.path.includes(tab.key)
      })
      const activeTab = tabs.length ? tabs[tabs.length - 1] : null
      this.activeTab = get(activeTab, 'key', null) || null
    },
  },
  created() {
    const tabs = this.tabs.filter((tab) => {
      return this.$route.path.includes(tab.key)
    })
    const activeTab = tabs.length ? tabs[tabs.length - 1] : null
    this.activeTab = get(activeTab, 'key', null) || null
  },
  methods: {
    handleOpenTab(tab) {
      if (!tab.disable) {
        this.activeTab = tab.key
      }
    },
    handleCloseDrawer() {
      this.activeTab = null
    },
  },
}
</script>

<style lang="less" scoped>
.setting-page {
  padding: @padding-40 @padding-24;
  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
  &__content {
    padding-top: @margin-16;
  }
}

.setting-page-tabs {
  @apply grid grid-cols-1 gap-4;
  @media (min-width: theme('screens.sm')) {
    @apply grid-cols-2;
  }
  @media (min-width: theme('screens.lg')) {
    @apply grid-cols-3;
  }
  @media (min-width: theme('screens.2xl')) {
    @apply grid-cols-4;
  }
}

.tab {
  color: @black;
  border: 1px solid @secondary-2;
  border-radius: @border-radius-md;
  padding: 2rem;
  @apply h-full flex cursor-pointer;
  &--disable {
    @apply cursor-not-allowed;
  }
  &__icon {
    font-size: @size-20;
    margin-right: @margin-12;
    margin-top: 0.5rem;
  }
  &__content {
    /deep/p {
      margin-bottom: 0;
    }
    &--title {
      font-size: @size-16;
      @apply font-medium;
    }
    &--sub-title {
      font-size: @size-12;
      color: @secondary-1;
    }
  }
}

.drawer-setting-page {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    z-index: 10;
    cursor: pointer;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }
  &__content {
    height: 100%;
    @apply overflow-auto;
  }
  &.ant-drawer-open {
    /deep/.ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        @apply overflow-auto;
      }
      &-wrapper {
        // height: 90%;
        // top: 10%;
      }
    }
  }
}

.setting-page-drawer {
  height: 100%;
  @apply flex overflow-auto;
  &__tabs {
    border-right: 1px solid @secondary-3;
    padding: @padding-40 0;
    min-width: 25rem;
    /deep/.ant-tabs {
      .ant-tabs-bar {
        width: 100%;
      }
      .ant-tabs-left-bar {
        border-right-width: 0;

        .ant-tabs-nav-container {
          .ant-tabs-tab {
            width: 100%;
            border-radius: @border-radius-md;
            color: @black;
            padding: @padding-16;
            margin-bottom: 0;
            font-size: @size-16;
            @apply text-left;
          }
          .ant-tabs-tab-active {
            background: rgba(@primary, 0.1);
            color: @primary;
          }
          .ant-tabs-ink-bar {
            width: 0.3rem;
            height: 3.4rem !important;
            left: 0;
            margin-top: 1rem;
            border-top-right-radius: @border-radius-md;
            border-bottom-right-radius: @border-radius-md;
          }
        }
      }
      .ant-tabs-left-content {
        @apply hidden;
      }
    }
  }
  &__content {
    flex: 1;
    @apply overflow-auto;
  }
}
</style>
