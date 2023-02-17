import BaseModel from '@/api/BaseModel'

const currentTags = 'current-tags'
const attach = 'attach-fan'
const update = 'update-fan'
const detach = 'detach-fan'

export default class TagsGuest extends BaseModel {
  getResource() {
    return 'tags'
  }

  async getCurrentTags(params) {
    const { data } = await this.$request.$get(
      `${this.getResource()}/${currentTags}`,
      {
        params,
      }
    )
    return { data }
  }

  async addTagsToGuest(payload) {
    const { data } = await this.$request.$post(
      `${this.getResource()}/${attach}`,
      payload
    )
    return { data }
  }

  async updateTagsToGuest(payload) {
    const { data } = await this.$request.$put(
      `${this.getResource()}/${update}`,
      payload
    )
    return { data }
  }

  async deleteTagsToGuest(payload) {
    const { data } = await this.$request.$delete(
      `${this.getResource()}/${detach}`,
      { data: payload }
    )
    return { data }
  }
}
