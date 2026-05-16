import { defineStore } from 'pinia'
import { ref } from 'vue'
import { LoginCredentials } from '@/login/domain/model/login-credentials.js'

const demoAccountData = {
    email: 'admin@entreprenly.pe',
    password: 'Entreprenly2026!',
    name: 'Entreprenly INC'
}

const useLoginStore = defineStore('login', () => {
    const demoAccount = ref(demoAccountData)
    const error = ref('')
    const notice = ref('')

    function login(input) {
        const credentials = new LoginCredentials(input)
        error.value = ''
        notice.value = ''

        if (!credentials.valid) {
            error.value = 'Completa correo y contrasena para ingresar.'
            return false
        }

        if (credentials.email !== demoAccount.value.email || credentials.password !== demoAccount.value.password) {
            error.value = 'Credenciales demo incorrectas.'
            return false
        }

        writeSession(credentials.rememberSession)
        return true
    }

    function loginWithGoogle() {
        error.value = ''
        notice.value = 'Acceso con Google simulado para pruebas.'
        writeSession(false)
        return true
    }

    function forgotPassword() {
        error.value = ''
        notice.value = 'Se simularia el envio de recuperacion al correo indicado.'
    }

    function writeSession(rememberSession) {
        try {
            localStorage.setItem('entreprenly-demo-session', JSON.stringify({
                email: demoAccount.value.email,
                name: demoAccount.value.name,
                rememberSession
            }))
        } catch {
            // Demo-only session. Ignore storage failures.
        }
    }

    return {
        demoAccount,
        error,
        notice,
        login,
        loginWithGoogle,
        forgotPassword
    }
})

export default useLoginStore
