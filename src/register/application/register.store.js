import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RegisterAccount } from '@/register/domain/model/register-account.js'

const useRegisterStore = defineStore('register', () => {
    const errors = ref([])
    const notice = ref('')

    function register(input) {
        const account = new RegisterAccount(input)
        errors.value = account.errors
        notice.value = ''

        if (errors.value.length > 0) return false

        notice.value = 'Registro demo preparado. No se guardo informacion ni se llamo ningun API.'
        return true
    }

    function registerWithGoogle() {
        errors.value = []
        notice.value = 'Registro con Google simulado. Listo para conectar OAuth despues.'
    }

    return {
        errors,
        notice,
        register,
        registerWithGoogle
    }
})

export default useRegisterStore
