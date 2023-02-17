<template>
  <div class="customer-detail-note">
    <span class="customer-detail-note__title">{{ $t('note') }}: </span>
    <a-textarea
      v-model="note"
      class="customer-detail-note__input-textarea"
      :placeholder="$t('placeholder-note-customer')"
      :auto-size="{ minRows: 1, maxRows: 3 }"
    />
  </div>
</template>
<script>
import Vue from 'vue'
import { debounce } from 'lodash'
import { notification } from 'ant-design-vue'
import { getResponseErrorMessage } from '@/utils'
Vue.use(notification)
export default {
  name: 'CustomerDetailNote',
  props: {
    customer: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      note: ``,
    }
  },
  watch: {
    note: {
      handler: debounce(function () {
        this.handleUpdateCustomer()
      }, 2000),
    },
  },
  created() {
    if (this.customer?.note?.length) this.note = this.customer.note
  },
  methods: {
    async handleUpdateCustomer() {
      try {
        if (this.note === this.customer?.note || !this.customer.id) return
        const payload = {
          note: this.note,
        }
        const { data } = await this.$api.customer.updateCustomer(
          this.customer.id,
          payload
        )
        if (data) {
          notification.success({
            message: this.$t('updated-notes-successfully'),
            class: 'notification-success',
          })
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
.customer-detail-note {
  background-color: @primary-3;
  border-radius: 8px;
  padding: 14px 16px;

  @apply flex;
  &__title {
    color: @black;
    @apply font-medium mr-2;
  }
  &__input-textarea {
    border: none;
    background-color: transparent;
    color: @black;
    box-shadow: none;
    padding: 0;
  }
}
</style>
