<template>
  <div class="post">
    <!-- <render-iframe-post
      v-if="linkSocialPost"
      :link="linkSocialPost"
      :code-social="codeSocial"
    /> -->
    <div class="post-head">
      <div class="post-head__left">
        <div class="avatar-page">
          <app-avatar
            :image="infoPage.avatar"
            :full-name="infoPage.name"
            :size="44"
          />
        </div>
        <div class="info-post">
          <p class="info-post__post-id" @click="handleCopyPostId">
            {{ $t('postId') }}:
            <span class="cursor-pointer">{{ post.social_id }}</span>
          </p>
          <span class="info-post__time">
            {{
              $moment
                .utc(post.published_date)
                .local()
                .locale(locale)
                .format('LLLL')
            }}
          </span>
        </div>
      </div>
      <div class="post-head__right">
        <div class="btn-link" @click="handleLinkToPost">
          <icon-link-to />
        </div>
      </div>
    </div>
    <div class="post-content">
      <p class="post-content__description" v-html="post.full_description"></p>
      <div v-if="thumbnailImage" class="post-content__thumbnail-img">
        <img
          :src="thumbnailImage"
          :alt="post.social_id"
          @click="handlePreviewImage"
        />
      </div>
      <a-modal
        v-model="visiblePreviewImage"
        centered
        :closable="false"
        :footer="null"
        destroy-on-close
      >
        <img :src="thumbnailImage" class="mx-auto" :alt="post.social_id" />
      </a-modal>
    </div>
    <div class="post-comments">
      <!-- <template v-if="isViewComment"> -->
      <comment-guest
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :info-page="infoPage"
        :avatar-guest="infoFan.avatar"
        :active-comment-id="activeCommentId"
        :post="post"
        :keywords="keywords"
        @handleCancelReplyComment="handleCancelReplyComment"
        @handleClickReplyComment="handleClickReplyComment"
      />
      <!-- </template> -->
      <!-- <template v-else>
        <comment-guest
          :key="comments[0].id"
          :comment="comments[0]"
          :info-page="infoPage"
          :is-first="true"
          :avatar-guest="infoFan.avatar"
          :active-comment-id="activeCommentId"
          :post="post"
          :keywords="keywords"
          @handleCancelReplyComment="handleCancelReplyComment"
          @handleClickReplyComment="handleClickReplyComment"
        />
      </template> -->
      <app-loading v-if="isLoading" />
      <span
        v-if="totalComment > comments.length"
        class="post-comments__expand"
        @click="handleSeeMoreComment"
      >
        {{ statusViewComment }}
        <a-icon v-if="isLoading" class="ml-2" type="loading" />
      </span>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { notification } from 'ant-design-vue'
Vue.use(notification)

export default {
  name: 'CommentPost',
  props: {
    post: {
      type: Object,
      default: () => {},
    },
    comments: {
      type: Array,
      default: () => [],
    },
    activeCommentId: {
      type: Number,
      default: 0,
    },
    totalComment: {
      type: Number,
      default: 1,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    keywords: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isViewComment: false,
      thumbnailImage: null,
      visiblePreviewImage: false,
    }
  },
  computed: {
    locale() {
      return this.$i18n.locale
    },
    isCollapsed() {
      return this.$store.state.conversationCollapsed
    },
    infoFan() {
      return this.$store.state.currentInfoFan
    },
    infoPage() {
      return this.$store.state.currentInfoPage
    },
    statusViewComment() {
      return `${this.$t('see-more-comments')} (${
        this.totalComment - this.comments.length
      })`
    },
    codeSocial() {
      return this.post?.social_link?.includes('instagram')
        ? 'instagram'
        : 'facebook'
    },
  },
  created() {
    this.checkImageExists(this.post.thumbnail_image)
  },
  methods: {
    handlePreviewImage() {
      this.visiblePreviewImage = true
    },
    checkImageExists(url) {
      const img = new Image()

      img.src = url

      if (img.complete) {
        return (this.thumbnailImage = url)
      } else {
        img.onload = () => {
          return (this.thumbnailImage = url)
        }

        img.onerror = () => {
          return (this.thumbnailImage = null)
        }
      }
    },
    getStringAvatar(fullName) {
      const arrayLetter = fullName
        .split(' ')
        .map((word) => {
          return word.charAt(0).toUpperCase()
        })
        .splice(-2)
      return arrayLetter.join('')
    },
    handleSeeMoreComment() {
      if (this.isLoading) return
      this.$emit('fetchMoreComment')
    },
    handleClickReplyComment(conversation) {
      this.$emit('handleClickReplyComment', conversation)
    },
    handleLinkToPost() {
      window.open(this.post.link, '_blank')
    },
    async handleCopyPostId() {
      if (!this.post.social_id) return
      await navigator.clipboard.writeText(this.post.social_id)
      notification.success({
        message: this.$t('copied-to-clipboard'),
        class: 'notification-success',
      })
    },
    handleCancelReplyComment() {
      this.$emit('handleCancelReplyComment')
    },
  },
}
</script>
<style lang="less" scoped>
.post {
  max-width: 90%;
  padding: 2rem;
  @apply mx-auto my-6 rounded-xl shadow-md;
  &-head {
    @apply flex justify-between;
    &__left {
      @apply flex;
      .avatar-page {
        width: 44px;
        height: 44px;
        background-color: @gray-6;
        @apply rounded-full overflow-hidden flex-shrink-0;
      }
      .info-post {
        margin-left: @margin-12;
        max-width: 90%;
        @apply overflow-hidden flex flex-col justify-between;
        &__post-id {
          color: @black;
          font-size: @size-20;
          margin-bottom: @margin-4;
          @apply font-semibold truncate;

          span {
            transition: 0.25s linear;

            &:hover {
              color: @primary-1;
            }
          }
        }
        &__time {
          color: @gray-4;
          font-size: @size-12;
          text-transform: capitalize;
        }
      }
    }
    &__right {
      @apply flex-shrink-0;
      .btn-link {
        color: @black;
        background-color: @gray-6;
        width: 3.5rem;
        height: 3.5rem;
        text-align: -webkit-center;
        @apply cursor-pointer flex items-center justify-center border-0 p-0 font-bold rounded-xl;
        svg {
          width: 1.5rem;
          height: 1.5rem;
        }
      }
    }
  }
  &-content {
    @apply mt-2;
    &__description {
      color: @black;
      font-size: @size-16;
    }
    &__thumbnail-img {
      max-height: 200px;
      @apply rounded-md overflow-hidden flex-shrink-0;
      img {
        max-height: 200px;
        object-fit: contain;
        @apply cursor-pointer;
      }
    }
  }
  &-comments {
    @apply px-4 mt-4;
    &__expand {
      color: @gray-3;
      @apply font-medium cursor-pointer flex items-center mt-4;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
