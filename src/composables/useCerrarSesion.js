import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export function useCerrarSesion() {
  const router = useRouter();
  const authStore = useAuthStore();
  const { usuario } = storeToRefs(authStore);

  function cerrarSesion() {
    authStore.logout();
    return router.push("/");
  }

  return { cerrarSesion, usuario };
}
