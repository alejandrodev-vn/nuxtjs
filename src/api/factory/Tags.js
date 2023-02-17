import BaseModel from '@/api/BaseModel'

export default class Tags extends BaseModel {
  getResource() {
    return `tags`
  }

  async getAllTags(params) {
    const { data } = await this.$request.$get(`${this.getResource()}`, {
      params,
    })
    return { data }
  }

  async getTagsChildren(id, params) {
    const { data } = await this.$request.$get(`${this.getResource()}/${id}`, {
      params,
    })
    return { data }
  }

  async getTagDetail(id, params) {
    const { data } = await this.$request.$get(
      `${this.getResource()}/${id}/children`,
      {
        params,
      }
    )
    return data
  }

  async getLastInteractiveTag() {
    const { data } = await this.$request.$get(
      `${this.getResource()}/last-interactive-information`
    )
    return { data }
  }

  async createTag(payload) {
    const { data } = await this.$request.$post(this.getResource(), payload)
    return { data }
  }

  async updateTag(payload, id) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/${id}`,
      payload
    )
    return { data }
  }

  async deleteTag(id) {
    const { data } = await this.$request.$delete(`${this.getResource()}/${id}`)
    return { data }
  }

  async hideTag(id) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/${id}/hide`
    )
    return { data }
  }

  async unhideTag(id) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/${id}/unhide`
    )
    return { data }
  }
}
