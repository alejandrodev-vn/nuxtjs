import BaseModel from '@/api/BaseModel'

export default class Setting extends BaseModel {
  getResource() {
    const setting = 'settings'
    return {
      setting,
    }
  }

  async getCompany() {
    const { data } = await this.$request.$get(
      `${this.getResource().setting}/company`
    )
    return { data }
  }
}
