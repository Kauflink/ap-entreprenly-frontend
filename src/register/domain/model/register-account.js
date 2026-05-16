export class RegisterAccount {
    constructor({
        businessName = '',
        ownerName = '',
        email = '',
        password = '',
        confirmPassword = '',
        acceptedTerms = false
    } = {}) {
        this.businessName = businessName.trim()
        this.ownerName = ownerName.trim()
        this.email = email.trim().toLowerCase()
        this.password = password
        this.confirmPassword = confirmPassword
        this.acceptedTerms = acceptedTerms
    }

    get errors() {
        const errors = []

        if (!this.businessName) errors.push('Ingresa el nombre del negocio.')
        if (!this.ownerName) errors.push('Ingresa el nombre del responsable.')
        if (!this.email.includes('@')) errors.push('Ingresa un correo valido.')
        if (this.password.length < 8) errors.push('La contrasena debe tener al menos 8 caracteres.')
        if (this.password !== this.confirmPassword) errors.push('La confirmacion de contrasena no coincide.')
        if (!this.acceptedTerms) errors.push('Acepta los terminos para continuar.')

        return errors
    }
}
