<script setup lang="ts">
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useRouter } from 'vue-router'
import ModeToggle from '@/components/ModeToggle.vue'
import { ref } from 'vue'

const router = useRouter()
const loggedIn = ref(!!localStorage.getItem('session_token'))

const searchQuery = ref('')

const goToLogin = () => {
  console.log('Redirecting to login...');
  router.push({ name: 'login' });
}
</script>

<template>
  <header class="w-full bg-background border-b border-border">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

      <div class="flex items-center space-x-6">
        <NavigationMenu>
          <NavigationMenuLink>Auctionary</NavigationMenuLink>
          <NavigationMenuLink>Search</NavigationMenuLink>
        </NavigationMenu>
      </div>

      <div class="flex-1 mx-6">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="flex items-center space-x-4">
        <ModeToggle />
        <Button v-if="!loggedIn" variant="default" @click="goToLogin">Login</Button>
        <Avatar v-else>
          <AvatarFallback>{{ user.name.charAt(0) }}</AvatarFallback>
        </Avatar>
      </div>

    </div>
  </header>
</template>
