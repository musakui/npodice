import './style.css'
import { cannonReady } from './util.js'

const header = document.querySelector('header')
const startButton = document.querySelector('.ld')

import('./babylon.js').then(async () => {
  await Promise.all([
    import('./scene.js').then(async ({ ready }) => {
      await ready
      header.style.backgroundColor = 'rgba(0,0,0,0)'
    }),
    cannonReady,
  ])
  await import('./app.js')
})
