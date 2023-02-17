<template>
  <div class="templates-normal-setup-content">
    <div class="templates-page">
      <div class="templates-page__header templates-page-header">
        <div class="templates-page-header__title">
          {{ $t('template-type') }}:
          {{ $t('normal') }}
        </div>
        <div class="templates-page-header__actions">
          <a-button type="primary" @click="handleOpenAddTemplate">
            <a-icon type="plus" />
            {{ $t('add-new-template') }}
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
        <!-- <template-table
          :templates="templates"
          :total="total"
          :is-loading="isLoading"
          @reload="fetchTemplates"
        /> -->
      </div>
    </div>
    <template-add-normal
      :is-show="isShowAddTemplate"
      @reload="fetchTemplates"
      @close="handleCloseAddTemplate"
    />
  </div>
</template>
<script>
export default {
  name: 'TemplatesExample',
  fetchOnServer: false,
  data() {
    return {
      search: '',
      isShowAddTemplate: false,
    }
  },
  fetch() {},
  methods: {
    handleOpenAddTemplate() {
      this.isShowAddTemplate = true
    },
    handleCloseAddTemplate() {
      this.isShowAddTemplate = false
    },
    fetchTemplates() {
      this.$emit('reload')
    },
  },
}
</script>
