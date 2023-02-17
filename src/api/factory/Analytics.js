import BaseModel from '@/api/BaseModel'

export default class Analytics extends BaseModel {
  getResource() {
    const statistics = 'statistics'
    return {
      statistics,
    }
  }

  async getStatistics(params) {
    const { data } = await this.$request.$get(
      `${this.getResource().statistics}`,
      { params }
    )
    return { data }
  }
}
