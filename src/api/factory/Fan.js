import BaseModel from '@/api/BaseModel'

export default class Fan extends BaseModel {
  getResource() {
    return 'fans'
  }

  async getGuestListConversation(params) {
    const { data, meta } = await this.$request.$get(this.getResource(), {
      params,
    })
    return { data, meta }
  }

  async getInfoGuest(guestId) {
    const { data } = await this.$request.$get(
      `${this.getResource()}/${guestId}`
    )
    return { data }
  }

  async updateInfoGuest(guestId, payload) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/${guestId}`,
      payload
    )
    return { data }
  }

  async unBlockConversation(payload) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/unlock`,
      payload
    )
    return { data }
  }

  async openConversation(fanId) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/${fanId}/opened`
    )
    return { data }
  }

  async seenConversation(payload) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/seen`,
      payload
    )
    return { data }
  }

  async getTagHistories(guestId) {
    const { data } = await this.$request.$get(
      `${this.getResource()}/${guestId}?include=tag_histories`
    )
    return { data }
  }

  async getGuests(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource()}/filters`,
      { params }
    )
    return { data, meta }
  }

  async getGuestDetail(id, params) {
    const { data } = await this.$request.$get(`${this.getResource()}/${id}`, {
      params,
    })
    return { data }
  }

  async getExportGuests(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource()}/exports`,
      {
        params,
      }
    )

    return { data, meta }
  }

  async createExportGuests(payload) {
    return await this.$request.$post(`${this.getResource()}/exports`, payload)
  }

  async deleteExportGuest(id) {
    return await this.$request.$delete(`${this.getResource()}/exports/${id}`)
  }

  async getTotalCountConversation(params) {
    const { data } = await this.$request.$get(
      `${this.getResource()}/total-conversation`,
      { params }
    )
    return { data }
  }
}
