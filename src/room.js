import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'

import { BoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder'

import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'

import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'

import { scene, camera } from './babylon.js'

export const skylight = new HemisphericLight('skylight', new Vector3(0, 1, 0))
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

export {
  Color3,
  Vector3,
  Texture,
  StandardMaterial,
  BoxBuilder,
  scene,
  camera,
}
