import { Scene } from '@babylonjs/core/scene'
import { Engine } from '@babylonjs/core/Engines/engine'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'

export const canvas = document.createElement('canvas')
export const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })

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
camera.attachControl(canvas, true)
