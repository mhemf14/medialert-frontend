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
import { useQuasar } from 'quasar'

// 🔧 Configuración
const API_BASE_URL = 'https://medialert-backend-1q8e.onrender.com'

const router = useRouter()
const $q = useQuasar()
const rut = ref('')
const contrasena = ref('')
const error = ref('')
let loginDialog: any | null = null

const validarRut = (valor: string) => {
  const rutLimpio = valor.replace(/[^0-9kK]/g, '').toLowerCase()
  if (rutLimpio.length < 2) {
    return false
  }
  const cuerpo = rutLimpio.slice(0, -1)
  const dvIngresado = rutLimpio.slice(-1)

  let suma = 0
  let factor = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const dvEsperadoNum = 11 - (suma % 11)
  const dvEsperado = dvEsperadoNum === 11 ? '0' : dvEsperadoNum === 10 ? 'k' : String(dvEsperadoNum)

  return dvIngresado === dvEsperado
}

const login = async () => {
  error.value = ''
  if (!validarRut(rut.value)) {
    error.value = 'RUT inválido'
    return
  }

  loginDialog = $q.dialog({
    progress: true,
    message: 'Iniciando sesión...',
    ok: false,
    persistent: true,
  })

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
      loginDialog?.hide()
      return
    }

    localStorage.setItem('usuario', JSON.stringify(data))

    $q.notify({
      type: 'info',
      message: 'Campaña activa: ¡recuerda revisar tus notificaciones!',
    })

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
      loginDialog?.hide()
      return
    }

    setTimeout(() => {
      loginDialog?.hide()
      loginDialog = null
      router.push(destino)
    }, 3000)
  } catch (err) {
    console.error('❌ Error al conectar al backend:', err)
    error.value = 'No se pudo conectar al servidor'
    loginDialog?.hide()
  }
}

const registrarse = () => {
  router.push('/registro')
}
</script>
