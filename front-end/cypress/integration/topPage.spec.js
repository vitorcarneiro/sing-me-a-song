describe('Top page test', () => {
  it('should show video on top page right', () => {
    cy.visit('http://localhost:3000/top')

    cy.get('article').first().find('iframe')
      .should('be.visible')
      .should('not.be.undefined')
      .end()
  })
})
