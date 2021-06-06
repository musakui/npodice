import { Vector3 } from '@babylonjs/core/Maths/math.vector'

export const getFace = (mesh, threshold = 0.85) => {
  const r = new Vector3(0, 0, 0)
  const q = mesh.rotationQuaternion

  Vector3.Right().rotateByQuaternionToRef(q, r)
  if (r.y >= threshold) return 2 // +X is up
  if (r.y <= -threshold) return 3 // -X is up

  Vector3.Up().rotateByQuaternionToRef(q, r)
  if (r.y >= threshold) return 4 // +Y is up
  if (r.y <= -threshold) return 5 // -Y is up

  Vector3.Forward().rotateByQuaternionToRef(q, r)
  if (r.y >= threshold) return 0 // +Z is up
  if (r.y <= -threshold) return 1 // -Z is up

  return 'nil'
}

export const getYaku = (result) => {
  const yaku = []
  const [ti, nn, o, ho, ha, na] = result
  if (ho > 1 && nn > 1) {
    yaku.push((ho > 2 && nn > 2) ? 'PONPONPON' : 'PONPON')
  }
  if (ti > 1 && nn > 1) {
    yaku.push(o ? 'OCHINCHIN' : 'CHINCHIN')
  }
  if (ha > 1 && ti > 1) {
    yaku.push('PACHIPACHI')
  }
  if (ha && na) {
    if (na > 1) {
      yaku.push(ti ? 'BANANACHI' : 'BANANA')
    } else {
      yaku.push(o ? 'OHANA' : 'HANA')
    }
  }
  return yaku
}
