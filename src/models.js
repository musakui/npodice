import '@babylonjs/loaders/glTF'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'

export async function load () {
  const bowl = await SceneLoader.ImportMeshAsync('', '/bowl.gltf')
  // const dice = SceneLoader.ImportMeshAsync('', '/dice.gltf'

  return {
    bowl,
    dice: null,
  }
}
