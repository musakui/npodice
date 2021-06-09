//import '@babylonjs/core/Loading/loadingScreen'
import { Engine } from '@babylonjs/core/Engines/engine'

import { Scene } from '@babylonjs/core/scene'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'

import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'

import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { BoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder'

export const canvas = document.createElement('canvas')
export const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })

document.body.appendChild(canvas)
engine.resize()
window.addEventListener('resize', () => engine.resize())

export const scene = new Scene(engine)
scene.clearColor = Color3.Black()
scene.fogColor = Color3.Black()
scene.fogMode = Scene.FOGMODE_EXP
scene.fogDensity = 0.02

export const camera = new ArcRotateCamera('camera', 0.5, 1, 25, Vector3.Zero())
camera.wheelPrecision = 10
camera.upperBetaLimit = 1.4
camera.lowerRadiusLimit = 3
camera.upperRadiusLimit = 45
camera.panningSensibility = 0
camera.useAutoRotationBehavior = true
camera.idleRotationWaitTime = 2000
camera.attachControl(canvas, true)

engine.runRenderLoop(() => scene.render())

const skylight = new HemisphericLight('skylight', new Vector3(0, 1, 0))
skylight.intensity = 0.2

export const spotlight = new SpotLight('spotL', new Vector3(0, 70, 0), new Vector3(0, -1, 0), 1.5, 1)
spotlight.intensity = 0.7

export const tatami = new StandardMaterial('tatamiMat')
tatami.roughness = 1
tatami.specularColor = new Color3(0.3, 0.3, 0)
Object.assign(tatami, Object.fromEntries(['diffuse', 'bump'].map((n) => {
  const t = new Texture(import.meta.env.BASE_URL + `tatami-${n}.png`)
  t.uScale = 6
  t.vScale = 5.5
  return [`${n}Texture`, t]
})))

export const floor = BoxBuilder.CreateBox('floor', { width: 100, height: 0.1, depth: 100 })
floor.position.y = -0.7
floor.material = tatami
floor.receiveShadows = true
