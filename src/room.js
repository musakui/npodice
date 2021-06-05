import { Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector'
import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'

import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'

import { BoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder'

import { tatami, diceMaterial } from './materials.js'

const skylight = new HemisphericLight('skylight', new Vector3(-0.4, 1, -0.4))
skylight.intensity = 0.1

const spotlight = new SpotLight('spotlight', new Vector3(0, 70, 0), new Vector3(0, -1, 0), 1.5, 1)
spotlight.intensity = 0.7

export const shadows = new ShadowGenerator(2048, spotlight)
shadows.usePoissonSampling = true

export const floor = BoxBuilder.CreateBox('floor', { width: 100, height: 0.1, depth: 100 })
floor.position.y = -0.7
floor.material = tatami
floor.receiveShadows = true

export const bowlColliders = Array.from({ length: 11 }, (_, i) => {
  const depth = 0.6
  const r = i * 0.5 + 1.5
  const width = i < 3 ? 0.5 : 1
  const ht = Math.pow(i / 3.2, 2) * 0.2 + 0.3
  const segments = Math.ceil(r * 2 * Math.PI / width)
  const sAngle = Math.PI * 2 / segments
  const tilt = -r / 10
  return Array.from({ length: segments }, (_, s) => {
    const c = BoxBuilder.CreateBox(`base-${s}`, { width, height: 0.1, depth })
    const a = s * sAngle
    c.rotation.y = a
    c.rotation.x = tilt
    c.position.y = ht
    c.visibility = false
    c.position.x = r * Math.sin(a)
    c.position.z = r * Math.cos(a)
    return c
  })
}).flat()
bowlColliders.unshift(BoxBuilder.CreateBox('cent', { width: 2, height: 0.7, depth: 2 }))
bowlColliders[0].visibility = false

const faceUV = Array.from({ length: 6 }, (_, i) => new Vector4(i / 6, 0, (i + 1) / 6, 1))
export const dice = Array.from({ length: 10 }, (_, i) => {
  const d = BoxBuilder.CreateBox('die', { size: 1, faceUV, wrap: true })
  d.position.y = -5
  d.position.x = i * 5
  d.material = diceMaterial
  shadows.addShadowCaster(d)
  return d
})

import('./models.js').then(async (m) => {
  const { bowl, dice } = await m.load()
  shadows.addShadowCaster(bowl.meshes[0])
})
