<template>
  <a-cascader
    :value="value"
    :options="tagOptions"
    :load-data="loadDataTagChildren"
    :placeholder="$t('allCurrentTags')"
    :allow-clear="allowClear"
    expand-trigger="click"
    popup-class-name="custom-popup-cascader-filter-data-tag"
    @change="handleChangeValue"
  />
</template>
<script>
export default {
  name: 'AppFilterDataTag',
  props: {
    socialChannelId: {
      type: Number,
      default: 0,
    },
    value: {
      type: Array,
      default: () => [],
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      tagOptions: [],
    }
  },
  watch: {
    socialChannelId: {
      immediate: true,
      handler() {
        this.tagOptions = []
        this.fetchTags()
      },
    },
  },
  methods: {
    handleChangeValue(value) {
      this.$emit('change', value)
    },
    async loadDataTagChildren(selectedOptions) {
      const targetOption = selectedOptions[selectedOptions.length - 1]
      targetOption.loading = true
      const data = await this.fetchChildrenTag(targetOption.value)
      if (data.length) {
        const children = data.map((item) => {
          return {
            ...item,
            value: `${item.id}`,
            label: item.name,
            isLeaf: !item.total_children,
          }
        })
        targetOption.children = children
      }
      targetOption.loading = false
      this.tagOptions = [...this.tagOptions]
    },
    async fetchChildrenTag(tagId) {
      try {
        if (!tagId) return
        const params = {
          'filter[status]': this.$store.state.tag.status.unhide,
          'filter[parent_status]': this.$store.state.tag.status.unhide,
        }
        const data = await this.$api.tags.getTagDetail(tagId, params)
        if (data) {
          return data
        }
      } catch (error) {}
    },
    async fetchTags() {
      try {
        const params = {
          'filter[social_channel_id]': this.socialChannelId,
          include: 'social_channel',
        }
        const { data } = await this.$api.tags.getAllTags(params)
        if (data) {
          this.tagOptions = data.map((item) => {
            return {
              ...item,
              value: `${item.id}`,
              label: item.name,
              isLeaf: !item.total_children,
            }
          })
        }
      } catch (e) {}
    },
  },
}
</script>
<style lang="less">
.custom-popup-cascader-filter-data-tag {
  .ant-cascader-menu-item {
    padding-right: 6rem;
    color: @black;
    font-size: @size-16;
    .ant-cascader-menu-item-expand-icon {
      color: @black;
      font-size: @size-16;
    }
  }
}
</style>
