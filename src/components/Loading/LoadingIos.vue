<template>
  <div class="spinner">
    <div v-for="index in 12" :key="index" class="spinner-blade"></div>
  </div>
</template>

<script>
export default {
  name: 'LoadingIos',
}
</script>

<style lang="less" scoped>
.spinner {
  width: 1rem;
  height: 1rem;
  @apply relative inline-block;
}

.spinner-blade {
  left: 0.4629rem;
  bottom: 0;
  width: 0.074rem;
  height: 0.2777rem;
  border-radius: 0.5rem;
  background-color: transparent;
  transform-origin: center -0.2222rem;
  -webkit-animation: spinner-fade 1s infinite linear;
  animation: spinner-fade 1s infinite linear;
  @apply absolute;
  &:nth-child(1) {
    -webkit-animation-delay: 0s;
    animation-delay: 0s;
    transform: rotate(0deg);
  }
  &:nth-child(2) {
    -webkit-animation-delay: 0.083s;
    animation-delay: 0.083s;
    transform: rotate(30deg);
  }
  &:nth-child(3) {
    -webkit-animation-delay: 0.166s;
    animation-delay: 0.166s;
    transform: rotate(60deg);
  }
  &:nth-child(4) {
    -webkit-animation-delay: 0.249s;
    animation-delay: 0.249s;
    transform: rotate(90deg);
  }
  &:nth-child(5) {
    -webkit-animation-delay: 0.332s;
    animation-delay: 0.332s;
    transform: rotate(120deg);
  }
  &:nth-child(6) {
    -webkit-animation-delay: 0.415s;
    animation-delay: 0.415s;
    transform: rotate(150deg);
  }
  &:nth-child(7) {
    -webkit-animation-delay: 0.498s;
    animation-delay: 0.498s;
    transform: rotate(180deg);
  }
  &:nth-child(8) {
    -webkit-animation-delay: 0.581s;
    animation-delay: 0.581s;
    transform: rotate(210deg);
  }
  &:nth-child(9) {
    -webkit-animation-delay: 0.664s;
    animation-delay: 0.664s;
    transform: rotate(240deg);
  }
  &:nth-child(10) {
    -webkit-animation-delay: 0.747s;
    animation-delay: 0.747s;
    transform: rotate(270deg);
  }
  &:nth-child(11) {
    -webkit-animation-delay: 0.83s;
    animation-delay: 0.83s;
    transform: rotate(300deg);
  }
  &:nth-child(12) {
    -webkit-animation-delay: 0.913s;
    animation-delay: 0.913s;
    transform: rotate(330deg);
  }
}

@-webkit-keyframes spinner-fade {
  0% {
    background-color: @primary;
  }
  100% {
    background-color: transparent;
  }
}

@keyframes spinner-fade {
  0% {
    background-color: @primary;
  }
  100% {
    background-color: transparent;
  }
}
</style>
