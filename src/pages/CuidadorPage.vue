<template>
  <q-page class="q-pa-md">
    <!-- Asignar medicamento -->
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
            :rules="[(v) => !!v || 'Selecciona un paciente']"
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

    <!-- Información del paciente seleccionado -->
    <q-card class="q-mt-md" v-if="pacienteActual">
      <q-card-section class="bg-grey-3">
        <div class="text-h6">Datos del Paciente</div>
      </q-card-section>
      <q-card-section>
        <div><strong>Nombre:</strong> {{ pacienteActual.nombre }}</div>
        <div><strong>RUT:</strong> {{ pacienteActual.rut }}</div>
        <div v-if="pacienteActual.telefono">
          <strong>Teléfono:</strong> {{ pacienteActual.telefono }}
        </div>
      </q-card-section>
    </q-card>

    <!-- Medicamentos del paciente seleccionado -->
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
          <div>
            <div class="text-subtitle2">Días:</div>
            <q-option-group type="checkbox" :options="diasSemana" v-model="editDias" inline />
          </div>
          <div>
            <div class="text-subtitle2">Horas:</div>
            <q-time v-model="editHoraTemporal" format24h @update:model-value="agregaHoraEdicion" />
            <div class="q-mt-sm">
              <q-chip
                v-for="(h, i) in editHoras"
                :key="i"
                color="primary"
                text-color="white"
                removable
                @remove="eliminarHoraEdicion(i)"
              >
                {{ h }}
              </q-chip>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="guardarEdicion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Lista completa de pacientes con sus medicamentos -->
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
              <q-item-section side>
                <q-btn flat round icon="edit" color="primary" @click="abrirEditar(med)" />
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click="eliminarMedicamento(med)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

const pacientes = ref([])
const pacientesConMedicamentos = ref([])
const rutPaciente = ref('')
const nombre = ref('')
const dosis = ref('')
const dias = ref([])
const horas = ref([])
const horaTemporal = ref('')
const loading = ref(false)

const medicamentos = ref([])
const columns = [
  { name: 'nombre', label: 'Medicamento', field: 'nombre', sortable: true },
  { name: 'dosis', label: 'Dosis', field: 'dosis', sortable: true },
  { name: 'dias', label: 'Días', field: 'dias', sortable: true },
  { name: 'horas', label: 'Horas', field: 'horas', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones' },
]

function normalizarMedicamento(m) {
  return {
    ...m,
    dias: Array.isArray(m.dias) ? m.dias.join(', ') : m.dias,
    horas: Array.isArray(m.horas) ? m.horas.join(', ') : m.horas,
  }
}

const diasSemana = [
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' },
  { label: 'Domingo', value: 'Domingo' },
]

const editDialog = ref(false)
const editData = ref({
  id: 0,
  nombre: '',
  dosis: '',
  dias: '',
  horas: '',
})
const editDias = ref([])
const editHoras = ref([])
const editHoraTemporal = ref('')

const pacienteActual = computed(() => pacientes.value.find((p) => p.rut === rutPaciente.value))

// 1) Carga inicial de pacientes y sus medicamentos
async function cargarPacientesConMedicamentos() {
  try {
    const { data: pacs } = await api.get(`/pacientes_por_cuidador/${usuario.rut}`)
    pacientes.value = pacs
    if (!rutPaciente.value && pacs.length) {
      rutPaciente.value = pacs[0].rut
    }
    pacientesConMedicamentos.value = []

    for (const p of pacs) {
      const { data: meds } = await api.get(`/medicamentos_por_rut/${p.rut}`)
      pacientesConMedicamentos.value.push({
        ...p,
        medicamentos: meds.map(normalizarMedicamento),
      })
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al cargar pacientes' })
  }
}

onMounted(cargarPacientesConMedicamentos)

// 2) Al cambiar paciente, refresca solo esa tabla
async function cargarMedicamentos(rut) {
  medicamentos.value = []
  if (!rut) return
  try {
    const { data } = await api.get(`/medicamentos_por_rut/${rut}`)
    medicamentos.value = data.map(normalizarMedicamento)
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al cargar medicamentos' })
  }
}

watch(rutPaciente, (newRut) => {
  cargarMedicamentos(newRut)
})

function agregarHora(h) {
  if (!horas.value.includes(h)) horas.value.push(h)
}
function eliminarHora(i) {
  horas.value.splice(i, 1)
}

function agregaHoraEdicion(h) {
  if (!editHoras.value.includes(h)) editHoras.value.push(h)
}
function eliminarHoraEdicion(i) {
  editHoras.value.splice(i, 1)
}

function abrirEditar(m) {
  editData.value = { ...m }
  const diasParsed = Array.isArray(m.dias)
    ? m.dias
    : m.dias
      ? m.dias.split(',').map((d) => d.trim())
      : []
  const horasParsed = Array.isArray(m.horas)
    ? m.horas
    : m.horas
      ? m.horas.split(',').map((h) => h.trim())
      : []
  editDias.value = diasParsed
  editHoras.value = horasParsed
  editHoraTemporal.value = ''
  editDialog.value = true
}

async function guardarEdicion() {
  try {
    await api.put(`/medicamentos/${editData.value.id}`, {
      nombre: editData.value.nombre,
      dosis: editData.value.dosis,
      dias: Array.isArray(editDias.value) ? editDias.value.join(', ') : editDias.value,
      horas: Array.isArray(editHoras.value) ? editHoras.value.join(', ') : editHoras.value,
    })
    $q.notify({ type: 'positive', message: 'Guardado exitoso' })
    editDialog.value = false
    await cargarMedicamentos(rutPaciente.value)
    await cargarPacientesConMedicamentos()
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo guardar' })
  }
}

async function eliminarMedicamento(row) {
  try {
    await api.delete(`/medicamentos/${row.id}`)
    $q.notify({ type: 'positive', message: 'Eliminado exitoso' })
    await cargarMedicamentos(rutPaciente.value)
    await cargarPacientesConMedicamentos()
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
  }
}

async function agregarMedicamento() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('👉 agregarMedicamento() called with:', {
      nombre: nombre.value,
      dosis: dosis.value,
      dias: dias.value,
      horas: horas.value,
      rut_paciente: rutPaciente.value,
      rut_cuidador: usuario.rut,
    })
  }

  loading.value = true
  try {
    const resp = await api.post('/medicamentos_por_rut', {
      nombre: nombre.value,
      dosis: dosis.value,
      dias: dias.value,
      horas: horas.value,
      rut_paciente: rutPaciente.value,
      rut_cuidador: usuario.rut,
    })
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ POST /medicamentos_por_rut response:', resp.data)
    }
    $q.notify({ type: 'positive', message: 'Medicamento agregado' })
    await cargarMedicamentos(rutPaciente.value)
    await cargarPacientesConMedicamentos()
    nombre.value = ''
    dosis.value = ''
    dias.value = []
    horas.value = []
  } catch (err) {
    console.error('❌ POST /medicamentos_por_rut failed:', err)
    $q.notify({ type: 'negative', message: 'No se pudo agregar' })
  } finally {
    loading.value = false
  }
}
</script>
