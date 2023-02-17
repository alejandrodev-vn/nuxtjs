<template>
  <div class="note">
    <h5 class="note__title">{{ $t('note') }}</h5>
    <app-loading v-if="$fetchState.pending" class="mt-8" />
    <div v-else class="flex-1 flex flex-col">
      <perfect-scrollbar
        :options="{ suppressScrollX: true }"
        class="scroll-note-list flex-1"
      >
        <app-loading v-if="isLoading" />
        <app-no-data v-else-if="!notes.length" :text="$t('noDataNote')" />
        <note-card v-for="note in notes" :key="note.id" :note="note" />
      </perfect-scrollbar>
      <note-add :is-lock="isLock" @handleSubmitNote="handleSubmitNote" />
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'NotePage',
  data() {
    return {
      notes: [],
      pagination: null,
      isLoading: false,
    }
  },
  async fetch() {
    await this.fetchNoteList()
  },
  computed: {
    noMore() {
      const currentPage = get(this.pagination, 'current_page', 0)
      const totalPage = get(this.pagination, 'total_pages', 1)
      return currentPage >= totalPage && !this.loading
    },
    guestId() {
      return this.$route.params.guest
    },
    infoFan() {
      return this.$store.state.currentInfoFan
    },
    isLock() {
      return (
        this.infoFan.locked_by &&
        this.$auth.user.id !== this.infoFan.locked_by.id
      )
    },
  },
  methods: {
    async fetchNoteList() {
      try {
        this.isLoading = true
        const params = {
          page: get(this.pagination, 'current_page', 1),
          'filter[fan_id]': this.guestId,
        }
        const { data, meta } = await this.$api.note.getNoteByGuest(params)
        if (data) {
          this.notes = [...this.notes, ...data]
          this.pagination = meta
        }
      } catch (e) {
      } finally {
        this.isLoading = false
      }
    },
    async handleSubmitNote(note) {
      try {
        const payload = {
          note,
          fan_id: this.guestId,
        }
        const { data } = await this.$api.note.createNoteByGuest(payload)
        if (data) {
          this.notes.push(data)
        }
      } catch (e) {}
    },
    initScrollEvent() {
      if (process.client) {
        this.$nextTick(() => {
          const scrollWrapper = document.querySelector('.scroll-note-list')
          if (scrollWrapper) {
            scrollWrapper.addEventListener('scroll', this.detectScrollNote)
          }
        })
      }
    },
    detectScrollNote(e) {
      const target = e.currentTarget
      const isBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight
      if (isBottom && !this.noMore) {
        this.loadMore()
      }
    },
    loadMore() {
      this.pagination.current_page++
      this.fetchNoteList()
    },
  },
}
</script>

<style lang="less" scoped>
.note {
  @apply relative h-full flex flex-col;

  &__title {
    font-size: @size-24;
    color: @black;
    padding: @padding-24 !important;
    border-color: @gray-4;
    @apply text-center font-semibold border-b mb-0;
  }
}
</style>
