import { faker } from '@faker-js/faker'

function generateSongData () {
  const youtubeLinks = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=fNFzfwLM72c',
    'https://www.youtube.com/watch?v=U5TqIdff_DQ',
    'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
    'https://www.youtube.com/watch?v=k85mRPqvMbE',
    'https://www.youtube.com/watch?v=zA52uNzx7Y4',
    'https://www.youtube.com/watch?v=k-HdGnzYdFQ',
    'https://www.youtube.com/watch?v=y6120QOlsfU'
  ]
  const name = `${faker.name.firstName()}'s test song`
  const randomIndex = Math.floor(Math.random() * youtubeLinks.length)

  return {
    name,
    youtubeLink: youtubeLinks[randomIndex],
    score: 0
  }
}

const song = generateSongData()

describe('Home page test', () => {
  it('should add a recommendation', () => {
    cy.visit('http://localhost:3000/')

    cy.get('input').first().type(song.name)
    cy.get('input').last().type(song.youtubeLink)
    cy.intercept('POST', process.env.REACT_APP_API_BASE_URL + '/recommendations').as('createRecommendation')
    cy.get('button').click()
    cy.wait('@createRecommendation')

    cy.contains(song.name).should('not.be.undefined').should('be.visible')

    cy.reload()

    cy.contains(song.name).should('not.be.undefined').should('be.visible')

    cy.end()
  })

  it('should show video on home page right', () => {
    cy.visit('http://localhost:3000/')

    cy.get('article').first().find('iframe')
      .should('be.visible')
      .should('not.be.undefined')
      .end()
  })

  it('should upvote last recommendation', () => {
    cy.visit('http://localhost:3000/')

    cy.get('article').first().find('svg').first().click()
    cy.contains(`${song.score + 1}`).should('not.be.undefined')
    cy.reload()

    cy.contains(`${song.score + 1}`).should('not.be.undefined')

    cy.end()
  })

  it('should downvote last recommendation', () => {
    cy.visit('http://localhost:3000/')

    cy.get('article').first().find('svg').last().click()
    cy.contains(`${song.score}`).should('not.be.undefined')
    cy.reload()

    cy.contains(`${song.score}`).should('not.be.undefined')

    cy.end()
  })

  it('should remove last recommendation when score is less than -5', () => {
    cy.visit('http://localhost:3000/')

    for (let i = 0; i >= -6; i--) {
      cy.get('article').first().find('svg').last().click()
      cy.contains(`${song.score}`).should('not.be.undefined')
    }
    cy.reload()

    cy.contains(`${song.name}`).should('not.exist')

    cy.end()
  })
})
