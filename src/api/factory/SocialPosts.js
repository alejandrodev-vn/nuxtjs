import BaseModel from '@/api/BaseModel'

export default class SocialPosts extends BaseModel {
  getResource() {
    return `/social-posts`
  }

  async getSocialPostList(params) {
    const { data, meta } = await this.$request.$get(this.getResource(), {
      params,
    })
    return { data, meta }
  }

  async getSocialPostDetail(id, params) {
    const { data } = await this.$request.$get(`${this.getResource()}/${id}`, {
      params,
    })
    return { data }
  }
}
