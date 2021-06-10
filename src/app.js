import '@babylonjs/core/Physics/physicsEngineComponent'
import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor'

import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture'
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock'

import { PlaneBuilder } from '@babylonjs/core/Meshes/Builders/planeBuilder'

import {
  Vector3,
  BoxBuilder,
  scene,
  camera,
  lensPipeline,
  floor,
} from './scene.js'

import { rand } from './util.js'
import { PhysicsPlugin } from './physics.js'
import { getYaku, getFace, createDice } from './dice.js'

const dice = Array.from({ length: 10 }, (_, i) => createDice(i))
const diceOpt = { mass: 1, friction: 0.9, restitution: 0.8 } // bounce
const staticOpts = { mass: 0, friction: 0.9, restitution: 0.8 }

const initPhysics = () => {
  const physics = new PhysicsPlugin()
  scene.enablePhysics(new Vector3(0, -9.81, 0), physics)

  const colliders = Array.from({ length: 12 }, (_, i) => {
    const depth = 0.6
    const r = i * 0.5 + 1.5
    const width = i < 3 ? 0.5 : 1
    const ht = Math.pow(i / 3.2, 2) * 0.18 + 0.39
    const segments = Math.ceil(r * 2 * Math.PI / width)
    const sAngle = Math.PI * 2 / segments
    const tilt = i === 11 ? 2 : (-r / 12)
    return Array.from({ length: segments }, (_, s) => {
      const c = BoxBuilder.CreateBox(`base-${s}`, { width, height: 0.1, depth })
      const a = s * sAngle
      c.isVisible = false
      c.rotation.y = a
      c.rotation.x = tilt
      c.position.y = ht
      c.position.x = r * Math.sin(a)
      c.position.z = r * Math.cos(a)
      return c
    })
  }).flat()

  colliders.unshift(BoxBuilder.CreateBox('cent', { width: 2.3, height: 0.9, depth: 2.3 }))
  colliders[0].isVisible = false
  colliders.unshift(floor)
  colliders.forEach((b) => {
    b.physicsImpostor = new PhysicsImpostor(b, PhysicsImpostor.BoxImpostor, staticOpts)
  })

  dice.forEach((d) => {
    d.physicsImpostor = new PhysicsImpostor(d, PhysicsImpostor.BoxImpostor, diceOpt)
    d.physicsImpostor.physicsBody.allowSleep = true
    d.physicsImpostor.sleep()
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

initPhysics()

  let rollDice = 5
  let rollNumber = 1
  let nudgesLeft = 0

  let observer = false

/*
  const finalDisplay = textBlock({ fontSize: 100, top: '0%' })
  const nudgeDisplay = textBlock({
    fontSize: 15,
    top: '45%', left: '-42%',
    width: '100px', height: '30px',
  })
  UI.addControl(finalDisplay)
  UI.addControl(nudgeDisplay)
*/

  const bowlPlane = PlaneBuilder.CreatePlane('bowlPlane', { size: 10 })
  bowlPlane.rotation.x = Math.PI / 2
  bowlPlane.rotation.y = -Math.PI / 2
  bowlPlane.position.y = 2.5

  const bowlUI = AdvancedDynamicTexture.CreateForMesh(bowlPlane)
  const rollDisplay = textBlock({ fontSize: 100, top: '-2%' })
  const diceDisplay = textBlock({ fontSize: 50, top: '10%' })
  bowlUI.addControl(rollDisplay)
  bowlUI.addControl(diceDisplay)

  const handleResult = async (faces) => {
    const result = [0, 0, 0, 0, 0, 0]
    result.out = 0
    result.nil = 0
    faces.forEach((face) => ++result[face])
    const yakus = getYaku(result)
    yakus.sort((a, b) => a.length - b.length)
    console.log(result, yakus)
    rollDice = 5 + Math.max(0, yakus.length - 1)
    /*
    for (const yaku of yakus) {
      finalDisplay.text = yaku
      await millis(1000)
    }
    await millis(1000)
    finalDisplay.text = ''
    */
    observer = false
    let curFD = 20
    let curEB = 0
    const fadeIn = scene.onBeforeRenderObservable.add(() => {
      let done = true
      if (curFD <= 90) {
        done = false
        lensPipeline.setFocusDistance(curFD)
        curFD += 4
      }
      if (curEB <= 0.9) {
        done = false
        lensPipeline.setEdgeBlur(curEB)
        curEB += 0.02
      }
      if (done) scene.onBeforeRenderObservable.remove(fadeIn)
    })
  }

  const throwDice = () => {
    ++rollNumber
    nudgesLeft = 3
    const current = dice.slice(0, rollDice)
    current.forEach((d, i) => {
      d.position.x = rand() * 4
      d.position.z = rand() * 4
      d.position.y = 7 + i * 2
      d.rotation.z = rand() * Math.PI
      d.physicsImpostor.setLinearVelocity(new Vector3(rand(), rand(), rand()))
      d.physicsImpostor.setAngularVelocity(new Vector3(rand(), rand(), rand()))
      d.physicsImpostor.wakeUp()
    })
    // nudgeDisplay.text = 'NUDGE' + `${nudgesLeft}`.padStart(2, '  ')
    observer = scene.onBeforeRenderObservable.add(() => {
      const done = current.every((d) => {
        if (d.physicsImpostor.physicsBody.sleepState === 2) return true
        if (d.position.y > 0) return false
        setTimeout(() => d.physicsImpostor.sleep(), 2000)
        return false
      })
      if (!done) return
      scene.onBeforeRenderObservable.remove(observer)
      observer = 0
      handleResult(current.map((d) => (d.position.y > 0) ? getFace(d) : 'out'))
  })
}

const pointerHandler = (info) => {
    if (info.type !== 1) return // PointerEventTypes.POINTERDOWN = 1
    if (info.event.button === 0) {
      if (observer === null) {
        rollDisplay.text = ''
        diceDisplay.text = ''
        throwDice()
      } else if (observer === false) {
        lensPipeline.disableEdgeBlur()
        lensPipeline.disableDepthOfField()
        dice.forEach((d, i) => {
          d.position.x = 50
          d.position.z = i * 2
          d.position.y = -5
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
      /*
      nudgeDisplay.text = 'NUDGE' + `${nudgesLeft}`.padStart(2, '  ')
      */
    }
}

export const startRound = async () => {
  camera.useAutoRotationBehavior = false
  scene.onPointerObservable.add(pointerHandler)
}