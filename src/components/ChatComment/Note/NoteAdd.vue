<template>
  <div class="note-add">
    <div class="note-add__form" :class="{ disable: isLock }">
      <a-textarea
        v-model="content"
        size="large"
        class="custom-textarea"
        :placeholder="$t('addNoteHere')"
        :auto-size="{ minRows: 1, maxRows: 2 }"
        :disabled="isLock"
        @pressEnter="handlePressEnter"
      >
      </a-textarea>
    </div>
    <a-button
      class="note-add__submit"
      type="primary"
      :class="{ disable: isLock }"
      @click="handleSubmitNote"
    >
      {{ $t('comment') }}
    </a-button>
  </div>
</template>

<script>
export default {
  name: 'NoteAdd',
  props: {
    isLock: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      content: '',
    }
  },
  methods: {
    handlePressEnter(e) {
      if (e.shiftKey) return
      if (e.ctrlKey) return (this.content += '\n')
      this.handleSubmitNote()
    },
    handleSubmitNote() {
      this.content = this.content.replace(/\n*$/, '').trimStart().trimEnd()
      if (!this.content.length || this.isLock) return
      this.$emit('handleSubmitNote', this.content)
      this.content = ''
    },
  },
}
</script>

<style lang="less" scoped>
.note-add {
  background-color: @white;
  @apply z-10 flex items-center justify-center p-4;

  &__form {
    border-color: @black-gray;
    background-color: @white;
    border-radius: 22px;
    @apply flex-1 z-10 flex items-center border mr-3;

    &.disable {
      background-color: #f5f5f5;
      cursor: not-allowed;
      filter: grayscale();
    }

    /deep/.custom-textarea {
      resize: none;
      border: none !important;
      box-shadow: none !important;
      min-height: 3.6rem !important;
      border-radius: 22px;
      padding-block: @padding-8;
      @apply w-full;

      &::-webkit-scrollbar {
        width: 6px;

        &:hover {
          width: 11px;
        }
      }

      &::-webkit-scrollbar-track {
        background-color: #eee;
        border-radius: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #aaa;
        border-radius: 6px;

        &:hover {
          background-color: #999;
        }
      }
    }
  }
  &__submit {
    text-align: -webkit-center;
    height: @height-field;
    @apply font-medium;

    &.disable {
      filter: grayscale();
      cursor: not-allowed;
    }
  }
}
</style>
