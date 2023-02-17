<template>
  <a-modal
    :visible="visible"
    :closable="false"
    centered
    :footer="null"
    :mask-closable="true"
    :width="width"
    @cancel="hide"
  >
    <div class="app-modal">
      <div v-if="!hiddenHeader" class="app-modal__header">
        <a-icon
          :type="getIcon()"
          class="app-modal__header--icon"
          :class="{ 'app-modal__header--icon--danger': type === 'danger' }"
        ></a-icon>
        <span class="app-modal__header--title">
          <slot name="title"> {{ $t('warning') }} </slot>
        </span>
      </div>
      <div class="app-modal__content">
        <slot name="content"> {{ $t('warning-question') }} </slot>
      </div>
      <div class="app-modal__footer">
        <slot name="footer">
          <a-button class="btn-cancel" @click="hide">
            {{ $t('cancel') }}
          </a-button>
          <a-button
            class="btn-confirm"
            :type="getButton()"
            :loading="loading"
            @click="confirm"
          >
            {{ $t('confirm') }}
          </a-button>
        </slot>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'AppModal',
  props: {
    type: {
      type: String,
      default: 'warning',
    },
    hiddenHeader: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '30vw',
    },
  },
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    confirm() {
      this.$emit('confirm')
    },
    show() {
      this.visible = true
    },
    hide() {
      this.visible = false
    },
    getIcon() {
      return this.type === 'danger' ? 'close-circle' : 'question-circle'
    },
    getButton() {
      return this.type === 'danger' ? 'danger' : 'primary'
    },
  },
}
</script>

<style lang="less" scoped>
.app-modal {
  padding: 0.3rem 0.5rem;
  &__header {
    margin-bottom: 0.8rem;
    @apply flex items-center;
    &--icon {
      color: @yellow;
      font-size: @size-20;
      margin-right: 1rem;
      &--danger {
        color: @red;
      }
    }
    &--title {
      color: @black-blue;
      font-size: @size-20;
      @apply font-semibold;
    }
  }
  &__content {
    font-size: @size-16;
    color: #808890;
    margin-bottom: 3rem;
  }
  /deep/&__footer {
    @apply text-right;
    .btn-cancel {
      color: @black;
      font-size: @size-14;
      border-color: @gray-1;
      @apply mr-4 font-medium;
    }
    .btn-confirm {
      font-size: @size-14;
      @apply font-medium;
    }
  }
}
</style>
