import BaseModel from '@/api/BaseModel'

export default class Keyword extends BaseModel {
  getResource() {
    return 'keywords'
  }

  async getListKeyword(params) {
    const { data, meta } = await this.$request.$get(this.getResource(), {
      params,
    })
    return { data, meta }
  }

  async createKeyword(payload) {
    const { data } = await this.$request.$post(this.getResource(), payload)
    return { data }
  }

  async updateKeyword(payload, id) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/${id}`,
      payload
    )
    return { data }
  }

  async deleteKeyword(payload) {
    const { data } = await this.$request.$delete(this.getResource(), {
      data: payload,
    })
    return { data }
  }
}
