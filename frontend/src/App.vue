<script>
import Header from './components/Header.vue'

export default {
  components: { Header },
  data() {
    return {
      welcomeMessage: "Welcome to Your Vue.js App!"
    }
  }
}
</script>

<template>
  <Header />
  <div>
    <router-view />
  </div>
</template>
