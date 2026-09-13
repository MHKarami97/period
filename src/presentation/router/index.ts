import { createRouter, createWebHistory } from "vue-router";
import { useAppModeStore } from "@application/stores/appModeStore";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "onboarding",
      component: () => import("@presentation/components/onboarding/RoleSelector.vue"),
    },
    {
      path: "/app",
      component: () => import("@presentation/components/layout/AppShell.vue"),
      children: [
        { path: "", redirect: { name: "dashboard" } },
        { path: "dashboard", name: "dashboard", component: () => import("@presentation/views/DashboardView.vue") },
        { path: "calendar", name: "calendar", component: () => import("@presentation/views/CalendarView.vue") },
        { path: "symptoms", name: "symptoms", component: () => import("@presentation/views/SymptomsView.vue") },
        { path: "guide", name: "guide", component: () => import("@presentation/views/GuideView.vue") },
        { path: "settings", name: "settings", component: () => import("@presentation/views/SettingsView.vue") },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const appModeStore = useAppModeStore();

  if (to.name === "onboarding" && appModeStore.hasSelectedRole) {
    return { name: "dashboard" };
  }
  if (to.name !== "onboarding" && !appModeStore.hasSelectedRole) {
    return { name: "onboarding" };
  }
  if (to.name === "symptoms" && appModeStore.isPartnerMode) {
    return { name: "dashboard" };
  }
  return true;
});

export default router;
