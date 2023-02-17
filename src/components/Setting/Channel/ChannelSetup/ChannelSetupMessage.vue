<template>
  <div class="channel-setup-body">
    <p>
      {{
        $t(
          'the-system-will-get-all-new-messages-since-adding-channel-account-successfully'
        )
      }}
    </p>
  </div>
</template>
<script>
export default {
  name: 'ChannelSetupMessage',
}
</script>
<style lang="less" scoped>
.channel-setup-body {
  p {
    color: @black;
    font-size: @size-14;
    @apply font-medium;
  }
}
</style>
