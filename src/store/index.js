/**
 * State
 */
export const state = () => {
  return {
    // config: {},
    protocol: 'http://',
    limit: 30,
    content_type: {
      text: 1,
      photo: 2,
      sticker: 3,
      video: 4,
      link: 5,
      event: 6,
      emoji: 7,
      file: 8,
      gif: 9,
      unknown: 10,
      audio: 11,
      voice: 12,
      contacts: 13,
      location: 14,
      order: 15,
      offer: 16,
      item: 17,
    },
    keyword: {
      status: {
        unpublish: 0,
        publish: 1,
      },
    },
    tag: {
      status: {
        hide: 0,
        unhide: 1,
      },
    },
    shopee: {
      replyType: {
        text: 'text',
        image: 'image',
        sticker: 'sticker',
        item: 'item',
        order: 'order',
      },
      region: {
        vn: 'vn',
        my: 'my',
        sg: 'sg',
      },
    },
    enumTemplateType: {
      HAS_KEYWORD: 'HAS_KEYWORD',
      IS_KEYWORD: 'IS_KEYWORD',
    },
    notify: {
      type: {
        added_page_success: 1,
        token_expired: 2,
        created_order_success: 3,
        delivered_order_success: 4,
        cancelled_order_success: 5,
        fan_exported_success: 6,
        conversation_history_exported_success: 7,
        order_exported_success: 8,
        discount_exported_success: 9,
        customer_exported_success: 10,
        failed_order_success: 11,
        assigned_page_success: 12,
      },
      status: {
        read: 1,
        unread: 2,
      },
    },
    configPaymentMethod: {
      type: {
        cod: 1,
        bank_transfer: 2,
      },
    },
    configDelivery: {
      shipping_fee_method: {
        fixed: 1,
        dynamic: 2,
      },
      type: {
        self_delivery: 'self_delivery',
        ghn: 'ghn',
        jnt: 'jnt',
        gdex: 'gdex',
      },
    },
    configCurrency: {
      en: {
        currency: 'USD',
        symbol: '$',
      },
      vi: {
        currency: 'VND',
        symbol: '₫',
      },
      my: {
        currency: 'MYR',
        symbol: 'RM',
      },
    },
    configConversations: {
      type: {
        chat: 1,
        comment: 2,
        reply: 4,
      },
      typeString: {
        chat: 'chat',
        comment: 'comment',
        reply: 'reply',
      },
      actions: {
        reply: 1,
        view: 2,
      },
      content_type: {
        text: 1,
        photo: 2,
        sticker: 3,
        video: 4,
        link: 5,
        event: 6,
        emoji: 7,
        file: 8,
        gif: 9,
        unknown: 10,
        audio: 11,
        voice: 12,
        contacts: 13,
        location: 14,
      },
      status: {
        failed: 0,
        opening: 1,
        answered_escalate: 2,
        direct_skip: 3,
        escalate_skip: 4,
        direct_response: 5,
        escalate_response: 6,
        waiting_escalate: 7,
        waiting_process: 8,
        send_private_message: 9,
      },
      sentiment: {
        positive: 1,
        neutral: 2,
        negative: 3,
      },
      action_type: {
        open_response_box: 1,
        direct_skip: 2,
        escalate_skip: 3,
        direct_response: 4,
        escalated: 5,
        escalate_response: 6,
        open_escalate_box: 7,
        answer_escalate: 8,
        created: 9,
        send_private_message: 10,
      },
    },
    gender: {
      male: 1,
      female: 2,
    },
    channel: {
      facebook: 1,
      instagram: 5,
      shopee: 7,
    },
    level: {
      awareness: 1,
      consideration: 2,
      convert: 3,
      loyalty: 4,
      advocacy: 5,
    },
    levelColor: {
      awareness: 'primary',
      consideration: 'success',
      convert: 'warning',
      loyalty: 'violet',
      advocacy: 'advanced',
    },
    discountTypes: {
      'percentage-discount': 1,
      'fixed-value-discount': 2,
    },
    discountStatus: {
      deactive: 0,
      active: 1,
      expired: 2,
    },
    discountUsageLimits: {
      unlimited: 0,
      limited: 1,
    },
    orderStatus: {
      unpaid: 1,
      pending: 2,
      'ready-to-ship': 3,
      shipping: 4,
      delivered: 5,
      canceled: 6,
      returned: 7,
      failed: 8,
      others: 9,
    },
    orderStatusColor: {
      unpaid: '#5b84ff',
      pending: '#5b84ff',
      'ready-to-ship': '#5b84ff',
      shipping: '#5b84ff',
      delivered: '#63f2dd',
      canceled: '#a7c8e9',
      returned: '#a7c8e9',
      failed: '#a7c8e9',
      others: '#a7c8e9',
    },
    customerRank: {
      bronze: 1,
      silver: 2,
      gold: 3,
      diamond: 4,
    },
    paymentType: {
      cod: 1,
      'bank-transfer': 2,
    },
    deliveryMethod: {
      'self-delivery': 1,
      'provider-delivery': 2,
    },
    shippingFeeMethod: {
      fixed: 1,
      dynamic: 2,
    },
    shippingFeeConfig: {
      fixed: 1,
      custom: 2,
    },
    deliveryStatus: {
      already: 1,
      yet: 0,
    },
    emailTemplateType: {
      'order-confirmation': 1,
      'canceled-order': 2,
      'delivered-order': 3,
      'failed-order': 4,
    },
    configResponseTemplate: {
      type: {
        normal: 1,
        'auto-suggestion': 2,
        'auto-response': 3,
      },
    },
    configChannel: {
      token_status: {
        active: 1,
        deactive: 2,
      },
      manual_data_type: {
        get_by_post_id: 0,
        get_all_post: 1,
      },
      posts_status: {
        unhandle: 0,
        handle: 1,
        unknown: 2,
      },
      status: {
        handle: 1,
        unhandle: 0,
      },
    },
    sidebarCollapsed: false,
    conversationCollapsed: true,
    conversationType: true,
    currentSocialChannelId: null,
    currentSocialProfileId: 0,
    currentFanId: 0,
    filterGuestListConversation: {
      socialPostId: '',
      conversationDateFrom: null,
      conversationDateTo: null,
      blockStatus: '',
      currentTags: null,
    },
    viewResponseId: null,
    currentInfoFan: null,
    isActivePage: 0,
    unsafeKeywords: [],
    currentInfoPage: null,
  }
}

/**
 * Getters
 */
export const getters = {
  // config: (state) => state.config,
  protocol: (state) => state.protocol,
  limit: (state) => state.limit,
  gender: (state) => state.gender,
  channel: (state) => state.channel,
  level: (state) => state.level,
  levelColor: (state) => state.levelColor,
  discountTypes: (state) => state.discountTypes,
  discountStatus: (state) => state.discountStatus,
  discountUsageLimits: (state) => state.discountUsageLimits,
  orderStatus: (state) => state.orderStatus,
  customerRank: (state) => state.customerRank,
  paymentType: (state) => state.paymentType,
  sidebarCollapsed: (state) => state.sidebarCollapsed,
  conversationCollapsed: (state) => state.conversationCollapsed,
  conversationType: (state) => state.conversationType,
  currentSocialChannelId: (state) => state.currentSocialChannelId,
  currentSocialProfileId: (state) => state.currentSocialProfileId,
  currentFanId: (state) => state.currentFanId,
  filterGuestListConversation: (state) => state.filterGuestListConversation,
  viewResponseId: (state) => state.viewResponseId,
  currentInfoFan: (state) => state.currentInfoFan,
  isActivePage: (state) => state.isActivePage,
  unsafeKeywords: (state) => state.unsafeKeywords,
  currentInfoPage: (state) => state.currentInfoPage,
}

/**
 * Mutations
 */
export const mutations = {
  // SET_CONFIG: (state, payload) => {
  //   state.config = payload
  // },
  SET_SIDEBAR_COLLAPSED: (state, payload) => {
    state.sidebarCollapsed = payload
  },
  SET_CONVERSATION_COLLAPSED: (state, payload) => {
    state.conversationCollapsed = payload
  },
  SET_CONVERSATION_TYPE: (state, payload) => {
    state.conversationType = payload
  },
  SET_CURRENT_SOCIAL_CHANNEL_ID: (state, payload) => {
    state.currentSocialChannelId = payload
  },
  SET_CURRENT_SOCIAL_PROFILE_ID: (state, payload) => {
    state.currentSocialProfileId = payload
  },
  SET_CURRENT_FAN_ID: (state, payload) => {
    state.currentFanId = payload
  },
  SET_FILTER_GUEST_LIST_CONVERSATION: (state, payload) => {
    state.filterGuestListConversation = payload
  },
  SET_VIEW_RESPONSE_ID: (state, payload) => {
    state.viewResponseId = payload
  },
  SET_CURRENT_INFO_FAN: (state, payload) => {
    state.currentInfoFan = payload
  },
  SET_IS_ACTIVE_PAGE: (state, payload) => {
    state.isActivePage = payload
  },
  SET_UNSAFE_KEYWORD: (state, payload) => {
    state.unsafeKeywords = payload
  },
  SET_CURRENT_INFO_PAGE: (state, payload) => {
    state.currentInfoPage = payload
  },
}

/**
 * Actions
 */
export const actions = {
  // async nuxtServerInit({ dispatch }) {
  //   await dispatch('fetchConfig')
  // },
  // async fetchConfig({ commit }) {
  //   try {
  //     const { users } = await this.$axios.$get('common/get-common-config')

  //     commit('SET_CONFIG', users || {})
  //   } catch (e) {}
  // },
  updateSidebarCollapsed({ commit }, collapsed) {
    commit('SET_SIDEBAR_COLLAPSED', collapsed)
  },
  updateConversationCollapsed({ commit }, collapsed) {
    commit('SET_CONVERSATION_COLLAPSED', collapsed)
  },
  updateConversationType({ commit }, type) {
    commit('SET_CONVERSATION_TYPE', type)
  },
  updateCurrentSocialChannelId({ commit }, socialChannelId) {
    commit('SET_CURRENT_SOCIAL_CHANNEL_ID', socialChannelId)
  },
  updateCurrentSocialProfileId({ commit }, socialProfileId) {
    commit('SET_CURRENT_SOCIAL_PROFILE_ID', socialProfileId)
  },
  updateCurrentFanId({ commit }, fanId) {
    commit('SET_CURRENT_FAN_ID', fanId)
  },
  updateFilterGuestListConversation({ commit }, filter) {
    commit('SET_FILTER_GUEST_LIST_CONVERSATION', filter)
  },
  updateViewResponseId({ commit }, response) {
    commit('SET_VIEW_RESPONSE_ID', response)
  },
  updateCurrentInfoFan({ commit }, fan) {
    commit('SET_CURRENT_INFO_FAN', fan)
  },
  updateIsActivePage({ commit }, status) {
    commit('SET_IS_ACTIVE_PAGE', status)
  },
  updateUnsafeKeywords({ commit }, payload) {
    commit('SET_UNSAFE_KEYWORD', payload)
  },
  updateCurrentInfoPage({ commit }, payload) {
    commit('SET_CURRENT_INFO_PAGE', payload)
  },
}
