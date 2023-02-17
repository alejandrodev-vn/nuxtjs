<template>
  <app-loading v-if="isLoading" />
  <div v-else class="w-full h-full">
    <div id="tagsArea" class="choose-tags">
      <perfect-scrollbar
        v-for="list in selectedTags"
        :key="list.id"
        class="tags-list"
      >
        <div
          v-for="tag in list.data"
          :key="tag.id"
          class="tag-item"
          :class="{ active: checkIsActiveTag(tag) }"
          @click="handleClickTag(tag)"
        >
          <div class="tag-item__name">{{ tag.name }}</div>
          <icon-right v-if="tag.children.data.length" />
          <a-icon
            v-else-if="tag.id !== tagEdit.id"
            type="plus-circle"
            theme="filled"
          />
        </div>
      </perfect-scrollbar>
    </div>
  </div>
</template>
<script>
import { get } from 'lodash'
export default {
  name: 'TagGuestsChooseTags',
  props: {
    canSubmit: {
      type: Boolean,
      default: false,
    },
    tagEdit: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      selectedTags: [],
      tags: [],
      activeTags: [],
      currentTag: null,
      allLevels: [this.tagEdit],
      isLoading: false,
    }
  },
  async fetch() {
    await this.fetchTagsList()
  },
  watch: {
    async tagEdit() {
      this.reset()
      await this.fetchTagsList()
      await this.findParentTag(this.tagEdit)
    },
    currentTag() {
      if (!this.currentTag) return
      this.$emit(
        'changeStatusSubmitEditTagsGuest',
        !get(this.currentTag, 'children.data.length', 0) &&
          this.currentTag.id !== this.tagEdit.id,
        this.activeTags
      )
    },
  },
  async created() {
    await this.findParentTag(this.tagEdit)
  },
  updated() {
    this.$nextTick(function () {
      this.scrollToLastTag()
    })
  },
  methods: {
    async fetchTagsList() {
      try {
        this.isLoading = true
        const params = {
          'filter[social_channel_id]': this.socialChannelId,
          include: 'children,social_channel',
        }
        const { data } = await this.$api.tags.getAllTags(params)
        if (data && data.length) {
          this.tags = Object.freeze(data)
          this.selectedTags.unshift({ data, id: 1, level: 1 })
        }
      } catch (error) {
      } finally {
        this.isLoading = false
      }
    },
    async fetchTagById(tagId) {
      try {
        if (!this.tagEdit) return
        const params = {
          include: 'children',
        }
        const { data } = await this.$api.tags.getTagsChildren(tagId, params)
        if (data) {
          return data
        }
      } catch (error) {}
    },
    async findParentTag(tag) {
      if (!tag) return
      if (!tag.parent_id) {
        await this.allLevels.forEach(async (item) => {
          await this.handleClickTag(item)
        })
        return
      }
      const getParent = await this.fetchTagById(tag.parent_id)
      this.allLevels.unshift(getParent)
      if (!this.allLevels[0].parent_id) {
        await this.allLevels.forEach(async (item) => {
          await this.handleClickTag(item)
        })
        return
      }
      await this.findParentTag(getParent)
    },
    handleClickTag(tag) {
      const findIndexSelectedTag = this.selectedTags.findIndex(
        (item) => item.level === tag.level
      )
      if (findIndexSelectedTag !== -1) {
        this.selectedTags.splice(
          findIndexSelectedTag + 1,
          this.selectedTags.length
        )
      }
      if (tag.children && tag.children.data.length) {
        this.selectedTags.push({
          data: [...tag.children.data],
          level: tag.children.data[0].level,
          id: tag.children.data[0].level,
        })
      }
      const findLevelActive = this.activeTags.findIndex(
        (list) => list.level === tag.level
      )
      if (findLevelActive !== -1) {
        this.activeTags.splice(findLevelActive, this.activeTags.length)
      }
      this.activeTags.push({ ...tag })
      this.onSelectedTag(tag)
    },
    onSelectedTag(tag) {
      this.currentTag = tag
    },
    checkIsActiveTag(tag) {
      return this.activeTags.some((item) => item.id === tag.id)
    },
    reset() {
      this.selectedTags.length = 0
      this.tags = []
      this.activeTags.length = 0
      this.currentTag = null
      this.allLevels = [this.tagEdit]
    },
    scrollToLastTag() {
      const container = this.$el.querySelector('#tagsArea')
      if (container) {
        container.scrollLeft = container.scrollWidth
      }
    },
  },
}
</script>
<style lang="less" scoped>
.choose-tags {
  overflow: auto hidden;
  @apply h-full flex flex-nowrap;
  .tags-list {
    height: 100%;
    min-width: 200px;
    width: 200px;
    @apply pt-4 border-r;
    .tag-item {
      color: @black;
      @apply flex justify-between items-center my-2 py-2 px-4 cursor-pointer;
      &__name {
        @apply mr-4;
      }
      &:hover,
      &.active {
        background-color: @primary-3;
      }
      /deep/.anticon-plus-circle {
        color: @primary;
      }
    }
  }
}
</style>
