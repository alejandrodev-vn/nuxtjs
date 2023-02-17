import ApiFactories from '@/api/ApiFactories'

export default function (context, inject) {
  inject('api', ApiFactories(context.$axios))
}
