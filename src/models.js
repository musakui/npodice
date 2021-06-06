import '@babylonjs/loaders/glTF'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'

const rootUrl = import.meta.env.BASE_URL

export async function load () {
  const [bowl, dice] = await Promise.all([
    SceneLoader.ImportMeshAsync('', rootUrl, 'bowl.gltf'),
    SceneLoader.ImportMeshAsync('', rootUrl, 'dice.gltf'),
  ])

  return {
    bowl,
    dice,
  }
}
