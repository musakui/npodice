import '@babylonjs/core/Rendering/depthRendererSceneComponent'
import { LensRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/lensRenderingPipeline'

import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'

import '@babylonjs/loaders/glTF/2.0/glTFLoader'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'

import { scene, camera } from './babylon.js'
import { spotlight } from './room.js'
import './dice.js'

const rootUrl = import.meta.env.BASE_URL
const load = async (n) => {
  const { meshes } = await SceneLoader.ImportMeshAsync('', rootUrl, `${n}.gltf`)
  return meshes[1]
}

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

export * from './room.js'
