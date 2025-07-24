<template>
  <q-page class="q-pa-md">
    <!-- FORMULARIO -->
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
            :rules="[(val) => !!val || 'Campo obligatorio']"
          />
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

    <!-- MEDICAMENTOS DEL PACIENTE SELECCIONADO -->
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

    <!-- DIALOGO EDICION -->
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

    <!-- TODOS LOS PACIENTES ASIGNADOS CON SUS MEDICAMENTOS -->
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

<script setup>
import { ref, onMounted, watch } from 'vue'
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

const usuario = JSON.parse(localStorage.getItem('usuario')) || {}
const pacientes = ref([])
const medicamentos = ref([])
const editDialog = ref(false)
const editData = ref({ id: null, nombre: '', dosis: '', dias: '', horas: '' })
const pacientesConMedicamentos = ref([])

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

onMounted(async () => {
  try {
    const res = await api.get(`/pacientes_por_cuidador/${usuario.rut}`)
    pacientes.value = res.data
    await cargarPacientesConMedicamentos()
  } catch (err) {
    console.error('Error al cargar pacientes', err)
  }
})

watch(rutPaciente, cargarMedicamentos)

async function cargarMedicamentos() {
  if (!rutPaciente.value) {
    medicamentos.value = []
    return
  }
  try {
    const res = await api.get(`/medicamentos_por_rut/${rutPaciente.value}`)
    medicamentos.value = res.data
  } catch (err) {
    console.error('Error al cargar medicamentos', err)
  }
}

async function cargarPacientesConMedicamentos() {
  try {
    const resPac = await api.get(`/pacientes_por_cuidador/${usuario.rut}`)
    const lista = resPac.data

    const conMed = await Promise.all(
      lista.map(async (p) => {
        const medsRes = await api.get(`/medicamentos_por_rut/${p.rut}`)
        return { ...p, medicamentos: medsRes.data }
      }),
    )

    pacientesConMedicamentos.value = conMed
  } catch (err) {
    console.error('Error al cargar pacientes con medicamentos:', err)
  }
}

function agregarHora(hora) {
  if (!horas.value.includes(hora)) {
    horas.value.push(hora)
  }
}

function eliminarHora(index) {
  horas.value.splice(index, 1)
}

function abrirEditar(row) {
  editData.value = { ...row }
  editDialog.value = true
}

async function guardarEdicion() {
  try {
    await api.put(`/medicamentos/${editData.value.id}`, editData.value)
    $q.notify({ type: 'positive', message: 'Medicamento actualizado' })
    editDialog.value = false
    await cargarMedicamentos()
    await cargarPacientesConMedicamentos()
  } catch (err) {
    console.error('Error al actualizar', err)
    $q.notify({ type: 'negative', message: 'No se pudo actualizar' })
  }
}

async function eliminarMedicamento(row) {
  try {
    await api.delete(`/medicamentos/${row.id}`)
    $q.notify({ type: 'positive', message: 'Medicamento eliminado' })
    await cargarMedicamentos()
    await cargarPacientesConMedicamentos()
  } catch (err) {
    console.error('Error al eliminar', err)
    $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
  }
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

    $q.notify({ type: 'positive', message: 'Medicamento agregado satisfactoriamente' })
    await cargarMedicamentos()
    await cargarPacientesConMedicamentos()

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
