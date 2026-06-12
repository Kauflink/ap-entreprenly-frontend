import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AuthApi } from '@/auth/infrastructure/auth-api.js'
import { AuthenticatedUser } from '@/auth/domain/model/authenticated-user.js'

const STORAGE_KEY = 'entreprenly-auth'

const authApi = new AuthApi()

function readStored() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? new AuthenticatedUser(JSON.parse(raw)) : null
    } catch {
        return null
    }
}

/**
 * Holds the authenticated session (user + JWT) and exposes sign-in / register / logout.
 * The token is persisted in localStorage so the session survives reloads.
 */
const useAuthStore = defineStore('auth', () => {
    const user = ref(readStored())

    const isAuthenticated = computed(() => user.value !== null)
    const token = computed(() => user.value?.token ?? null)
    const userId = computed(() => user.value?.id ?? null)

    function setUser(authenticatedUser) {
        user.value = authenticatedUser
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser))
        } catch {
            // Ignore storage failures; the in-memory session still works.
        }
    }

    function signIn(email, password) {
        return authApi.signIn(email, password).then(authenticatedUser => {
            setUser(authenticatedUser)
            return authenticatedUser
        })
    }

    function register(input) {
        return authApi.signUp(input).then(() => signIn(input.email, input.password))
    }

    function logout() {
        user.value = null
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch {
            // Ignore storage failures.
        }
    }

    return {
        user,
        isAuthenticated,
        token,
        userId,
        signIn,
        register,
        logout
    }
})

export default useAuthStore
