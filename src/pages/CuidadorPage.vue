<template>
  <q-page class="q-pa-md">
    <!-- === Formulario de asignación === -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Asignar Medicamento a Paciente</div>
      </q-card-section>

      <q-form @submit.prevent="agregarMedicamento">
        <q-card-section class="q-gutter-md">
          <!-- Debug en UI -->
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
                v-for="(h, idx) in horas"
                :key="idx"
                color="primary"
                text-color="white"
                removable
                @remove="eliminarHora(idx)"
                >{{ h }}</q-chip
              >
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="Agregar" color="primary" type="submit" :loading="loading" />
        </q-card-actions>
      </q-form>
    </q-card>

    <!-- === Tabla de medicamentos del paciente seleccionado === -->
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

    <!-- === Dialog de edición === -->
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

    <!-- === Lista de pacientes con sus medicamentos === -->
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

const $q = useQuasar()

// Form
const nombre = ref('')
const dosis = ref('')
const rutPaciente = ref('')
const dias = ref<string[]>([])
const horas = ref<string[]>([])
const horaTemporal = ref('')
const loading = ref(false)

// Logueado
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

// Datos
const pacientes = ref<{ rut: string; nombre: string }[]>([])
const medicamentos = ref<any[]>([])
const editDialog = ref(false)
const editData = ref<{ id: number; nombre: string; dosis: string; dias: string; horas: string }>({
  id: 0,
  nombre: '',
  dosis: '',
  dias: '',
  horas: '',
})
const pacientesConMedicamentos = ref<{ rut: string; nombre: string; medicamentos: any[] }[]>([])

// Columnas de la mesa
const columns = [
  { name: 'nombre', label: 'Medicamento', field: 'nombre', sortable: true },
  { name: 'dosis', label: 'Dosis', field: 'dosis', sortable: true },
  { name: 'dias', label: 'Días', field: 'dias', sortable: true },
  { name: 'horas', label: 'Horas', field: 'horas', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'acciones' },
]

// Días de la semana
const diasSemana = [
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' },
  { label: 'Domingo', value: 'Domingo' },
]

// === Sólo ESTE onMounted ===
onMounted(async () => {
  console.log('🚀 CuidadorPage montado; rut=', usuario.rut)

  try {
    // 1) traigo pacientes del cuidador
    const resPac = await api.get(`/pacientes_por_cuidador/${usuario.rut}`)
    console.log('🤖 GET pacientes_por_cuidador →', resPac.data)
    pacientes.value = resPac.data

    // 2) para cada paciente, traigo sus medicamentos y armo el array
    pacientesConMedicamentos.value = []
    for (const p of pacientes.value) {
      const resMed = await api.get(`/medicamentos_por_rut/${p.rut}`)
      pacientesConMedicamentos.value.push({
        ...p,
        medicamentos: resMed.data,
      })
    }
  } catch (err) {
    console.error('❌ Error al inicializar CuidadorPage:', err)
  }
})

// Cuando cambia el select, recargo la tabla
watch(rutPaciente, async (val) => {
  if (!val) {
    medicamentos.value = []
    return
  }
  try {
    const r = await api.get(`/medicamentos_por_rut/${val}`)
    medicamentos.value = r.data
  } catch (e) {
    console.error('❌ Error al cargar medicamentos', e)
  }
})

// Resto de funciones de CRUD y utilidades...
function agregarHora(h: string) {
  if (!horas.value.includes(h)) horas.value.push(h)
}
function eliminarHora(i: number) {
  horas.value.splice(i, 1)
}
function abrirEditar(row: any) {
  editData.value = { ...row }
  editDialog.value = true
}
async function guardarEdicion() {
  try {
    await api.put(`/medicamentos/${editData.value.id}`, editData.value)
    $q.notify({ type: 'positive', message: 'Medicamento actualizado' })
    editDialog.value = false
    // recarga
    const r = await api.get(`/medicamentos_por_rut/${rutPaciente.value}`)
    medicamentos.value = r.data
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo actualizar' })
  }
}
async function eliminarMedicamento(row: any) {
  try {
    await api.delete(`/medicamentos/${row.id}`)
    $q.notify({ type: 'positive', message: 'Medicamento eliminado' })
    const r = await api.get(`/medicamentos_por_rut/${rutPaciente.value}`)
    medicamentos.value = r.data
  } catch {
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
    $q.notify({ type: 'positive', message: 'Medicamento agregado' })
    // recarga
    const r = await api.get(`/medicamentos_por_rut/${rutPaciente.value}`)
    medicamentos.value = r.data
    // reset
    nombre.value = ''
    dosis.value = ''
    dias.value = []
    horas.value = []
    horaTemporal.value = ''
  } catch {
    $q.notify({ type: 'negative', message: 'Error de conexión' })
  }
}

// exportar PDF / Excel omitido por brevedad...
</script>
