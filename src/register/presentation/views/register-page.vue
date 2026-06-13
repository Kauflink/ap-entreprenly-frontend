<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import brandLogo from '@/assets/brand/brand-logo-light-transparent.png'
import useAuthStore from '@/auth/application/auth.store.js'
import { RegisterAccount } from '@/register/domain/model/register-account.js'

const router = useRouter()
const authStore = useAuthStore()

const errors = ref([])
const notice = ref('')
const loading = ref(false)

const timezones = [
    'America/Lima (UTC-05:00)',
    'America/Bogota (UTC-05:00)',
    'America/Mexico_City (UTC-06:00)',
    'America/Buenos_Aires (UTC-03:00)',
    'America/Santiago (UTC-04:00)',
    'Europe/Madrid (UTC+01:00)',
    'UTC'
]

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    timezone: timezones[0],
    password: '',
    confirmPassword: '',
    acceptedTerms: false
})

const benefits = [
    {
        title: 'Inicio simple',
        copy: 'Crea tu cuenta en pocos pasos y entra al dashboard.'
    },
    {
        title: 'Plan Free listo',
        copy: 'Tu cuenta arranca con el plan inicial asignado.'
    },
    {
        title: 'Operacion ordenada',
        copy: 'La cuenta representa un negocio con inventario, ventas y caja.'
    },
    {
        title: 'Acceso inmediato',
        copy: 'Al registrarte quedas listo para iniciar sesion.'
    }
]

async function submitRegister() {
    notice.value = ''
    const account = new RegisterAccount(form)
    errors.value = account.errors
    if (errors.value.length > 0) return

    loading.value = true
    try {
        await authStore.register(account.toSignUpRequest())
        router.push('/home')
    } catch {
        errors.value = ['No se pudo crear la cuenta (el correo ya podria estar registrado).']
    } finally {
        loading.value = false
    }
}

function registerWithGoogle() {
    errors.value = []
    notice.value = 'Registro con Google no disponible aun.'
}
</script>

<template>
    <main class="access-page">
        <div class="access-shell">
            <header class="access-header">
                <RouterLink class="ghost-button" to="/login">
                    <span class="material-icons" aria-hidden="true">arrow_back</span>
                    <span>Volver</span>
                </RouterLink>

                <img class="brand-logo" :src="brandLogo" alt="Entreprenly" />

                <RouterLink class="ghost-button" to="/login">
                    Iniciar sesion
                </RouterLink>
            </header>

            <div class="access-grid">
                <section class="access-copy">
                    <p class="eyebrow">Crear cuenta</p>
                    <h1>Crea tu cuenta para empezar a ordenar inventario, ventas y caja.</h1>
                    <p>
                        Registro para empezar a usar Entreprenly con tu negocio.
                    </p>

                    <div class="benefits-grid">
                        <article v-for="benefit in benefits" :key="benefit.title" class="benefit-card">
                            <span class="benefit-icon material-icons" aria-hidden="true">check</span>
                            <div>
                                <h2>{{ benefit.title }}</h2>
                                <p>{{ benefit.copy }}</p>
                            </div>
                        </article>
                    </div>
                </section>

                <section class="form-panel" aria-labelledby="register-title">
                    <span class="mini-tag">Registro</span>
                    <h2 id="register-title">Activa tu acceso</h2>
                    <p class="form-copy">
                        Completa tus datos para crear la cuenta.
                    </p>

                    <form class="access-form" @submit.prevent="submitRegister">
                        <label>
                            <span>Nombre</span>
                            <span class="field-shell">
                                <span class="material-icons" aria-hidden="true">person</span>
                                <input v-model="form.firstName" type="text" autocomplete="given-name" />
                            </span>
                        </label>

                        <label>
                            <span>Apellido</span>
                            <span class="field-shell">
                                <span class="material-icons" aria-hidden="true">badge</span>
                                <input v-model="form.lastName" type="text" autocomplete="family-name" />
                            </span>
                        </label>

                        <label>
                            <span>Correo electronico</span>
                            <span class="field-shell">
                                <span class="material-icons" aria-hidden="true">mail</span>
                                <input v-model="form.email" type="email" autocomplete="email" />
                            </span>
                        </label>

                        <label>
                            <span>Telefono</span>
                            <span class="field-shell">
                                <span class="material-icons" aria-hidden="true">call</span>
                                <input v-model="form.phone" type="tel" autocomplete="tel" placeholder="+51 999 888 777" />
                            </span>
                        </label>

                        <label>
                            <span>Zona horaria</span>
                            <span class="field-shell">
                                <span class="material-icons" aria-hidden="true">schedule</span>
                                <select v-model="form.timezone">
                                    <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
                                </select>
                            </span>
                        </label>

                        <label>
                            <span>Contrasena</span>
                            <span class="field-shell">
                                <span class="material-icons" aria-hidden="true">lock</span>
                                <input v-model="form.password" type="password" autocomplete="new-password" />
                            </span>
                        </label>

                        <label>
                            <span>Confirmar contrasena</span>
                            <span class="field-shell">
                                <span class="material-icons" aria-hidden="true">lock</span>
                                <input v-model="form.confirmPassword" type="password" autocomplete="new-password" />
                            </span>
                        </label>

                        <label class="check-row">
                            <input v-model="form.acceptedTerms" type="checkbox" />
                            <span>Acepto los terminos y condiciones.</span>
                        </label>

                        <div v-if="errors.length > 0" class="message message--error" role="alert">
                            <p v-for="item in errors" :key="item">{{ item }}</p>
                        </div>
                        <p v-if="notice" class="message" role="status" aria-live="polite">{{ notice }}</p>

                        <button class="primary-button" type="submit" :disabled="loading">
                            {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
                        </button>

                        <button class="secondary-button" type="button" @click="registerWithGoogle">
                            <span class="material-icons" aria-hidden="true">account_circle</span>
                            <span>Registrarme con Google</span>
                        </button>
                    </form>

                    <p class="switch-copy">
                        Ya tienes cuenta?
                        <RouterLink to="/login">Inicia sesion aqui</RouterLink>
                    </p>
                </section>
            </div>
        </div>
    </main>
</template>

<style scoped>
.access-page {
    min-height: 100dvh;
    overflow: hidden;
    background:
        linear-gradient(135deg, rgb(255 247 225 / 72%), transparent 34%),
        linear-gradient(315deg, rgb(252 224 212 / 78%), transparent 32%),
        var(--color-bg-page);
    color: var(--color-text-strong);
    padding: 16px;
}

.access-shell {
    display: flex;
    width: min(1280px, 100%);
    min-height: calc(100dvh - 32px);
    flex-direction: column;
    border: 1px solid rgb(81 30 0 / 10%);
    border-radius: 28px;
    background: rgb(255 255 255 / 78%);
    box-shadow: 0 24px 80px rgb(81 30 0 / 12%);
    margin: 0 auto;
    overflow: hidden;
}

.access-header {
    display: flex;
    min-height: 76px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid rgb(81 30 0 / 10%);
    padding: 14px 22px;
}

.brand-logo {
    width: 172px;
    height: auto;
}

.ghost-button,
.secondary-button,
.primary-button {
    display: inline-flex;
    min-height: 48px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-weight: 800;
    text-decoration: none;
}

.ghost-button {
    border: 1px solid rgb(81 30 0 / 12%);
    background: rgb(255 255 255 / 84%);
    color: var(--color-btn-select-text);
    padding: 0 18px;
}

.ghost-button .material-icons,
.secondary-button .material-icons {
    width: 18px;
    height: 18px;
    font-size: 18px;
}

.access-grid {
    display: grid;
    flex: 1;
    grid-template-columns: 1.04fr 0.96fr;
}

.access-copy {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 42px;
}

.eyebrow,
.mini-tag {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    color: var(--color-label-accent);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.18em;
    margin: 0 0 18px;
    text-transform: uppercase;
}

.eyebrow::before {
    width: 32px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--color-primary), #ffd678);
    content: '';
}

.mini-tag {
    border-radius: 999px;
    background: rgb(81 30 0 / 10%);
    padding: 6px 12px;
}

h1,
h2,
p {
    margin: 0;
}

.access-copy h1 {
    max-width: 580px;
    font-size: 56px;
    font-weight: 900;
    letter-spacing: 0;
    line-height: 0.98;
}

.access-copy > p {
    max-width: 610px;
    color: var(--color-text-muted);
    font-size: 18px;
    line-height: 1.7;
    margin-top: 24px;
}

.benefits-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 44px;
}

.benefit-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    border: 1px solid rgb(81 30 0 / 10%);
    border-radius: 20px;
    background: rgb(255 255 255 / 76%);
    padding: 16px;
}

.benefit-icon {
    display: grid;
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    place-items: center;
    border-radius: 14px;
    background: #fff7e1;
    color: var(--color-primary);
    font-size: 20px;
}

.benefit-card h2 {
    font-size: 17px;
    font-weight: 900;
}

.benefit-card p {
    color: var(--color-text-muted);
    font-size: 14px;
    line-height: 1.55;
    margin-top: 8px;
}

.form-panel {
    align-self: center;
    width: calc(100% - 64px);
    border: 1px solid rgb(81 30 0 / 10%);
    border-radius: 28px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 98%), rgb(252 224 212 / 54%));
    box-shadow: 0 18px 42px rgb(12 15 18 / 8%);
    margin: 32px;
    padding: 32px;
}

.form-panel h2 {
    font-size: 32px;
    font-weight: 900;
}

.form-copy {
    max-width: 440px;
    color: var(--color-text-muted);
    line-height: 1.65;
    margin-top: 12px;
}

.access-form {
    display: grid;
    gap: 16px;
    margin-top: 26px;
}

.access-form label {
    display: grid;
    gap: 8px;
    color: var(--color-label-accent);
    font-size: 14px;
    font-weight: 900;
}

.field-shell {
    display: flex;
    min-height: 54px;
    align-items: center;
    gap: 12px;
    border: 1px solid rgb(81 30 0 / 10%);
    border-radius: 16px;
    background: rgb(255 255 255 / 92%);
    color: rgb(81 30 0 / 45%);
    padding: 0 16px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
}

.field-shell input,
.field-shell select {
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--color-text-strong);
    font: inherit;
    outline: 0;
}

.check-row {
    display: inline-flex !important;
    grid-template-columns: none !important;
    align-items: center;
    color: var(--color-label-accent) !important;
    font-size: 13px !important;
}

.check-row input {
    width: 16px;
    height: 16px;
    accent-color: var(--color-primary);
}

.message {
    display: grid;
    gap: 6px;
    border: 1px solid rgb(243 131 19 / 18%);
    border-radius: 16px;
    background: rgb(255 247 225 / 68%);
    color: var(--color-label-accent);
    font-size: 14px;
    line-height: 1.5;
    padding: 12px 14px;
}

.message--error {
    border-color: #f1beb8;
    background: #fff7f5;
    color: #8b2c20;
}

.primary-button {
    border: 0;
    background: var(--color-primary);
    color: #ffffff;
    padding: 0 22px;
    box-shadow: 0 14px 30px rgb(243 131 19 / 28%);
}

.secondary-button {
    border: 1px solid rgb(81 30 0 / 12%);
    background: rgb(255 255 255 / 82%);
    color: var(--color-btn-select-text);
    padding: 0 22px;
}

.switch-copy {
    border-top: 1px solid rgb(81 30 0 / 10%);
    color: var(--color-text-muted);
    font-size: 14px;
    margin-top: 24px;
    padding-top: 18px;
    text-align: center;
}

.switch-copy a {
    color: var(--color-primary);
    font-weight: 900;
    text-decoration: none;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
    outline: 3px solid rgb(243 131 19 / 32%);
    outline-offset: 3px;
}

@media (max-width: 980px) {
    .access-grid {
        grid-template-columns: 1fr;
    }

    .access-copy {
        padding: 32px 26px;
    }

    .form-panel {
        width: auto;
        margin: 0 26px 28px;
    }
}

@media (max-width: 620px) {
    .access-page {
        padding: 0;
    }

    .access-shell {
        min-height: 100dvh;
        border-radius: 0;
    }

    .access-header {
        padding: 12px 14px;
    }

    .brand-logo {
        width: 136px;
    }

    .ghost-button {
        min-height: 42px;
        padding: 0 12px;
    }

    .ghost-button span:last-child {
        display: none;
    }

    .access-copy h1 {
        font-size: 40px;
    }

    .benefits-grid {
        grid-template-columns: 1fr;
    }

    .form-panel {
        border-radius: 22px;
        margin: 0 14px 18px;
        padding: 22px;
    }
}
</style>
