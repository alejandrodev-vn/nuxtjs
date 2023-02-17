import BaseModel from '@/api/BaseModel'

export default class ResponseTemplate extends BaseModel {
  getResource() {
    const responseTemplate = 'response-templates'
    const suggestion = 'suggestion'
    return {
      responseTemplate,
      suggestion,
    }
  }

  async getSuggestion(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().responseTemplate}/${this.getResource().suggestion}`,
      { params }
    )
    return { data, meta }
  }

  async getResponseTemplatesByFilter(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().responseTemplate}`,
      { params }
    )
    return { data, meta }
  }

  async createTemplate(payload) {
    const { data } = await this.$request.$post(
      this.getResource().responseTemplate,
      payload
    )
    return { data }
  }

  async updateTemplate(payload, id) {
    const { data } = await this.$request.$put(
      `${this.getResource().responseTemplate}/${id}`,
      payload
    )
    return { data }
  }

  async deleteTemplate(payload) {
    const { data } = await this.$request.$delete(
      this.getResource().responseTemplate,
      {
        data: payload,
      }
    )
    return { data }
  }
}
