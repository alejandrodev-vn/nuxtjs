import BaseModel from '@/api/BaseModel'

export default class User extends BaseModel {
  getResource() {
    const users = 'users'
    const members = 'members'
    return {
      users,
      members,
    }
  }

  async getStaffs(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().users}`,
      {
        params,
      }
    )
    return { data, meta }
  }

  async getUserMe(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().users}/me`,
      {
        params,
      }
    )
    return { data, meta }
  }

  async getStaffDetail(id, params) {
    const { data } = await this.$request.$get(
      `${this.getResource().users}/${id}`,
      {
        params,
      }
    )
    return { data }
  }

  async addStaff(payload) {
    return await this.$request.$post(
      `${this.getResource().users}/invite-member`,
      payload
    )
  }

  async reAddStaff(id, payload) {
    return await this.$request.$post(
      `${this.getResource().users}/${id}/resend-invite`,
      payload
    )
  }

  async updateStaff(id, payload) {
    return await this.$request.$put(
      `${this.getResource().users}/members/${id}`,
      payload
    )
  }

  async updateUser(id, payload) {
    return await this.$request.$post(
      `${this.getResource().users}/${id}`,
      payload
    )
  }

  async updateUserPassword(payload) {
    return await this.$request.$put(
      `${this.getResource().users}/change-password`,
      payload
    )
  }

  async deleteStaffs(payload) {
    return await this.$request.$delete(`${this.getResource().users}/members`, {
      data: payload,
    })
  }

  async checkTokenVerifyAccount(params) {
    const { data } = await this.$request.$get(`check-account-verify-token`, {
      params,
    })
    return { data }
  }
}
