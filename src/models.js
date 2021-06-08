import '@babylonjs/loaders/glTF/2.0/glTFLoader'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'

const rootUrl = import.meta.env.BASE_URL

const modelNames = ['bowl', 'dice']
export const models = {}
export const ready = Promise.all(modelNames.map(async (n) => {
  const m = await SceneLoader.ImportMeshAsync('', rootUrl, `${n}.gltf`)
  models[n] = m
}))
