<template>
  <nuxt-child :channels="channels"></nuxt-child>
</template>

<script>
export default {
  name: 'SocialChannelPage',
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
  },
}
</script>
