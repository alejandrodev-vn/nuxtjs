<template>
  <i18n-n :value="number">
    <template #group>
      <span>.</span>
    </template>
    <template #decimal>
      <span>,</span>
    </template>
  </i18n-n>
</template>

<script>
export default {
  name: 'AppNumber',
  props: {
    number: {
      type: Number,
      default: 0,
    },
  },
}
</script>
