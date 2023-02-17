<template>
  <div class="search-result">
    <h5 class="title-section">{{ $t('searchResult') }}</h5>
    <div
      v-if="!isFiltering && !responseTemplates.length"
      class="flex-1 flex justify-center items-center"
    >
      <p>{{ $t('enterTemplateNameToSearch') }}</p>
    </div>
    <app-loading v-else-if="isLoading" />
    <app-no-data
      v-else-if="!responseTemplates.length"
      :text="$t('noDataFound')"
    />
    <div v-else class="scroll-search-template" @scroll="detectScroll">
      <response-template-card
        v-for="template in responseTemplates"
        :key="template.id"
        :is-lock="isLock"
        :template="template"
        :selected-template="selectedTemplate"
      />
    </div>
    <app-loading v-if="isLoadingMore" />
  </div>
</template>

<script>
export default {
  name: 'ResponseTemplateSearchResultDetail',
  props: {
    responseTemplates: {
      type: Array,
      default: () => [],
    },
    isFiltering: {
      type: Boolean,
      default: false,
    },
    infoFan: {
      type: Object,
      default: null,
    },
    isLock: {
      type: Boolean,
      default: false,
    },
    isLoadingMore: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    selectedTemplate: {
      type: String,
      default: null,
    },
  },
  methods: {
    detectScroll(e) {
      const target = e.currentTarget
      const isBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 10
      if (isBottom) {
        this.handleFetchMoreTemplate()
      }
    },
    handleFetchMoreTemplate() {
      this.$emit('handleFetchMoreTemplate')
    },
  },
}
</script>

<style lang="less" scoped>
.search-result {
  height: 40%;
  padding-left: @padding-24;
  @apply flex flex-col flex-shrink-0 flex-1;
  .scroll-search-template {
    overflow: hidden auto;
    &::-webkit-scrollbar {
      width: 6px;
      &:hover {
        width: 11px;
      }
    }
    &::-webkit-scrollbar-track {
      background-color: #eee;
      border-radius: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #aaa;
      border-radius: 6px;
      min-height: 50px;
      &:hover {
        background-color: #999;
      }
    }
  }
}
</style>
