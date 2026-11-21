import { createRouter, createWebHistory } from "vue-router";
import { useAccessStore } from "@application/stores/accessStore";
import { useAppModeStore } from "@application/stores/appModeStore";
import { GAME_CATALOG } from "@presentation/games/gameCatalog";
import { GameVisibilityPolicy } from "@domain/games/GameVisibilityPolicy";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    return { top: 0, left: 0 };
  },
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
        { path: "", redirect: { name: "home" } },
        { path: "home", name: "home", component: () => import("@presentation/views/HomeView.vue") },
        { path: "companion", name: "companion", component: () => import("@presentation/views/CompanionView.vue") },
        // Legacy URLs and route names keep working; they now open the matching tab of "Hamrah".
        { path: "dashboard", name: "dashboard", redirect: { name: "companion" } },
        { path: "calendar", name: "calendar", redirect: { name: "companion", query: { tab: "calendar" } } },
        { path: "symptoms", name: "symptoms", redirect: { name: "companion", query: { tab: "symptoms" } } },
        { path: "hamyar", name: "hamyar", component: () => import("@presentation/views/HamyarView.vue") },
        { path: "hamyar/:guideId", name: "hamyar-guide", component: () => import("@presentation/views/HamyarGuideView.vue") },
        { path: "games", name: "games", component: () => import("@presentation/views/GamesView.vue") },
        ...GAME_CATALOG.map((game) => ({
          path: `games/${game.id}`,
          name: game.routeName,
          component: game.loadView,
          meta: { requiresGameAccess: !GameVisibilityPolicy.isOpen(game.id) },
        })),
        { path: "hamdel", name: "hamdel", component: () => import("@presentation/views/HamdelView.vue") },
        { path: "hamdel/challenges", name: "hamdel-challenges", component: () => import("@presentation/views/HamdelChallengesView.vue") },
        { path: "hamdel/diary", name: "hamdel-diary", component: () => import("@presentation/views/HamdelDiaryView.vue") },
        { path: "hamdel/dates", name: "hamdel-dates", component: () => import("@presentation/views/HamdelDatesView.vue") },
        { path: "hamdel/brief", name: "hamdel-brief", component: () => import("@presentation/views/HamdelBriefView.vue") },
        { path: "hamdel/occasionNotes", redirect: { name: "hamdel-brief" } },
        { path: "hamdel/weekly-plan", name: "hamdel-weekly-plan", component: () => import("@presentation/views/HamdelWeeklyPlanView.vue") },
        { path: "hamdel/gift-finder", name: "hamdel-gift-finder", component: () => import("@presentation/views/HamdelGiftFinderView.vue") },
        { path: "hamdel/stats", name: "hamdel-stats", component: () => import("@presentation/views/HamdelStatsView.vue") },
        { path: "hamdel/:section", name: "hamdel-section", component: () => import("@presentation/views/HamdelSectionView.vue") },
        // Positions now live in the games catalog (games/positions); keep the old URL working.
        { path: "positions", redirect: { name: "positions" } },
        { path: "guide", name: "guide", component: () => import("@presentation/views/GuideView.vue") },
        { path: "settings", name: "settings", component: () => import("@presentation/views/SettingsView.vue") },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const appModeStore = useAppModeStore();

  if (to.name === "onboarding" && appModeStore.hasSelectedRole) {
    return { name: "home" };
  }
  if (to.name !== "onboarding" && !appModeStore.hasSelectedRole) {
    return { name: "onboarding" };
  }
  if (to.meta.requiresGameAccess && !useAccessStore().isUnlocked) {
    return { name: "games" };
  }
  return true;
});

router.afterEach((to, from) => {
  if (to.path !== from.path) {
    window.scrollTo({ top: 0, left: 0 });
    if (typeof document !== "undefined") {
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }
});

export default router;
