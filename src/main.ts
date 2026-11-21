import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./presentation/router";
import { installSecurity } from "@infrastructure/security/installSecurity";
import { initCustomCategories } from "@domain/hamdel/customCategories";
import "./presentation/styles/main.css";

// Before anything reads the database: if app lock is on, route Hamdel storage through encryption.
installSecurity();
initCustomCategories();

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount("#app");
