<template>
  <q-page class="flex flex-center">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="text-h6">Iniciar Sesión</div>
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

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

const API_BASE_URL = 'https://medialert-backend-1q8e.onrender.com'
const rut = ref('')
const contrasena = ref('')
const error = ref('')

const login = async () => {
  error.value = ''

  // Validar campos vacíos
  if (!rut.value || !contrasena.value) {
    error.value = 'Debe ingresar su RUT y contraseña'
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rut: rut.value, contrasena: contrasena.value }),
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.error || 'Error al iniciar sesión'
      return
    }

    localStorage.setItem('usuario', JSON.stringify(data))

    const rol = data.rol?.toLowerCase().trim()
    let destino = ''

    if (rol === 'cuidador') {
      destino = '/cuidador'
    } else if (rol === 'paciente') {
      destino = '/paciente'
    } else if (rol === 'admin') {
      destino = '/admin'
    } else {
      error.value = 'Rol no reconocido'
      return
    }

    // Mostrar popup de carga
    const dialog = $q.dialog({
      title: 'Ingresando',
      message: 'Por favor espera...',
      progress: true,
      persistent: true,
      ok: false,
    })

    // Esperar 4 segundos antes de redirigir
    setTimeout(() => {
      dialog.hide()
      router.push(destino)
    }, 4000)
  } catch (err) {
    console.error('❌ Error al conectar al backend:', err)
    error.value = 'No se pudo conectar al servidor'
  }
}

const registrarse = () => {
  router.push('/registro')
}
</script>
