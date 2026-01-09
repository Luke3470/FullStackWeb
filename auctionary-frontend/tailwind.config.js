import { shadcnPreset } from "@shadcn-vue/ui";

export default {
    presets: [shadcnPreset()],
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./node_modules/@shadcn-vue/ui/**/*.{js,vue}"
    ],
    theme: {
        extend: {}
    },
    plugins: []
}
