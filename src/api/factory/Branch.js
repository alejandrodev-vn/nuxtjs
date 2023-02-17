import BaseModel from '@/api/BaseModel'

export default class Branch extends BaseModel {
  getResource() {
    const branches = 'branches'
    return {
      branches,
    }
  }

  async getBranchesList(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().branches,
      { params }
    )
    return { data, meta }
  }
}
