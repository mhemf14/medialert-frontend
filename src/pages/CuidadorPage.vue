<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Asignar Medicamento a Paciente</div>
      </q-card-section>

      <q-form @submit.prevent="agregarMedicamento">
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="nombre"
            label="Nombre del medicamento"
            filled
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
          <q-input
            v-model="dosis"
            label="Dosis"
            filled
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
          <q-input
            v-model="rutPaciente"
            label="RUT del paciente"
            filled
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />

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
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Agregar" color="primary" type="submit" :loading="loading" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()

const nombre = ref('')
const dosis = ref('')
const rutPaciente = ref('')
const dias = ref([])
const horas = ref([])
const horaTemporal = ref('')
const loading = ref(false)

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
  loading.value = true

  try {
    await api.post('/medicamentos_por_rut', {
      nombre: nombre.value,
      dosis: dosis.value,
      dias: dias.value,
      horas: horas.value,
      rut_paciente: rutPaciente.value,
    })

    $q.notify({ type: 'positive', message: 'Medicamento agregado correctamente' })
    nombre.value = ''
    dosis.value = ''
    dias.value = []
    horas.value = []
    rutPaciente.value = ''
    horaTemporal.value = ''
  } catch (err) {
    console.error('Error de conexión:', err)
    $q.notify({
      type: 'negative',
      message: err.response?.data?.error || 'No se pudo conectar al servidor',
    })
  } finally {
    loading.value = false
  }
}
</script>
