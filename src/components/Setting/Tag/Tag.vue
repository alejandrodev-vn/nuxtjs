<template>
  <app-loading v-if="isLoading" />
  <div
    v-else-if="!channels.length"
    class="flex items-center justify-center h-full w-full px-4"
  >
    <p>
      {{ $t('please-add-channel-account-before-setting-up-the-data-tags') }}
      <nuxt-link
        class="click-here"
        :to="localePath({ path: '/setting/channel' })"
      >
        {{ $t('click-here') }}
      </nuxt-link>
      {{ $t('to-add-new-channel-account') }}
    </p>
  </div>
  <div
    v-else-if="!tags.length && !isActing"
    class="flex items-center justify-center h-full w-full"
  >
    <p>
      <span class="click-here" @click="handleClickHere">
        {{ $t('click-here') }}
      </span>
      {{ $t('to-add-new-tag-group') }}
    </p>
  </div>
  <div v-else class="w-full h-full">
    <perfect-scrollbar
      id="tagsArea"
      :options="{ suppressScrollY: true }"
      class="tags"
    >
      <perfect-scrollbar
        v-for="tree in selectedTags"
        :key="tree.id"
        class="tag-tree"
      >
        <div v-if="checkIsLevelWantToAddNew(tree)" class="tag-item add">
          <a-input
            v-model="currentName"
            :placeholder="placeholder"
            class="tag-item__name"
            @pressEnter="handleConfirmAddTag(tree)"
          >
            <div slot="suffix" class="flex items-center">
              <a-icon
                v-if="currentName.length"
                type="check-circle"
                class="mr-2"
                style="color: green"
                @click="handleConfirmAddTag(tree)"
              />
              <a-icon
                type="close"
                style="color: red"
                @click="handleCancelAddTag"
              />
            </div>
          </a-input>
        </div>
        <tag-item
          v-for="tag in tree.data"
          :key="tag.id"
          :tag="tag"
          :type-action="typeAction"
          :is-acting="isActing"
          :current-name="currentName"
          :selected-tags="selectedTags"
          :active-tags="activeTags"
          :current-action-tag="currentActionTag"
          :current-edit-tag="currentEditTag"
          :current-level-add="currentLevelAdd"
          :tags="tags"
          :delete-tag-id="deleteTagId"
          :can-confirm-edit="canConfirmEdit"
          @onChangeName="handleChangeName"
          @handleClickAddNewTagItem="handleClickAddNewTagItem"
          @handleClickAddNewGroup="handleClickAddNewGroup"
          @handleClickEditTag="handleClickEditTag"
          @handleConfirmEditTag="handleConfirmEditTag"
          @handleCancelEditTag="handleCancelEditTag"
          @handleClickDeleteTag="handleClickDeleteTag"
          @handleClickHideTag="handleClickHideTag"
          @handleClickUnhideTag="handleClickUnhideTag"
          @handleClickTag="handleClickTag"
        />
      </perfect-scrollbar>
      <app-loading
        v-if="isLoadingMore"
        class="w-full flex items-center justify-center"
      />
      <app-modal
        ref="modalDeleteTag"
        type="danger"
        @confirm="handleConfirmDeleteTag"
      >
        <template #title> {{ $t('delete') }} </template>
        <template #content>{{ $t('content-delete-tag') }} </template>
      </app-modal>
    </perfect-scrollbar>
  </div>
</template>
<script>
import Vue from 'vue'
import { get } from 'lodash'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'Tag',
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
    socialChannelId: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      typeAction: '',
      isLoading: false,
      isLoadingMore: false,
      isActing: false,
      currentName: '',
      placeholder: '',
      selectedTags: [],
      activeTags: [],
      currentActionTag: null,
      currentEditTag: null,
      currentLevelAdd: 0,
      tags: [],
      deleteTagId: null,
      canConfirmEdit: false,
    }
  },
  watch: {
    socialChannelId: {
      immediate: true,
      handler() {
        this.reset()
        this.fetchTagsList()
      },
    },
    currentName() {
      if (this.typeAction !== 'edit') return
      this.canConfirmEdit =
        !!this.currentName.length &&
        this.currentName !== this.currentEditTag.name
    },
  },
  updated() {
    this.$nextTick(function () {
      this.scrollToLastTag()
    })
  },
  methods: {
    reset() {
      this.typeAction = ''
      this.isActing = false
      this.currentName = ''
      this.selectedTags.length = 0
      this.activeTags.length = 0
      this.currentActionTag = null
      this.currentEditTag = null
      this.currentLevelAdd = 0
      this.tags.length = 0
      this.deleteTagId = null
      this.canConfirmEdit = false
      this.$emit('updateTag')
    },
    async fetchTagsList() {
      try {
        if (!this.socialChannelId) return
        this.isLoading = true
        const params = {
          'filter[social_channel_id]': this.socialChannelId,
          include: 'social_channel',
        }
        const { data } = await this.$api.tags.getAllTags(params)
        if (data && data.length) {
          this.tags = data
          this.selectedTags.push({ data, id: 1, level: 1 })
        }
      } catch (error) {
      } finally {
        this.isLoading = false
      }
    },
    async fetchChildrenTag(tagId) {
      try {
        const data = await this.$api.tags.getTagDetail(tagId)
        if (data) {
          return data
        }
      } catch (error) {}
    },
    handleChangeName(value) {
      this.currentName = value
    },
    async handleClickUnhideTag(tag) {
      try {
        await this.$api.tags.unhideTag(tag.id)
        const findTree = this.selectedTags.find(
          (item) => item.level === tag.level
        )
        const findTagEditInTree = findTree.data.find(
          (item) => item.id === tag.id
        )
        findTagEditInTree.status = this.$store.state.tag.status.unhide
        findTagEditInTree.updated_at = this.$moment().format('HH:mm DD/MM/YYYY')
        findTagEditInTree.updated_by = this.$auth.user.name
        if (tag.level === 1) {
          this.reset()
          this.fetchTagsList()
        } else {
          this.selectedTags.splice(tag.level - 1, this.selectedTags.length)
        }
        this.onSelectedTag(findTagEditInTree)
        // this.reset()
        // await this.fetchTagsList()
        this.$emit('updateTag')
        notification.success({
          message: this.$t('unhide-tag-successfully'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async handleClickHideTag(tag) {
      try {
        await this.$api.tags.hideTag(tag.id)
        const findTree = this.selectedTags.find(
          (item) => item.level === tag.level
        )
        const findTagEditInTree = findTree.data.find(
          (item) => item.id === tag.id
        )
        findTagEditInTree.status = this.$store.state.tag.status.hide
        findTagEditInTree.updated_at = this.$moment().format('HH:mm DD/MM/YYYY')
        findTagEditInTree.updated_by = this.$auth.user.name
        if (tag.level === 1) {
          this.reset()
          this.fetchTagsList()
        } else {
          this.selectedTags.splice(tag.level - 1, this.selectedTags.length)
        }
        this.onSelectedTag(findTagEditInTree)
        this.$emit('updateTag')
        notification.success({
          message: this.$t('hide-tag-successfully'),
          class: 'notification-success',
        })
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    handleClickHere() {
      this.isActing = true
      this.currentLevelAdd = 1
      this.typeAction = 'add-group'
      this.currentName = ''
      this.placeholder = this.$t('new-group')
      this.selectedTags.push({
        data: [],
        level: 1,
        id: 1,
      })
    },
    handleCancelAddTag() {
      this.currentEditTag = null
      this.typeAction = ''
      if (!this.tags.length) {
        this.isActing = false
        this.selectedTags.length = 0
        this.currentLevelAdd = 0
      }
    },
    async handleConfirmAddTag(tree) {
      try {
        if (this.currentName.length === 0) return
        let newTag = {}
        if (this.typeAction === 'add-group') {
          const findCurrentItemAtLevel = this.activeTags.find(
            (tag) => tag.level === tree.level
          )
          const parentId = get(findCurrentItemAtLevel, 'parent_id', 0)
          const payload = {
            name: this.currentName,
            social_channel_id: this.socialChannelId,
            ...(parentId && { parent_id: parentId }),
          }
          const { data } = await this.$api.tags.createTag(payload)
          newTag = { ...data }
          this.selectedTags[this.currentLevelAdd - 1].data.push({
            ...newTag,
            children: { data: [] },
          })
        } else if (this.typeAction === 'add-tag') {
          const findParentId = this.activeTags.find(
            (tag) => tag.level === tree.level - 1
          ).id
          const payload = {
            name: this.currentName,
            social_channel_id: this.socialChannelId,
            ...(findParentId && { parent_id: findParentId }),
          }
          const { data } = await this.$api.tags.createTag(payload)
          newTag = { ...data }
          const findParent = this.selectedTags[
            this.currentLevelAdd - 2
          ].data.find((tag) => tag.id === findParentId)
          if (findParent?.children?.data) {
            findParent.children.data.push({
              ...newTag,
              children: { data: [] },
            })
          } else {
            findParent.children = {
              data: {
                ...newTag,
                children: { data: [] },
              },
            }
          }

          this.selectedTags[this.currentLevelAdd - 1].data.push({
            ...newTag,
            children: { data: [] },
          })
          this.activeTags[this.currentLevelAdd - 1] = {
            ...newTag,
            children: { data: [] },
          }
        }
        const params = {
          'filter[social_channel_id]': this.socialChannelId,
          include: 'social_channel',
        }
        const { data } = await this.$api.tags.getAllTags(params)
        if (data && data.length) {
          this.tags = data
        }
        notification.success({
          message: this.$t('add-tag-successfully'),
          class: 'notification-success',
        })
        this.$emit('updateTag')
        this.handleCancelEditTag()
      } catch (e) {
        notification.error({
          message: this.$t('add-tag-failed'),
          class: 'notification-error',
        })
      }
    },
    handleCancelEditTag() {
      this.currentEditTag = null
      this.typeAction = ''
    },
    async handleConfirmEditTag(tag) {
      try {
        if (!this.currentName.length || this.currentName === tag.name) return
        const findTree = this.selectedTags.find(
          (item) => item.level === tag.level
        )
        const findTagEditInTree = findTree.data.find(
          (item) => item.id === tag.id
        )
        const payload = {
          name: this.currentName,
        }
        const tagId = get(tag, 'id', 0)
        await this.$api.tags.updateTag(payload, tagId)
        findTagEditInTree.name = this.currentName
        findTagEditInTree.updated_at = this.$moment().format('HH:mm DD/MM/YYYY')
        findTagEditInTree.updated_by = this.$auth.user.name
        this.onSelectedTag(findTagEditInTree)
        this.$emit('updateTag')
        notification.success({
          message: this.$t('updated-tag-successfully'),
          class: 'notification-success',
        })
        this.handleCancelEditTag()
      } catch (e) {
        notification.error({
          message: this.$t('updated-tag-failed'),
          class: 'notification-error',
        })
      }
    },
    async handleConfirmDeleteTag() {
      try {
        if (!this.deleteTagId) return
        await this.$api.tags.deleteTag(this.deleteTagId)
        notification.success({
          message: this.$t('delete-tag-successfully'),
          class: 'notification-success',
        })
        this.reset()
        this.fetchTagsList()
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async handleClickTag(tag) {
      try {
        if (this.isLoadingMore) return
        if (this.currentEditTag && this.currentEditTag.id !== tag.id) {
          this.currentEditTag = null
          this.typeAction = ''
        }
        if (this.typeAction === 'add-group' || this.typeAction === 'add-tag') {
          this.currentLevelAdd = 0
          this.typeAction = ''
        }
        const findIndexSelectedTag = this.selectedTags.findIndex(
          (item) => item.level === tag.level
        )
        if (findIndexSelectedTag !== -1) {
          this.selectedTags.splice(
            findIndexSelectedTag + 1,
            this.selectedTags.length
          )
        }
        if (tag.total_children > 0) {
          this.isLoadingMore = true
          const children = await this.fetchChildrenTag(tag.id)
          if (children.length) {
            this.selectedTags.push({
              data: [...children],
              level: children[0].level,
              id: children[0].level,
            })
          }
        }
        const findLevelActive = this.activeTags.findIndex(
          (tree) => tree.level === tag.level
        )
        if (findLevelActive !== -1) {
          this.activeTags.splice(findLevelActive, this.activeTags.length)
        }
        this.activeTags.push({ ...tag })
        this.onSelectedTag(tag)
      } catch (error) {
      } finally {
        this.isLoadingMore = false
      }
    },
    onSelectedTag(tag) {
      this.currentActionTag = tag
    },
    checkIsLevelWantToAddNew(tree) {
      return (
        (this.typeAction === 'add-group' || this.typeAction === 'add-tag') &&
        this.currentLevelAdd === tree.level
      )
    },
    handleClickAddNewGroup(tag) {
      this.typeAction = 'add-group'
      this.currentName = ''
      this.placeholder = this.$t('new-group')
      this.currentLevelAdd = tag.level
    },
    handleClickAddNewTagItem(tag) {
      this.typeAction = 'add-tag'
      this.currentName = ''
      this.placeholder = this.$t('new-tag')
      this.currentLevelAdd = tag.level + 1
      const findLevelIsExist = this.selectedTags.find(
        (tree) => tree.level === this.currentLevelAdd
      )
      if (!findLevelIsExist) {
        this.selectedTags.push({
          data: [],
          level: this.currentLevelAdd,
          id: this.currentLevelAdd,
        })
      }
    },
    handleClickEditTag(tag) {
      this.typeAction = 'edit'
      this.currentName = tag.name
      this.currentEditTag = { ...tag }
    },
    handleClickDeleteTag(tag) {
      this.$refs.modalDeleteTag.show()
      this.deleteTagId = tag.id
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
.tags {
  @apply h-full flex flex-nowrap;
  .tag-tree {
    height: 100%;
    min-width: 25rem;
    border-color: @gray-4;
    @apply pt-4 border-r;
  }
}
.click-here {
  color: @primary;
  @apply cursor-pointer;
  &:hover {
    @apply underline;
  }
}
</style>
<style lang="less">
.dropdown-add-new-tag {
  .ant-dropdown-menu-item {
    color: @black;
  }
}
</style>
