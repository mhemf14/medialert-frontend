<template>
  <q-page class="flex flex-center">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6">Registro de Usuario</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="nombre" label="Nombre completo" filled />
        <q-input v-model="rut" label="RUT (sin puntos y con guion)" filled />
        <q-input v-model="telefono" label="Teléfono" filled />
        <q-select v-model="rol" :options="['cuidador', 'paciente']" label="Rol" filled />
        <q-input v-model="contrasena" label="Contraseña" type="password" filled />
        <q-banner v-if="error" class="bg-red text-white q-pa-sm">
          {{ error }}
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
const rut = ref('')
const telefono = ref('')
const rol = ref(null)
const contrasena = ref('')
const error = ref('')

const registrar = async () => {
  error.value = ''
  try {
    await api.post('/usuarios', {
      nombre: nombre.value,
      rut: rut.value,
      telefono: telefono.value,
      rol: rol.value,
      contrasena: contrasena.value,
    })

    router.push('/login')
  } catch (err) {
    console.error(err)
    if (err.response && err.response.data?.error) {
      error.value = err.response.data.error
    } else {
      error.value = 'No se pudo conectar al servidor'
    }
  }
}
</script>
