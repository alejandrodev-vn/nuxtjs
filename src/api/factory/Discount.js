import BaseModel from '@/api/BaseModel'

export default class Discount extends BaseModel {
  getResource() {
    const discounts = 'discounts'
    return {
      discounts,
    }
  }

  async getDiscounts(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().discounts,
      {
        params,
      }
    )
    return { data, meta }
  }

  async getDiscountDetail(id, params) {
    const { data } = await this.$request.$get(
      `${this.getResource().discounts}/${id}`,
      {
        params,
      }
    )
    return { data }
  }

  async checkValidCode(params) {
    const { data } = await this.$request.$get(
      `${this.getResource().discounts}/check-valid-code`,
      {
        params,
      }
    )
    return { data }
  }

  async addDiscount(payload) {
    return await this.$request.$post(this.getResource().discounts, payload)
  }

  async updateDiscount(id, payload) {
    return await this.$request.$put(
      `${this.getResource().discounts}/${id}`,
      payload
    )
  }

  async updateDiscountStatus(id, payload) {
    return await this.$request.$put(
      `${this.getResource().discounts}/${id}/status`,
      payload
    )
  }

  async deleteDiscount(id) {
    return await this.$request.$delete(`${this.getResource().discounts}/${id}`)
  }

  async getExportDiscounts(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().discounts}/exports`,
      {
        params,
      }
    )

    return { data, meta }
  }

  async createExportDiscounts(payload) {
    return await this.$request.$post(
      `${this.getResource().discounts}/exports`,
      payload
    )
  }

  async deleteExportDiscount(id) {
    return await this.$request.$delete(
      `${this.getResource().discounts}/exports/${id}`
    )
  }
}
