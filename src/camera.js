import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'

export const camera = new ArcRotateCamera('camera', Math.PI / 6, Math.PI / 3, 30, Vector3.Zero())
camera.wheelPrecision = 10
camera.upperBetaLimit = 1.4
camera.lowerRadiusLimit = 3
camera.upperRadiusLimit = 45
