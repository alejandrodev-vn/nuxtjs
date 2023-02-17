<template>
  <div class="response-template">
    <h5 class="response-template__title">
      {{ $t('responseTemplate') }}
    </h5>
    <div class="response-template__body">
      <div class="padding-search">
        <a-input
          v-model="valueSearch"
          class="custom-search-input"
          :placeholder="$t('searchByTemplateName')"
        >
          <a-icon slot="prefix" type="search" />
          <a-icon v-if="isLoading" slot="suffix" type="loading" />
        </a-input>
      </div>
      <response-template-search-result-detail
        :is-lock="isLock"
        :is-filtering="isFiltering"
        :is-loading-more="isLoadingMore"
        :is-loading="isLoading"
        :info-fan="currentInfoFan"
        :selected-template="selectedTemplate"
        :response-templates="listReponseTemplatesByFilter"
        @handleFetchMoreTemplate="handleFetchMoreTemplate"
      />
      <response-template-suggestion-detail
        :is-lock="isLock"
        :info-fan="currentInfoFan"
        :selected-template="selectedTemplate"
      />
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import event from '@/utils/event'

export default {
  name: 'ResponseTemplatePage',
  fetchOnServer: false,
  data() {
    return {
      isLoading: false,
      isLoadingMore: false,
      valueSearch: '',
      selectedTemplate: null,
      listReponseTemplatesByFilter: [],
      isFiltering: false,
      page: 1,
      limit: this.$store.state.limit,
      total: 0,
    }
  },
  async fetch() {
    this.isLoading = true
    await this.fetchResponseTemplateByFilter()
    this.isLoading = false
  },
  computed: {
    currentInfoFan() {
      return this.$store.state.currentInfoFan
    },
    isLock() {
      return (
        this.currentInfoFan.locked_by &&
        this.$auth.user.id !== this.currentInfoFan.locked_by.id
      )
    },
    noMoreResults() {
      return !this.isLoadingMore && this.page >= this.total
    },
  },
  watch: {
    valueSearch() {
      this.handleSearchByName()
    },
  },
  mounted() {
    event.$on('handleSelectedTemplate', this.handleSelectedTemplate)
  },
  destroyed() {
    event.$off('handleSelectedTemplate')
  },
  methods: {
    handleFetchMoreTemplate() {
      if (
        !this.$fetchState.pending &&
        !this.isLoadingMore &&
        !this.noMoreResults
      ) {
        this.page++
        this.fetchResponseTemplateByFilter()
      }
    },
    async fetchResponseTemplateByFilter() {
      try {
        this.isLoadingMore = true
        const params = {
          ...(!this.valueSearch.length && {
            'filter[type]': '1',
          }),
          ...(this.valueSearch.length && {
            'search[0][field]': 'name',
            'search[0][value]': this.valueSearch,
          }),
          page: this.page,
          limit: this.limit,
          sort: '-updated_at',
        }
        const { data, meta } =
          await this.$api.responseTemplate.getResponseTemplatesByFilter(params)
        if (data) {
          if (this.page <= 1) this.listReponseTemplatesByFilter = data
          if (this.page > 1)
            this.listReponseTemplatesByFilter = [
              ...this.listReponseTemplatesByFilter,
              ...data,
            ]
          this.total = meta.pagination.total_pages
        }
      } catch (error) {
      } finally {
        this.isLoadingMore = false
      }
    },
    handleSelectedTemplate(idTemplate) {
      this.selectedTemplate = idTemplate
    },
    handleSearchByName: debounce(function () {
      if (this.valueSearch.length && !this.isFiltering) {
        this.listReponseTemplatesByFilter.length = 0
        this.isFiltering = true
        this.page = 1
        this.total = 0
      }
      if (!this.valueSearch.length && this.isFiltering) {
        this.listReponseTemplatesByFilter.length = 0
        this.isFiltering = false
        this.page = 1
        this.total = 0
      }
      this.fetchResponseTemplateByFilter()
    }, 1000),
  },
}
</script>

<style lang="less" scoped>
.response-template {
  @apply h-full flex flex-col;

  &__title {
    font-size: @size-20;
    color: @black;
    padding: @padding-24;
    border-color: @gray-4;
    margin-bottom: 0;
    @apply text-center font-semibold border-b;
  }

  /deep/.title-section {
    font-size: @size-20;
    line-height: @size-20;
    margin-bottom: @margin-16;
    @apply font-semibold;
  }

  &__body {
    @apply flex-1 flex flex-col overflow-hidden;
  }

  /deep/.custom-search-input {
    .ant-input {
      height: @height-field;
    }
  }
  .padding-search {
    padding: @padding-24;
  }
}
</style>
