<script setup lang="ts">
import { NavigationMenu, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useRouter, useRoute } from 'vue-router'
import ModeToggle from '@/components/ModeToggle.vue'
import { ref, watch, computed } from 'vue'
import { useSessionStore } from '../stores/session.ts'
import { logOut } from  '../services/user.service.ts'
import { storeToRefs } from 'pinia'
import { UseUserNavigation } from  '../services/services.config.ts'

const session = useSessionStore()
const { loggedIn, userId } = storeToRefs(session)
const { goToUser } = UseUserNavigation()

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')

const safeUserId = computed(() => userId.value ?? '')

const goToLogin = () => {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}
const goHome = () => router.push({ name: 'home' })

const goSearch = () => {
  if (!searchQuery.value) {
    router.push({ name: 'search'})
  }else{
    router.push({ name: 'search', query: { q: searchQuery.value } })
  }
}

const goCreate = () => {
  router.push({ name: 'create' })
}

const handleGoToProfile = () => {
  if (!userId.value) {
    console.warn('No user ID yet')
    return
  }
  goToUser(userId.value)
}


const handleSearchKey = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    goSearch()
  }
}

const handleLogout = async () => {
  try {
    const token = session.authToken.value
    if (token) {
      const response = await logOut(token)

      if (response?.message === "Logged out successfully") {
        console.log("Logout complete. Storage cleared.")
      } else {
        console.warn("Logout failed", response)
        if (response?.error_message === 'Invalid or expired session token') {
          toast.error(response.error_message + ". Redirecting to login.")
        }
      }
    }
  } catch (err: any) {
    console.error("Logout error:", err)
    toast.error("Error logging out. Redirecting to login.")
  } finally {
    session.setAuthToken(null)
    session.setUserId(null)
    session.setLoggedIn(false)

    localStorage.removeItem('session_token')
    localStorage.removeItem('user_id')

    router.push({ name: 'login' })
  }
}

watch(
    () => route.fullPath,
    () => {
      searchQuery.value = ''
    }
)

</script>

<template>
  <header class="w-full bg-background border-b border-border">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

      <div class="flex items-center space-x-6">
        <NavigationMenu>
          <NavigationMenuLink @click.prevent="goHome">Auctionary</NavigationMenuLink>
          <NavigationMenuLink @click.prevent="goSearch">Search</NavigationMenuLink>
        </NavigationMenu>
      </div>

      <div class="flex-1 mx-6">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            @keydown="handleSearchKey"
            class="w-full px-4 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="flex items-center space-x-4">
        <ModeToggle />
        <Button v-if="!loggedIn" variant="default" @click="goToLogin">
          Log in
        </Button>
        <Button v-if="loggedIn" variant="default" @click="goCreate">
          Create Item
        </Button>
        <DropdownMenu v-if="loggedIn">
          <DropdownMenuTrigger as-child>
            <Avatar class="cursor-pointer">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="handleGoToProfile">View Profile</DropdownMenuItem>
            <DropdownMenuItem @click="handleLogout">Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
