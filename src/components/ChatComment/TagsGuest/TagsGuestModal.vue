<template>
  <a-drawer
    :title="$t('tags')"
    placement="right"
    :closable="false"
    :visible="visible"
    destroy-on-close
    class="tags-edit"
    @close="onClose"
  >
    <a-button type="secondary" class="btn-close" @click="onClose">
      <a-icon type="left" />
    </a-button>
    <app-loading v-if="isLoading" />
    <div v-else class="flex items-center flex-wrap">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="single-tag"
        :class="{
          active: currentTagChoosing && currentTagChoosing.id === tag.id,
        }"
      >
        <span class="single-tag__name" @click="handleOpenEditTag(tag)">
          {{ tag.name }}
        </span>
        <button
          class="single-tag__delete"
          @click="handleClickDeleteTag(tag.id)"
        >
          <a-icon type="close-circle" />
        </button>
      </div>
      <div
        class="btn-add-tag"
        :class="{ active: action === 'add' }"
        @click="handleOpenAddTag"
      >
        <button class="btn-add-tag__plus">
          <a-icon type="plus" />
        </button>
        <span class="btn-add-tag__name">{{ $t('add-tag') }}</span>
      </div>
    </div>
    <a-breadcrumb v-if="breadcrumbs.length" class="tags-edit__breadcrumb">
      <a-breadcrumb-item v-for="crumb in breadcrumbs" :key="crumb.id">
        {{ crumb.name }}
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div
      v-if="action.length"
      class="tags-edit__choose-tag"
      :class="{ 'mt-14': !breadcrumbs.length }"
    >
      <tags-guest-edit
        v-if="action === 'edit'"
        :tag-edit="currentTagChoosing"
        @changeStatusSubmitEditTagsGuest="handleChangeCanSubmitEdit"
      />
      <tags-guest-choose-tags
        v-else-if="action === 'add'"
        @changeStatusSubmitAddTagsGuest="handleChangeCanSubmitAdd"
      />
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
      <p>{{ $t('noActionEditTagGuest') }}</p>
    </div>
    <tags-guest-submit-add
      v-if="action === 'add'"
      :can-submit="canSubmitAdd"
      @submit="handleSubmitAddTag"
      @close="onClose"
    />
    <tags-guest-submit-edit
      v-else-if="action === 'edit'"
      :can-submit="canSubmitEdit"
      :tag-edit="currentTagChoosing"
      :selected-tag="selectedTagEdit"
      @submit="handleSubmitEditTag"
      @close="onClose"
    />
    <tags-guest-submit-delete
      v-else-if="canSubmitDelete"
      :can-submit="canSubmitDelete"
      @submit="handleClickSaveOnlyDeleteTag"
      @close="onClose"
    />
  </a-drawer>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import event from '@/utils/event'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)

export default {
  name: 'TagsGuestModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    fanId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      action: '',
      breadcrumbs: [],
      canSubmitAdd: false,
      selectedTagAdd: null,
      canSubmitEdit: false,
      selectedTagEdit: null,
      canSubmitDelete: false,
      currentTagChoosing: null,
      isLoading: false,
      listTagsDelete: [],
      tags: [],
    }
  },
  created() {
    this.fetchCurrentTags()
  },
  methods: {
    async fetchCurrentTags() {
      try {
        this.isLoading = true
        if (!this.fanId) return
        const params = {
          fan_id: this.fanId,
        }
        const { data } = await this.$api.tagsGuest.getCurrentTags(params)
        if (data) {
          this.tags = data
        }
      } catch (err) {
      } finally {
        this.isLoading = false
      }
    },
    onClose() {
      this.resetModal()
      this.$emit('closeModal')
    },
    resetModal() {
      this.action = ''
      this.breadcrumbs.length = 0
      this.canSubmitAdd = false
      this.selectedTagAdd = null
      this.canSubmitEdit = false
      this.selectedTagEdit = null
      this.currentTagChoosing = null
    },
    handleOpenAddTag() {
      this.resetModal()
      this.action = 'add'
    },
    handleOpenEditTag(tag) {
      this.resetModal()
      this.action = 'edit'
      this.currentTagChoosing = { ...tag }
    },
    handleChangeCanSubmitAdd(canSubmit, selectedTags) {
      this.canSubmitAdd = canSubmit
      this.breadcrumbs = [...selectedTags]
      this.selectedTagAdd = { ...selectedTags[selectedTags.length - 1] }
    },
    handleChangeCanSubmitEdit(canSubmit, selectedTags) {
      this.canSubmitEdit = canSubmit
      this.breadcrumbs = [...selectedTags]
      this.selectedTagEdit = { ...selectedTags[selectedTags.length - 1] }
    },
    async handleSubmitAddTag() {
      try {
        if (
          !this.selectedTagAdd ||
          this.selectedTagAdd.children.data.length ||
          !this.fanId
        )
          return
        const payload = {
          fan_id: this.fanId,
          tag_ids: [this.selectedTagAdd.id],
        }
        const { data } = await this.$api.tagsGuest.addTagsToGuest(payload)
        if (this.listTagsDelete.length && this.canSubmitDelete) {
          await this.handleSubmitDeleteTag()
        }
        if (data) {
          event.$emit('triggerFetchCurrentTags')
          event.$emit('triggerFetchTagHistories')
          this.onClose()
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    async handleSubmitEditTag() {
      try {
        if (
          !this.selectedTagEdit ||
          (this.selectedTagEdit.children &&
            this.selectedTagEdit.children.data.length) ||
          !this.fanId ||
          !this.currentTagChoosing
        )
          return
        const payload = {
          fan_id: this.fanId,
          current_tag_id: this.currentTagChoosing.id,
          new_tag_id: this.selectedTagEdit.id,
        }
        const { data } = await this.$api.tagsGuest.updateTagsToGuest(payload)
        if (this.listTagsDelete.length && this.canSubmitDelete) {
          await this.handleSubmitDeleteTag()
        }
        if (data) {
          event.$emit('triggerFetchCurrentTags')
          event.$emit('triggerFetchTagHistories')
          this.onClose()
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
    handleClickDeleteTag(tagId) {
      const findTag = this.tags.findIndex((tag) => tag.id === tagId)
      this.tags.splice(findTag, 1)
      this.listTagsDelete.push(tagId)
      if (this.listTagsDelete.length) this.canSubmitDelete = true
      if (this.currentTagChoosing && this.currentTagChoosing.id === tagId) {
        this.resetModal()
      }
    },
    async handleClickSaveOnlyDeleteTag() {
      await this.handleSubmitDeleteTag()
      event.$emit('triggerFetchCurrentTags')
      event.$emit('triggerFetchTagHistories')
      this.onClose()
    },
    async handleSubmitDeleteTag() {
      try {
        if (!this.fanId || !this.listTagsDelete.length || !this.canSubmitDelete)
          return
        const payload = {
          fan_id: this.fanId,
          tag_ids: [...this.listTagsDelete],
        }
        await this.$api.tagsGuest.deleteTagsToGuest(payload)
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
  },
}
</script>
<style lang="less" scoped>
.tags-edit {
  /deep/.ant-drawer-header {
    border: 0;
    height: 5%;
    @apply mt-6 pb-2;
    .ant-drawer-title {
      color: @black;
      font-size: @size-20;
      @apply font-semibold;
    }
  }
  /deep/.ant-drawer-body {
    height: 83%;
    @apply flex flex-col;
  }
  /deep/.ant-drawer-content-wrapper {
    height: calc(100% - 70px);
    width: 60% !important;
    @apply bottom-0;
  }
  /deep/.ant-drawer-content {
    overflow: initial;
    @apply relative;
  }
  .btn-close {
    width: @width-btn-trigger;
    height: @width-btn-trigger;
    color: @black;
    border-color: @gray-4;
    transform: translateX(-50%);
    @apply absolute top-0 left-0 flex items-center justify-center rounded-full;
  }
  .single-tag {
    font-size: @size-14;
    font-weight: 500;
    line-height: @size-14;
    border-radius: 64px;
    padding: 0.6rem @padding-8;
    color: @gray-2;
    border: 1px solid @gray-2;
    background-color: transparent;
    white-space: nowrap;
    margin-inline: @margin-8;
    margin-bottom: @margin-8;
    @apply flex items-center cursor-pointer;
    &:first-child {
      margin-left: 0;
    }
    &:hover,
    &.active {
      background-color: @primary-3;
      color: @primary;
    }
    &.active {
      border-color: @primary-3;
    }
    &__delete {
      font-size: @size-16;
      line-height: 10px;
      @apply ml-2 duration-500;
      &:hover {
        transform: scale(1.4);
        color: @red;
      }
    }
  }
  .btn-add-tag {
    font-size: @size-14;
    font-weight: 500;
    line-height: @size-14;
    border-radius: 64px;
    padding: 0.6rem @padding-8;
    color: @gray-2;
    border: 1px dashed @gray-2;
    background-color: transparent;
    margin-inline: @margin-8;
    margin-bottom: @margin-8;
    @apply flex items-center cursor-pointer;
    &:hover,
    &.active {
      background-color: @primary-3;
      color: @primary;
    }
    &.active {
      border-color: @primary-3;
    }
    &__plus {
      font-size: @size-16;
      line-height: 10px;
      @apply mr-2 duration-500;
      &:hover {
        transform: scale(1.4);
      }
    }
  }
  &__breadcrumb {
    @apply mt-6 mb-4;
  }
  &__choose-tag {
    height: 70%;
    @apply border rounded-xl;
  }
  /deep/&__footer {
    height: 70px;
    @apply w-full absolute bottom-0 left-0 shadow-2xl flex justify-end items-center px-4;
    .btn-cancel {
      border-color: @black;
      color: @black;
      @apply mr-2;
    }
    .btn-save {
      &.disabled {
        filter: grayscale();
      }
    }
  }
}
</style>
