<template>
  <a-modal
    :visible="isShow"
    centered
    width="600px"
    :closable="true"
    :footer="null"
    :mask-closable="true"
    @cancel="hide"
  >
    <div class="delivery-modal">
      <div class="delivery-modal__title">
        {{ $t('how-to-setup-delivery-provide-rand-shipping-fee') }}
      </div>
      <div class="delivery-modal__image">
        <img
          src="~/assets/images/Delivery/delivery-thumbnail-guid.png"
          alt="Prime web"
          class="delivery-modal-image__picture"
        />
      </div>
      <div class="delivery-modal__step-1">
        <div class="delivery-modal__step-1--title">
          {{ $t('setup-shipping-fee') }}
        </div>
        <div class="delivery-modal__step-1--subtitle">
          {{ $t('title-setup-shipping-fee') }}
        </div>
        <div class="delivery-modal__step-1--description">
          <ol>
            <li>
              {{ $t('setup-shipping-dynamic-fee') }}
            </li>
            <li>
              {{ $t('setup-shipping-fixed-fee') }}
            </li>
          </ol>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'DeliveryModalGuid',
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShowDrawer: false,
    }
  },
  methods: {
    hide() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="less" scoped>
.delivery-modal {
  padding: 1rem 0 0 0;
  @apply flex flex-col items-center;
  &__image {
    max-width: 300px;
    margin-bottom: 2rem;
  }
  &__title {
    font-size: @size-24;
    color: @black;
    margin-bottom: 1rem;
    @apply font-semibold text-center;
  }
  &__step-1 {
    background: rgba(34, 49, 63, 0.03);
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    @apply w-full;
    &--title {
      font-weight: 600;
      font-size: @size-16;
      color: @black;
      margin: 0.75rem 0;
    }
    &--subtitle {
      font-weight: 500;
      font-size: @size-14;
      color: @black;
    }
    &--description {
      font-size: @size-14;
      color: #6c6c81;
      ol {
        list-style: decimal;
        margin: 0 1rem;
      }
      p {
        font-size: @size-14;
        line-height: 1.5rem;
        color: #6c6c81;
      }
    }
  }
  &__step-2 {
    background: rgba(34, 49, 63, 0.03);
    border-radius: 1rem;
    padding: 1.5rem;
    &--title {
      font-weight: 600;
      font-size: @size-14;
      color: @black;
      margin: 0.75rem 0;
    }
    &--subtitle {
      font-weight: 500;
      font-size: @size-14;
      color: @black;
    }
    &--description {
      font-size: @size-14;
      color: #6c6c81;
      ol {
        list-style: decimal;
        margin: 0 1rem;
      }
    }
  }
}
</style>
