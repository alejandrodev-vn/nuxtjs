<template>
  <div class="w-full h-[50rem]">
    <app-loading v-if="isLoading" />
    <app-no-data v-else-if="!tags.length" :text="$t('noDataFound')" />
    <div v-else id="tagsArea" class="choose-tags">
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
          <icon-right v-if="tag.total_unhide_children" />
          <template v-else>
            <div class="tag-item__sentiment">
              <div
                class="icon-sentiment icon-sentiment--positive"
                :class="{
                  selected:
                    tagEdit.id === tag.id &&
                    tagEdit.sentiment ===
                      configConversations.sentiment.positive,
                }"
                @click="
                  handleClickSentiment(
                    tag,
                    configConversations.sentiment.positive
                  )
                "
              >
                <i class="far fa-smile"></i>
              </div>
              <div
                class="icon-sentiment icon-sentiment--neutral"
                :class="{
                  selected:
                    tagEdit.id === tag.id &&
                    tagEdit.sentiment === configConversations.sentiment.neutral,
                }"
                @click="
                  handleClickSentiment(
                    tag,
                    configConversations.sentiment.neutral
                  )
                "
              >
                <i class="far fa-meh"></i>
              </div>
              <div
                class="icon-sentiment icon-sentiment--negative"
                :class="{
                  selected:
                    tagEdit.id === tag.id &&
                    tagEdit.sentiment ===
                      configConversations.sentiment.negative,
                }"
                @click="
                  handleClickSentiment(
                    tag,
                    configConversations.sentiment.negative
                  )
                "
              >
                <i class="far fa-frown"></i>
              </div>
            </div>
          </template>
        </div>
      </perfect-scrollbar>
      <app-loading
        v-if="isLoadingMore"
        class="w-full flex items-center justif-center"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'ConversationAddTag',
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
      isLoading: false,
      isLoadingMore: false,
      allLevels: [this.tagEdit],
      count: 0,
    }
  },
  async fetch() {
    this.reset()
    await this.fetchTagsList()
    if (
      this.tagEdit?.id &&
      this.tagEdit?.parent_status !== this.$store.state.tag.status.hide &&
      this.tagEdit?.status !== this.$store.state.tag.status.hide
    ) {
      await this.findParentTag(this.tagEdit)
    }
  },
  computed: {
    configConversations() {
      return this.$store.state.configConversations
    },
    socialChannelId() {
      return this.$route.params.page
    },
  },
  watch: {
    currentTag() {
      this.$emit('handleChangeBreadcrumbs', this.activeTags)
    },
  },
  updated() {
    this.$nextTick(function () {
      this.scrollToLastTag()
    })
  },
  destroyed() {
    this.selectedTags = []
    this.tags = []
    this.activeTags = []
    this.currentTag = null
  },
  methods: {
    reset() {
      this.selectedTags.length = 0
      this.tags = []
      this.activeTags.length = 0
      this.currentTag = null
      this.allLevels = [this.tagEdit]
    },
    async fetchTagsList() {
      try {
        this.isLoading = true
        const params = {
          'filter[social_channel_id]': this.socialChannelId,
          'filter[status]': this.$store.state.tag.status.unhide,
          include: 'social_channel',
        }
        const { data } = await this.$api.tags.getAllTags(params)
        if (data && data.length) {
          this.tags = Object.freeze(data)
          this.selectedTags.push({ data, id: 1, level: 1 })
        }
      } catch (error) {
      } finally {
        this.isLoading = false
      }
    },
    async fetchChildrenTag(tagId) {
      try {
        if (!this.tagEdit) return
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
    async findParentTag(tag) {
      try {
        this.isLoading = true
        if (!tag) return
        if (!tag.tag?.data?.parent_id && !tag.parent_id) {
          this.handleClickTag(tag)
          return
        }
        const params = {
          include: 'parent',
        }
        const { data } = await this.$api.tags.getTagsChildren(
          tag.tag?.data?.id || tag.id,
          params
        )
        await this.formatParent(data)
        for (let i = 0; i < this.allLevels.length; i++) {
          await this.handleClickTag(this.allLevels[i])
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
    async formatParent(tag) {
      await Object.keys(tag).forEach(async (key) => {
        if (key === 'parent' && tag.parent) {
          if (tag.level === 1) return
          await this.allLevels.unshift(tag.parent.data)
          await this.formatParent(tag.parent.data)
        }
      })
    },
    async handleClickTag(tag) {
      try {
        const findIndexSelectedTag = await this.selectedTags.findIndex(
          (item) => item.level === tag.level
        )
        if (findIndexSelectedTag !== -1) {
          await this.selectedTags.splice(
            findIndexSelectedTag + 1,
            this.selectedTags.length
          )
        }
        if (tag.total_unhide_children > 0) {
          this.isLoadingMore = true
          const children = await this.fetchChildrenTag(tag.id)
          if (children.length) {
            await this.selectedTags.push({
              data: [...children],
              level: children[0].level,
              id: children[0].level,
            })
          }
        }
        const findLevelActive = await this.activeTags.findIndex(
          (list) => list.level === tag.level
        )
        if (findLevelActive !== -1) {
          await this.activeTags.splice(findLevelActive, this.activeTags.length)
        }
        if (tag?.tag?.data) {
          await this.activeTags.push({ ...tag.tag.data })
          this.onSelectedTag(tag.tag.data)
        } else {
          await this.activeTags.push({ ...tag })
          this.onSelectedTag(tag)
        }
      } catch (e) {
      } finally {
        this.isLoadingMore = false
      }
    },
    onSelectedTag(tag) {
      this.currentTag = tag
    },
    checkIsActiveTag(tag) {
      return this.activeTags.some((item) => item.id === tag.id)
    },
    scrollToLastTag() {
      const container = this.$el.querySelector('#tagsArea')
      if (container) {
        container.scrollLeft = container.scrollWidth
      }
    },
    handleClickSentiment(tag, sentiment) {
      if (this.tagEdit.id === tag.id && this.tagEdit.sentiment === sentiment)
        return
      this.$emit('handleUpdateTag', tag, sentiment)
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
    min-width: 20rem;
    max-width: 30rem;
    @apply pt-4 border-r;
    .tag-item {
      color: @black;
      min-height: 4.4rem;
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
      svg {
        flex-shrink: 0;
      }
      &__sentiment {
        @apply flex items-center;
        .icon-sentiment {
          font-size: @size-20;
          transition: 0.25s linear;
          color: @gray-2;
          @apply cursor-pointer mr-3;
          &:hover {
            transform: scale(1.3);
          }
          &--positive {
            &:hover,
            &.selected {
              color: @green;
            }
          }
          &--neutral {
            &:hover,
            &.selected {
              color: @yellow;
            }
          }
          &--negative {
            &:hover,
            &.selected {
              color: @red;
            }
          }
        }
      }
    }
  }
}
</style>
