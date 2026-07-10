import { createPinia } from 'pinia'

const pinia = createPinia()

// Setup stores (defineStore with a function) don't get a $reset() out of the box.
// This plugin captures each store's initial state on creation and exposes $reset()
// so the session can wipe all domain data on logout — otherwise a different account
// keeps seeing the previous user's cached products, lots, sales, etc.
pinia.use(({ store }) => {
    const initialState = JSON.parse(JSON.stringify(store.$state))
    store.$reset = () => store.$patch($state => {
        Object.assign($state, JSON.parse(JSON.stringify(initialState)))
    })
})

export default pinia;
