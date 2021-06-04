import { Scene } from '@babylonjs/core/scene'

export async function init (canvas, engine) {
  const scene = new Scene(engine)
  const { camera } = await import('./camera.js')
  camera.attachControl(canvas, true)
  return scene
}
