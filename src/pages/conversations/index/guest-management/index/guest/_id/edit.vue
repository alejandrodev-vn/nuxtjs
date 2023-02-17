<template>
  <div class="guest-detail-edit-page">
    <div class="guest-detail-edit-page__header">
      <div class="guest-detail-edit-page__header--title">
        {{ $t('guest-detail') }}
      </div>
      <div class="guest-detail-edit-page__header--edit">
        <i class="fas fa-pen"></i>
      </div>
    </div>
    <div v-if="$fetchState.pending" class="mt-8">
      <app-loading />
    </div>
    <div
      v-else
      class="guest-detail-edit-page__body guest-detail-edit-page-body"
    >
      <div class="guest-detail-edit-page-body__info">
        <guest-detail-information
          ref="formGuest"
          :guest="guest"
          :disabled="false"
        />
        <div class="flex flex-col">
          <guest-detail-order :guest="guest" />
          <guest-detail-current-tags :guest="guest" class="flex-1 mt-4" />
        </div>
      </div>
      <div class="guest-detail-edit-page-body__conversation">
        <guest-detail-conversation-history :guest="guest" />
      </div>
      <div class="guest-detail-edit-page-body__actions">
        <a-button @click="handleCancel">
          {{ $t('cancel') }}
        </a-button>
        <a-button type="primary" :disabled="loading" @click="handleSave">
          <a-icon v-if="loading" type="loading" />
          {{ $t('save') }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '../../../../../../../utils'
Vue.use(notification)

export default {
  name: 'GuestDetailEditPage',
  fetchOnServer: false,
  data() {
    return {
      loading: false,
      guest: {},
    }
  },
  async fetch() {
    await this.fetchGuestDetail()
  },
  computed: {
    guestID() {
      return this.$route.params.id
    },
  },
  methods: {
    async fetchGuestDetail() {
      try {
        const params = {
          include: 'tag_histories,conversation_histories,social_channel',
        }
        const { data } = await this.$api.fan.getGuestDetail(
          this.guestID,
          params
        )
        if (data) {
          this.guest = data
        }
      } catch (e) {}
    },
    handleCancel() {
      const query = {
        ...this.$route.query,
      }
      this.$router.push(
        this.localePath({
          path: `/conversations/guest-management/guest/${this.guestID}`,
          query,
        })
      )
    },
    async handleSave() {
      try {
        const isCompleted = await this.$refs.formGuest.handleSave()
        if (isCompleted) {
          const form = { ...this.$refs.formGuest.form }
          const payload = {
            ...(form.phone && { phone: form.phone.trim() }),
            ...(form.email && { email: form.email }),
            ...(form.address && { address: form.address }),
            ...(form.country && { country_id: form.country }),
            province_id: form.province ? form.province : 0,
          }

          const { data } = await this.$api.fan.updateInfoGuest(
            this.guestID,
            payload
          )

          if (data) {
            notification.success({
              message: this.$t('success'),
              class: 'notification-success',
            })
            const query = {
              ...this.$route.query,
            }
            this.$router.push(
              this.localePath({
                path: `/conversations/guest-management/guest/${this.guestID}`,
                query,
              })
            )
          }
        }
      } catch (e) {
        notification.error({
          message: getResponseErrorMessage(e),
          class: 'notification-error',
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.guest-detail-edit-page {
  padding: @padding-40 @padding-24;
  @apply relative h-full;

  &__header {
    @apply flex;

    &--title {
      color: @black;
      font-size: @size-20;
      @apply font-semibold;
    }

    &--edit {
      background-color: @primary-3;
      border: 1px solid @primary;
      border-radius: @border-radius-base;
      color: @primary;
      padding: 0.5rem;
      margin-left: 1rem;
      @apply flex items-center font-medium cursor-pointer;
    }
  }

  &__body {
    margin-top: 1rem;
  }
}

.guest-detail-edit-page-body {
  &__info {
    @apply grid grid-cols-2 gap-4;
  }

  &__conversation {
    margin-top: 1rem;
  }

  &__actions {
    width: 100%;
    left: 0;
    bottom: 0;
    background-color: @white;
    padding: 1rem 1.5rem;
    box-shadow: 8px 0 24px rgba(25, 32, 56, 0.04);
    @apply absolute text-right;
  }
}
</style>
