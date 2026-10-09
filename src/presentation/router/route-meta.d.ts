import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    /** Route is only reachable after the games password was entered. */
    requiresGameAccess?: boolean;
  }
}
