import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'

import diceUrl from './assets/ohohanachin.png'
import tatamiNormalUrl from './assets/tatami-normal.png'
import tatamiDiffuseUrl from './assets/tatami-diffuse.png'
/*
import woodNormalUrl from './assets/wood-normal.png'
import woodDiffuseUrl from './assets/wood-diffuse.png'

export const wood = new StandardMaterial('woodMaterial')
wood.diffuseTexture = new Texture(woodDiffuseUrl)
wood.diffuseTexture.uScale = 1
wood.diffuseTexture.vScale = 4
wood.bumpTexture = new Texture(woodNormalUrl)
wood.bumpTexture.uScale = 1
wood.bumpTexture.vScale = 4
*/

export const tatami = new StandardMaterial('tatamiMaterial')
tatami.roughness = 1
tatami.specularColor = new Color3(0.3, 0.3, 0)
tatami.diffuseTexture = new Texture(tatamiDiffuseUrl)
tatami.diffuseTexture.uScale = 7
tatami.diffuseTexture.vScale = 6.5
tatami.bumpTexture = new Texture(tatamiNormalUrl)
tatami.bumpTexture.uScale = 7
tatami.bumpTexture.vScale = 6.5

export const diceMaterial = new StandardMaterial('diceMaterial')
diceMaterial.diffuseTexture = new Texture(diceUrl)
