const epsCheck = (n) => n < 0.001 ? 0.001 : n

export class PhysicsPlugin {

  constructor(_useDeltaForWorldStep = false, iterations = 10) {
    this.BJSCANNON = CANNON
    this._physicsMaterials = []
    this.world = new this.BJSCANNON.World()
    this.world.allowSleep = true
    this.world.solver.iterations = iterations
    this.world.broadphase = new this.BJSCANNON.NaiveBroadphase()
    this._useDeltaForWorldStep = _useDeltaForWorldStep
  }

  isSupported () {
    return true
  }

  executeStep (delta, impostors) {
    this.world.step(this._useDeltaForWorldStep ? delta : (delta * 0.5))
  }

  setTimeStep (timestep) {
    this._fixedTimeStep = timestep
  }

  setGravity (vec) {
    this.world.gravity.set(vec.x, vec.y, vec.z)
  }

  sleepBody (impostor) {
    impostor.physicsBody.sleep()
  }

  wakeUpBody (impostor) {
    impostor.physicsBody.wakeUp()
  }

  setLinearVelocity (impostor, v) {
    impostor.physicsBody.velocity.set(v.x, v.y, v.z)
  }

  setAngularVelocity (impostor, v) {
    impostor.physicsBody.angularVelocity.set(v.x, v.y, v.z)
  }

  setPhysicsBodyTransformation (impostor, np, nr) {
    impostor.physicsBody.position.set(np.x, np.y, np.z)
    impostor.physicsBody.quaternion.set(nr.x, nr.y, nr.z, nr.w)
  }

  setTransformationFromPhysicsBody  (impostor) {
    const { position: p, quaternion: q } = impostor.physicsBody
    impostor.object.position.set(p.x, p.y, p.z)
    if (impostor.object.rotationQuaternion) {
      impostor.object.rotationQuaternion.set(q.x, q.y, q.z, q.w)
    }
  }

  applyImpulse(impostor, f, p) {
    impostor.physicsBody.applyImpulse(new this.BJSCANNON.Vec3(f.x, f.y, f.z), new this.BJSCANNON.Vec3(p.x, p.y, p.z))
  }

  generatePhysicsBody (impostor) {
    if (impostor.isBodyInitRequired()) {
      const box = impostor.getObjectExtendSize().scale(0.5)
      const size = new this.BJSCANNON.Vec3(epsCheck(box.x), epsCheck(box.y), epsCheck(box.z))
      impostor.physicsBody = new this.BJSCANNON.Body({
        mass: impostor.getParam('mass'),
        material: this._addMaterial("mat-" + impostor.uniqueId, impostor.getParam('friction'), impostor.getParam('restitution')),
      })
      impostor.physicsBody.addShape(new this.BJSCANNON.Box(size))
      impostor.physicsBody.addEventListener('collide', impostor.onCollide)
      this.world.addEventListener('preStep', impostor.beforeStep)
      this.world.addEventListener('postStep', impostor.afterStep)
      this.world.addBody(impostor.physicsBody)
    }
    const object = impostor.object
    object.computeWorldMatrix && object.computeWorldMatrix(true)
    if (!object.getBoundingInfo()) return
  }

  _addMaterial (name, friction, restitution) {
    let index, mat
    for (index = 0; index < this._physicsMaterials.length; ++index) {
      mat = this._physicsMaterials[index]
      if (mat.friction === friction && mat.restitution === restitution) return mat
    }

    const currentMat = new this.BJSCANNON.Material(name)
    currentMat.friction = friction
    currentMat.restitution = restitution
    this._physicsMaterials.push(currentMat)
    return currentMat
  }
}