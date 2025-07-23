<template>
  <q-page class="q-pa-md admin-page">
    <q-card>
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Panel de Asignaciones</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          filled
          v-model="filtro"
          label="Filtrar"
          @input="filtrarAsignaciones"
        />

        <q-table
          :rows="filtradas"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :pagination="pagination"
          :rows-per-page-options="[5, 10, 25]"
          :loading="loading"
        >
          <template #body-cell-acciones="{ row }">
            <q-btn
              flat
              round
              icon="edit"
              color="primary"
              @click="abrirEditar(row)"
            />
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="eliminarAsignacion(row)"
            />
          </template>
        </q-table>

        <div class="text-center q-my-md" v-if="loading">
          <q-spinner color="primary" size="2em" />
        </div>

        <q-banner v-if="error" class="bg-red text-white q-pa-sm">
          {{ error }}
        </q-banner>
      </q-card-section>
    </q-card>

    <q-dialog v-model="editDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="text-h6">Editar Asignación</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="editData.cuidador" label="Cuidador" />
          <q-input v-model="editData.paciente" label="Paciente" />
          <q-input v-model="editData.medicamento" label="Medicamento" />
          <q-input v-model="editData.dias" label="Días" />
          <q-input v-model="editData.horas" label="Horas" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="guardarAsignacion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from 'boot/axios'

const asignaciones = ref([])
const error = ref('')
const filtro = ref('')
const loading = ref(false)
const pagination = ref({ rowsPerPage: 5 })
const editDialog = ref(false)
const editData = ref({ cuidador: '', paciente: '', medicamento: '', dias: '', horas: '', id: null })

const filtradas = computed(() => {
  if (!filtro.value) return asignaciones.value
  const term = filtro.value.toLowerCase()
  return asignaciones.value.filter((a) =>
    Object.values(a).some((v) => String(v).toLowerCase().includes(term)),
  )
})

const columns = [
  { name: 'cuidador', label: 'Cuidador', field: 'cuidador', sortable: true },
  { name: 'paciente', label: 'Paciente', field: 'paciente', sortable: true },
  { name: 'medicamento', label: 'Medicamento', field: 'medicamento', sortable: true },
  { name: 'dias', label: 'Días', field: 'dias', sortable: true },
  { name: 'horas', label: 'Horas', field: 'horas', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones', sortable: false },
]

const cargarAsignaciones = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/asignaciones')
    asignaciones.value = res.data
    console.log('Asignaciones:', res.data)
  } catch (err) {
    error.value = 'No se pudieron cargar las asignaciones'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function filtrarAsignaciones() {
  // handled by computed property
}

function abrirEditar(row) {
  editData.value = { ...row }
  editDialog.value = true
}

function guardarAsignacion() {
  editDialog.value = false
  // Aquí podrías enviar los cambios al backend
}

function eliminarAsignacion(row) {
  // Aquí podrías eliminar la asignación en el backend
  console.log('Eliminar asignación', row)
}

onMounted(cargarAsignaciones)
</script>

<style scoped>
.admin-page .q-table {
  font-size: 14px;
}
</style>
