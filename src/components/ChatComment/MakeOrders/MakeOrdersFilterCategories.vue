<template>
  <a-col :span="12">
    <a-select
      :value="selectedCategory"
      class="custom-select"
      style="width: 100%"
      :placeholder="`${$t('allCategories')}`"
      dropdown-class-name="select__dropdown"
      default-value=""
      :loading="$fetchState.pending"
      @change="handleChangeCategory"
      @popupScroll="handleScrollCategories"
    >
      <a-select-option :value="-1">
        {{ $t('allCategories') }}
      </a-select-option>
      <a-select-option :value="0"> {{ $t('non-category') }} </a-select-option>
      <a-select-option
        v-for="category in categories"
        :key="category.platform_category_id"
        :value="category.platform_category_id"
      >
        {{ category.name_vn }}
      </a-select-option>
    </a-select>
  </a-col>
</template>
<script>
export default {
  name: 'MakeOrdersFilterCategories',
  fetchOnServer: false,
  props: {
    selectedCategory: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      isLoadingMore: false,
      page: 1,
      limit: this.$store.state.limit,
      total: 0,
      categories: [],
    }
  },
  async fetch() {
    await this.fetchCategoriesList()
  },
  computed: {
    noMoreResults() {
      return !this.isLoadingMore && this.page >= this.total
    },
  },
  methods: {
    handleChangeCategory(value) {
      this.$emit('changeCategory', value)
    },
    async fetchCategoriesList() {
      try {
        const params = {
          page: this.page,
          limit: this.limit,
          sort: 'name_vn',
        }
        const { data, meta } = await this.$api.category.getCategoriesList(
          params
        )
        if (data) {
          this.categories = [...this.categories, ...data]
          this.total = meta.pagination.total_pages
        }
      } catch (error) {}
    },
    handleScrollCategories(e) {
      const { target } = e
      if (
        !this.isLoadingMore &&
        target.scrollTop + target.offsetHeight >= target.scrollHeight - 10
      ) {
        this.page++
        this.fetchCategoriesList()
      }
    },
  },
}
</script>
<style lang="less" scoped>
.custom-select {
  color: @black;
  height: @height-field;
  margin-bottom: @margin-12;
  &.ant-select-disabled {
    .ant-select-selection {
      background-color: @white;
      cursor: default;
    }
  }
  /deep/.ant-select-selection {
    height: @height-field !important;
    border-color: @gray-4;
    &__rendered {
      line-height: @height-field;
    }
  }
  /deep/.ant-select-arrow {
    color: @black;
  }
}
</style>
