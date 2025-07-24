<template>
  <q-page class="q-pa-md">
    <!-- Formulario de asignación -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Asignar Medicamento a Paciente</div>
      </q-card-section>

      <q-form @submit.prevent="agregarMedicamento">
        <q-card-section class="q-gutter-md">
          <!-- DEBUG: ver pacientes traídos -->
          <p class="text-caption">DEBUG pacientes: {{ JSON.stringify(pacientes) }}</p>

          <q-select
            v-model="rutPaciente"
            :options="pacientes"
            option-label="nombre"
            option-value="rut"
            label="Paciente"
            filled
            :rules="[(v) => !!v || 'Campo obligatorio']"
          />

          <q-input
            v-model="nombre"
            label="Nombre del medicamento"
            filled
            :rules="[(v) => !!v || 'Campo obligatorio']"
          />
          <q-input
            v-model="dosis"
            label="Dosis"
            filled
            :rules="[(v) => !!v || 'Campo obligatorio']"
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
    <q-card class="q-mt-md" v-if="medicamentos.length">
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

    <!-- Lista de pacientes con sus medicamentos -->
    <q-card class="q-mt-md" v-if="pacientesConMedicamentos.length">
      <q-card-section class="bg-secondary text-white">
        <div class="text-h6">Pacientes con Medicamentos Asignados</div>
      </q-card-section>
      <q-card-section>
        <div v-for="pac in pacientesConMedicamentos" :key="pac.rut" class="q-mb-md">
          <div class="text-subtitle1">{{ pac.nombre }} ({{ pac.rut }})</div>

          <q-btn
            dense
            icon="picture_as_pdf"
            color="red"
            class="q-mr-sm q-mb-sm"
            label="Exportar PDF"
            @click="exportarPDF(pac)"
          />
          <q-btn
            dense
            icon="table_view"
            color="green"
            class="q-mb-sm"
            label="Exportar Excel"
            @click="exportarExcel(pac)"
          />

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

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const $q = useQuasar()

// refs para el formulario
const nombre = ref('')
const dosis = ref('')
const rutPaciente = ref('')
const dias = ref([])
const horas = ref([])
const horaTemporal = ref('')
const loading = ref(false)

// usuario logueado
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

// datos
const pacientes = ref([])
const medicamentos = ref([])
const editDialog = ref(false)
const editData = ref({ id: null, nombre: '', dosis: '', dias: '', horas: '' })
const pacientesConMedicamentos = ref([])

// columnas
const columns = [
  { name: 'nombre', label: 'Medicamento', field: 'nombre', sortable: true },
  { name: 'dosis', label: 'Dosis', field: 'dosis', sortable: true },
  { name: 'dias', label: 'Días', field: 'dias', sortable: true },
  { name: 'horas', label: 'Horas', field: 'horas', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones' },
]

const diasSemana = [
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' },
  { label: 'Domingo', value: 'Domingo' },
]

// un único onMounted
onMounted(async () => {
  console.log('🚀 CuidadorPage montado; rut=', usuario.rut)

  try {
    // traer pacientes a cargo
    const r1 = await api.get(`/pacientes_por_cuidador/${usuario.rut}`)
    console.log('🤖 GET pacientes_por_cuidador →', r1.data)
    pacientes.value = r1.data

    // para cada paciente, traer sus medicamentos
    pacientesConMedicamentos.value = []
    for (const p of pacientes.value) {
      const r2 = await api.get(`/medicamentos_por_rut/${p.rut}`)
      pacientesConMedicamentos.value.push({
        ...p,
        medicamentos: r2.data,
      })
    }
  } catch (err) {
    console.error('❌ Error al inicializar CuidadorPage:', err)
  }
})

// recargar tabla al cambiar paciente seleccionado
watch(rutPaciente, async () => {
  if (!rutPaciente.value) {
    medicamentos.value = []
    return
  }
  try {
    const r = await api.get(`/medicamentos_por_rut/${rutPaciente.value}`)
    medicamentos.value = r.data
  } catch (e) {
    console.error('Error al cargar medicamentos', e)
  }
})

// funciones utilitarias...
function agregarHora(h) {
  if (!horas.value.includes(h)) horas.value.push(h)
}
function eliminarHora(i) {
  horas.value.splice(i, 1)
}
function abrirEditar(row) {
  editData.value = { ...row }
  editDialog.value = true
}

// edición
async function guardarEdicion() {
  try {
    await api.put(`/medicamentos/${editData.value.id}`, editData.value)
    $q.notify({ type: 'positive', message: 'Medicamento actualizado' })
    editDialog.value = false
    // recarga
    const r = await api.get(`/medicamentos_por_rut/${rutPaciente.value}`)
    medicamentos.value = r.data
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'No se pudo actualizar' })
  }
}

// eliminación
async function eliminarMedicamento(row) {
  try {
    await api.delete(`/medicamentos/${row.id}`)
    $q.notify({ type: 'positive', message: 'Medicamento eliminado' })
    const r = await api.get(`/medicamentos_por_rut/${rutPaciente.value}`)
    medicamentos.value = r.data
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
  }
}

// alta
const agregarMedicamento = async () => {
  loading.value = true
  try {
    await api.post('/medicamentos_por_rut', {
      nombre,
      dosis,
      dias,
      horas,
      rut_paciente: rutPaciente.value,
    })
    $q.notify({ type: 'positive', message: 'Medicamento agregado' })
    // recarga tabla
    const r = await api.get(`/medicamentos_por_rut/${rutPaciente.value}`)
    medicamentos.value = r.data
    // reset form salvo rutPaciente
    nombre.value = ''
    dosis.value = ''
    dias.value = []
    horas.value = []
    horaTemporal.value = ''
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'No se pudo conectar al servidor' })
  } finally {
    loading.value = false
  }
}

// exportar
function exportarPDF(pac) {
  const doc = new jsPDF()
  doc.text(`Medicamentos de ${pac.nombre} (${pac.rut})`, 10, 10)
  const rows = pac.medicamentos.map((m) => [m.nombre, m.dosis, m.dias, m.horas])
  autoTable(doc, { head: [['Medicamento', 'Dosis', 'Días', 'Horas']], body: rows, startY: 20 })
  doc.save(`meds_${pac.rut}.pdf`)
}
function exportarExcel(pac) {
  const ws = XLSX.utils.json_to_sheet(pac.medicamentos)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Medicamentos')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf]), `meds_${pac.rut}.xlsx`)
}
</script>
