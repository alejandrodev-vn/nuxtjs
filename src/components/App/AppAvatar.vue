<template>
  <a-avatar
    :src="image"
    :style="`color: ${color}; background-color: ${background};
    font-size: ${fontSize}px; font-weight: 600`"
    :size="size"
  >
    {{ shortName }}
  </a-avatar>
</template>
<script>
export default {
  name: 'AppAvatar',
  props: {
    image: {
      type: String,
      default: null,
    },
    fullName: {
      type: String,
      default: '--',
    },
    color: {
      type: String,
      default: '#406290',
    },
    background: {
      type: String,
      default: '#e8ecf3',
    },
    fontSize: {
      type: Number,
      default: 16,
    },
    size: {
      type: [String, Number],
      default: 'default',
    },
  },
  computed: {
    shortName() {
      return this.getStringAvatar(this.fullName)
    },
  },
  methods: {
    getStringAvatar(fullName) {
      if (!fullName?.length) return '--'
      const arrayLetter = fullName
        .split(' ')
        .map((word) => {
          return word.charAt(0).toUpperCase()
        })
        .splice(-2)
      return arrayLetter.join('')
    },
  },
}
</script>
