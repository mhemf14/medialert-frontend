<template>
  <q-page class="flex flex-center">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6">Registro de Usuario</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="nombre" label="Nombre completo" filled />
        <q-input v-model="telefono" label="Teléfono" filled />
        <q-input v-model="rut" label="RUT (sin puntos y con guion)" filled />
        <q-select v-model="rol" :options="['cuidador', 'paciente']" label="Rol" filled />
        <q-input v-model="contrasena" label="Contraseña" type="password" filled />
        <q-banner v-if="error" class="bg-red text-white q-pa-sm">
          {{ error }}
        </q-banner>
        <q-banner v-if="success" class="bg-green text-white q-pa-sm">
          {{ success }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Registrar" color="primary" @click="registrar" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'

const router = useRouter()
const nombre = ref('')
const telefono = ref('')
const rut = ref('')
const contrasena = ref('')
const rol = ref(null)
const error = ref('')
const success = ref('')

const registrar = async () => {
  error.value = ''
  success.value = ''
  try {
    const { data } = await api.post('/registro', {
      nombre: nombre.value,
      telefono: telefono.value,
      rut: rut.value,
      contrasena: contrasena.value,
      rol: rol.value,
    })

    success.value = 'Registro exitoso'
    setTimeout(() => router.push('/login'), 1000)
  } catch (err) {
    console.error(err)
    if (err.response) {
      error.value = err.response.data?.error || 'Error al registrar'
    } else {
      error.value = 'No se pudo conectar al servidor'
    }
  }
}
</script>
