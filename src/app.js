import '@babylonjs/core/Physics/physicsEngineComponent'
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor'
//import { AmmoJSPlugin } from '@babylonjs/core/Physics/Plugins/ammoJSPlugin'
import { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins/cannonJSPlugin'

import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import { Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector'

import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'

import { AdvancedDynamicTexture } from '@babylonjs/gui/2D'
import { Button } from '@babylonjs/gui/2D/controls/button'
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock'

import { BoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { PlaneBuilder } from '@babylonjs/core/Meshes/Builders/planeBuilder'
//import { CylinderBuilder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder'

import { makeRoom } from './room.js'
import { diceMaterial } from './materials.js'
import { getYaku, getFace } from './dice.js'

const diceOpt = {
  mass: 1,
  friction: 0.9,
  restitution: 0.8, // bounce
}

const rand = () => Math.random() - 0.5
const millis = (d) => new Promise((resolve) => setTimeout(resolve, d))

export async function init (scene) {
  import('./models.js').then((m) => m.loadModels())

  const dieCount = 5
  const physics = new CannonJSPlugin()
  physics.world.allowSleep = true
  scene.enablePhysics(new Vector3(0, -9.81, 0), physics)
  scene.getPhysicsEngine().setSubTimeStep(5)

  makeRoom()
  
  const faceUV = Array.from({ length: 6 }, (_, i) => new Vector4(i / 6, 0, (i + 1) / 6, 1))
  const dice = Array.from({ length: dieCount }, (_, i) => {
    const d = BoxBuilder.CreateBox('die', { size: 1, faceUV, wrap: true })
    d.position.x = 50
    d.position.z = i * 2
    d.position.y = 0
    d.rotation.x = rand() * Math.PI
    d.rotation.y = rand() * Math.PI
    d.rotation.z = rand() * Math.PI
    d.material = diceMaterial
    d.physicsImpostor = new PhysicsImpostor(d, PhysicsImpostor.BoxImpostor, diceOpt)
    d.physicsImpostor.physicsBody.allowSleep = true
    return d
  })

  let butt = null
  let observer = null
  let nudgesLeft = 0

  const finalDisplay = new TextBlock()
  finalDisplay.color = 'white'
  finalDisplay.fontSize = 100
  finalDisplay.top = '0%'

  const againDisplay = new TextBlock()
  againDisplay.color = 'white'
  againDisplay.fontSize = 50
  againDisplay.top = '25%'
  againDisplay.text = ''

  const nudgesDisplay = new TextBlock()
  nudgesDisplay.width = '100px'
  nudgesDisplay.height = '30px'
  nudgesDisplay.color = 'white'
  nudgesDisplay.fontSize = 15
  nudgesDisplay.left = '-42%'
  nudgesDisplay.top = '45%'

  const UI = AdvancedDynamicTexture.CreateFullscreenUI('UI')
  UI.addControl(finalDisplay)
  UI.addControl(againDisplay)
  UI.addControl(nudgesDisplay)

  const bowlPlane = PlaneBuilder.CreatePlane('bowlPlane', { size: 10 })
  bowlPlane.rotation.x = Math.PI / 2
  bowlPlane.rotation.y = -Math.PI / 2
  bowlPlane.position.y = 2.5 

  const bowlUI = AdvancedDynamicTexture.CreateForMesh(bowlPlane)
  butt = Button.CreateSimpleButton('start', 'Start')
  butt.width = 100
  butt.height = 100
  butt.color = 'white'
  butt.fontSize = 200
  butt.fontFamily = 'Helvetica'
  bowlUI.addControl(butt)

  const handleResult = async (faces) => {
    const result = [0, 0, 0, 0, 0, 0]
    result.out = 0
    result.nil = 0
    faces.forEach((face) => ++result[face])
    const yakus = getYaku(result)
    yakus.sort((a, b) => a.length - b.length)
    console.log(result, yakus)
    for (const yaku of yakus) {
      finalDisplay.text = yaku
      await millis(1000)
    }
    await millis(1000)
    finalDisplay.text = ''
    againDisplay.text = 'again?'
    observer = false
  }

  const throwDice = () => {
    nudgesLeft = 3
    dice.forEach((d, i) => {
      physics.wakeUpBody(d.physicsImpostor)
      d.position.x = rand() * 4
      d.position.z = rand() * 4
      d.position.y = 7 + i * 2
      d.rotation.x = rand() * Math.PI
      d.rotation.y = rand() * Math.PI
      d.rotation.z = rand() * Math.PI
      d.physicsImpostor.setLinearVelocity(new Vector3(rand(), rand(), rand()))
    })
    nudgesDisplay.text = `nudge: ${nudgesLeft}`
    observer = scene.onBeforeRenderObservable.add(() => {
      if (dice.some((d) => d.physicsImpostor.physicsBody.sleepState !== 2)) return
      scene.onBeforeRenderObservable.remove(observer)
      observer = 0
      handleResult(dice.map((d) => (d.position.y > 0) ? getFace(d) : 'out'))
    })
  }

  scene.onPointerObservable.add((info) => {
    if (info.type !== PointerEventTypes.POINTERDOWN) return
    if (info.event.button === 0) {
      if (observer === null) {
        butt.isVisible = false
        throwDice()
      } else if (observer === false) {
        dice.forEach((d, i) => {
          d.position.x = 50
          d.position.z = i * 2
          d.position.y = 0
        })
        againDisplay.text = ''
        butt.isVisible = true
        observer = null
      }
    } else if (info.event.button === 2 && observer && nudgesLeft > 0) {
      console.log('nudge')
      dice.forEach((d) => {
        physics.wakeUpBody(d.physicsImpostor)
        const direction = new Vector3(rand(), 2 + 5 * Math.random(), rand())
        physics.applyImpulse(d.physicsImpostor, direction, d.position)
      })
      --nudgesLeft
      nudgesDisplay.text = `nudge: ${nudgesLeft}`
    }
  })
}
