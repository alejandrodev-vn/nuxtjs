<template>
  <a-modal
    centered
    :visible="visible"
    :footer="null"
    :mask-closable="true"
    destroy-on-close
    width="80vw"
    class="conversation-tag-modal"
    @cancel="onClose"
  >
    <template slot="title">
      <div class="title">
        {{ $t('data-tags') }}
        <span class="title__description">
          {{ $t('select-tags-below-or-click-current-tags-to-edit') }}
        </span>
      </div>
    </template>
    <app-loading v-if="isLoading" />
    <div v-else-if="tagEdit && tagEdit.id" class="flex items-center flex-wrap">
      <div :class="`single-tag ${getSentiment(tagEdit.sentiment)}`">
        <span class="single-tag__name" @click="handleOpenEditTag(tagEdit)">
          {{ tagEdit.name }}
        </span>
        <button class="single-tag__delete" @click="handleClickDeleteTag">
          <a-icon type="close-circle" />
        </button>
      </div>
    </div>
    <a-breadcrumb
      v-if="breadcrumbs.length"
      class="conversation-tag-modal__breadcrumb"
    >
      <a-breadcrumb-item v-for="crumb in breadcrumbs" :key="crumb.tag_id">
        {{ crumb.name }}
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div
      class="conversation-tag-modal__choose-tag"
      :class="{ 'mt-14': !breadcrumbs.length }"
    >
      <conversation-add-tag
        :key="keyComponentAddTag"
        :tag-edit="tagEdit"
        @handleChangeBreadcrumbs="handleChangeBreadcrumbs"
        @handleUpdateTag="handleUpdateTag"
      />
    </div>
    <div class="conversation-tag-modal__keyword">
      <span class="conversation-tag-modal__keyword__title">
        {{ $t('keyword') }}
      </span>
      <a-select
        :value="valueKeywords"
        mode="multiple"
        size="large"
        style="min-width: 40rem"
        class="custom-select"
        :placeholder="$t('enter-keyword')"
        :filter-option="
          (inputValue, option) => handleSearchKeyword(inputValue, option)
        "
        :not-found-content="notFoundContent"
        @change="handleChangeKeyword"
      >
        <a-select-option
          v-for="keyword in keywords"
          :key="keyword.name"
          :value="keyword.id"
        >
          <a-tooltip
            overlay-class-name="custom-tooltip-light"
            placement="bottom"
          >
            <template slot="title"> {{ keyword.name }} </template>
            <div class="conversation-tag-modal__seclect-keyword">
              <p class="mb-0">{{ keyword.name }}</p>
            </div>
          </a-tooltip>
        </a-select-option>
      </a-select>
    </div>
  </a-modal>
</template>
<script>
import Vue from 'vue'
import { invert } from 'lodash'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'ConversationModalTag',
  fetchOnServer: false,
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    tagEdit: {
      type: Object,
      default: () => {},
    },
    keywords: {
      type: Array,
      default: () => [],
    },
    valueKeywords: {
      type: Array,
      default: () => [],
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
      keyComponentAddTag: 0,
    }
  },
  computed: {
    notFoundContent() {
      return <app-no-data text={this.$t('no-data')} />
    },
  },
  methods: {
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
    getSentiment(key) {
      if (!key) return ''
      const invertConfigSentiment = invert(
        this.$store.state.configConversations.sentiment
      )
      return invertConfigSentiment[key]
    },
    handleChangeBreadcrumbs(selectedTags) {
      this.breadcrumbs = [...selectedTags]
    },
    handleOpenEditTag(tag) {
      this.resetModal()
      this.currentTagChoosing = { ...tag }
      this.keyComponentAddTag++
    },
    handleClickDeleteTag() {
      this.$emit('handleDeleteTag')
    },
    handleSearchKeyword(inputValue, option) {
      return option.key.toLowerCase().includes(inputValue.toLowerCase())
    },
    handleUpdateTag(tag, sentiment) {
      this.$emit('handleUpdateTag', tag, sentiment)
    },
    handleChangeKeyword(value) {
      this.$emit('handleChangeKeyword', value)
    },
  },
}
</script>
<style lang="less" scoped>
.conversation-tag-modal {
  /deep/.ant-modal {
    max-width: 116rem;
  }
  /deep/.ant-modal-content {
    .ant-modal-header {
      border: 0;
      @apply pb-2;
      .ant-modal-title {
        color: @black;
        .title {
          font-size: @size-20;
          margin-top: @margin-24;
          @apply font-semibold;
          &__description {
            font-size: @size-16;
            margin-left: @margin-16;
            @apply font-normal;
          }
        }
      }
    }
    .ant-modal-body {
      height: 83%;
      @apply flex flex-col;
    }
    .ant-modal-content-wrapper {
      height: calc(100% - 70px);
      width: 60% !important;
      @apply bottom-0;
    }
    .ant-modal-close-x {
      font-size: @size-20;
      color: @black;
    }
  }

  .single-tag {
    font-size: @size-14;
    font-weight: 500;
    line-height: @size-14;
    border-radius: 64px;
    padding: 0.6rem @padding-8;
    color: @black;
    border: 1px solid @gray-2;
    background-color: transparent;
    white-space: nowrap;
    margin-inline: @margin-8;
    margin-bottom: @margin-8;
    @apply flex items-center cursor-pointer;
    &.positive {
      background-color: @positive;
      border-color: @positive;
      color: @white;
    }
    &.neutral {
      background-color: @neutral;
      border-color: @neutral;
      color: @white;
    }
    &.negative {
      background-color: @negative;
      border-color: @negative;
      color: @white;
    }
    &:first-child {
      margin-left: 0;
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
    & > span:last-child,
    & > span:last-child a {
      color: @black;
    }
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
  &__keyword {
    margin-top: @margin-16;
    @apply flex items-center;
    &__title {
      font-size: @size-20;
      color: @black;
      margin-right: @margin-12;
      @apply font-semibold;
    }
  }
  /deep/.custom-select {
    color: @black;
    font-size: @size-16;
    min-height: @height-field !important;
    height: auto;
    .ant-select-selection {
      border-color: @black-gray !important;
      min-height: @height-field !important;
      padding-block: 0;
      &__rendered {
        line-height: @height-field !important;
        .ant-select-selection__choice {
          background-color: @primary;
          border-radius: 9999px;
          padding-right: 28px !important;
          max-width: 20rem;
          @apply truncate;
          &__content {
            color: @white;
          }
          &__remove {
            .anticon-close.ant-select-remove-icon {
              font-size: @size-14;
              border-radius: 50%;
              border: 2px solid white;
              color: @white;
              width: 2rem;
              height: 2rem;
              display: flex;
              align-items: center;
              justify-content: center;
              position: absolute;
              right: 0.5rem;
              top: 1rem;
              padding: 2px;
              transition: 0.25s linear;
              &:hover {
                color: @red;
                transform: scale(1.3);
                border-color: @red;
              }
            }
          }
        }
      }
    }
    .ant-select-arrow {
      color: @black;
      font-size: @size-10;
      top: 55%;
    }
  }
}
</style>
<style lang="less">
.ant-select-dropdown--multiple {
  .ant-select-dropdown-menu-item.ant-select-dropdown-menu-item-selected {
    color: @primary;
  }
  .conversation-tag-modal__seclect-keyword {
    max-width: 38rem;
    overflow: hidden;
    p {
      @apply truncate;
    }
  }
}
</style>
