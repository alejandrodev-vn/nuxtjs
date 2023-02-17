<template>
  <div class="header-notfication-item" @click="handleClickItem">
    <div class="header-notfication-item__top">{{ timeNotify }}</div>
    <div class="header-notfication-item__bottom">
      <div
        class="header-notfication-item__bottom__content"
        v-html="contentNofify"
      ></div>
      <div v-if="isUnread" class="header-notfication-item__bottom__mark"></div>
    </div>
  </div>
</template>
<script>
import { invert } from 'lodash'
export default {
  name: 'HeaderNotificationItem',
  props: {
    notify: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    userId() {
      return this.$auth.user.id
    },
    configNotificationsType() {
      return invert(this.$store.state.notify.type)
    },
    typeNotify() {
      return this.configNotificationsType[this.notify?.data?.type]
    },
    isUnread() {
      return !this.notify?.read_at
    },
    contentNofify() {
      return this.notify?.data?.message
    },
    timeNotify() {
      return this.$moment
        .utc(this.notify?.created_at)
        .local()
        .format('HH:mm DD/MM/YYYY')
    },
    enumActionTypes() {
      return {
        EXPORT: 'EXPORT',
        DIRECT: 'DIRECT',
        READ: 'READ',
      }
    },
    typeAction() {
      const actionsExport = [
        'fan_exported_success',
        'conversation_history_exported_success',
        'order_exported_success',
        'discount_exported_success',
        'customer_exported_success',
      ]
      const actionsDirect = [
        'added_page_success',
        'token_expired',
        'created_order_success',
        'delivered_order_success',
        'cancelled_order_success',
        'failed_order_success',
      ]
      const isExport = actionsExport.includes(this.typeNotify)
      if (isExport) return this.enumActionTypes.EXPORT
      const isDirect = actionsDirect.includes(this.typeNotify)
      if (isDirect) return this.enumActionTypes.DIRECT
      return this.enumActionTypes.READ
    },
  },
  methods: {
    async handleClickItem() {
      const updatedItem = {
        ...this.notify,
        read_at: this.$moment().utc().format('YYYY/MM/DD HH:mm:ss'),
      }
      await this.handleReadNotifications()
      this.$emit('update', updatedItem)

      switch (this.typeAction) {
        case this.enumActionTypes.EXPORT: {
          this.handleDownloadFile({
            file_name: updatedItem?.data?.file_name,
            url: updatedItem?.data?.url,
          })
          break
        }
        case this.enumActionTypes.DIRECT: {
          window.open(updatedItem?.data?.url, '_top')
          break
        }
        case this.enumActionTypes.READ: {
          break
        }
        default: {
          break
        }
      }
    },
    async handleReadNotifications() {
      try {
        const payload = {
          status: this.$store.state.notify.status.read,
          ids: [this.notify.id],
        }
        await this.$api.notifications.readNotications(this.userId, payload)
      } catch (e) {}
    },
    handleDownloadFile(file) {
      const fileLink = document.createElement('a')

      fileLink.href = file.url
      fileLink.setAttribute('download', file.file_name)
      document.body.appendChild(fileLink)

      fileLink.click()
    },
  },
}
</script>
<style lang="less" scoped>
.header-notfication-item {
  padding-block: 12px 16px;
  padding-inline: 12px;
  cursor: pointer;
  @apply duration-500 relative;
  &::after {
    content: '';
    position: absolute;
    width: 90%;
    height: 1px;
    background-color: #eff2f8;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  &:hover {
    background-color: @gray-6;
  }
  &__top {
    font-weight: 500;
    font-size: @size-12;
    line-height: @size-16;
    color: #595f90;
    margin-bottom: 10px;
  }
  &__bottom {
    @apply flex items-center justify-between;
    &__content {
      color: @gray-3;
      font-size: @size-12;
      line-height: @size-16;
      margin-right: @margin-12;
      /deep/p {
        margin-bottom: 0;
      }
    }
    &__mark {
      flex-shrink: 0;
      width: 8px;
      height: 8px;
      background-color: @primary;
      border-radius: 50%;
    }
  }
}
</style>
