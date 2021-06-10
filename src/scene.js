import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'

import '@babylonjs/core/Rendering/depthRendererSceneComponent'
import { LensRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/lensRenderingPipeline'

import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'

import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'

import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'

import '@babylonjs/loaders/glTF/2.0/glTFLoader'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import { BoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder'

import { scene, camera } from './babylon.js'
import './dice.js'

const rootUrl = import.meta.env.BASE_URL
const load = async (n) => {
  const { meshes } = await SceneLoader.ImportMeshAsync('', rootUrl, `${n}.gltf`)
  return meshes[1]
}

export const skylight = new HemisphericLight('skylight', new Vector3(0, 1, 0))
skylight.intensity = 0.2

export const spotlight = new SpotLight('spotL', new Vector3(0, 70, 0), new Vector3(0, -1, 0), 1.5, 1)
spotlight.intensity = 0.7

export const shadows = new ShadowGenerator(2048, spotlight)
shadows.usePoissonSampling = true

export const lensPipeline = new LensRenderingPipeline('lens', {
  edge_blur: 0.7,
  grain_amount: 0.3,
  dof_gain: 1.0,
  dof_darken: 0.6,
  dof_focus_distance: 90,
  chromatic_aberration: 0.5,
}, scene, 1.0, camera)

export let diceModel = null

export const ready = Promise.all([
  load('bowl').then((b) => {
    shadows.addShadowCaster(b)
    b.receiveShadows = true
    return b
  }),
  load('dice').then((d) => {
    d.setEnabled(false)
    d.isVisible = false
    diceModel = d
    return d
  }),
])

export const tatami = new StandardMaterial('tatamiMat')
tatami.roughness = 1
tatami.specularColor = new Color3(0.3, 0.3, 0)
Object.assign(tatami, Object.fromEntries(['diffuse', 'bump'].map((n) => {
  const t = new Texture(rootUrl + `tatami-${n}.png`)
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
