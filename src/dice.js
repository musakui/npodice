import '@babylonjs/core/Meshes/instancedMesh'
import { Vector4 } from '@babylonjs/core/Maths/math.vector'
import { PolyhedronBuilder } from '@babylonjs/core/Meshes/Builders/polyhedronBuilder'

import {
  Color3,
  Vector3,
  Texture,
  StandardMaterial,
  shadows,
  diceModel,
} from './scene.js'

import diceDiffuseUrl from './assets/ohohanachin.png'

export const getFace = (mesh, threshold = 0.85) => {
  if (mesh.position.y <= 0) return 'out'

  const r = new Vector3(0, 0, 0)
  const q = mesh.rotationQuaternion

  Vector3.Right().rotateByQuaternionToRef(q, r)
  if (r.y >= threshold) return 2 // +X is up
  if (r.y <= -threshold) return 3 // -X is up

  Vector3.Up().rotateByQuaternionToRef(q, r)
  if (r.y >= threshold) return 4 // +Y is up
  if (r.y <= -threshold) return 5 // -Y is up

  Vector3.Forward().rotateByQuaternionToRef(q, r)
  if (r.y >= threshold) return 0 // +Z is up
  if (r.y <= -threshold) return 1 // -Z is up

  return 'nil'
}

export const getYaku = (result) => {
  const yaku = []
  const [ti, nn, o, ho, ha, na] = result
  if (ho > 1 && nn > 1) {
    yaku.push((ho > 2 && nn > 2) ? 'PONPONPON' : 'PONPON')
  }
  if (ti > 1 && nn > 1) {
    yaku.push(o ? 'OCHINCHIN' : 'CHINCHIN')
  }
  if (ha > 1 && ti > 1) {
    yaku.push('PACHIPACHI')
  }
  if (ha && na) {
    if (na > 1) {
      yaku.push(ti ? 'BANANACHI' : 'BANANA')
    } else {
      yaku.push(o ? 'OHANA' : 'HANA')
    }
  }
  return yaku
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

export const diceMaterial = new StandardMaterial('diceMat')
diceMaterial.roughness = 1
diceMaterial.specularColor = new Color3(0, 0, 0)
diceMaterial.diffuseTexture = new Texture(diceDiffuseUrl)
diceMaterial.diffuseTexture.hasAlpha = true

const diceFaces = PolyhedronBuilder.CreatePolyhedron('dicek', { custom, faceUV })
diceFaces.setEnabled(false)
diceFaces.material = diceMaterial

export const createDice = (idx) => {
  const d = diceModel.createInstance(`d${idx}`)
  const df = diceFaces.createInstance(`df${idx}`)
  df.setParent(d)
  d.position.z = idx * 2
  d.position.y = -3
  shadows.addShadowCaster(d)
  return d
}
