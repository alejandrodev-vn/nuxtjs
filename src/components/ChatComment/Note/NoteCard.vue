<template>
  <div class="note-card" :class="{ 'right-item': infoUser.id === userId }">
    <div class="note-card__left">
      <div class="note-card__left__content">
        <p>{{ note.note }}</p>
      </div>
      <div class="note-card__left__info-message">
        <span class="note-card__left__info-message--bold">
          {{ infoUser.name }}
        </span>
        <span>{{ formatTime(note.updated_at) }}</span>
      </div>
    </div>
    <div class="note-card__right">
      <app-avatar
        :image="infoUser.profile_picture"
        :full-name="infoUser.name"
        size="large"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoteCard',
  props: {
    note: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    infoUser() {
      return this.note.user.data
    },
    userId() {
      return this.$auth.user.id
    },
  },
  methods: {
    formatTime(time) {
      return this.$moment.utc(time).local().format('hh:mm A DD/MM/YYYY')
    },
  },
}
</script>

<style lang="less" scoped>
.note-card {
  max-width: 90%;
  @apply flex flex-row-reverse justify-end m-6;

  &__left {
    max-width: 90%;

    &__content {
      color: #333;
      background-color: @gray-6;
      width: max-content;
      max-width: 100%;
      font-size: @size-16;
      word-break: break-word;
      @apply rounded-md py-2 px-4 ml-4;

      /deep/p {
        white-space: pre-wrap;
        @apply m-0;
      }
    }

    &__info-message {
      @apply flex items-center justify-end;

      span {
        font-size: @size-12;
        color: @gray-4;
        @apply mt-2 px-2;
      }

      &--bold {
        @apply font-semibold relative pl-0 pr-2;

        &::after {
          content: '';
          width: 1.5px;
          height: 90%;
          top: 0%;
          right: 0;
          background-color: @gray-4;
          @apply absolute;
        }
      }
    }
  }

  &.right-item {
    @apply flex-row;

    .note-card {
      &__left {
        max-width: 90%;
        @apply mr-4;

        &__content {
          color: #333;
          background-color: @gray-6;
          width: max-content;
          max-width: 100%;
          word-break: break-word;
          font-size: @size-16;
          @apply rounded-md py-2 px-4 ml-auto;

          /deep/p {
            white-space: pre-wrap;
            @apply m-0;
          }
        }

        &__info-message {
          @apply flex items-center justify-end;

          span {
            font-size: @size-12;
            color: @gray-4;
            @apply mt-2 px-2;
          }

          &--bold {
            @apply font-semibold relative pl-0 pr-2;

            &::after {
              content: '';
              width: 1.5px;
              height: 90%;
              top: 0%;
              right: 0;
              background-color: @gray-4;
              @apply absolute;
            }
          }
        }
      }
    }
  }
}
</style>
