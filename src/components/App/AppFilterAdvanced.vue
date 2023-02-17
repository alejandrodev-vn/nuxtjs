<template>
  <a-drawer
    width="30vw"
    :closable="false"
    :visible="isShow"
    class="filter-advanced"
    :destroy-on-close="destroyOnClose"
    @close="handleClose"
  >
    <span class="filter-advanced__close" @click="handleClose">
      <icon-right class="btn-trigger-collapse" />
    </span>
    <div v-if="isLoading" class="mt-8">
      <app-loading />
    </div>
    <div v-else class="filter-advanced__content">
      <div class="filter-advanced-content">
        <div class="filter-advanced-content__title">
          {{ $t('filter') }}
        </div>
        <div class="filter-advanced-content__form">
          <slot name="form"></slot>
        </div>
        <div class="filter-advanced-content__actions">
          <a-button
            class="filter-advanced-content__actions--btn-default"
            @click="handleSetDefault"
          >
            {{ $t('defaultFilter') }}
          </a-button>
          <a-button
            type="primary"
            class="filter-advanced-content__actions--btn-apply"
            :disabled="isLoading"
            :loading="isLoading"
            @click="handleSave"
          >
            {{ $t('apply') }}
          </a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'AppFilterAdvanced',
  fetchOnServer: false,
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    destroyOnClose: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleSave() {
      this.$emit('save')
      this.handleClose()
    },
    handleSetDefault() {
      this.$emit('setDefault')
    },
  },
}
</script>

<style lang="less" scoped>
.filter-advanced {
  &__close {
    top: 0;
    left: 0;
    width: @width-btn-trigger !important;
    height: @width-btn-trigger;
    border-color: @gray-5;
    background-color: @white;
    transform: translateX(-50%);
    z-index: 10;
    cursor: pointer;
    @apply absolute rounded-full border flex items-center justify-center;
    .btn-trigger-collapse {
      color: @black;
      width: @size-16;
      height: @size-16;
      @apply duration-500 font-bold;
    }
  }

  &.ant-drawer-open {
    /deep/ .ant-drawer-content {
      @apply overflow-visible;
      .ant-drawer-wrapper-body {
        overflow: visible;
      }
      .ant-drawer-body {
        height: 100%;
        padding: 0;
        overflow: visible;
      }
    }
  }
}

.filter-advanced-content {
  min-height: 100vh;
  padding: @padding-40 @padding-24;
  overflow: visible;

  @apply relative;

  &__title {
    color: @black;
    font-size: @size-20;
    margin-bottom: 1rem;
    @apply font-semibold;
  }

  &__form {
    /deep/.popover-button {
      height: @height-field;
      margin-right: 0;
      &__text {
        font-size: @size-16;
        line-height: @size-24;
        color: @black;
      }
      .anticon.anticon-down {
        font-size: @size-12;
      }
    }

    /deep/.ant-select {
      font-size: @size-16;
      line-height: 24px;
      color: @black;
      .ant-select-selection {
        height: @height-field;
        border-color: @black-gray;

        &__rendered {
          line-height: @height-field;
          margin-left: @margin-16;
        }
      }
      .ant-select-arrow {
        color: @black;
      }
    }
    /deep/.ant-cascader-picker {
      height: @height-field;
      .ant-cascader-picker-label {
        font-size: @size-16;
        line-height: @size-24;
        color: @black;
        height: 100%;
      }
      .ant-input.ant-cascader-input {
        height: 100%;
        &::placeholder {
          font-size: @size-16;
          line-height: @size-24;
          color: @black;
        }
      }
      .ant-cascader-picker-arrow {
        color: @black;
      }
    }

    /deep/.mx-datepicker {
      width: 100%;

      .mx-input {
        height: @height-field;
        font-size: @size-16;
        line-height: @size-24;
        color: @black;
        &::placeholder {
          font-size: @size-16;
          line-height: @size-24;
          color: @black;
        }
      }
    }
  }

  &__actions {
    width: 100%;
    left: 0;
    bottom: 0;
    background-color: @white;
    padding: 1rem 1.5rem;
    box-shadow: 8px 0 24px rgba(25, 32, 56, 0.04);
    @apply absolute text-right;
    &--btn-default {
      color: @black;
    }
  }
}
</style>
