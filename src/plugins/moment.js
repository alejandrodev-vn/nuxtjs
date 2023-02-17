import moment from 'moment'

export default function (ctx, inject) {
  inject('moment', moment)
}
