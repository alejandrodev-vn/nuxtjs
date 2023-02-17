<template>
  <div class="layout-sidebar" :class="{ collapsed }">
    <a-layout-sider v-model="collapsed" collapsible width="24rem">
      <div class="layout-sidebar__content">
        <a-menu
          mode="inline"
          :default-selected-keys="activeMenu"
          :default-open-keys="!collapsed ? activeParrentMenu : []"
          @select="handleSelectMenu"
        >
          <template v-for="menu in menus">
            <template v-if="!menu.children">
              <a-menu-item :key="menu.key">
                <nuxt-link
                  :to="
                    localePath({
                      path: menu.route,
                      ...($route.name.includes(menu.key) && {
                        query: { ...$route.query },
                      }),
                    })
                  "
                >
                  <a-icon :type="menu.icon" />
                  <span>{{ $t(menu.name) }}</span>
                </nuxt-link>
              </a-menu-item>
            </template>
            <template v-else>
              <a-sub-menu :key="menu.key">
                <span slot="title">
                  <a-icon :type="menu.icon" />
                  <span>{{ $t(menu.name) }}</span>
                </span>
                <template v-for="subMenu in menu.children">
                  <a-menu-item :key="subMenu.key">
                    <nuxt-link
                      :to="
                        localePath({
                          path: subMenu.route,
                          ...($route.name.includes(subMenu.key) && {
                            query: { ...$route.query },
                          }),
                        })
                      "
                    >
                      <span>{{ $t(subMenu.name) }}</span>
                    </nuxt-link>
                  </a-menu-item>
                </template>
              </a-sub-menu>
            </template>
          </template>
        </a-menu>
        <a-menu mode="inline">
          <a-dropdown placement="topLeft" :trigger="['click']">
            <a-menu slot="overlay">
              <a-menu-item v-for="locale in $i18n.locales" :key="locale.code">
                <nuxt-link
                  :to="switchLocalePath(locale.code)"
                  class="select-languages-option"
                  :class="{ collapsed }"
                >
                  <country-flag
                    :country="locale.flag"
                    size="normal"
                    class="select-languages-option__flag"
                    rounded
                  ></country-flag>
                  <span v-if="!collapsed" class="select-languages-option__name">
                    {{ locale.name }}
                  </span>
                </nuxt-link>
              </a-menu-item>
            </a-menu>
            <a-button class="select-languages-button" :class="{ collapsed }">
              <country-flag
                :country="currentLocale.flag"
                size="normal"
                rounded
                class="select-languages-button__flag"
              ></country-flag>
              <span v-if="!collapsed" class="select-languages-button__name">
                {{ currentLocale.name }}
              </span>
              <a-icon
                v-if="!collapsed"
                type="down"
                class="select-languages-button__icon"
              />
            </a-button>
          </a-dropdown>
          <a-menu-item key="logout" @click="handleLogout">
            <a-icon type="logout" />
            <span>
              {{ $t('logout') }}
            </span>
          </a-menu-item>
        </a-menu>
      </div>
      <template slot="trigger">
        <icon-right class="btn-trigger-collapse" :class="{ collapsed }" />
      </template>
    </a-layout-sider>
  </div>
</template>

<script>
import { get } from 'lodash'

const menuHome = {
  key: 'home',
  name: 'home',
  icon: 'home',
  route: '/',
}

export default {
  name: 'LayoutSidebar',
  data() {
    return {
      activeMenu: [menuHome.key],
      activeParrentMenu: [],
      collapsed: this.$store.state.sidebarCollapsed,
      menus: [menuHome],
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
  watch: {
    collapsed() {
      this.$store.dispatch('updateSidebarCollapsed', this.collapsed)
      this.$auth.$storage.setCookie('isCloseSidebar', this.collapsed, {
        path: '/',
      })
    },
    $route() {
      this.handleActiveMenu()
    },
  },
  created() {
    this.collapsed = !!this.$auth.$storage.getCookie('isCloseSidebar')
    if (!this.collapsed) {
      // console.log(1)
      // const parrentMenu = openKeys.length
      //     ? [openKeys[openKeys.length - 1]]
      //     : []
      //   this.activeParrentMenu = parrentMenu
    }
    const permissions =
      get(this.$store, 'state.auth.user.permissions', []) || []
    if (permissions.includes('analytics')) {
      this.menus = [
        ...this.menus,
        {
          key: 'analytics',
          name: 'analytics',
          icon: 'bar-chart',
          route: '/analytics',
        },
      ]
    }
    if (permissions.includes('conversation')) {
      this.menus = [
        ...this.menus,
        {
          key: 'conversations',
          name: 'conversation',
          icon: 'profile',
          children: [
            {
              key: 'chat-comment',
              name: 'chat-comment',
              route: '/conversations/chat-comment',
            },
            {
              key: 'response-history',
              name: 'response-history',
              route: '/conversations/response-history',
            },
            {
              key: 'guest-management',
              name: 'guest-management',
              route: '/conversations/guest-management',
            },
          ],
        },
      ]
    }
    // this.menus = [
    //   ...this.menus,
    //   {
    //     key: 'search-facebook-page',
    //     name: 'search-facebook-page',
    //     icon: 'search',
    //     route: '/search-facebook-page',
    //   },
    // ]
    // if (permissions.includes('sales ops')) {
    //   this.menus = [
    //     ...this.menus,
    //     {
    //       key: 'sales-operation',
    //       name: 'sales-operation',
    //       icon: 'stock',
    //       children: [
    //         {
    //           key: 'discount',
    //           name: 'discount',
    //           route: '/sales-operation/discount',
    //         },
    //         {
    //           key: 'order',
    //           name: 'order',
    //           route: '/sales-operation/order',
    //         },
    //         {
    //           key: 'customer',
    //           name: 'customer',
    //           route: '/sales-operation/customer',
    //         },
    //       ],
    //     },
    //   ]
    // }
    this.menus = [
      ...this.menus,
      {
        key: 'setting',
        name: 'setting',
        icon: 'setting',
        route: '/setting',
      },
    ]

    this.handleActiveMenu()
  },
  methods: {
    handleActiveMenu() {
      const menus = this.menus.filter((menu) => {
        return this.$route.name?.includes(menu.key)
      })
      const activeMenu = menus.length ? menus[menus.length - 1] : menuHome

      if (activeMenu.children) {
        const subMenus = activeMenu.children.filter((subMenu) => {
          return this.$route.name?.includes(subMenu.key)
        })
        const activeSubMenu = subMenus[subMenus.length - 1]

        this.activeParrentMenu = [activeMenu.key]
        this.activeMenu = [activeSubMenu.key]
      } else {
        this.activeParrentMenu = []
        this.activeMenu = [activeMenu.key]
      }
      if (this.activeMenu.some((key) => key.includes('chat-comment'))) {
        this.collapsed = true
      }
    },
    handleLogout() {
      this.$firebase.firebase.off()
      this.$auth.logout()
    },
    handleSelectMenu({ item, selectedKeys }) {
      const parentMenu = get(item, 'parentMenu.eventKey', null) || null
      this.activeParrentMenu = parentMenu ? [parentMenu] : []
      this.activeMenu = selectedKeys
    },
  },
}
</script>

<style lang="less">
.ant-menu {
  .ant-menu-item {
    &.ant-menu-item-selected {
      background-color: @primary-3;
    }
  }
}
</style>
<style scoped lang="less">
.layout-sidebar {
  top: @height-header;
  left: 0;
  width: @width-sidebar;
  height: calc(100vh - @height-header);
  background-color: @white;
  z-index: 1;
  @apply fixed;

  &.collapsed {
    width: 0;

    .ant-layout-sider {
      transform: translateX(-80px);

      /deep/.ant-layout-sider-trigger {
        right: -@width-btn-trigger !important;
      }
    }
  }

  .desktop({
    &.collapsed {
      width: @width-sidebar-collapsed;

      .ant-layout-sider {
        transform: translateX(0);

        /deep/.ant-layout-sider-trigger {
          right: -2rem !important;
        }
      }
    }
  });

  &__content {
    height: 100%;
    @apply flex flex-col justify-between;
  }

  .ant-layout-sider {
    height: 100%;
    background-color: @white;
    padding-top: 3.8rem;
    @apply relative;

    /deep/.ant-layout-sider-trigger {
      top: 0.5rem;
      right: -2rem;
      width: @width-btn-trigger !important;
      height: @width-btn-trigger;
      border-color: @gray-5;
      background-color: @white;
      @apply absolute rounded-full border flex items-center justify-center;
      .btn-trigger-collapse {
        color: @black;
        width: @size-16;
        height: @size-16;
        transform: rotate(-180deg);
        @apply duration-500 font-bold;
        &.collapsed {
          transform: rotate(0);
        }
      }
    }
    /deep/.ant-menu {
      border: none;
      .ant-menu-submenu {
        .ant-menu-submenu-title {
          height: 4.8rem;
          padding-left: 2.4rem !important;
          & > span {
            color: @black;
            font-size: @size-16;
            line-height: 4.8rem;
            @apply flex items-center;
          }
        }
        .ant-menu-item {
          padding-left: 4.8rem !important;
        }
        &.ant-menu-submenu-selected {
          .ant-menu-submenu-title {
            & > span {
              color: @primary;
            }
          }
        }
      }
      .ant-menu-item {
        height: 4.8rem;
        line-height: 4.8rem;
        padding-left: 2.4rem !important;
        @apply flex items-center;

        &.ant-menu-item-selected {
          width: 100%;
          color: @primary !important;

          &::before {
            content: '';
            top: 4px;
            left: 0;
            bottom: 4px;
            width: 3px;
            border-top-right-radius: @border-radius-md;
            border-bottom-right-radius: @border-radius-md;
            background-color: @primary;
            opacity: 1;
            @apply absolute;
          }

          &::after {
            content: none;
          }
          > span,
          a {
            color: @primary;
          }
        }

        a {
          font-size: @size-16;
          color: @black;
          @apply flex items-center;
        }
      }
      &.ant-menu-inline-collapsed > .ant-menu-item,
      &.ant-menu-inline-collapsed > .ant-menu-submenu .ant-menu-submenu-title {
        padding: 0 2.7rem !important;
        @apply justify-center;
        & > span {
          @apply justify-center;
        }
      }
      &.ant-menu-inline-collapsed > .ant-menu-item .anticon,
      &.ant-menu-inline-collapsed
        > .ant-menu-submenu
        > .ant-menu-submenu-title
        .anticon {
        font-size: @size-20;
      }
    }
  }
}

.select-languages-button {
  width: 100%;
  border-color: @white;
  box-shadow: none;
  @apply flex items-center;

  &.collapsed {
    .select-languages-button__flag {
      &.flag {
        margin: 0;
      }
    }
  }

  &__flag {
    &.flag {
      border-radius: @border-radius-base;
      margin: 0 -0.5rem;
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

  &.collapsed {
    .select-languages-option__flag {
      &.flag {
        margin: 0;
      }
    }
  }

  &__flag {
    &.flag {
      border-radius: @border-radius-base;
      margin: 0 -0.25rem;
    }
  }

  &__name {
    color: @black;
    line-height: 1;
  }
}

.ant-dropdown-menu {
  &.ant-dropdown-menu-inline-collapsed {
    max-width: @width-sidebar-collapsed;

    .ant-dropdown-menu-item {
      padding: 5px 12px !important;
    }
  }
}
</style>
