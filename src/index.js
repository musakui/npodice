import '@babylonjs/core/Loading/loadingScreen'
import { Engine } from '@babylonjs/core/Engines/engine'

const canvas = document.createElement('canvas')
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })
document.body.appendChild(canvas)
engine.resize()
window.addEventListener('resize', () => engine.resize())

import('./createScene.js').then(async (m) => {
  const scene = await m.init(canvas, engine)
  const { init } = await import('./app.js')
  await init(scene)
  engine.runRenderLoop(() => scene.render())
})
