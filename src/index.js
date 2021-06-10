import './style.css'
import { millis, cannonReady } from './util.js'

const app = document.querySelector('#app')
const header = document.querySelector('header')
const startButton = document.querySelector('.ld')

startButton.onclick = () => {}

import('./babylon.js').then(async () => {
  await Promise.all([
    import('./scene.js').then(async ({ ready }) => {
      await ready
      header.style.backgroundColor = 'rgba(0,0,0,0)'
    }),
    cannonReady,
  ])

  const { startRound } = await import('./app.js')

  const result = document.createElement('div')
  result.id = 'result'
  app.appendChild(result)

  const showResult = (text) => new Promise((resolve) => {
    result.innerText = text
    result.classList.add('show')
    result.addEventListener('animationend', () => {
      result.innerText = ''
      result.classList.remove('show')
      setTimeout(() => resolve(), 100)
    }, { once: true, capture: false })
  })

  window.gameState = {
    showResult,
    done () {
      header.style.marginTop = 0
    },
  }

  await millis(100)
  startButton.classList.remove('running')
  startButton.onclick = async () => {
    header.style.marginTop = '-100%'
    startRound(window.gameState)
  }
})
