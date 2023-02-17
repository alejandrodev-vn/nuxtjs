import BaseModel from '@/api/BaseModel'

const conversations = 'conversations'
const response = 'response'
const fb = 'fb'
const ig = 'ig'
const shopee = 'shopee'

export default class Response extends BaseModel {
  async replyFbMessage(conversationId, payload) {
    const { data } = await this.$request.$post(
      `${conversations}/${fb}/${conversationId}/${response}`,
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return { data }
  }

  async replyIGMessage(conversationId, payload) {
    const { data } = await this.$request.$post(
      `${conversations}/${ig}/${conversationId}/${response}`,
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return { data }
  }

  /*
  Reply message Shopee
  @payload
  'to_id' => 'integer|required',
  'actions' => 'array',
  'actions.reply' => 'required|integer|in:1',
  'social_channel_id' => 'integer|required',
  'unsafe_keyword' => 'integer',
  'note' => 'string',
  'order_sn' => 'string',
  'content' => 'present|string',
  'sticker_id' => 'string|required_with:sticker_package_id',
  'sticker_package_id' => 'string|required_with:sticker_id',
  'attachment_url' => 'file|required_if:attachment_type,image',
  'attachment_type' => 'required|' . Rule::in(array_values(config('common.conversations.shopee.reply_type')))
  */
  async replyShopeeMessage(payload) {
    const { data } = await this.$request.$post(
      `${conversations}/${shopee}/${response}`,
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return { data }
  }
}
