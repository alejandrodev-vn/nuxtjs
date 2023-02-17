import BaseModel from '@/api/BaseModel'

export default class Note extends BaseModel {
  getResource() {
    return 'notes'
  }

  async getNoteByGuest(params) {
    const { data, meta } = await this.$request.$get(this.getResource(), {
      params,
    })
    return { data, meta }
  }

  async createNoteByGuest(payload) {
    const { data } = await this.$request.$post(this.getResource(), payload)
    return { data }
  }

  async updateNoteByGuest(fanId, payload) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/${fanId}`,
      payload
    )
    return { data }
  }

  async deleteNoteByGuest(fanId) {
    const { data } = await this.$request.$put(`${this.getResource()}/${fanId}`)
    return { data }
  }
}
