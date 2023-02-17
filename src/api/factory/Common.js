import BaseModel from '@/api/BaseModel'

export default class Common extends BaseModel {
  getResource() {
    const faqs = 'faqs'
    return {
      faqs,
    }
  }

  async getFaqs(params) {
    const { data } = await this.$request.$get(this.getResource().faqs, {
      params,
    })
    return { data }
  }
}
