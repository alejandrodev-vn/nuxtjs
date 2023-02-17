<template>
  <div class="export-data">
    <export-button :loading="loading" @export="handleExport" />
    <export-history
      :files="listExport"
      :is-loading-more-result="isLoadingMoreResult"
      @loadMore="handleLoadMore"
      @delete="handleDeleteFile"
    />
  </div>
</template>

<script>
export default {
  name: 'ExportData',
  props: {
    filters: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      page: 1,
      limit: 10,
      total: 0,
      listExport: [],
      isLoadingMoreResult: false,
    }
  },
  async fetch() {
    await this.fetchExport()
  },
  computed: {
    noMoreResults() {
      return !this.loading && this.page >= this.total
    },
    configNotify() {
      return this.$store.state.notify.type
    },
  },
  methods: {
    handleDownloadFile(file) {
      const fileLink = document.createElement('a')

      fileLink.href = file.url
      fileLink.setAttribute('download', file.file_name)
      document.body.appendChild(fileLink)

      fileLink.click()
    },
    handleLoadMore() {
      if (
        !this.$fetchState.pending &&
        !this.loading &&
        !this.noMoreResults &&
        !this.isLoadingMoreResult
      ) {
        this.isLoadingMoreResult = true
        this.page++
        this.fetchExport()
      }
    },
    async refreshData() {
      this.page = 1
      this.listExport = []
      await this.fetchExport()
    },
  },
}
</script>

<style lang="less" scoped>
.export-data {
  @apply flex;

  /deep/.ant-dropdown-trigger {
    margin-left: 0.5rem;
  }
}
</style>
