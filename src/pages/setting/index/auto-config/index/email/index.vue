<template>
  <a-drawer
    :visible="true"
    :closable="false"
    width="80vw"
    class="drawer-email-template-page"
    @close="handleCloseDrawer"
  >
    <span class="drawer-email-template-page__close" @click="handleCloseDrawer">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div class="drawer-email-template-page__content">
      <div class="email-template-page-drawer">
        <div class="email-template-page-drawer__tabs">
          <a-tabs v-model="activeTab" tab-position="left">
            <a-tab-pane
              v-for="tab in tabs"
              :key="tab.key"
              :tab="tab.title"
              :disabled="tab.disable"
            >
            </a-tab-pane>
          </a-tabs>
        </div>
        <div class="email-template-page-drawer__content">
          <nuxt-child></nuxt-child>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
export default {
  name: 'EmailTemplatePage',
  data() {
    return {
      activeTab: null,
    }
  },
  computed: {
    tabs() {
      return [
        {
          key: 'order-confirmation',
          icon: 'far fa-user-circle',
          title: this.$t('order-confirmation'),
          disable: false,
        },
        {
          key: 'canceled-order',
          icon: 'far fa-user-circle',
          title: this.$t('canceled-order'),
          disable: false,
        },
        {
          key: 'delivered-order',
          icon: 'far fa-user-circle',
          title: this.$t('delivered-order'),
          disable: false,
        },
        {
          key: 'failed-order',
          icon: 'far fa-user-circle',
          title: this.$t('failed-order'),
          disable: false,
        },
      ]
    },
  },
  watch: {
    activeTab() {
      this.$router.push(
        this.localePath({
          path: `/setting/auto-config/email/${this.activeTab}`,
        })
      )
    },
  },
  created() {
    const tabs = this.tabs.filter((tab) => {
      return this.$route.path.includes(tab.key)
    })
    const activeTab = tabs.length ? tabs[tabs.length - 1] : this.tabs[0]
    this.activeTab = activeTab.key
  },
  methods: {
    handleOpenTab(tab) {
      if (!tab.disable) {
        this.activeTab = tab.key
      }
    },
    handleCloseDrawer() {
      this.$router.push(
        this.localePath({
          path: '/setting/auto-config',
        })
      )
    },
  },
}
</script>

<style lang="less" scoped>
.drawer-email-template-page {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    cursor: pointer;
    z-index: 10;

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
    }
  }
}

.email-template-page-drawer {
  height: 100%;
  @apply flex overflow-auto;
  &__tabs {
    border-right: 1px solid @secondary-3;
    padding: 36px 0;
    /deep/.ant-tabs {
      .ant-tabs-left-bar {
        .ant-tabs-nav-container {
          .ant-tabs-tab {
            width: 25rem;
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
            width: 3px;
            left: 0;
            top: 10px !important;
            height: 34px !important;
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
    padding: 2rem 1rem 1rem;
    @apply overflow-auto;
  }
}
</style>
