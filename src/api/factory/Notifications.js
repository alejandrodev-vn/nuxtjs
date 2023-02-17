import BaseModel from '@/api/BaseModel'

export default class Notifications extends BaseModel {
  getResource() {
    const users = 'users'
    const notifications = 'notifications'
    const markAllAsRead = 'mark-all-as-read'
    return {
      notifications,
      users,
      markAllAsRead,
    }
  }

  async getNotifications(userId, params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().users}/${userId}/${
        this.getResource().notifications
      }`,
      { params }
    )
    return { data, meta }
  }

  async readNotications(userId, payload) {
    const { data } = await this.$request.$put(
      `${this.getResource().users}/${userId}/${
        this.getResource().notifications
      }`,
      payload
    )
    return { data }
  }

  async readAllNotications(userId, payload = {}) {
    const { data } = await this.$request.$put(
      `${this.getResource().users}/${userId}/${
        this.getResource().notifications
      }/${this.getResource().markAllAsRead}`,
      payload
    )
    return { data }
  }
}
