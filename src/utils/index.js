export const isSameObj = (from, to) => {
  if (Object.keys(from).length !== Object.keys(to).length) return false
  let same = true
  for (const key in from) {
    // eslint-disable-next-line no-prototype-builtins
    if (from.hasOwnProperty(key) && from[key] !== to[key]) {
      same = false
    }
  }
  return same
}

export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0) + str.slice(1)
}

export const formatNumber = (value) => {
  value += ''
  const list = value.split('.')
  const prefix = list[0].charAt(0) === '-' ? '-' : ''
  let num = prefix ? list[0].slice(1) : list[0]
  let result = ''
  while (num.length > 3) {
    result = `,${num.slice(-3)}${result}`
    num = num.slice(0, num.length - 3)
  }
  if (num) {
    result = num + result
  }
  return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`
}

export const getResponseErrorMessage = (err) => {
  if (!err.response) {
    return 'Something went wrong'
  }

  const errDetail = err.response.data

  if (errDetail.message !== undefined) {
    if (typeof errDetail.message === 'object') {
      return Object.values(errDetail.message).join('<br/> ')
    }
    return errDetail.message
  } else if (errDetail.invalid_fields) {
    if (typeof errDetail.invalid_fields === 'object') {
      const invalidFields = Object.entries(errDetail.invalid_fields).map(
        (key) => {
          return `${key[1]}`
        }
      )
      return invalidFields.join('<br/> ')
    } else {
      return errDetail.invalid_fields
    }
  } else {
    return 'Something went wrong'
  }
}
