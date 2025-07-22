<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat icon="logout" label="Salir" @click="logout" />

        <q-toolbar-title>
          MediAlert
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <!-- ❌ Drawer eliminado -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function logout () {
  localStorage.removeItem('usuario')
  router.push('/login')
}
</script>
