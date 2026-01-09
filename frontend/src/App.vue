<script>
import Header from './components/Header.vue';
import { Toaster } from 'vue-sonner'


export default {
  components: { Header, Toaster },
}
</script>

<template>
  <Header />
  <div>
    <Toaster position="top-center"  />
    <router-view />
  </div>
</template>
