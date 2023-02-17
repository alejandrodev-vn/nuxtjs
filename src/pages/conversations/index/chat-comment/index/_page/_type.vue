<template>
  <nuxt-child v-if="!$fetchState.pending" :channels="channels"></nuxt-child>
</template>

<script>
import { get } from 'lodash'

export default {
  name: 'ConversationTypePage',
  props: {
    channels: {
      type: Array,
      default: () => [],
    },
  },
  asyncData({ app, redirect, params }) {
    const conversationType = params.type
    if (conversationType !== 'chat' && conversationType !== 'comment') {
      const defaultLocale = app.i18n.defaultLocale
      const locale = app.store.state.i18n.locale
      const pageId = params.page
      const url =
        locale === defaultLocale
          ? `/conversations/chat-comment/${pageId}/chat`
          : `/${locale}/conversations/chat-comment/${pageId}/chat`

      redirect(url)
    }
  },
  fetchOnServer: false,
  data() {
    return {
      total: 0,
      guests: [],
      profileId: '',
      infoPageCheckStatus: null,
    }
  },
  async fetch() {
    // await this.fetchGuests()
    await this.getInfoPageCheckStatus()
    // if (this.guestId) {
    await this.fetchGuestDetail()
    //   await this.fetchConversationsGuest()
    // } else {
    // const primaryGuestId = get(this.guests, '0.id', '') || ''
    // if (primaryGuestId) {
    // const query = {}
    // if (
    //   this.conversationType === 'comment' &&
    //   this.guests[0].social_posts?.social_post_id
    // ) {
    //   query.social_post_id = this.guests[0].social_posts.social_post_id
    // }
    // const path = `/conversations/chat-comment/${this.pageId}/${this.conversationType}`
    // this.handleChangeRoute(path)
    // }
    // }
  },
  computed: {
    pageId() {
      return this.$route.params.page
    },
    conversationType() {
      return this.$route.params.type
    },
    guestId() {
      return this.$route.params.guest
    },
    configConversations() {
      return this.$store.state.configConversations.actions
    },
    isActivePage() {
      return this.infoPageCheckStatus?.status === 1
    },
  },
  watch: {
    pageId() {
      this.$fetch()
    },
    conversationType() {
      this.$fetch()
    },
    guestId() {
      if (this.guestId) {
        this.fetchGuestDetail()
        return
      }
      this.$store.dispatch('updateCurrentInfoFan', null)
    },
    '$route.query.social_post_id'() {
      if (this.guestId) {
        this.fetchGuestDetail()
        return
      }
      this.$store.dispatch('updateCurrentInfoFan', null)
    },
  },
  methods: {
    async getInfoPageCheckStatus() {
      try {
        if (!this.pageId?.length) return
        const { data } = await this.$api.socialChannel.getSocialChannelDetail(
          this.pageId
        )
        if (data) {
          this.$store.dispatch('updateIsActivePage', data.status)
          this.$store.dispatch('updateCurrentInfoPage', data)
          if (
            data.channel_type?.data?.code === 'shopee' &&
            this.conversationType === 'comment'
          ) {
            const path = `/conversations/chat-comment/${this.pageId}/chat/${this.guestId}`
            this.handleChangeRoute(path)
          }
        }
      } catch (e) {}
    },
    async fetchGuests() {
      try {
        const isChat = this.conversationType === 'chat'
        const params = {
          social_channel_id: this.pageId,
          conversation_type: isChat ? 1 : 2,
          page: 1,
          limit: 1,
        }
        const { data, meta } = await this.$api.fan.getGuestListConversation(
          params
        )
        if (data) {
          this.guests = Object.freeze(data)
          this.total = meta.pagination.total_pages
        }
      } catch (e) {}
    },
    async fetchGuestDetail() {
      try {
        if (!this.guestId) return
        const params = {
          ...(this.conversationType === 'comment' && {
            social_post_id: this.$route.query.social_post_id,
          }),
        }
        const { data } = await this.$api.fan.getGuestDetail(
          this.guestId,
          params
        )
        if (data) {
          this.profileId = data.social_profile_id
          this.$store.dispatch('updateCurrentInfoFan', data)
        }
      } catch (e) {}
    },
    async fetchConversationsGuest() {
      try {
        const params = {
          action: this.configConversations.view,
          'filter[social_channel_id]': this.pageId,
          'filter[from_id]': this.profileId,
          'filter[conversation_type]':
            this.conversationType === 'comment' ? 2 : 1,
          sort: '-publish_time',
          page: 1,
          limit: 1,
          ...(this.$route.query.social_post_id &&
            this.conversationType === 'comment' && {
              'filter[social_post_id]': this.socialPostId,
              include: 'social_post',
            }),
        }
        const { data } = await this.$api.conversation.getConversationHistory(
          params
        )
        const conversations = [...data]
        if (!conversations.length) {
          const guestId = get(this.guests, '0.id', '') || ''
          const path = `/conversations/chat-comment/${this.pageId}/${this.conversationType}/${guestId}`
          this.handleChangeRoute(path)
        }
      } catch (e) {}
    },
    handleChangeRoute(route, q) {
      const query = {
        ...this.$route.query,
        ...q,
      }
      this.$router.push(
        this.localePath({
          path: route,
          query,
        })
      )
    },
  },
}
</script>
