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

    <!-- Animación vistosa -->
    <transition name="fade">
      <div v-if="cargando" class="fullscreen bg-black bg-opacity-75 flex flex-center z-top">
        <div class="column items-center">
          <q-spinner-gears size="50px" color="primary" />
          <div class="text-white q-mt-md text-h6">Iniciando sesión...</div>
        </div>
      </div>
    </transition>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

//const $q = useQuasar()
const router = useRouter()

const rut = ref('')
const contrasena = ref('')
const error = ref('')
const cargando = ref(false)

const login = async () => {
  error.value = ''

  if (!rut.value || !contrasena.value) {
    error.value = 'Debe ingresar su RUT y contraseña'
    return
  }

  try {
    const { data } = await api.post('/login', {
      rut: rut.value,
      contrasena: contrasena.value,
    })

    localStorage.setItem('usuario', JSON.stringify(data))

    const rol = data.rol?.toLowerCase().trim()
    let destino = ''

    if (rol === 'cuidador') destino = '/cuidador'
    else if (rol === 'paciente') destino = '/paciente'
    else if (rol === 'admin') destino = '/admin'
    else {
      error.value = 'Rol no reconocido'
      return
    }

    // Mostrar animación vistosa
    cargando.value = true

    setTimeout(() => {
      cargando.value = false
      router.push(destino)
    }, 6000)
  } catch (err) {
    console.error('❌ Error al conectar al backend:', err)
    if (err.response) {
      error.value = err.response.data?.error || 'Error al iniciar sesión'
    } else {
      error.value = 'No se pudo conectar al servidor'
    }
  }
}

const registrarse = () => {
  router.push('/registro')
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
