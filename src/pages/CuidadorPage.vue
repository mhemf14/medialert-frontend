<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Asignar Medicamento a Paciente</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="nombre" label="Nombre del medicamento" filled />
        <q-input v-model="dosis" label="Dosis" filled />
        <q-input v-model="rutPaciente" label="RUT del paciente" filled />

        <div>
          <div class="text-subtitle2">Selecciona los días:</div>
          <q-option-group type="checkbox" :options="diasSemana" v-model="dias" inline />
        </div>

        <div>
          <div class="text-subtitle2">Agrega las horas:</div>
          <q-time v-model="horaTemporal" format24h @update:model-value="agregarHora" />
          <div class="q-mt-sm">
            <q-chip
              v-for="(h, index) in horas"
              :key="index"
              color="primary"
              text-color="white"
              removable
              @remove="eliminarHora(index)"
            >
              {{ h }}
            </q-chip>
          </div>
        </div>

        <q-banner v-if="error" class="bg-red text-white q-pa-sm">
          {{ error }}
        </q-banner>
        <q-banner v-if="success" class="bg-green text-white q-pa-sm">
          {{ success }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Agregar" color="primary" @click="agregarMedicamento" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// 👉 Puedes mover esto a un archivo de configuración global si prefieres
const API_BASE_URL = 'https://medialert-backend-1q8e.onrender.com'

const nombre = ref('')
const dosis = ref('')
const rutPaciente = ref('')
const dias = ref([])
const horas = ref([])
const horaTemporal = ref('')
const error = ref('')
const success = ref('')

const diasSemana = [
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' },
  { label: 'Domingo', value: 'Domingo' },
]

function agregarHora(hora) {
  if (!horas.value.includes(hora)) {
    horas.value.push(hora)
  }
}

function eliminarHora(index) {
  horas.value.splice(index, 1)
}

const agregarMedicamento = async () => {
  error.value = ''
  success.value = ''

  try {
    const res = await fetch(`${API_BASE_URL}/medicamentos_por_rut`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.value,
        dosis: dosis.value,
        dias: dias.value,
        horas: horas.value,
        rut_paciente: rutPaciente.value,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.error || 'Error al agregar medicamento'
      return
    }

    success.value = 'Medicamento agregado correctamente'
    nombre.value = ''
    dosis.value = ''
    dias.value = []
    horas.value = []
    rutPaciente.value = ''
    horaTemporal.value = ''
  } catch (err) {
    console.error('Error de conexión:', err)
    error.value = 'No se pudo conectar al servidor'
  }
}
</script>
