import BaseModel from '@/api/BaseModel'

export default class Order extends BaseModel {
  getResource() {
    const orders = 'orders'
    const syncForDistribution = 'sync-for-distribution'
    return {
      orders,
      syncForDistribution,
    }
  }

  async getOrders(params) {
    const { data, meta } = await this.$request.$get(this.getResource().orders, {
      params,
    })
    return { data, meta }
  }

  async getOrderDetail(id, params) {
    const { data } = await this.$request.$get(
      `${this.getResource().orders}/${id}`,
      {
        params,
      }
    )
    return { data }
  }

  async getExportOrders(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().orders}/exports`,
      {
        params,
      }
    )

    return { data, meta }
  }

  async createExportOrders(payload) {
    return await this.$request.$post(
      `${this.getResource().orders}/exports`,
      payload
    )
  }

  async deleteExportOrder(id) {
    return await this.$request.$delete(
      `${this.getResource().orders}/exports/${id}`
    )
  }

  async createOrder(payload) {
    const { data } = await this.$request.$post(
      `${this.getResource().orders}`,
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return { data }
  }

  async syncOrderForDistribution(payload) {
    return await this.$request.$post(
      `${this.getResource().orders}/${this.getResource().syncForDistribution}`,
      payload
    )
  }
}
