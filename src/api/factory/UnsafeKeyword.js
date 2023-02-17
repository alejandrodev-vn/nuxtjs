import BaseModel from '@/api/BaseModel'

export default class UnsafeKeyword extends BaseModel {
  getResource() {
    return 'disallow-keywords'
  }

  async getListUnsafeKeyword(params) {
    const { data, meta } = await this.$request.$get(this.getResource(), {
      params,
    })
    return { data, meta }
  }

  async createUnsafeKeyword(payload) {
    const { data } = await this.$request.$post(this.getResource(), payload)
    return { data }
  }

  async updateUnsafeKeyword(payload, id) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/${id}`,
      payload
    )
    return { data }
  }

  async deleteUnsafeKeyword(payload) {
    const { data } = await this.$request.$delete(this.getResource(), {
      data: payload,
    })
    return { data }
  }
}
