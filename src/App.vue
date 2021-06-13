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
import { startRound } from './game.js'

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
  showResult,
  done: () => {
    header.style.marginTop = 0
    root.classList.remove('inactive')
  },
})

const start = () => {
  header.style.marginTop = '-100%'
  startRound(state)
  root.classList.add('inactive')
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
