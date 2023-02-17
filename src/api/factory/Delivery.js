import BaseModel from '@/api/BaseModel'

export default class Delivery extends BaseModel {
  getResource() {
    const deliveryProviders = 'delivery-providers'
    const deliveryShops = 'delivery-shops'
    const getShippingFee = 'get-shipping-fee'
    return { deliveryProviders, deliveryShops, getShippingFee }
  }

  async getAllDeliveryProviders(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().deliveryProviders,
      {
        params,
      }
    )
    return { data, meta }
  }

  async getDeliveryShops(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().deliveryShops,
      {
        params,
      }
    )
    return { data, meta }
  }

  async updateDeliveryShops(payload, id) {
    const data = await this.$request.$put(
      `${this.getResource().deliveryShops}/${id}`,
      payload
    )
    return data
  }

  async getShippingFee(payload) {
    const data = await this.$request.$post(
      `${this.getResource().deliveryShops}/${
        this.getResource().getShippingFee
      }`,
      payload
    )
    return data
  }
}
