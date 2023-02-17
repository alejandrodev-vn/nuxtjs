import BaseModel from '@/api/BaseModel'

export default class Customer extends BaseModel {
  getResource() {
    const customers = 'customers'
    const ranks = 'ranks'
    return {
      customers,
      ranks,
    }
  }

  async getCustomers(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().customers,
      { params }
    )
    return { data, meta }
  }

  async getCustomerDetail(id, params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().customers}/${id}`,
      { params }
    )
    return { data, meta }
  }

  async updateCustomer(id, payload) {
    const { data } = await this.$request.$put(
      `${this.getResource().customers}/${id}`,
      payload
    )
    return { data }
  }

  async getExportCustomers(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().customers}/exports`,
      {
        params,
      }
    )

    return { data, meta }
  }

  async createExportCustomers(payload) {
    return await this.$request.$post(
      `${this.getResource().customers}/exports`,
      payload
    )
  }

  async deleteExportCustomer(id) {
    return await this.$request.$delete(
      `${this.getResource().customers}/exports/${id}`
    )
  }

  async getRanks(params) {
    const { data } = await this.$request.$get(this.getResource().ranks, {
      params,
    })
    return { data }
  }

  async getStatisticTotalOrder(id, params) {
    const { data } = await this.$request.$get(
      `${this.getResource().customers}/${id}/order-statistic`,
      { params }
    )
    return { data }
  }

  async getStatisticTotalSpending(id, params) {
    const { data } = await this.$request.$get(
      `${this.getResource().customers}/${id}/spend-total`,
      { params }
    )
    return { data }
  }
}
