<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'vue-router'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')


const handleSignUp = () => {
  router.push({ name: 'login' })
}


const goToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center relative">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 opacity-40 backdrop-blur-lg"></div>

    <Card class="w-full max-w-md shadow-lg relative z-10 mt-24">
      <CardHeader>
        <CardTitle class="text-center text-2xl">Sign Up</CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col gap-4">
        <div class="flex gap-4">
          <div class="flex-1 flex flex-col gap-1">
            <Label for="firstName">First Name</Label>
            <Input id="firstName" v-model="firstName" type="text" placeholder="John" />
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <Label for="lastName">Last Name</Label>
            <Input id="lastName" v-model="lastName" type="text" placeholder="Doe" />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <Label for="email">Email</Label>
          <Input id="email" v-model="email" type="email" placeholder="you@example.com" />
        </div>

        <div class="flex flex-col gap-1">
          <Label for="password">Password</Label>
          <Input id="password" v-model="password" type="password" placeholder="••••••••" />
        </div>

        <Button class="w-full mt-2" variant="default" @click="handleSignUp">
          Sign Up
        </Button>

        <p class="text-center text-sm text-muted-foreground mt-2">
          Already have an account?
          <button @click="goToLogin" class="text-primary underline hover:text-primary/80">
            Sign In
          </button>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
