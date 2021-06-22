<template>
  <div id="startholder">
    <button v-if="!first && !state.inRound" class="ld" @click="start">
      START
    </button>
  </div>
  <div id="result" ref="result">{{ text }}</div>
  <footer v-if="state.inRound">
    <div id="nudges">NUDGE {{ state.nudges }}</div>
    <div id="rolls">{{ state.rolls }}</div>
  </footer>
</template>

<script setup>
import { ref, reactive } from 'vue'

import {
  view,
  dice,
  physics,
} from './game.js'

import { millis } from './util.js'

const result = ref(null)
const text = ref('')
const first = ref(true)

const root = document.querySelector('#app')
const header = document.querySelector('header')

const showResult = (txt) => new Promise((resolve) => {
  text.value = txt
  result.value.classList.add('show')
  result.value.addEventListener('animationend', () => {
    text.value = ''
    result.value.classList.remove('show')
    setTimeout(() => resolve(), 100)
  }, { once: true, capture: false })
})

const state = reactive({
  inRound: false,
  rolls: 3,
  nudges: 5,
})

const throwDice = async () => {
  --state.rolls
  ++state.rollNumber
  const current = dice.throwDice(state.rollDice)
  const stopNudge = view.usePointer((button) => {
    if (button !== 2) return
    dice.nudge()
    --state.nudges
  })
  setTimeout(() => physics.setTimeStep(1), 5000)
  const { result, yakus } = await current.done()
  stopNudge()

  physics.setTimeStep(0.5)
  console.log(result, yakus)
  for (const yaku of yakus) {
    await showResult(yaku)
  }
  if (yakus.length) { ++state.rolls }
  state.nudges += yakus.length
  state.rollDice = 5 + Math.max(0, yakus.length - 1)
  await millis(2000)
  const stop = view.usePointer((button) => {
    if (button !== 0) return
    stop()
    dice.hide()
    beforeThrow()
  })

  if (state.rolls < 1) {
    view.spinUpCamera()
    state.inRound = false
    header.style.marginTop = 0
    root.classList.remove('inactive')
    setTimeout(() => dice.hide(), 100)
  }
}

const start = async () => {
  header.style.marginTop = '-100%'
  root.classList.add('inactive')
  state.inRound = true
  state.rolls = 3
  state.nudges = 5
  state.rollDice = 5
  state.rollNumber = 1
  await view.spinDownCamera()
  await beforeThrow()
}

async function beforeThrow () {
  await view.bowl.show(state.rollNumber, state.rollDice)
  await millis(2000)
  view.bowl.hide()
  const stop = view.usePointer((button) => {
    if (button !== 0) return
    stop()
    throwDice()
  })
}

const startButton = document.querySelector('.ld')
if (startButton) {
  startButton.classList.remove('running')
  startButton.onclick = () => {
    first.value = false
    setTimeout(() => startButton.parentNode.removeChild(startButton), 1000)
    start()
  }
}
</script>

<style>
#app.inactive {
  pointer-events: none;
}

#startholder {
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;
  margin-top: 50vh;
}

#startholder button {
  z-index: 100;
}

footer {
  position: absolute;
  height: 10vh;
  width: 99vw;
  bottom: 0;
}

#nudges {
  position: absolute;
  left: 30px;
  bottom: 20px;
}

#rolls {
  position: absolute;
  right: 20px;
  bottom: 10px;
  border: 1px solid white;
  border-radius: 2px;
  padding: 1em;
}
</style>
