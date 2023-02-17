<template>
  <div class="channel-set-up">
    <div class="channel-set-up__text">
      <div class="channel-set-up__text--title">
        {{ step.title }}
      </div>
      <div class="channel-set-up__text--detail">
        {{ step.detail }}
      </div>
    </div>
    <div class="channel-set-up__detail">
      <img
        :src="step.image"
        alt="Prime CRM"
        class="channel-set-up__detail--picture"
      />
      <a-button
        v-if="isFinalStep"
        type="primary"
        class="channel-set-up__detail--button"
        @click="handleClick"
      >
        {{ $t('i-understood-proceed-now') }}
      </a-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChannelGuid',
  props: {
    step: {
      type: Object,
      default: () => {},
    },
    isFinalStep: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClick() {
      this.$emit('next')
    },
  },
}
</script>

<style lang="less" scoped>
.channel-set-up {
  padding-bottom: 2rem;

  &__text {
    background-color: @primary-4;
    border-radius: @border-radius-xl;
    font-size: @size-16;
    padding: 1.5rem;
    @apply mb-4;

    &--title {
      color: @primary;
      @apply font-semibold;
    }

    &--detail {
      color: @black;
      margin-top: 0.25rem;
    }
  }

  &__detail {
    @apply text-center mb-4;

    &--picture {
      width: 100%;
      height: 100%;
      max-height: 400px;
      object-fit: contain;
    }
  }
}
</style>
