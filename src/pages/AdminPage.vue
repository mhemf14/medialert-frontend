<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Panel de Asignaciones</div>
      </q-card-section>

      <q-table :rows="asignaciones" :columns="columns" row-key="id" flat bordered />

      <q-banner v-if="error" class="bg-red text-white q-pa-sm">
        {{ error }}
      </q-banner>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const asignaciones = ref([])
const error = ref('')

const columns = [
  { name: 'cuidador', label: 'Cuidador', field: 'cuidador' },
  { name: 'paciente', label: 'Paciente', field: 'paciente' },
  { name: 'medicamento', label: 'Medicamento', field: 'medicamento' },
  { name: 'dias', label: 'Días', field: 'dias' },
  { name: 'horas', label: 'Horas', field: 'horas' },
]

const cargarAsignaciones = async () => {
  try {
    const res = await api.get('/admin/asignaciones')
    asignaciones.value = res.data
    console.log('Asignaciones:', res.data)
  } catch (err) {
    error.value = 'No se pudieron cargar las asignaciones'
    console.error(err)
  }
}

onMounted(cargarAsignaciones)
</script>
