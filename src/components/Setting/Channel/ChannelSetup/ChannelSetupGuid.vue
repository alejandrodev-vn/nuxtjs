<template>
  <div class="channel-set-up">
    <div class="channel-set-up__text">
      <div class="channel-set-up__text--title">
        {{ step.title }}
      </div>
      <div class="channel-set-up__text--detail" v-html="step.detail"></div>
    </div>
    <div class="channel-set-up__detail">
      <img
        :src="step.image"
        alt="Prime CRM"
        class="channel-set-up__detail--picture"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChannelSetupGuid',
  props: {
    step: {
      type: Object,
      default: () => {},
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
