<template>
  <q-page class="q-pa-md">
    <!-- Asignación de medicamento -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Asignar Medicamento a Paciente</div>
      </q-card-section>

      <q-form @submit.prevent="agregarMedicamento">
        <q-card-section class="q-gutter-md">
          <q-select
            v-model="rutPaciente"
            :options="pacientes"
            option-label="nombre"
            option-value="rut"
            label="Paciente"
            filled
            :rules="[(val: string) => !!val || 'Campo obligatorio']"
          />

          <q-input
            v-model="nombre"
            label="Nombre del medicamento"
            filled
            :rules="[(val: string) => !!val || 'Campo obligatorio']"
          />

          <q-input
            v-model="dosis"
            label="Dosis"
            filled
            :rules="[(val: string) => !!val || 'Campo obligatorio']"
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
                v-for="(h, i) in horas"
                :key="i"
                color="primary"
                text-color="white"
                removable
                @remove="eliminarHora(i)"
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

    <!-- Tabla de medicamentos del paciente seleccionado -->
    <q-card class="q-mt-md" v-if="medicamentos.length > 0">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Medicamentos del Paciente</div>
      </q-card-section>
      <q-card-section>
        <q-table :rows="medicamentos" :columns="columns" row-key="id" flat bordered>
          <template #body-cell-acciones="{ row }">
            <q-btn flat round icon="edit" color="primary" @click="abrirEditar(row)" />
            <q-btn flat round icon="delete" color="negative" @click="eliminarMedicamento(row)" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Diálogo de edición -->
    <q-dialog v-model="editDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="text-h6">Editar Medicamento</q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="editData.nombre" label="Nombre" />
          <q-input v-model="editData.dosis" label="Dosis" />
          <q-input v-model="editData.dias" label="Días" />
          <q-input v-model="editData.horas" label="Horas" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="guardarEdicion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Lista de todos los pacientes y sus medicamentos -->
    <q-card class="q-mt-md" v-if="pacientesConMedicamentos.length">
      <q-card-section class="bg-secondary text-white">
        <div class="text-h6">Pacientes con Medicamentos Asignados</div>
      </q-card-section>
      <q-card-section>
        <div v-for="pac in pacientesConMedicamentos" :key="pac.rut" class="q-mb-md">
          <div class="text-subtitle1">{{ pac.nombre }} ({{ pac.rut }})</div>
          <q-list bordered separator>
            <q-item v-for="med in pac.medicamentos" :key="med.id">
              <q-item-section>
                <q-item-label>{{ med.nombre }}</q-item-label>
                <q-item-label caption>
                  Dosis: {{ med.dosis }} | Días: {{ med.dias }} | Horas: {{ med.horas }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

// Tipado de Paciente
interface Paciente {
  rut: string
  nombre: string
}

// Tipado de Medicamento
interface Medicamento {
  id: number
  nombre: string
  dosis: string
  dias: string
  horas: string
}

const $q = useQuasar()

// Usuario logueado
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}') as { rut: string; rol: string }

// Select de pacientes y carga de pacientes con meds
const pacientes = ref<Paciente[]>([])
const pacientesConMedicamentos = ref<Array<Paciente & { medicamentos: Medicamento[] }>>([])

// Formulario de asignar
const rutPaciente = ref<string>('')
const nombre = ref<string>('')
const dosis = ref<string>('')
const dias = ref<string[]>([])
const horas = ref<string[]>([])
const horaTemporal = ref<string>('')
const loading = ref<boolean>(false)

// Tabla de medicamentos del paciente seleccionado
const medicamentos = ref<Medicamento[]>([])
const columns = [
  { name: 'nombre', label: 'Medicamento', field: 'nombre', sortable: true },
  { name: 'dosis', label: 'Dosis', field: 'dosis', sortable: true },
  { name: 'dias', label: 'Días', field: 'dias', sortable: true },
  { name: 'horas', label: 'Horas', field: 'horas', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones' },
]

// Opciones de días
const diasSemana = [
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' },
  { label: 'Domingo', value: 'Domingo' },
]

// Al montar, traigo mis pacientes y luego sus meds
onMounted(async () => {
  console.log('🚀 CuidadorPage montado; rut=', usuario.rut)

  try {
    const { data: pacs } = await api.get<Paciente[]>(`/pacientes_por_cuidador/${usuario.rut}`)
    console.log('🤖 GET /pacientes_por_cuidador →', pacs)
    pacientes.value = pacs

    // Para la lista de pacientes con sus meds
    pacientesConMedicamentos.value = []
    for (const p of pacs) {
      const { data: meds } = await api.get<Medicamento[]>(`/medicamentos_por_rut/${p.rut}`)
      pacientesConMedicamentos.value.push({ ...p, medicamentos: meds })
    }
  } catch (err) {
    console.error('❌ Error al cargar pacientes', err)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar pacientes' })
  }
})

// Cuando cambie el paciente seleccionado, cargo sus meds
watch(rutPaciente, cargarMedicamentos)

async function cargarMedicamentos() {
  if (!rutPaciente.value) {
    medicamentos.value = []
    return
  }
  try {
    const { data } = await api.get<Medicamento[]>(`/medicamentos_por_rut/${rutPaciente.value}`)
    medicamentos.value = data
  } catch (err) {
    console.error('❌ Error al cargar medicamentos', err)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar medicamentos' })
  }
}

function agregarHora(h: string) {
  if (!horas.value.includes(h)) {
    horas.value.push(h)
  }
}

function eliminarHora(idx: number) {
  horas.value.splice(idx, 1)
}

function abrirEditar(row: Medicamento) {
  editData.value = { ...row }
  editDialog.value = true
}

const editDialog = ref<boolean>(false)
const editData = ref<Medicamento>({ id: 0, nombre: '', dosis: '', dias: '', horas: '' })

async function guardarEdicion() {
  try {
    await api.put(`/medicamentos/${editData.value.id}`, editData.value)
    $q.notify({ type: 'positive', message: 'Medicamento actualizado' })
    editDialog.value = false
    cargarMedicamentos()
  } catch (err) {
    console.error('❌ Error al actualizar', err)
    $q.notify({ type: 'negative', message: 'No se pudo actualizar' })
  }
}

async function eliminarMedicamento(row: Medicamento) {
  try {
    await api.delete(`/medicamentos/${row.id}`)
    $q.notify({ type: 'positive', message: 'Medicamento eliminado' })
    cargarMedicamentos()
  } catch (err) {
    console.error('❌ Error al eliminar', err)
    $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
  }
}

async function agregarMedicamento() {
  loading.value = true
  try {
    await api.post('/medicamentos_por_rut', {
      nombre: nombre.value,
      dosis: dosis.value,
      dias: dias.value,
      horas: horas.value,
      rut_paciente: rutPaciente.value,
    })
    $q.notify({ type: 'positive', message: 'Medicamento agregado' })
    cargarMedicamentos()
    nombre.value = ''
    dosis.value = ''
    dias.value = []
    horas.value = []
    // mantengo el paciente seleccionado
  } catch (err) {
    console.error('❌ Error al agregar', err)
    $q.notify({ type: 'negative', message: 'No se pudo agregar' })
  } finally {
    loading.value = false
  }
}
</script>
