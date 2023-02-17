/* eslint-disable no-undef */
/// <reference types="cypress" />
import testCase from '../../fixtures/login.json'

describe('Login', () => {
  before(() => {})

  beforeEach(() => {
    // Chạy mỗi lần trước khi chạy test case
  })

  afterEach(() => {
    // Chạy mỗi lần sau khi chạy test case
  })

  after(() => {
    // Chạy duy nhất 1 lần khi kết thúc
  })

  if (testCase.formLogin.happyCase) {
    const { happyCase } = testCase.formLogin
    Object.keys(happyCase).forEach((key) => {
      it(`Đăng nhập thành công với: ${key}`, () => {
        cy.visit('auth/login')
        cy.get('[data-cy="input-login-email"]')
          .type(happyCase[key].email)
          .blur({ force: true })
        cy.get('[data-cy="input-login-password"]')
          .type(happyCase[key].password)
          .blur({ force: true })
        cy.get('[data-cy="form-login"]')
          .find('.ant-form-explain')
          .should('not.exist')
        cy.get('[data-cy="button-login-submit"]').click()
      })
    })
  }
  if (testCase.formLogin.badCase) {
    const { badCase } = testCase.formLogin
    Object.keys(badCase).forEach((key) => {
      it(`Đăng nhập không thành công với: ${key}`, () => {
        cy.visit('auth/login')
        if (badCase[key].email.length) {
          cy.get('[data-cy="input-login-email"]')
            .type(badCase[key].email)
            .blur({ force: true })
        } else {
          cy.get('[data-cy="input-login-email"]').focus().blur()
        }
        if (badCase[key].password.length) {
          cy.get('[data-cy="input-login-password"]')
            .type(badCase[key].password)
            .blur({ force: true })
        } else {
          cy.get('[data-cy="input-login-password"]').focus().blur()
        }
        cy.get('[data-cy="form-login"]')
          .find('.ant-form-explain')
          .should('be.visible')
        cy.get('[data-cy="button-login-submit"]').click()
      })
    })
  }
})
