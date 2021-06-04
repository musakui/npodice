import '@babylonjs/loaders/glTF'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'

export async function loadModels () {
  SceneLoader.Append('/bowl.gltf')
  /*
  SceneLoader.ImportMesh('', '/assets/', 'dice.gltf', scene, (m) => {
    console.log(m)
  })
  */
}
