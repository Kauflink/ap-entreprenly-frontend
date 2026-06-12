export class RegisterAccount {
    constructor({
        firstName = '',
        lastName = '',
        email = '',
        phone = '',
        timezone = '',
        password = '',
        confirmPassword = '',
        acceptedTerms = false
    } = {}) {
        this.firstName = firstName.trim()
        this.lastName = lastName.trim()
        this.email = email.trim().toLowerCase()
        this.phone = phone.trim()
        this.timezone = timezone
        this.password = password
        this.confirmPassword = confirmPassword
        this.acceptedTerms = acceptedTerms
    }

    get errors() {
        const errors = []

        if (!this.firstName) errors.push('Ingresa tu nombre.')
        if (!this.lastName) errors.push('Ingresa tu apellido.')
        if (!this.email.includes('@')) errors.push('Ingresa un correo valido.')
        if (this.password.length < 8) errors.push('La contrasena debe tener al menos 8 caracteres.')
        if (this.password !== this.confirmPassword) errors.push('La confirmacion de contrasena no coincide.')
        if (!this.acceptedTerms) errors.push('Acepta los terminos para continuar.')

        return errors
    }

    get valid() {
        return this.errors.length === 0
    }

    toSignUpRequest() {
        return {
            email: this.email,
            password: this.password,
            firstName: this.firstName,
            lastName: this.lastName,
            phone: this.phone,
            timezone: this.timezone
        }
    }
}
