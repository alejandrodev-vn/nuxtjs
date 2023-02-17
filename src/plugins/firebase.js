import event from '@/utils/event'
import { actionTypes } from '@/constants/action-types-firebase'

export default function (context, inject) {
  let connected = false
  const firebase = {
    init: () => {
      const app = context.app
      if (!context.$auth || !context.$auth.loggedIn) {
        return
      }
      const user = context.$auth.user
      if (!user) {
        return
      }

      const pathGuest = `${user.id}`
      const refGuest = app.$fire.database.ref(pathGuest)
      if (!refGuest) {
        return
      }
      refGuest.on('value', (snap) => {
        try {
          if (snap.val() && connected) {
            const notifyData = { ...snap.val() }
            if (notifyData?.notify) {
              event.$emit(actionTypes.NOTIFY, notifyData?.notify)
            }
            if (notifyData?.message) {
              event.$emit(actionTypes.MESSAGE, notifyData?.message)
            }
          }
          connected = true
        } catch (error) {
          console.log(error)
        }
      })
    },
    off() {
      const app = context.app
      if (!context.$auth || !context.$auth.loggedIn) {
        return
      }
      const user = context.$auth.user
      if (!user) {
        return
      }

      const pathGuest = `${user.id}`
      app.$fire.database.ref(pathGuest).off()
      connected = false
    },
  }
  // firebase.init()
  inject('firebase', { firebase, connected })
}
