<template>
  <div class="discount-switch">
    <a-popover v-if="expired" placement="right">
      <template #content>
        {{ $t('expired') }}
      </template>
      <div class="discount-switch__checkbox discount-switch-checkbox expired">
        <label class="discount-switch-checkbox__switch">
          <input
            :checked="checked"
            class="discount-switch-checkbox__input"
            type="checkbox"
            disabled
          />
          <span class="discount-switch-checkbox__slider"></span>
        </label>
      </div>
    </a-popover>
    <div
      v-else
      class="discount-switch__checkbox discount-switch-checkbox"
      @click.stop="handleChange"
    >
      <label class="discount-switch-checkbox__switch">
        <input
          :checked="checked"
          class="discount-switch-checkbox__input"
          type="checkbox"
          disabled
        />
        <span class="discount-switch-checkbox__slider"></span>
      </label>
    </div>

    <app-modal ref="modalSwitch" @confirm="handleConfirm">
      <template #title> {{ title }} </template>
      <template #content>{{ content }} </template>
    </app-modal>
  </div>
</template>

<script>
import AppSwitch from '@/components/App/AppSwitch'

export default {
  name: 'DiscountSwitch',
  extends: AppSwitch,
  props: {
    expired: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="less" scoped>
.discount-switch {
  margin-left: @margin-8;
  @apply flex items-center;
}

.discount-switch-checkbox {
  @apply flex;
  &__switch {
    width: 3.6rem;
    height: 2rem;
    margin-bottom: 0;
    @apply relative;
  }
  &__input {
    -webkit-appearance: none;
    &:checked + .discount-switch-checkbox__slider {
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
  &.expired {
    .discount-switch-checkbox__slider {
      background-color: @secondary-2;
    }
  }
}
</style>
