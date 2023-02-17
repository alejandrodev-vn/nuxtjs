<template>
  <div class="template-page">
    <div class="template-page__header template-page-header">
      <div class="template-page-header__title">
        {{ $t('responseTemplate') }}
      </div>
      <div class="template-page-header__actions">
        <a-dropdown :trigger="['click']">
          <a-menu slot="overlay">
            <a-menu-item
              v-for="action in listTypeAddTemplate"
              :key="action.id"
              @click="handleOpenAddTemplate(action.type)"
            >
              {{ action.label }}
            </a-menu-item>
          </a-menu>
          <a-button type="primary">
            {{ $t('add-template') }}
            <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>
    </div>

    <div class="template-page__filters">
      <a-input v-model="search" :placeholder="$t('searchByTemplateName')">
        <a-icon slot="prefix" type="search" />
      </a-input>
      <a-select v-model="filterType" class="custom-select">
        <a-select-option
          v-for="type in listTypeResponse"
          :key="type.id"
          :value="type.value"
        >
          {{ type.label }}
        </a-select-option>
      </a-select>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <div v-else class="template-page__body">
      <template-table
        :templates="templates"
        :total="total"
        :is-loading="isLoading"
        @reload="fetchTemplates"
      />
    </div>

    <component
      :is="isTypeComponent"
      :is-show="isShowAddTemplate"
      :type-component="isTypeComponent"
      :templates="templates"
      @reload="fetchTemplates"
      @close="handleCloseAddTemplate"
    ></component>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { get, debounce } from 'lodash'
import { getResponseErrorMessage } from '@/utils'
import TemplateAddNormal from '@/components/Setting/Template/Add/TemplateAddNormal'
import TemplateAddAutoSuggestionAndResponse from '@/components/Setting/Template/Add/TemplateAddAutoSuggestionAndResponse'
Vue.use(notification)

export default {
  name: 'TemplatePage',
  components: {
    'add-normal': TemplateAddNormal,
    'add-suggestion': TemplateAddAutoSuggestionAndResponse,
    'add-auto': TemplateAddAutoSuggestionAndResponse,
  },
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
      isLoading: false,
      page: 1,
      limit: this.$store.state.limit,
      isShowAddTemplate: false,
      isTypeComponent: '',
      templates: [],
      search: '',
      filterType: '',
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
  },
  watch: {
    '$route.query': {
      handler() {
        const {
          page = 1,
          limit = this.$store.state.limit,
          search = '',
        } = this.$route.query
        this.page = Number(page)
        this.limit = Number(limit)
        this.search = search
        this.type = this.filterType
        this.fetchTemplates()
      },
    },
    search() {
      this.handleSearchByName()
    },
    filterType() {
      this.handleSearchByName()
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
          ...(this.filterType.length && {
            'filter[type]': this.filterType,
          }),
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
    handleOpenAddTemplate(type = 'add-normal') {
      this.isShowAddTemplate = true
      this.isTypeComponent = type
    },
    handleCloseAddTemplate() {
      this.isShowAddTemplate = false
      this.isTypeComponent = ''
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
.template-page {
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

.template-page-header {
  @apply flex items-center justify-between;

  &__title {
    color: @black;
    font-size: @size-20;
    @apply font-semibold;
  }
}
</style>
