import '@babylonjs/core/Physics/physicsEngineComponent'
import '@babylonjs/core/Rendering/depthRendererSceneComponent'

import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor'
//import { AmmoJSPlugin } from '@babylonjs/core/Physics/Plugins/ammoJSPlugin'
import { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins/cannonJSPlugin'

import { Vector3, Vector2 } from '@babylonjs/core/Maths/math.vector'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'

import { AdvancedDynamicTexture } from '@babylonjs/gui/2D'
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock'

import { BoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { PlaneBuilder } from '@babylonjs/core/Meshes/Builders/planeBuilder'
import { LensRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/lensRenderingPipeline'

import { scene, camera } from './scene.js'
import { floor, dice, bowlColliders } from './room.js'
import { getYaku, getFace } from './dice.js'

const rand = () => Math.random() - 0.5
const millis = (d) => new Promise((resolve) => setTimeout(resolve, d))

const diceOpt = { mass: 1, friction: 0.9, restitution: 0.8 } // bounce
const staticOpts = { mass: 0, friction: 0.9, restitution: 0.8 }

const initPhysics = () => {
  const physics = new CannonJSPlugin()
  physics.world.allowSleep = true
  scene.enablePhysics(new Vector3(0, -9.81, 0), physics)
  scene.getPhysicsEngine().setSubTimeStep(5)

  floor.physicsImpostor = new PhysicsImpostor(floor, PhysicsImpostor.BoxImpostor, staticOpts)
  bowlColliders.forEach((b) => {
    b.physicsImpostor = new PhysicsImpostor(b, PhysicsImpostor.BoxImpostor, staticOpts)
  })

  dice.forEach((d) => {
    d.physicsImpostor = new PhysicsImpostor(d, PhysicsImpostor.BoxImpostor, diceOpt)
    d.physicsImpostor.physicsBody.allowSleep = true
    physics.sleepBody(d.physicsImpostor)
  })
  return physics
}

const UI = AdvancedDynamicTexture.CreateFullscreenUI('UI')

const textBlock = (opts) => {
  const txt = new TextBlock()
  txt.color = 'white'
  txt.fontFamily = 'monospace'
  Object.assign(txt, opts)
  return txt
}

const lensPP = new LensRenderingPipeline('lens', {
  edge_blur: 0.7,
  grain_amount: 0.3,
  dof_gain: 1.0,
  dof_darken: 0.6,
  dof_focus_distance: 90,
  chromatic_aberration: 0.5,
}, scene, 1.0, camera)

export async function init () {
  let rollDice = 5
  let rollNumber = 1
  let nudgesLeft = 0

  let observer = false

  const finalDisplay = textBlock({ fontSize: 100, top: '0%' })
  const nudgeDisplay = textBlock({
    fontSize: 15,
    top: '45%', left: '-42%',
    width: '100px', height: '30px',
  })
  UI.addControl(finalDisplay)
  UI.addControl(nudgeDisplay)

  const bowlPlane = PlaneBuilder.CreatePlane('bowlPlane', { size: 10 })
  bowlPlane.rotation.x = Math.PI / 2
  bowlPlane.rotation.y = -Math.PI / 2
  bowlPlane.position.y = 2.5

  const bowlUI = AdvancedDynamicTexture.CreateForMesh(bowlPlane)
  const rollDisplay = textBlock({ fontSize: 100, top: '-2%' })
  const diceDisplay = textBlock({ fontSize: 50, top: '10%' })
  bowlUI.addControl(rollDisplay)
  bowlUI.addControl(diceDisplay)

  const physics = initPhysics()

  const handleResult = async (faces) => {
    const result = [0, 0, 0, 0, 0, 0]
    result.out = 0
    result.nil = 0
    faces.forEach((face) => ++result[face])
    const yakus = getYaku(result)
    yakus.sort((a, b) => a.length - b.length)
    console.log(result, yakus)
    rollDice = 5 + Math.max(0, yakus.length - 1)
    for (const yaku of yakus) {
      finalDisplay.text = yaku
      await millis(1000)
    }
    await millis(1000)
    finalDisplay.text = ''
    observer = false
    let curFD = 20
    let curEB = 0
    const fadeIn = scene.onBeforeRenderObservable.add(() => {
      let done = true
      if (curFD <= 90) {
        done = false
        lensPP.setFocusDistance(curFD)
        curFD += 4
      }
      if (curEB <= 0.9) {
        done = false
        lensPP.setEdgeBlur(curEB)
        curEB += 0.02
      }
      if (done) scene.onBeforeRenderObservable.remove(fadeIn)
    })
  }

  const throwDice = () => {
    ++rollNumber
    nudgesLeft = 3
    dice.slice(0, rollDice).forEach((d, i) => {
      d.position.x = rand() * 4
      d.position.z = rand() * 4
      d.position.y = 7 + i * 2
      d.rotation.z = rand() * Math.PI
      d.physicsImpostor.setLinearVelocity(new Vector3(rand(), rand(), rand()))
      d.physicsImpostor.setAngularVelocity(new Vector3(rand(), rand(), rand()))
      d.physicsImpostor.wakeUp()
    })
    nudgeDisplay.text = 'NUDGE' + `${nudgesLeft}`.padStart(2, '  ')
    observer = scene.onBeforeRenderObservable.add(() => {
      const done = dice.every((d) => {
        if (d.physicsImpostor.physicsBody.sleepState === 2) return true
        if (d.position.y > 0) return false
        setTimeout(() => physics.sleepBody(d.physicsImpostor), 2000)
        return false
      })
      if (!done) return
      scene.onBeforeRenderObservable.remove(observer)
      observer = 0
      handleResult(dice.map((d) => (d.position.y > 0) ? getFace(d) : 'out'))
    })
  }

  scene.onPointerObservable.add((info) => {
    if (info.type !== PointerEventTypes.POINTERDOWN) return
    if (info.event.button === 0) {
      if (observer === null) {
        rollDisplay.text = ''
        diceDisplay.text = ''
        throwDice()
      } else if (observer === false) {
        lensPP.disableEdgeBlur()
        lensPP.disableDepthOfField()
        dice.forEach((d, i) => {
          d.position.x = 50
          d.position.z = i * 2
          d.position.y = 0
        })
        rollDisplay.text = 'ROLL:' + `${rollNumber}`.padStart(2, '  ')
        diceDisplay.text = `${rollDice} DICE`
        observer = null
      }
    } else if (info.event.button === 2 && observer && nudgesLeft > 0) {
      dice.forEach((d) => {
        if (d.position.y < 0) return
        d.physicsImpostor.wakeUp()
        const direction = new Vector3(rand(), 2 + 5 * Math.random(), rand())
        d.physicsImpostor.applyImpulse(direction, d.position)
      })
      --nudgesLeft
      nudgeDisplay.text = 'NUDGE' + `${nudgesLeft}`.padStart(2, '  ')
    }
  })
}
