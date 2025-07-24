<template>
  <q-page class="q-pa-md">
    <q-card class="q-mb-md">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Vista del Paciente</div>
      </q-card-section>
      <q-card-section>
        <div class="text-subtitle1">Hora actual: {{ horaActual }}</div>
        <q-btn
          class="q-ml-sm"
          color="primary"
          flat
          label="Alto Contraste"
          @click="toggleContraste"
        />
      </q-card-section>
    </q-card>

    <q-card v-for="medicamento in medicamentos" :key="medicamento.id" class="q-mb-md">
      <q-card-section>
        <div class="text-h6">{{ medicamento.nombre }}</div>
        <div><strong>Dosis:</strong> {{ medicamento.dosis }}</div>
        <div><strong>Días programados:</strong> {{ medicamento.dias }}</div>
        <div><strong>Horario programado:</strong> {{ medicamento.horas }}</div>

        <q-btn
          class="q-mt-sm"
          :color="medicamento.confirmado ? 'green-3' : 'positive'"
          :label="medicamento.confirmado ? 'Toma Confirmada' : 'Confirmar toma'"
          :disable="medicamento.confirmado"
          @click="confirmarToma(medicamento)"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const medicamentos = ref([])
const horaActual = ref('')
const $q = useQuasar()
const usuario = JSON.parse(localStorage.getItem('usuario'))

const modoContraste = ref(false)

function toggleContraste() {
  modoContraste.value = !modoContraste.value
  if (modoContraste.value) {
    document.body.classList.add('high-contrast')
    localStorage.setItem('highContrast', 'true')
  } else {
    document.body.classList.remove('high-contrast')
    localStorage.setItem('highContrast', 'false')
  }
}

function traducirDia(diaIngles) {
  const mapa = {
    Monday: 'Lunes',
    Tuesday: 'Martes',
    Wednesday: 'Miércoles',
    Thursday: 'Jueves',
    Friday: 'Viernes',
    Saturday: 'Sábado',
    Sunday: 'Domingo',
  }
  return mapa[diaIngles] || diaIngles
}

function emitirAlarma() {
  const audio = new Audio('/alarma.mp3')
  audio.play()
  $q.notify({
    type: 'warning',
    message: 'Es hora de tomar tu medicamento!',
    timeout: 8000,
  })
}

function confirmarToma(med) {
  med.confirmado = true

  $q.notify({
    type: 'positive',
    message: 'Toma de medicamento realizada',
  })

  // Aquí podrías registrar la toma en el backend
}

let timer
onMounted(async () => {
  if (localStorage.getItem('highContrast') === 'true') {
    modoContraste.value = true
    document.body.classList.add('high-contrast')
  }
  const res = await fetch(
    `https://medialert-backend-1q8e.onrender.com/medicamentos_por_rut/${usuario.rut}`,
  )
  const data = await res.json()

  // Agregamos propiedad `confirmado` localmente para cada medicamento
  medicamentos.value = data.map((med) => ({ ...med, confirmado: false }))

  timer = setInterval(() => {
    const ahora = dayjs().tz('America/Santiago').format('HH:mm')
    horaActual.value = dayjs().tz('America/Santiago').format('HH:mm:ss')
    const diaActual = traducirDia(dayjs().tz('America/Santiago').format('dddd'))

    medicamentos.value.forEach((med) => {
      const horas = med.horas ? med.horas.split(',').map((h) => h.trim()) : []
      const dias = med.dias ? med.dias.split(',').map((d) => d.trim()) : []

      if (horas.includes(ahora) && dias.includes(diaActual)) {
        emitirAlarma()
      }
    })
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
  document.body.classList.remove('high-contrast')
})
</script>

<style scoped>
.text-h6 {
  font-weight: bold;
}
</style>
