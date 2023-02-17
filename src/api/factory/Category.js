import BaseModel from '@/api/BaseModel'

export default class Category extends BaseModel {
  getResource() {
    const categories = 'categories'
    return {
      categories,
    }
  }

  async getCategoriesList(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().categories,
      { params }
    )
    return { data, meta }
  }
}
