<template>
  <a-button
    :disabled="loading"
    :icon="loading ? 'loading' : 'download'"
    @click="handleExport"
  >
    {{ titleButton }}
  </a-button>
</template>

<script>
export default {
  name: 'ExportButton',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    titleButton() {
      return this.loading ? this.$t('exporting-data') : this.$t('export-data')
    },
  },
  methods: {
    handleExport() {
      this.$emit('export')
    },
  },
}
</script>

<style lang="less" scoped></style>
