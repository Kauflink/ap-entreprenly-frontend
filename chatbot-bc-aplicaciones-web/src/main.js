import './assets/main.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import pinia from './pinia.js'
import i18n from './i18n.js'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Drawer from 'primevue/drawer'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import Toolbar from 'primevue/toolbar'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(i18n)
app.use(PrimeVue, { theme: { preset: Aura }, ripple: true })
app.use(ToastService)
app.use(ConfirmationService)

app.component('pv-button', Button)
app.component('pv-card', Card)
app.component('pv-column', Column)
app.component('pv-confirm-dialog', ConfirmDialog)
app.component('pv-data-table', DataTable)
app.component('pv-dialog', Dialog)
app.component('pv-drawer', Drawer)
app.component('pv-input-text', InputText)
app.component('pv-select-button', SelectButton)
app.component('pv-tag', Tag)
app.component('pv-textarea', Textarea)
app.component('pv-toast', Toast)
app.component('pv-toolbar', Toolbar)

app.mount('#app')
