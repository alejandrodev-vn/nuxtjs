<template>
  <div class="tags__current-tags p-section">
    <div class="tags__current-tags__head">
      <h6 class="title-section">{{ $t('currentTags') }}</h6>
      <a-button
        class="btn-edit"
        :class="{ disabled: !canEdit }"
        type="primary"
        @click="openEdit"
      >
        <a-icon type="edit" />
      </a-button>
      <tags-guest-modal
        v-if="isVisibleModal"
        :visible="isVisibleModal"
        :fan-id="currentFanId"
        @closeModal="closeModal"
      />
    </div>
    <app-loading v-if="isLoading" />
    <app-no-data
      v-else-if="!currentTags.length"
      :text="$t('noDataTagHistories')"
    />
    <perfect-scrollbar
      v-else
      :options="{ suppressScrollX: true, suppressScrollY: !currentTags.length }"
      class="tags__current-tags__body"
    >
      <app-tag
        v-for="tag in currentTags"
        :key="tag.id"
        type="secondary"
        :nowrap="true"
        class="mr-2 mb-2"
      >
        <span>{{ tag.name }}</span>
      </app-tag>
    </perfect-scrollbar>
  </div>
</template>
<script>
import event from '@/utils/event'
export default {
  name: 'TagsGuestCurrentTags',
  data() {
    return {
      isLoading: false,
      canEdit: true,
      isVisibleModal: false,
      currentTags: [],
    }
  },
  computed: {
    currentFanId() {
      return this.$route.params.guest
    },
    infoFan() {
      return this.$store.state.currentInfoFan
    },
  },
  watch: {
    infoFan() {
      this.canEdit =
        !this.infoFan.locked_by ||
        (this.infoFan.locked_by &&
          this.$auth.user.id === this.infoFan.locked_by.id) ||
        !this.infoFan
    },
  },
  async created() {
    await this.fetchCurrentTags()
    event.$on('triggerFetchCurrentTags', this.fetchCurrentTags)
  },
  methods: {
    async fetchCurrentTags() {
      try {
        this.isLoading = true
        if (!this.currentFanId) return
        const params = {
          fan_id: this.currentFanId,
        }
        const { data } = await this.$api.tagsGuest.getCurrentTags(params)
        if (data) {
          this.currentTags = Object.freeze(data)
        }
      } catch (err) {
      } finally {
        this.isLoading = false
      }
    },
    openEdit() {
      if (!this.canEdit || !this.infoFan) return
      this.isVisibleModal = true
    },
    closeModal() {
      this.isVisibleModal = false
    },
  },
}
</script>
<style lang="less" scoped>
.tags {
  &__current-tags {
    height: 40%;
    flex-shrink: 0;
    padding: @padding-24;
    @apply flex flex-col;
    &__head {
      color: @black;
      margin-bottom: @margin-24;
      @apply flex items-end;
      /deep/.title-section {
        margin-bottom: 0 !important;
      }
      .btn-edit {
        background-color: @gray-5;
        color: @black;
        width: @width-btn-trigger;
        height: @width-btn-trigger;
        padding: 0.25rem 0.5rem;
        margin-left: @margin-16;
        font-size: @size-15;
        @apply border-0 rounded-md;
        &.disabled {
          background-color: @gray-6;
          color: @gray-4;
        }
      }
    }
    &__body {
      @apply flex items-baseline flex-wrap;
    }
    &.p-section {
      border-bottom: 4px solid @gray-4 !important;
    }
  }
}
</style>
