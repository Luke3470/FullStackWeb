<script setup>
    import { ref } from "vue";
    import { Button, Card, CardHeader, CardTitle, CardContent, Input } from "@shadcn-vue/ui";
    import { useAuthStore } from "../stores/auth";
    import { useRouter } from "vue-router";

    const email = ref("");
    const password = ref("");
    const store = useAuthStore();
    const router = useRouter();

    async function submit() {
    try {
    await store.login(email.value, password.value);
    router.push("/dashboard");
} catch (e) {
    console.error(e);
}
}
</script>

<template>
    <div class="flex justify-center items-center h-screen">
        <Card class="w-[400px]">
            <CardHeader>
                <CardTitle>Login</CardTitle>
            </CardHeader>

            <CardContent class="space-y-4">

                <Input placeholder="Email" v-model="email" />
                <Input placeholder="Password" type="password" v-model="password" />

                <Button @click="submit" class="w-full">Login</Button>
        </CardContent>
    </Card>
</div>
</template>
