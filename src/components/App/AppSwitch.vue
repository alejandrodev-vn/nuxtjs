<template>
  <div class="app-switch">
    <div
      class="app-switch__checkbox app-switch-checkbox"
      :class="{ 'pointer-events-none': disabled }"
      @click.stop="handleChange"
    >
      <label class="app-switch-checkbox__switch">
        <input
          :checked="checked"
          class="app-switch-checkbox__input"
          type="checkbox"
          disabled
        />
        <span class="app-switch-checkbox__slider"></span>
      </label>
    </div>

    <app-modal ref="modalSwitch" @confirm="handleConfirm">
      <template #title> {{ title }} </template>
      <template #content>
        <p class="app-switch-content">{{ content }}</p>
      </template>
    </app-modal>
  </div>
</template>

<script>
export default {
  name: 'AppSwitch',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: () => {},
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleCloseModal() {
      this.$refs.modalSwitch.hide()
    },
    handleChange() {
      this.$refs.modalSwitch.show()
    },
    handleConfirm() {
      this.$emit('confirm', this.item)
    },
  },
}
</script>

<style lang="less" scoped>
.app-switch {
  @apply flex items-center;
  &-content {
    white-space: pre-line;
  }
}

.app-switch-checkbox {
  @apply flex;
  &__switch {
    width: 3.6rem;
    height: 2rem;
    margin-bottom: 0;
    @apply relative;
  }
  &__input {
    -webkit-appearance: none;
    &:checked + .app-switch-checkbox__slider {
      background-color: @primary;
      &::before {
        transform: translateX(1.4rem);
      }
    }
  }
  &__slider {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: @secondary-3;
    border-radius: 2.125rem;
    @apply absolute cursor-pointer;
    &::before {
      content: '';
      width: 1.6rem;
      height: 1.6rem;
      left: 0.3125rem;
      top: 0.2rem;
      background-color: @white;
      border-radius: 50%;
      transition: all 0.5s ease;
      @apply absolute;
    }
  }
}
</style>
