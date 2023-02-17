<template>
  <div class="templates-auto-suggestion-setup-content">
    <div class="templates-page">
      <div class="templates-page__header templates-page-header">
        <div class="templates-page-header__title">
          {{ $t('template-type') }}:
          {{ $t('auto-suggestion') }}
        </div>
        <div class="templates-page-header__actions">
          <a-button type="primary" @click="handleOpenAddTemplate">
            <a-icon type="plus" />
            {{ $t('add-template') }}
          </a-button>
        </div>
      </div>

      <div class="templates-page__filters">
        <a-input v-model="search" :placeholder="$t('searchByTemplateName')">
          <a-icon slot="prefix" type="search" />
        </a-input>
      </div>
      <div v-if="$fetchState.pending" class="mt-8">
        <app-loading />
      </div>
      <div v-else class="templates-page__body">
        <templates-table
          :templates="templates"
          :total="total"
          :is-loading="isLoading"
          type-template="edit-auto"
          @reload="fetchTemplates"
        />
      </div>
    </div>
    <a-drawer
      :visible="isShowAddTemplate"
      :closable="false"
      width="60vw"
      class="drawer-add-template"
      @close="handleCloseAddTemplate"
    >
      <span class="drawer-add-template__close" @click="handleCloseAddTemplate">
        <icon-right class="btn-trigger-collapse" />
      </span>
      <div class="drawer-add-template__content">
        <div class="templates-type-drawer">
          <div class="templates-type-drawer__content">
            <templates-example-suggestion @reload="fetchTemplates" />
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { debounce } from 'lodash'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  fetchOnServer: false,
  data() {
    return {
      isLoading: false,
      page: 1,
      limit: this.$store.state.limit,
      isShowAddTemplate: false,
      isTypeComponent: '',
      templates: [],
      search: '',
      total: 0,
    }
  },
  async fetch() {
    await this.fetchTemplates()
  },
  computed: {
    listTypeResponse() {
      return [
        {
          id: 0,
          value: '',
          label: this.$t('all-template-types'),
        },
        {
          id: 1,
          value: '1',
          label: this.$t('normal'),
        },
        {
          id: 2,
          value: '2',
          label: this.$t('auto-suggestion'),
        },
        {
          id: 3,
          value: '3',
          label: this.$t('auto-response'),
        },
      ]
    },
    listTypeAddTemplate() {
      return [
        {
          id: 1,
          type: 'add-normal',
          label: this.$t('normal'),
        },
        {
          id: 2,
          type: 'add-suggestion',
          label: this.$t('auto-suggestion'),
        },
        {
          id: 3,
          type: 'add-auto',
          label: this.$t('auto-response'),
        },
      ]
    },
    configResponseTemplate() {
      return this.$store.state.configResponseTemplate
    },
  },
  methods: {
    async fetchTemplates(sort) {
      try {
        this.isLoading = true
        const params = {
          limit: this.limit,
          page: this.page,
          sort: !sort ? '-updated_at' : sort,
          ...(this.search.length && {
            'search[0][field]': 'name',
            'search[0][value]': this.search,
          }),
          'filter[type]': this.configResponseTemplate.type['auto-suggestion'],
        }
        const { data, meta } =
          await this.$api.responseTemplate.getResponseTemplatesByFilter(params)
        if (data) {
          this.templates = Object.freeze(data)
          this.total = meta.pagination.total
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      } finally {
        this.isLoading = false
      }
    },
    handleOpenAddTemplate() {
      this.isShowAddTemplate = true
    },
    handleCloseAddTemplate() {
      this.isShowAddTemplate = false
    },
    handleSearchByName: debounce(function () {
      const query = {
        ...this.$route.query,
        page: 1,
        search: this.search,
        type: this.filterType,
      }
      if (!this.search.length) {
        delete query.search
      }
      if (!this.filterType.length) {
        delete query.type
      }
      this.$router.push({ query })
    }, 1000),
  },
}
</script>
<style lang="less" scoped>
.templates-page {
  padding: @padding-40 @padding-24;

  /deep/&__filters {
    margin-top: 0.5rem;
    @apply flex items-center;
    .custom-select {
      width: 200px;
      height: @height-field;
      .ant-select-selection--single {
        height: @height-field;
        border-color: @gray-4;
      }
      .ant-select-selection__rendered {
        line-height: @height-field;
        color: @black;
      }
    }
    .ant-input-affix-wrapper {
      width: 40%;
      margin-right: @margin-16;

      .ant-input {
        height: @height-field;
      }
    }
  }

  &__body {
    margin-top: 1rem;
  }
}

.templates-page-header {
  @apply flex items-center justify-between;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
}
.drawer-add-template {
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
    padding: @padding-40 @padding-24;
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
</style>
