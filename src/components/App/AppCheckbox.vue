<template>
  <a-checkbox v-model="checked" :disabled="disabled"></a-checkbox>
</template>

<script>
export default {
  name: 'AppCheckbox',
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      checked: false,
    }
  },
  watch: {
    checked() {
      if (this.checked) {
        this.$emit('check', this.item)
      } else {
        this.$emit('uncheck', this.item)
      }
    },
  },
}
</script>
