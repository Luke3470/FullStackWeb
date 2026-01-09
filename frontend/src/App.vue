<script>
import Header from './components/Header.vue'

export default {
  components: { Header },
}
</script>

<template>
  <Header />
  <div>
    <router-view />
  </div>
</template>
