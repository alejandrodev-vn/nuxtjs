<template>
  <div class="guest-page">
    <div class="guest-page__left" :class="{ collapsed: isCollapsed }">
      <div class="guest-conversations">
        <chat-comment-conversation-box :channels="channels" />
      </div>
      <div class="guest-sidebar">
        <div @click="handleTriggerOpenTab">
          <icon-right
            type="left"
            class="btn-trigger-collapse"
            :class="{ collapsed: isCollapsed }"
          />
        </div>
        <ul class="guest-sidebar-menu">
          <template v-for="tab in tabs">
            <li
              v-if="!tab.isHidden"
              :key="tab.key"
              class="guest-sidebar-menu__item"
              :class="{
                active: $route.path.includes(tab.name),
                disabled: tab.disable,
              }"
              @click="() => handleClickTab(tab)"
            >
              <a-tooltip
                placement="right"
                overlay-class-name="custom-tooltip-light"
              >
                <template slot="title">
                  <span>{{ tab.tooltip }}</span>
                </template>
                <a-button type="primary" class="btn-tab">
                  <i :class="`${tab.icon} btn-tab__icon`"></i>
                </a-button>
              </a-tooltip>
            </li>
          </template>
        </ul>
      </div>
    </div>
    <div class="guest-page__right" :class="{ collapsed: isCollapsed }">
      <nuxt-child></nuxt-child>
    </div>
    <app-modal
      ref="modalDeactiveChannel"
      type="primary"
      width="400px"
      hidden-header
    >
      <template #content>
        {{ $t('content-deactive-channel') }}
        <p
          v-html="$t('click-here-if-you-want-to-active-this-channel-account')"
        ></p>
      </template>
      <template slot="footer">
        <a-button
          key="confirm"
          class="btn-confirm"
          type="primary"
          @click="handleClickUnderStood"
        >
          {{ $t('understood') }}
        </a-button>
      </template>
    </app-modal>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'GuestPage',
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    pageId() {
      return this.$route.params.page
    },
    isDeactivePage() {
      return !this.$store.state.isActivePage
    },
    conversationType() {
      return this.$route.params.type
    },
    currentInfoFan() {
      return this.$store.state.currentInfoFan
    },
    guestId() {
      return this.$route.params.guest
    },
    tabs() {
      return [
        {
          key: 'information',
          name: 'information',
          tooltip: this.$t('guestInformation'),
          icon: 'far fa-user',
          route: 'information',
          disable: !this.guestId || !this.currentInfoFan,
        },
        {
          key: 'resolution-history',
          name: 'resolution-history',
          tooltip: this.$t('resolutionHistory'),
          icon: 'far fa-history',
          route: 'resolution-history',
          disable: !this.guestId || !this.currentInfoFan,
        },
        {
          key: 'make-orders',
          name: 'make-orders',
          tooltip: this.$t('makeOrder'),
          icon: 'far fa-shopping-cart',
          route: 'make-orders',
          disable: !this.guestId || !this.currentInfoFan,
          isHidden: true,
        },
        {
          key: 'search-orders',
          name: 'search-orders',
          tooltip: this.$t('searchOrder'),
          icon: 'far fa-clipboard-list',
          route: 'search-orders',
          disable: !this.guestId || !this.currentInfoFan,
          isHidden: true,
        },
        {
          key: 'search-customer',
          name: 'search-customer',
          tooltip: this.$t('searchCustomer'),
          icon: 'far fa-users',
          route: 'search-customer',
          disable: !this.guestId || !this.currentInfoFan,
          isHidden: true,
        },
        {
          key: 'discount',
          name: 'discount',
          tooltip: this.$t('searchDiscount'),
          icon: 'far fa-badge-percent',
          route: 'discount',
          disable: !this.guestId || !this.currentInfoFan,
          isHidden: true,
        },
        {
          key: 'tags',
          name: 'tags',
          tooltip: this.$t('tags'),
          icon: 'far fa-tag',
          route: 'tags',
          disable: !this.guestId || !this.currentInfoFan,
          isHidden: true,
        },
        {
          key: 'response-template',
          name: 'response-template',
          tooltip: this.$t('responseTemplate'),
          icon: 'far fa-server',
          route: 'response-template',
          disable: !this.guestId || !this.currentInfoFan,
        },
        {
          key: 'note',
          name: 'note',
          tooltip: this.$t('note'),
          icon: 'far fa-file-alt',
          route: 'note',
          disable: !this.guestId || !this.currentInfoFan,
        },
      ]
    },
    isCollapsed() {
      const arr = this.tabs.map((item) => {
        return this.$route.path.includes(item.key)
      })
      this.$store.dispatch('updateConversationCollapsed', arr.includes(true))
      return arr.includes(true)
    },
  },
  watch: {
    pageId: {
      immediate: true,
      handler() {
        if (this.isDeactivePage) {
          this.$nextTick(() => {
            this.$refs.modalDeactiveChannel.show()
          })
          return
        }
        this.$nextTick(() => {
          this.$refs.modalDeactiveChannel.hide()
        })
      },
    },
  },
  methods: {
    handleClickUnderStood() {
      this.$refs.modalDeactiveChannel.hide()
    },
    handleTriggerOpenTab() {
      if (!this.guestId || !this.currentInfoFan) return
      if (this.isCollapsed) {
        const path = `/conversations/chat-comment/${this.pageId}/${this.conversationType}/${this.guestId}`
        this.handleChangeRoute(path)
      } else {
        const primaryTab = get(this.tabs, '0.key', '') || ''
        const path = `/conversations/chat-comment/${this.pageId}/${this.conversationType}/${this.guestId}/${primaryTab}`
        this.handleChangeRoute(path)
      }
    },
    handleClickTab(tab) {
      if (tab.disable) return
      const path = `/conversations/chat-comment/${this.pageId}/${this.conversationType}/${this.guestId}/${tab.key}`
      this.handleChangeRoute(path)
    },
    handleChangeRoute(route) {
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: route,
          query,
        })
      )
    },
  },
}
</script>

<style lang="less" scoped>
.guest-page {
  width: 100%;
  @apply flex;

  &__left {
    -webkit-transition: width 0.5s ease-in-out;
    -moz-transition: width 0.5s ease-in-out;
    -o-transition: width 0.5s ease-in-out;
    transition: width 0.5s ease-in-out;
    @apply flex flex-1;

    &.collapsed {
      border-color: @gray-4;
      -webkit-transition: width 0.5s ease-in-out;
      -moz-transition: width 0.5s ease-in-out;
      -o-transition: width 0.5s ease-in-out;
      transition: width 0.5s ease-in-out;
      @apply border-r flex-1;
    }
  }

  &__right {
    -webkit-transition: width 0.5s ease-in-out;
    -moz-transition: width 0.5s ease-in-out;
    -o-transition: width 0.5s ease-in-out;
    transition: width 0.5s ease-in-out;
    width: 0%;

    &.collapsed {
      width: 43%;
      -webkit-transition: width 0.5s ease-in-out;
      -moz-transition: width 0.5s ease-in-out;
      -o-transition: width 0.5s ease-in-out;
      transition: width 0.5s ease-in-out;
    }
  }
}

.guest-conversations {
  border-color: @gray-4;
  @apply flex-1 border-r;
}

.guest-sidebar {
  width: 6.2rem;
  @apply relative flex-shrink-0;
}

.guest-sidebar-menu {
  margin-top: 5rem;
  @apply text-center;

  &__item {
    .btn-tab {
      background-color: @gray-6;
      color: @black;
      width: @width-btn-trigger;
      height: @width-btn-trigger;
      margin: 0 auto 1rem;
      font-size: @size-14;
      @apply flex items-center justify-center border-0 rounded-xl p-0;

      &__icon {
        line-height: 1;
      }
    }

    &.active {
      .btn-tab {
        background-color: @primary-3;
        color: @primary;
      }
    }

    &.disabled {
      .btn-tab {
        cursor: not-allowed;
        background-color: @gray-6;
        color: @gray-4;
      }
    }
  }
}

.btn-trigger-collapse {
  top: 0;
  left: -1rem;
  width: @width-btn-trigger;
  height: @width-btn-trigger;
  border: 1px solid @secondary-2;
  border-radius: 50%;
  background-color: @white;
  font-size: 1.125rem;
  padding: @padding-8;
  transform: rotate(-180deg) translateX(1rem);
  @apply absolute z-10 cursor-pointer flex items-center justify-center duration-300;

  &.collapsed {
    transform: rotate(0) translateX(-1rem);
  }
}
</style>
