<template>
  <div class="templates-page">
    <div class="templates-page__title">
      {{ $t('responseTemplate') }}
    </div>
    <div class="templates-page__description">
      {{ $t('response-template-long-description') }}
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <div v-else class="templates-page__body">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        :bordered="true"
        :custom-row="handleClickRow"
      >
        <template slot="action" slot-scope="record">
          <div
            class="response-template-table-actions"
            @click.stop="(e) => e.preventDefault()"
          >
            <a-dropdown placement="bottomLeft" :trigger="['click']">
              <a
                class="response-template-table-actions__dropdown"
                @click="(e) => e.preventDefault()"
              >
                <i class="fas fa-ellipsis-v"></i>
              </a>
              <a-menu slot="overlay">
                <a-menu-item key="edit">
                  <a
                    rel="noopener noreferrer"
                    class="response-template-table-actions__dropdown--item"
                    @click="handleOpenTab(record)"
                  >
                    {{ $t('edit') }}
                  </a>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </template>
      </a-table>
    </div>

    <a-drawer
      :visible="isShowDrawer"
      :closable="false"
      width="80vw"
      class="drawer-templates-type"
      @close="handleCloseDrawer"
    >
      <span class="drawer-templates-type__close" @click="handleCloseDrawer">
        <icon-right class="btn-trigger-collapse" />
      </span>
      <div class="drawer-templates-type__content">
        <div class="templates-type-drawer">
          <div class="templates-type-drawer__tabs">
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
          <div class="templates-type-drawer__content">
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
  name: 'TemplatesPage',
  fetchOnServer: false,
  asyncData({ app, redirect }) {
    const permissions = get(app, 'store.state.auth.user.permissions', []) || []
    if (!permissions.includes('setting')) {
      const defaultLocale = app.i18n.defaultLocale
      const locale = app.store.state.i18n.locale
      const url =
        locale === defaultLocale
          ? '/setting/account'
          : `/${locale}/setting/account`

      redirect(url)
    }
  },
  data() {
    return {
      isShowDrawer: false,
      activeTab: null,
      columns: [
        {
          key: 'action',
          scopedSlots: { customRender: 'action' },
        },
        {
          title: this.$t('template-type'),
          key: 'type',
          dataIndex: 'type',
          scopedSlots: { customRender: 'type' },
        },
        {
          title: this.$t('template-quantity'),
          key: 'quantity',
          dataIndex: 'quantity',
          scopedSlots: { customRender: 'quantity' },
          align: 'center',
        },
        {
          title: this.$t('description'),
          key: 'description',
          dataIndex: 'description',
          scopedSlots: { customRender: 'description' },
        },
        {
          title: this.$t('last-edited'),
          key: 'date',
          dataIndex: 'date',
          scopedSlots: { customRender: 'date' },
        },
      ],
      dataSource: [
        {
          key: 'normal',
          type: 'Normal',
          quantity: 0,
          description:
            'Response templates are for common questions and concerns about your brand. When you want to use it to respond to customers, you can find it by searching the template name.',
          date: '09:00 04/01/2020',
        },
        {
          key: 'auto-suggestion',
          type: 'Auto suggestion',
          quantity: 0,
          description:
            'The system will automatically suggest the response templates based on the created keywords for you to respond to your customers.',
          date: '09:00 04/01/2020',
        },
        {
          key: 'auto-response',
          type: 'Auto response',
          quantity: 0,
          description:
            'Based on the created keywords, the system will automatically respond to your customers according to the response templates.',
          date: '09:00 04/01/2020',
        },
      ],
    }
  },
  fetch() {},
  computed: {
    tabs() {
      return [
        {
          key: 'normal',
          title: this.$t('normal'),
          disable: false,
        },
        {
          key: 'auto-suggestion',
          title: this.$t('auto-suggestion'),
          disable: false,
        },
        {
          key: 'auto-response',
          title: this.$t('auto-response'),
          disable: false,
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
            path: `/setting/templates/${this.activeTab}`,
          })
        )
      } else {
        this.isShowDrawer = false
        this.$router.push(
          this.localePath({
            path: '/setting/templates',
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
    handleClickRow(record) {
      return {
        style: {
          cursor: 'pointer',
        },
        on: {
          click: () => {
            this.handleOpenTab(record)
          },
        },
      }
    },
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
.templates-page {
  padding: @padding-40 @padding-24;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }

  &__description {
    margin-top: 1.2rem;
    font-size: @size-3;
    color: @secondary-2;
  }

  &__body {
    margin-top: 2.4rem;
  }

  /deep/.ant-table-content {
    .ant-table-body {
      table {
        thead {
          tr {
            height: @height-table;
            th {
              background-color: #f2f3f4;
              font-weight: 500;
              font-size: @font-size-base;
              line-height: @size-22;
              color: @black;
            }
          }
        }
        tbody {
          tr {
            height: @height-table;
            @apply cursor-pointer;
            td {
              font-size: @font-size-base;
              line-height: @size-22;
              color: @color-table;
              &:first-child {
                width: 4rem;
                padding: 0;
                @apply cursor-default text-center;
              }
              &:nth-child(2) {
                width: 13rem;
              }
              &:nth-child(3) {
                width: 11rem;
              }
              &:last-child {
                width: 15rem;
              }
            }
          }
        }
      }
    }
  }
}

.response-template-table-actions {
  &__dropdown {
    color: @secondary-1;
    line-height: 1;
    padding: 0 0.5rem;

    &--item {
      width: 9rem;
      @apply text-center;
    }
  }
}

.drawer-templates-type {
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
    }
  }
}

.templates-type-drawer {
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
