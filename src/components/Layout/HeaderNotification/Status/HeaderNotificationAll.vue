<template>
  <div>
    <header-notification-item
      v-for="notify in notifications"
      :key="notify.id"
      :notify="notify"
      @update="handleUpdateItem"
    />
  </div>
</template>
<script>
export default {
  name: 'HeaderNotificationAll',
  props: {
    notifications: {
      type: Array,
      default: () => [],
    },
    notificationsUnread: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    handleUpdateItem(item) {
      this.$emit('update', item)
    },
  },
}
</script>
