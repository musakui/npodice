export const rand = (n = 1) => (Math.random() - 0.5) * n
export const millis = (d) => new Promise((resolve) => setTimeout(resolve, d))

export const cannonReady = new Promise(async (resolve) => {
  while (!window.CANNON) await millis(100)
  resolve(window.CANNON)
})
