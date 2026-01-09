<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useRoute } from 'vue-router'
import {useSessionStore} from "@/stores/session.ts";

const session = useSessionStore()

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')

const handleLogin = () => {
  localStorage.setItem('session_token', 'fake-token')
  session.setLoggedIn(true)
  const redirectTo = route.query.redirect as string || '/'
  router.push(redirectTo)
}

const goSignUp = () => {
  router.push({ name: 'signup' })
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center relative">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 opacity-40 backdrop-blur-lg"></div>

    <Card class="w-full max-w-md shadow-lg relative z-10 mt-24">
      <CardHeader>
        <CardTitle class="text-center text-2xl">Log In</CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <Label for="email">Email</Label>
          <Input id="email" v-model="email" type="email" placeholder="you@example.com" />
        </div>

        <div class="flex flex-col gap-1">
          <Label for="password">Password</Label>
          <Input id="password" v-model="password" type="password" placeholder="••••••••" />
        </div>

        <Button class="w-full mt-2" variant="default" @click="handleLogin">
          Sign In
        </Button>

        <p class="text-center text-sm text-muted-foreground mt-2">
          Don't have an account?
          <button @click="goSignUp" class="text-primary underline hover:text-primary/80">
            Sign Up
          </button>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
