import BaseModel from '@/api/BaseModel'

export default class OrderForm extends BaseModel {
  getResource() {
    const orderForms = 'orders/order-forms'
    const checkValidOrderForm = 'orders/order-forms/check-valid-order-form'
    return {
      orderForms,
      checkValidOrderForm,
    }
  }

  async getOrderForms(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().orderForms}`,
      {
        params,
      }
    )
    return { data, meta }
  }

  async getOrderFormDetail(id) {
    const { data } = await this.$request.$get(
      `${this.getResource().orderForms}/${id}`
    )
    return { data }
  }

  async checkValidOrderForm(payload) {
    const { data } = await this.$request.$post(
      `${this.getResource().checkValidOrderForm}`,
      payload
    )
    return { data }
  }

  async getOrderFormByShortTitle(shortTitle) {
    const { data } = await this.$request.$get(shortTitle)
    return { data }
  }

  async createOrderForm(payload) {
    const { data } = await this.$request.$post(
      `${this.getResource().orderForms}`,
      payload
    )
    return { data }
  }

  async updateOrderForm(id, payload) {
    const { data } = await this.$request.$put(
      `${this.getResource().orderForms}/${id}`,
      payload
    )
    return { data }
  }
}
