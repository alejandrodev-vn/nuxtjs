<template>
  <div class="post-item">
    <div class="post-item__left">
      <a-icon
        type="minus-circle"
        class="icon-minus"
        @click="handleRemovePost"
      />
      <div class="information">
        <!-- <div class="information__thumbnail">
          <img src="@/assets/images/Icon/No-Image.png" alt="" />
        </div> -->
        <div class="information__content">
          <p class="information__content__title">{{ post }}</p>
        </div>
      </div>
    </div>
    <div class="post-item__right" @click="handleLinkToPost">
      <icon-link-to class="cursor-pointer" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'ChannelSetupPostItem',
  props: {
    post: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleRemovePost() {
      this.$emit('remove', this.post)
    },
    handleLinkToPost() {
      window.open(`https://www.facebook.com/${this.post}`, '_blank')
    },
  },
}
</script>
<style lang="less">
.post-item {
  background-color: #22313f08;
  margin: @margin-16 2rem;
  padding: @padding-12 @padding-16;
  border-radius: 8px;
  @apply flex items-center justify-between;
  &__left {
    max-width: 60%;
    overflow: hidden;
    @apply flex items-center;
    .icon-minus {
      color: @black;
      font-size: @size-20;
      margin-right: @margin-12;
      cursor: pointer;
    }
    .information {
      @apply flex items-center;
      &__thumbnail {
        border-radius: 0.8rem;
        width: 4.8rem;
        height: 4.8rem;
        overflow: hidden;
        margin-right: @margin-24;
        border: 1px solid @gray-5;
      }
      &__content {
        &__title {
          color: @black;
          font-size: @size-16;
          @apply font-medium mb-0 truncate;
        }
        &__description {
          font-size: @size-12;
          color: @gray-4;
          @apply truncate;
        }
      }
    }
  }
}
</style>
