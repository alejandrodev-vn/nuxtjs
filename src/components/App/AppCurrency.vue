<template>
  <i18n-n :value="price" format="currency" :locale="locale">
    <template #currency>
      <span>{{ currency }}</span>
    </template>
    <template #group>
      <span>,</span>
    </template>
    <template #decimal>
      <span>.</span>
    </template>
  </i18n-n>
</template>

<script>
export default {
  name: 'AppCurrency',
  props: {
    price: {
      type: Number,
      default: 0,
    },
    locale: {
      type: String,
      default: 'vi',
    },
    currency: {
      type: String,
      default: '',
    },
  },
}
</script>
