import BaseModel from '@/api/BaseModel'

export default class Level extends BaseModel {
  getResource() {
    const levels = 'guest-levels'
    return {
      levels,
    }
  }

  async getLevels(params) {
    const { data } = await this.$request.$get(this.getResource().levels, {
      params,
    })
    return { data }
  }

  async updateLevels(payload) {
    return await this.$request.$put(this.getResource().levels, payload)
  }

  async addLevels() {
    return await this.$request.$post(this.getResource().levels)
  }
}
