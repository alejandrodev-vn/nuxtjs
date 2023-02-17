import BaseModel from '@/api/BaseModel'

export default class Conversation extends BaseModel {
  getResource() {
    const conversationHistory = 'conversation_history'
    const conversations = 'conversations'
    return {
      conversationHistory,
      conversations,
    }
  }

  async getConversationHistory(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().conversationHistory,
      { params }
    )
    return { data, meta }
  }

  async getConversationByGuest(params) {
    const { data } = await this.$request.$get(
      this.getResource().conversations,
      { params }
    )
    return { data }
  }

  async getExportResponseHistory(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().conversations}/response-histories/exports`,
      {
        params,
      }
    )

    return { data, meta }
  }

  async createExportResponseHistory(payload) {
    return await this.$request.$post(
      `${this.getResource().conversations}/response-histories/exports`,
      payload
    )
  }

  async deleteExportResponseHistory(id) {
    return await this.$request.$delete(
      `${this.getResource().conversations}/response-histories/exports/${id}`
    )
  }

  async updateConversation(id, payload) {
    const { data } = await this.$request.$put(
      `${this.getResource().conversations}/${id}`,
      payload
    )
    return { data }
  }

  async deleteConversation(payload) {
    return await this.$request.$delete(`${this.getResource().conversations}`, {
      data: payload,
    })
  }

  async sendMessage(channel, id, payload) {
    const { data } = await this.$request.$put(
      `${this.getResource().conversations}/${channel}/${id}/send-message`,
      payload
    )
    return { data }
  }

  async getShopeeStickers(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().conversations}/shopee/stickers`,
      { params }
    )
    return { data, meta }
  }

  async addTagToConversation(conversationId, payload) {
    const { data } = await this.$request.$post(
      `${this.getResource().conversations}/${conversationId}/tags`,
      payload
    )
    return { data }
  }

  async skipConversationFb(conversationId, payload) {
    const { data } = await this.$request.$put(
      `${this.getResource().conversations}/fb/${conversationId}/skip`,
      payload
    )
    return { data }
  }

  async escalateConversationFb(conversationId, payload) {
    const { data } = await this.$request.$put(
      `${this.getResource().conversations}/fb/${conversationId}/escalate`,
      payload
    )
    return { data }
  }
}
