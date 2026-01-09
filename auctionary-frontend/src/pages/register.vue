<script setup>
import { ref } from "vue";
import { Card, CardHeader, CardContent, CardTitle, Input, Button } from "@shadcn-vue/ui";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: ""
});

const store = useAuthStore();
const router = useRouter();

async function submit() {
  await store.register(form.value);
  router.push("/login");
}
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <Card class="w-[450px]">
      <CardHeader><CardTitle>Create Account</CardTitle></CardHeader>
      <CardContent class="space-y-4">

        <Input v-model="form.first_name" placeholder="First Name" />
        <Input v-model="form.last_name" placeholder="Last Name" />
        <Input v-model="form.email" placeholder="Email" />
        <Input type="password" v-model="form.password" placeholder="Password" />

        <Button @click="submit" class="w-full">Register</Button>

      </CardContent>
    </Card>
  </div>
</template>
