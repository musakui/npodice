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

import { rand, millis } from './util.js'
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

const physics = initPhysics()

const textBlock = (opts) => {
  const txt = new TextBlock()
  txt.color = 'white'
  txt.fontFamily = 'monospace'
  Object.assign(txt, opts)
  return txt
}

const createBowlDisplay = () => {
  const bowlPlane = PlaneBuilder.CreatePlane('bowlPlane', { size: 10 })
  bowlPlane.rotation.x = Math.PI / 2
  bowlPlane.rotation.y = -Math.PI / 2
  bowlPlane.position.y = 2.5

  const bowlUI = AdvancedDynamicTexture.CreateForMesh(bowlPlane)
  const rollDisplay = textBlock({ fontSize: 100, top: '-2%' })
  const diceDisplay = textBlock({ fontSize: 50, top: '10%' })
  bowlUI.addControl(rollDisplay)
  bowlUI.addControl(diceDisplay)

  return async (roll, dice) => {
    rollDisplay.text = 'ROLL:' + `${roll}`.padStart(2, '  ')
    diceDisplay.text = `${dice} DICE`
    await millis(1500)
    rollDisplay.text = ''
    diceDisplay.text = ''
  }
}

const spinDownCamera = async () => {
  let speed = camera.autoRotationBehavior.idleRotationSpeed
  const oriSpeed = speed
  while (speed > 0.001) {
    speed *= 0.95
    camera.autoRotationBehavior.idleRotationSpeed = speed
    await millis(20)
  }
  camera.useAutoRotationBehavior = false
}

const bowlDisplay = createBowlDisplay()

export const startRound = async (state = {}) => {
  state.inRound = true
  state.throwing = 0 // 0 - before, 1 - during, 2 - after, 3 - done
  state.score = {}
  state.nudges = 5
  state.rolls = 3

  state.rollDice = 5
  state.rollNumber = 1
  state.rollResult = null

  let observePointer = null

  const handleResult = async (dc) => {
    const result = [0, 0, 0, 0, 0, 0]
    result.out = 0
    result.nil = 0
    dc.forEach((d) => ++result[getFace(d)])
    const yakus = getYaku(result)
    yakus.sort((a, b) => a.length - b.length)
    console.log(result, yakus)
    state.rollResult = yakus

    for (const yaku of yakus) {
      await state?.showResult(yaku)
    }
    if (yakus.length) { ++state.rolls }
    state.nudges += yakus.length
    state.rollDice = 5 + Math.max(0, yakus.length - 1)
    await millis(2000)
    state.throwing = 3

    if (state.rolls < 1) {
      scene.onPointerObservable.remove(observePointer)
      camera.useAutoRotationBehavior = true
      state.inRound = false
      state?.done()
      setTimeout(() => dice.forEach((d) => { d.position.y = -5 }), 100)
    }
  }

  const throwDice = () => {
    --state.rolls
    ++state.rollNumber
    state.throwing = 1
    state.rollResult = null
    const current = dice.slice(0, state.rollDice)
    current.forEach((d, i) => {
      d.position.x = rand() * 4
      d.position.z = rand() * 4
      d.position.y = 7 + i * 1.5
      d.rotation.z = rand() * Math.PI
      d.physicsImpostor.setLinearVelocity(new Vector3(rand(), rand(), rand()))
      d.physicsImpostor.setAngularVelocity(new Vector3(rand(), rand(), rand()))
      d.physicsImpostor.wakeUp()
    })

    const observer = scene.onBeforeRenderObservable.add(() => {
      const done = current.every((d) => {
        if (d.physicsImpostor.physicsBody.sleepState === 2) return true
        if (d.position.y <= 0) setTimeout(() => d.physicsImpostor.sleep(), 2000)
        return false
      })
      if (!done) return
      scene.onBeforeRenderObservable.remove(observer)
      state.throwing = 2
      handleResult(current)
    })
  }

  const pointerHandler = (info) => {
    if (info.type !== 1) return // PointerEventTypes.POINTERDOWN = 1
    const { button } = info.event
    if (button === 0) {
      if (state.throwing === 0) return throwDice()
      if (state.throwing === 3) {
        dice.forEach((d, i) => {
          d.position.x = 50
          d.position.z = i * 2
          d.position.y = -5
        })
        bowlDisplay(state.rollNumber, state.rollDice).then(() => {
          state.throwing = 0
        })
      }
    } else if (button === 2 && state.throwing === 1 && state.nudges > 0) {
      dice.forEach((d) => {
        if (d.position.y < 0 || d.position.y > 4) return
        d.physicsImpostor.wakeUp()
        const direction = new Vector3(rand(), 2 + 5 * Math.random(), rand())
        d.physicsImpostor.applyImpulse(direction, d.position)
      })
      --state.nudges
    }
  }

  await spinDownCamera()
  await bowlDisplay(state.rollNumber, state.rollDice)
  observePointer = scene.onPointerObservable.add(pointerHandler)
}