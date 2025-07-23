<template>
  <q-page class="flex flex-center">
    <q-card style="width: 400px">
      <q-card-section class="flex flex-center q-pb-none">
        <img src="../assets/medical-logo.svg" alt="Logo médico" style="width: 80px;" />
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="text-h6 text-center">Iniciar Sesión</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="rut" label="RUT" filled />
        <q-input v-model="contrasena" label="Contraseña" type="password" filled />
        <q-banner v-if="error" class="bg-red text-white q-pa-sm">
          {{ error }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="between">
        <q-btn label="Registrarse" flat @click="registrarse" />
        <q-btn label="Entrar" color="primary" @click="login" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 🔧 Configuración
const API_BASE_URL = 'https://medialert-backend-1q8e.onrender.com'

const router = useRouter()
const rut = ref('')
const contrasena = ref('')
const error = ref('')

const login = async () => {
  error.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut: rut.value, contrasena: contrasena.value }),
    })

    const data = await res.json()
    console.log('🟢 Usuario autenticado:', data) // 👀 Verifica qué llega

    if (!res.ok) {
      error.value = data.error || 'Error al iniciar sesión'
      return
    }

    localStorage.setItem('usuario', JSON.stringify(data))

    const rol = data.rol?.toLowerCase().trim()

    if (rol === 'cuidador') {
      router.push('/cuidador')
    } else if (rol === 'paciente') {
      router.push('/paciente')
    } else if (rol === 'admin') {
      router.push('/admin')
    } else {
      error.value = 'Rol no reconocido'
    }
  } catch (err) {
    console.error('❌ Error al conectar al backend:', err)
    error.value = 'No se pudo conectar al servidor'
  }
}

const registrarse = () => {
  router.push('/registro')
}
</script>
