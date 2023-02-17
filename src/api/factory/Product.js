import BaseModel from '@/api/BaseModel'

export default class Product extends BaseModel {
  getResource() {
    const products = 'products'
    const productSkus = 'product_skus'
    return {
      products,
      productSkus,
    }
  }

  async getProductsList(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().products,
      { params }
    )
    return { data, meta }
  }

  async getProductDetail(id, params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().products}/${id}`,
      { params }
    )
    return { data, meta }
  }
}
