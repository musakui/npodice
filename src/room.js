import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'

import { BoxBuilder } from '@babylonjs/core/Meshes/Builders/boxBuilder'
import { GroundBuilder } from '@babylonjs/core/Meshes/Builders/groundBuilder'
//import { RibbonBuilder } from '@babylonjs/core/Meshes/Builders/ribbonBuilder'

import { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor'

import { wood } from './materials.js'

const impOpts = { mass: 0, friction: 0.9, restitution: 0.8 }

const bowlGen = (size, length = 150) => {
  const half = (length - 1) / 2
  const sc = Math.PI / 2 / half
  const scale = size / length
  const h = (x, z) => (Math.hypot(x, z) > half) ? 0 : (Math.cos(x * sc) + Math.cos(z * sc))
  const v = (x, z) => {
    const ht = h(x, z)
    return new Vector3(x * scale, ht ? (4.9 - 2.25 * ht) : -0.1, z * scale)
  }
  return Array.from({ length }, (_, i) => Array.from({ length }, (_, j) => v(i - half, j - half)))
}

export function makeRoom() {
  const skylight = new HemisphericLight('skylight', new Vector3(-0.4, 1, -0.4))
  skylight.intensity = 0.1

  const spotlight = new SpotLight('spotlight', new Vector3(0, 50, 0), new Vector3(0, -1, 0), Math.PI / 6, 2)
  spotlight.intensity = 0.3

  const walls = Array.from({ length: 4 }, (_, i) => {
    const w = GroundBuilder.CreateGround('w', { width: 50, height: 50 })
    w.material = wood
    w.position.y = 25
    w.rotation.x = Math.PI / 2
    w.rotation.y = i * Math.PI / 2
    w.physicsImpostor = new PhysicsImpostor(w, PhysicsImpostor.BoxImpostor, impOpts)
    return w
  })
  walls[0].position.z = -25
  walls[1].position.x = -25
  walls[2].position.z = 25
  walls[3].position.x = 25

  const floor = GroundBuilder.CreateGround('floor', { width: 70, height: 70 })
  floor.position.y = -0.6
  floor.material = wood
  floor.physicsImpostor = new PhysicsImpostor(floor, PhysicsImpostor.BoxImpostor, impOpts)

  const cent = BoxBuilder.CreateBox('cent', { width: 2, height: 0.7, depth: 2 })
  cent.physicsImpostor = new PhysicsImpostor(cent, PhysicsImpostor.BoxImpostor, impOpts)
  cent.visibility = false

  Array.from({ length: 11 }, (_, i) => {
    const depth = 0.6
    const r = i * 0.5 + 1.5
    const width = i < 3 ? 0.5 : 1
    const height = Math.pow(i / 3.2, 2) * 0.2 + 0.3
    const segments = Math.ceil(r * 2 * Math.PI / width)
    const scaleAngle = Math.PI * 2 / segments
    const tilt = -r / 10
    Array.from({ length: segments }, (_, c) => {
      const cb = BoxBuilder.CreateBox(`base-${c}`, { width, height: 0.1, depth })
      const a = c * scaleAngle
      cb.rotation.y = a
      cb.rotation.x = tilt
      cb.position.x = r * Math.sin(a)
      cb.position.z = r * Math.cos(a)
      cb.position.y = height
      cb.visibility = false
      cb.physicsImpostor = new PhysicsImpostor(cb, PhysicsImpostor.BoxImpostor, impOpts)
    })
  })
}
