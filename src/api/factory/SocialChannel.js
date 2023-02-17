import BaseModel from '@/api/BaseModel'

export default class SocialChannel extends BaseModel {
  getResource() {
    const socialChannels = 'social-channels'
    const socialChannelUsers = 'social-channel-users'
    const callbackUrl = `${process.env.DOMAIN_CRM}callback`
    return {
      socialChannels,
      socialChannelUsers,
      callbackUrl,
    }
  }

  async getSocialChannels(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().socialChannels,
      { params }
    )
    return { data, meta }
  }

  async getSocialChannelsByUser(params) {
    const { data, meta } = await this.$request.$get(
      `${this.getResource().socialChannels}/by-user`,
      { params }
    )
    return { data, meta }
  }

  async getSocialChannelUsers(params) {
    const { data, meta } = await this.$request.$get(
      this.getResource().socialChannelUsers,
      { params }
    )
    return { data, meta }
  }

  async addChannelAccount(url, auth, channel) {
    const callbackUrl = `${this.getResource().callbackUrl}/${channel}`
    const { data } = await this.$request.$get(
      `${
        this.getResource().socialChannels
      }/${channel}/url-login?redirect_uri=${callbackUrl}`
    )

    return (
      callbackUrl +
      '?loginUrl=' +
      btoa(data.url_login) +
      '&redirecUrl=' +
      btoa(url) +
      '&auth=' +
      btoa(auth)
    )
  }

  async insertChannelAccount(code, auth, channel) {
    const callbackUrl = `${this.getResource().callbackUrl}/${channel}`
    const { data } = await this.$request.post(
      `${this.getResource().socialChannels}/${channel}/insert-used-channel`,
      {
        code,
        redirect_url: callbackUrl,
      },
      {
        headers: {
          Authorization: auth,
        },
      }
    )
    return data
  }

  async insertChannel(id, auth, channel) {
    const { data } = await this.$request.$post(
      `${this.getResource().socialChannels}/${channel}/${id}/add-pages`,
      {
        headers: {
          Authorization: auth,
        },
      }
    )
    return data
  }

  async insertChannelShopee(code, shop_id, auth, channel) {
    const { data } = await this.$request.$post(
      `${this.getResource().socialChannels}/${channel}/add-pages`,
      {
        code,
        shop_id,
      },
      {
        headers: {
          Authorization: auth,
        },
      }
    )
    return data
  }

  async startHandlePage(payload, channel) {
    const { data } = await this.$request.$post(
      `${this.getResource().socialChannels}/${channel}/start-handle`,
      payload
    )
    return data
  }

  async stopHandlePage(id, channel) {
    const { data } = await this.$request.$put(
      `${this.getResource().socialChannels}/${channel}/stop-handle/${id}`,
      {
        status: 0,
      }
    )
    return data
  }

  async startHandleShopee(payload, channel) {
    const { data } = await this.$request.$put(
      `${this.getResource().socialChannels}/${channel}/start-handle`,
      payload
    )
    return data
  }

  async deleteSocialChannels(payload) {
    return await this.$request.$delete(
      `${this.getResource().socialChannels}/destroy`,
      { data: payload }
    )
  }

  async getSocialChannelDetail(id) {
    const { data } = await this.$request.$get(
      `${this.getResource().socialChannels}/${id}`
    )
    return { data }
  }

  async addPostConfig(channelId, payload) {
    const url = `${this.getResource().socialChannels}/${channelId}/add-post`
    const { data } = await this.$request.post(url, payload)
    return data
  }

  async setupConfigPage(channelId, payload) {
    const url = `${this.getResource().socialChannels}/${channelId}/setup`
    const { data } = await this.$request.put(url, payload)
    return data
  }
}
