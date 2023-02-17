<template>
  <div
    class="tag-item"
    :class="{
      edit: checkIsEditTag(tag),
      active: checkIsActiveTag(tag),
    }"
    @click="$emit('handleClickTag', tag)"
  >
    <a-input
      v-if="checkIsEditTag(tag)"
      :value="currentName"
      :placeholder="tag.name"
      class="tag-item__name"
      @change="handleChangeName"
      @pressEnter="handleConfirmEditTag"
    >
      <div slot="suffix" class="flex items-center">
        <a-icon
          v-if="canConfirmEdit"
          type="check-circle"
          class="mr-2"
          style="color: green"
          @click="handleConfirmEditTag"
        />
        <a-icon type="close" style="color: red" @click="handleCancelEditTag" />
      </div>
    </a-input>
    <div v-else class="tag-item__name">{{ tag.name }}</div>
    <div
      class="tag-item__actions"
      :class="{
        'is-acting': checkIsCurrentActionTag(tag),
      }"
    >
      <template v-if="checkIsCurrentActionTag(tag)">
        <a-icon
          v-if="
            tag.status === $store.state.tag.status.unhide &&
            tag.parent_status === $store.state.tag.status.unhide
          "
          type="edit"
          class="mr-4"
          @click="handleClickEditTag"
        />
        <a-dropdown
          v-if="
            tag.status === $store.state.tag.status.unhide &&
            tag.parent_status === $store.state.tag.status.unhide
          "
          :trigger="['click']"
          @click="
            (e) => {
              e.stopPropagation()
            }
          "
        >
          <a-icon type="plus-circle" class="mr-4" theme="filled" />
          <a-menu slot="overlay" class="dropdown-add-new-tag">
            <a-menu-item v-if="tag.level === 1" @click="handleClickAddNewGroup">
              <span>{{ $t('add-new-group') }}</span>
            </a-menu-item>
            <a-menu-item @click="handleClickAddNewTagItem">
              <span>{{ $t('add-new-tag') }}</span>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
        <a-icon
          v-if="
            tag.status === $store.state.tag.status.unhide &&
            tag.parent_status === $store.state.tag.status.unhide
          "
          type="delete"
          class="mr-4"
          @click="handleClickDeleteTag"
        />
      </template>
      <a-icon
        v-if="
          tag.status === $store.state.tag.status.hide ||
          tag.parent_status === $store.state.tag.status.hide
        "
        type="eye-invisible"
        class="mr-4"
        @click="handleClickUnhideTag"
      />
      <a-icon v-else type="eye" class="mr-4" @click="handleClickHideTag" />
      <icon-right
        v-if="checkIsShowArrow(tag)"
        :class="{ 'opacity-0': !tag.total_children }"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'TagItem',
  props: {
    tag: {
      type: Object,
      default: () => {},
    },

    typeAction: {
      type: String,
      default: '',
    },
    isActing: {
      type: Boolean,
      default: false,
    },
    currentName: {
      type: String,
      default: '',
    },
    selectedTags: {
      type: Array,
      default: () => [],
    },
    activeTags: {
      type: Array,
      default: () => [],
    },
    currentActionTag: {
      type: Object,
      default: null,
    },
    currentEditTag: {
      type: Object,
      default: null,
    },
    currentLevelAdd: {
      type: Number,
      default: 0,
    },
    tags: {
      type: Array,
      default: () => [],
    },
    deleteTagId: {
      type: Number,
      default: null,
    },
    canConfirmEdit: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClickHideTag(e) {
      e.stopPropagation()
      this.$emit('handleClickHideTag', this.tag)
    },
    handleClickUnhideTag(e) {
      e.stopPropagation()
      this.$emit('handleClickUnhideTag', this.tag)
    },
    handleClickAddNewTagItem() {
      this.$emit('handleClickAddNewTagItem', this.tag)
    },
    handleClickDeleteTag(e) {
      e.stopPropagation()
      this.$emit('handleClickDeleteTag', this.tag)
    },
    handleClickAddNewGroup() {
      this.$emit('handleClickAddNewGroup', this.tag)
    },
    handleClickEditTag(e) {
      e.stopPropagation()
      this.$emit('handleClickEditTag', this.tag)
    },
    handleCancelEditTag(e) {
      e.stopPropagation()
      this.$emit('handleCancelEditTag')
    },
    handleConfirmEditTag(e) {
      e.stopPropagation()
      this.$emit('handleConfirmEditTag', this.tag)
    },
    checkIsEditTag(tag) {
      return this.typeAction === 'edit' && this.currentEditTag.id === tag.id
    },
    handleChangeName(e) {
      this.$emit('onChangeName', e.target.value)
    },
    checkIsCurrentActionTag(tag) {
      return (
        this.currentActionTag &&
        this.currentActionTag.id === tag.id &&
        this.typeAction !== 'edit'
      )
    },
    checkIsShowArrow(tag) {
      if (this.typeAction !== 'edit') return true
      return this.currentEditTag && this.currentEditTag.id !== tag.id
    },
    checkIsActiveTag(tag) {
      return this.activeTags.some((item) => item.id === tag.id)
    },
  },
}
</script>
<style lang="less" scoped>
.tag-item {
  color: @black;
  line-height: 4.4rem;
  font-size: @size-16;
  padding-inline: 1.8rem;
  @apply flex justify-between items-center my-2 py-2 cursor-pointer;
  &.edit,
  &.add {
    @apply px-0;
    .tag-item__name {
      @apply mr-0;
    }
  }
  &__name {
    @apply flex-shrink-0 mr-4;
    /deep/.ant-input {
      color: @black;
    }
  }
  &__actions {
    @apply flex items-center justify-between flex-shrink-0;
  }
  &:hover,
  &.active {
    background-color: @primary-3;
  }
  /deep/.anticon-plus-circle {
    color: @primary;
  }
  /deep/.anticon-delete {
    color: @red;
  }
  /deep/.ant-input-affix-wrapper {
    @apply m-0 w-full;
    .ant-input {
      padding-right: 50px;
    }
  }
}
</style>
