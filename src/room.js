import { Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector'
import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'

import '@babylonjs/core/Meshes/instancedMesh'
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'

import { BoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { PolyhedronBuilder } from '@babylonjs/core/Meshes/Builders/polyhedronBuilder'

import { tatami, diceMaterial } from './materials.js'

const skylight = new HemisphericLight('skylight', new Vector3(0, 1, 0))
skylight.intensity = 0.2

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
    c.isVisible = false
    c.rotation.y = a
    c.rotation.x = tilt
    c.position.y = ht
    c.position.x = r * Math.sin(a)
    c.position.z = r * Math.cos(a)
    return c
  })
}).flat()
bowlColliders.unshift(BoxBuilder.CreateBox('cent', { width: 2, height: 0.7, depth: 2 }))
bowlColliders[0].isVisible = false

const numDice = 10
export let dice = null

let diceResolve = null
const dicePromise = new Promise((resolve) => { diceResolve = resolve })
export const getDice = async () => {
  if (dice) return dice
  dice = await dicePromise
  return dice
}

const side = 0.501
const corner = 0.35
const PN = [[1, 1], [-1, 1], [-1, -1], [1, -1]]
const eight = [1, -1].map((s) => {
  const vn = s < 0 ? PN : [PN[0], PN[3], PN[2], PN[1]]
  return vn.map((vs) => [s * side, ...vs.map((i) => i * corner)])
}).flat(1)

const custom = {
  face: [0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2, 3].map((j) => j + i * 4)),
  vertex: [0, 1, 2].map((i) => eight.map(([s, a, b]) => {
    if (!i) return [ s, b, a ]
    return i === 1 ? [ a, s, b ] : [ b, a, s ]
  })).flat(1)
}

const faceUV = custom.face.map((_, i) => new Vector4((i + 1) / 6, 0, i / 6, 1))
const diceFaces = PolyhedronBuilder.CreatePolyhedron('dicek', { custom, faceUV })
diceFaces.setEnabled(false)
diceFaces.material = diceMaterial

import('./models.js').then(async (m) => {
  const { bowl, dice: dc } = await m.load()
  const diceMesh = dc.meshes[1]
  diceMesh.setEnabled(false)
  diceMesh.isVisible = false
  diceResolve(Array.from({ length: numDice }, (_, i) => {
    const d = diceMesh.createInstance(`d${i}`)
    const df = diceFaces.createInstance(`df${i}`)
    df.setParent(d)
    d.position.z = i * 2
    d.position.y = -3
    shadows.addShadowCaster(d)
    return d
  }))
  shadows.addShadowCaster(bowl.meshes[1])
})
