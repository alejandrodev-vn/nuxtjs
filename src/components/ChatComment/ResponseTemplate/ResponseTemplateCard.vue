<template>
  <div
    class="response-template-item"
    :class="{ disabled: isLock, active: isActive }"
    @click="handleClick"
  >
    <span class="response-template-item__name">{{ template.name }}</span>
    <div class="response-template-item__content">
      <p>{{ isCollapseText ? shortContent : template.response }}</p>
      <span
        v-if="template.response.length > 80"
        class="btn-more"
        @click="handleClickSeeMore"
      >
        {{ isCollapseText ? $t('seeMore') : $t('collapse') }}
      </span>
    </div>
  </div>
</template>

<script>
import event from '@/utils/event'

export default {
  name: 'ResponseTemplateCard',
  props: {
    template: {
      type: Object,
      default: () => {},
    },
    isLock: {
      type: Boolean,
      default: false,
    },
    selectedTemplate: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      isCollapseText: true,
    }
  },
  computed: {
    isActive() {
      return this.selectedTemplate === this.template.id
    },
    shortContent() {
      return this.template.response.length > 80
        ? this.template.response.slice(0, 80) + '...'
        : this.template.response
    },
  },
  methods: {
    handleClickSeeMore(e) {
      e.stopPropagation()
      if (this.isLock) return
      this.isCollapseText = !this.isCollapseText
    },
    handleClick() {
      if (this.isLock) return
      event.$emit('useResponseTemplate', this.template.response)
      event.$emit('handleSelectedTemplate', this.template.id)
    },
  },
}
</script>

<style lang="less" scoped>
.response-template-item {
  border-color: @gray-4;
  margin-right: @margin-24;

  @apply mb-2 border p-4 rounded-xl duration-500 cursor-pointer;
  &:hover,
  &.active {
    background-color: @primary-4;
  }
  &__name {
    color: @black;
    font-size: @font-size-base;
    @apply font-semibold;
  }
  &__content {
    p {
      white-space: pre-line;
      @apply mt-2 mb-0 inline;
    }
  }
  .btn-more {
    font-size: @size-3;
    color: @primary;
    @apply cursor-pointer relative;
    &::after {
      content: '';
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: @primary;
      @apply absolute;
    }
  }
  &.disabled {
    cursor: not-allowed;
    &:hover {
      background-color: @white;
    }
    .btn-more {
      color: @gray-4;
      cursor: not-allowed;
      &::after {
        background-color: @gray-4;
      }
    }
  }
}
</style>
