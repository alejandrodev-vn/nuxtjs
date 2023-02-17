<template>
  <div
    class="app-tag"
    :class="{
      [`app-tag--${type}`]: type,
      'app-tag-border': border,
      pointer,
      square,
      nowrap,
    }"
    @click="$emit('click')"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AppTag',
  props: {
    type: {
      type: String,
      default: null,
    },
    border: {
      type: Boolean,
      default: false,
    },
    pointer: {
      type: Boolean,
      default: false,
    },
    square: {
      type: Boolean,
      default: false,
    },
    nowrap: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="less" scoped>
.app-tag {
  font-size: @size-14;
  font-weight: 500;
  line-height: @size-18;
  border-radius: 64px;
  padding: 0.6rem @padding-16;
  background-color: var(--background-color);
  color: var(--color);
  &.pointer {
    @apply cursor-pointer;
  }
  &.square {
    @apply rounded-md;
  }
  &.nowrap {
    white-space: nowrap;
  }
  &.app-tag-border {
    border: 1px solid @gray-2;
  }
  &--secondary {
    background-color: transparent;
    color: @gray-2;
    border: 1px solid @gray-2;
  }
  &--primary {
    background-color: @primary-3;
    color: @primary;
    &.app-tag-border {
      border: 1px solid @primary;
    }
  }
  &--success {
    background-color: @green-2;
    color: @green;
    &.app-tag-border {
      border: 1px solid @green;
    }
  }
  &--warning {
    background-color: @yellow-2;
    color: @yellow;
    &-alt {
      background-color: @yellow-1;
      color: @orange;
    }
    &.app-tag-border {
      border: 1px solid @yellow;
    }
  }
  &--danger {
    background-color: @red-2;
    color: @red;
    &.app-tag-border {
      border: 1px solid @red;
    }
  }
  &--violet {
    background-color: @violet-2;
    color: @violet;
    &.app-tag-border {
      border: 1px solid @violet;
    }
  }
  &--advanced {
    background-color: #eefafe;
    color: #56ccf2;
    &.app-tag-border {
      border: 1px solid #56ccf2;
    }
  }
  &--light {
    background-color: rgba(@white, 0.6);
    color: @white;
    &.app-tag-border {
      border: 1px solid @white;
    }
  }
  &--dark {
    background-color: @secondary-3;
    color: @secondary-1;
    &.app-tag-border {
      border: 1px solid @secondary;
    }
  }
  &--primary-status-order {
    background-color: @primary;
    color: @white;
  }
  &--fade-status-order {
    background-color: #a7c8e9;
    color: @white;
  }
  &--delivered-status-order {
    background-color: #56ccf2;
    color: @white;
  }
  &--gray {
    background-color: #22313f08;
    color: #0112224d;
  }
}
</style>
