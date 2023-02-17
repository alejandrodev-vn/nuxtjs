<template>
  <figure
    v-if="codeSocial === 'facebook'"
    ref="facebookPost"
    class="op-interactive facebook-post"
  >
    <div v-if="loadingPost" class="facebook-post__loading">
      <app-loading />
    </div>
    <div
      v-show="!loadingPost"
      ref="post"
      :data-href="link"
      class="fb-post"
      data-show-text="true"
      data-adapt-container-width="true"
      scrolling="no"
      height="350px"
    ></div>
  </figure>
  <figure v-else class="op-interactive instagram-post">
    <iframe width="100%" height="350px" :src="link" frameborder="0"></iframe>
  </figure>
</template>
<script>
import { get } from 'lodash'

export default {
  name: 'RenderIframePost',
  props: {
    link: {
      type: String,
      default: '',
    },
    codeSocial: {
      type: String,
      default: 'facebook',
    },
  },
  data() {
    return {
      loadingPost: false,
    }
  },
  watch: {
    link() {
      if (this.codeSocial === 'facebook') {
        this.renderPostFb()
      }
    },
  },
  created() {
    if (this.codeSocial === 'facebook') {
      this.renderPostFb()
    }
  },
  methods: {
    renderPostFb() {
      this.loadingPost = true
      this.$nextTick(() => {
        const xfbml = get(this.$fb, 'sdk.XFBML', null)
        if (xfbml) {
          xfbml.parse(this.$refs.facebookPost, () => (this.loadingPost = false))
        }
      })
    },
  },
}
</script>
<style lang="less" scoped>
.op-interactive {
  min-height: 150px;
}
.facebook-post {
  display: flex;
  justify-content: center;
  flex-direction: column;
  /deep/.base-card-loading {
    width: 100% !important;
  }

  /deep/.fb-post {
    & > span {
      margin: 0 auto;
      width: 100% !important;
      iframe[style] {
        width: 100% !important;
      }
    }
  }
}
</style>
