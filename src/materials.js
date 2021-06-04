import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'

import diceUrl from './assets/ohohanachin.png'
import woodNormalUrl from './assets/wood-normal.png'
import woodDiffuseUrl from './assets/wood-diffuse.png'

export const wood = new StandardMaterial('woodMaterial')
wood.diffuseTexture = new Texture(woodDiffuseUrl)
wood.diffuseTexture.uScale = 1
wood.diffuseTexture.vScale = 4
wood.bumpTexture = new Texture(woodNormalUrl)
wood.bumpTexture.uScale = 1
wood.bumpTexture.vScale = 4

export const diceMaterial = new StandardMaterial('diceMaterial')
diceMaterial.diffuseTexture = new Texture(diceUrl)
