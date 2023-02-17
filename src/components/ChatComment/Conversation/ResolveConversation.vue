<template>
  <div class="resolve-conversation">
    <app-avatar
      :image="lockedBy.avatar"
      :full-name="lockedBy.name"
      :size="54"
    />
    <p>{{ lockedBy.name }} {{ $t('isResolvingThisConversation') }}</p>
  </div>
</template>
<script>
export default {
  name: 'ResolveConversation',
  props: {
    lockedBy: {
      type: Object,
      default: () => {},
    },
  },
}
</script>
<style lang="less" scoped>
.resolve-conversation {
  @apply w-full flex items-center justify-center mb-2;
  p {
    color: @gray-3;
    @apply m-0 ml-2;
  }
}
</style>
