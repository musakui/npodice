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

const diceOpt = { mass: 1, friction: 0.9, restitution: 0.8 } // bounce
const staticOpts = { mass: 0, friction: 0.9, restitution: 0.8 }

const createStaticObjects = () => {
  const bowl = Array.from({ length: 12 }, (_, i) => {
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

  const mid = BoxBuilder.CreateBox('cent', { width: 2.3, height: 0.9, depth: 2.3 })
  mid.isVisible = false

  return [...bowl, mid, floor]
}

export const physics = new PhysicsPlugin()
scene.enablePhysics(new Vector3(0, -9.81, 0), physics)
physics.setTimeStep(0.5)

export const dice = Array.from({ length: 10 }, (_, i) => createDice(i))

dice.forEach((d) => {
  d.physicsImpostor = new PhysicsImpostor(d, PhysicsImpostor.BoxImpostor, diceOpt)
  d.physicsImpostor.physicsBody.allowSleep = true
  d.physicsImpostor.physicsBody.sleepSpeedLimit = 0.3
  d.physicsImpostor.sleep()
})

dice.hide = () => dice.forEach((d, i) => {
  d.position.x = 50
  d.position.z = i * 2
  d.position.y = -5
})

const initThrow = (num) => dice.slice(0, num).map((d, i) => {
  d.position.x = rand() * 4
  d.position.z = rand() * 4
  d.position.y = 7 + i * 1.5
  d.rotation.z = rand() * Math.PI
  d.physicsImpostor.setLinearVelocity(new Vector3(rand(), rand(), rand()))
  d.physicsImpostor.setAngularVelocity(new Vector3(rand(), rand(), rand()))
  d.physicsImpostor.wakeUp()
  return d
})

dice.nudge = () => dice.forEach((d) => {
  if (d.position.y < 0 || d.position.y > 4) return
  d.physicsImpostor.wakeUp()
  const direction = new Vector3(rand(), 2 + 5 * Math.random(), rand())
  d.physicsImpostor.applyImpulse(direction, d.position)
})

dice.throwDice = (num) => {
  const current = initThrow(num)
  const isDone = () => current.every((d) => {
    if (d.physicsImpostor.physicsBody.sleepState === 2) return true
    if (d.position.y <= 0) setTimeout(() => d.physicsImpostor.sleep(), 2000)
    return false
  })

  current.done = () => new Promise((resolve) => {
    const observer = scene.onBeforeRenderObservable.add(() => {
      if (!isDone()) return
      scene.onBeforeRenderObservable.remove(observer)
      const result = [0, 0, 0, 0, 0, 0]
      result.out = 0
      result.nil = 0
      current.forEach((d) => ++result[getFace(d)])
      const yakus = getYaku(result)
      yakus.sort((a, b) => a.length - b.length)
      resolve({ result, yakus })
    })
  })
  return current
}

export const staticObjects = createStaticObjects()
staticObjects.forEach((b) => {
  b.physicsImpostor = new PhysicsImpostor(b, PhysicsImpostor.BoxImpostor, staticOpts)
})

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

  const ui = AdvancedDynamicTexture.CreateForMesh(bowlPlane)
  const rollDisplay = textBlock({ fontSize: 100, top: '-2%' })
  const diceDisplay = textBlock({ fontSize: 50, top: '10%' })
  ui.addControl(rollDisplay)
  ui.addControl(diceDisplay)

  const show = (roll, dice) => {
    rollDisplay.text = 'ROLL:' + `${roll}`.padStart(2, '  ')
    diceDisplay.text = `${dice} DICE`
  }

  const hide = () => {
    rollDisplay.text = ''
    diceDisplay.text = ''
  }

  return {
    ui,
    show,
    hide,
  }
}

const usePointer = (handler) => {
  const observePointer = scene.onPointerObservable.add((info) => {
    if (info.type === 1) handler(info.event.button)
  })
  return () => scene.onPointerObservable.remove(observePointer)
}

const spinUpCamera = () => {
  camera.useAutoRotationBehavior = true
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

export const view = {
  usePointer,
  spinUpCamera,
  spinDownCamera,
  bowl: createBowlDisplay(),
}