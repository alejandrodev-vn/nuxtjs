<template>
  <div class="layout-default">
    <layout-header />
    <layout-sidebar />
    <div class="layout-default-content" :class="{ collapsed }">
      <div class="layout-default-content__body">
        <nuxt />
      </div>
      <layout-footer />
    </div>
    <subscription-modal-upgrade />
    <notify-expire />
  </div>
</template>

<script>
export default {
  computed: {
    collapsed() {
      return this.$store.state.sidebarCollapsed
    },
  },
}
</script>

<style scoped lang="less">
.layout-default {
  min-height: 100vh;
  height: 100%;
  background-color: @gray-6;
}

.layout-default-content {
  padding-top: calc(@height-header + @padding-container);
  padding-left: @padding-container;
  padding-right: @padding-container;
  @apply duration-500;

  .desktop({
    padding-left: calc(@width-sidebar + @padding-container);

    &.collapsed {
      padding-left: calc(@width-sidebar-collapsed + @padding-container);
    }
  });

  &__body {
    min-height: calc(
      100vh - @height-header - @height-footer - @padding-container
    );
    background-color: @white;
    border: 1px solid @secondary-3;
    border-radius: @border-radius-md;
  }
}
</style>
