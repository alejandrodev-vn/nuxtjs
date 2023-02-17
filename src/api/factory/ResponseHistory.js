import BaseModel from '@/api/BaseModel'

export default class ResponseHistory extends BaseModel {
  getResource() {
    return {
      responseHistory: 'conversations/response-histories',
      agencyResponseHistory: 'agency/conversation_histories',
    }
  }

  async getResponseHistory(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().responseHistory,
      {
        params,
      }
    )
    return { data, meta }
  }

  async getAgencyResponseHistory(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().agencyResponseHistory,
      {
        params,
      }
    )
    return { data, meta }
  }

  async getAgencyResponseHistoryDetail(id, params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().agencyResponseHistory}/${id}`,
      {
        params,
      }
    )
    return { data, meta }
  }

  async createExportAgencyResponseHistory(payload) {
    return await this.$request.$post(
      `${this.getResource().agencyResponseHistory}/exports`,
      payload
    )
  }

  async getExportResponseHistory(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().agencyResponseHistory}/exports`,
      {
        params,
      }
    )

    return { data, meta }
  }

  async deleteExportResponseHistory(id) {
    return await this.$request.$delete(
      `${this.getResource().agencyResponseHistory}/exports/${id}`
    )
  }
}
