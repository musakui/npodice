import '@babylonjs/core/Loading/loadingScreen'
import { canvas, engine, scene } from './scene.js'

document.body.appendChild(canvas)
engine.resize()
engine.runRenderLoop(() => scene.render())

window.addEventListener('resize', () => engine.resize())
import('./app.js').then((m) => m.init())
