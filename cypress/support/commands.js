/* eslint-disable no-undef */
import 'cypress-file-upload'

Cypress.Commands.add(
  'login',
  (username = Cypress.env('username'), password = Cypress.env('password')) => {
    const payload = {
      username,
      password,
      g_recaptcha_response: '',
    }

    const url = `${Cypress.env('apiUrl')}/authorization`

    cy.request('POST', url, payload).then((response) => {
      const accessToken = response.body.access_token
      const tokenType = response.body.token_type

      window.localStorage.setItem('auth.strategy', 'local')
      window.localStorage.setItem('auth._refresh_token.local', 'false')
      window.localStorage.setItem(
        'auth._token.local',
        `${tokenType} ${accessToken}`
      )

      cy.setCookie('auth._token.local', `${tokenType} ${accessToken}`)
      cy.setCookie('auth._refresh_token.local', 'false')
      cy.setCookie('auth.redirect', '%2F')
      cy.setCookie('auth.strategy', 'local')
      cy.visit('/')

      cy.get('.logout').should('be.visible')
    })
  }
)
