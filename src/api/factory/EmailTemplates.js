import BaseModel from '@/api/BaseModel'

export default class EmailTemplates extends BaseModel {
  getResource() {
    const emailTemplates = 'email-templates'
    return {
      emailTemplates,
    }
  }

  async getEmailTemplates(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().emailTemplates,
      {
        params,
      }
    )
    return { data, meta }
  }

  async getEmailTemplateDetail(id, params) {
    const { data } = await this.$request.$get(
      `${this.getResource().emailTemplates}/${id}`,
      {
        params,
      }
    )
    return { data }
  }

  async updateEmailTemplate(id, payload) {
    return await this.$request.$put(
      `${this.getResource().emailTemplates}/${id}`,
      payload
    )
  }

  async updateEmailTemplateLanguage(payload) {
    return await this.$request.$put(
      `${this.getResource().emailTemplates}/default-language`,
      payload
    )
  }

  async updateEmailTemplateStatus(id, payload) {
    return await this.$request.$put(
      `${this.getResource().emailTemplates}/${id}/status`,
      payload
    )
  }
}
