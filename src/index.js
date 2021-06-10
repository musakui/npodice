import './style.css'
import { millis, cannonReady } from './util.js'

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
  const app = await import('./app.js')
  await millis(100)
  startButton.classList.remove('running')
  startButton.onclick = () => {
    header.style.marginTop = '-100%'
    app.startRound()
  }
})
