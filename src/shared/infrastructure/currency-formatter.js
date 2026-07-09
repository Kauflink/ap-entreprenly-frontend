import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import useProfileStore from '@/profile/application/profile.store.js'

const PEN_TO_USD_RATE = 1 / 3.75

const CURRENCY_SYMBOLS = {
    PEN: 'S/',
    USD: '$'
}

const CURRENCY_RATES = {
    PEN: 1,
    USD: PEN_TO_USD_RATE
}

export function isSupportedCurrency(value) {
    return value === 'PEN' || value === 'USD'
}

export function useCurrencyFormatter() {
    const profileStore = useProfileStore()
    const { preferences } = storeToRefs(profileStore)

    const currency = computed(() => isSupportedCurrency(preferences.value.currency)
        ? preferences.value.currency
        : 'PEN')
    const symbol = computed(() => CURRENCY_SYMBOLS[currency.value])

    function format(priceInPen) {
        const value = Number(priceInPen ?? 0)
        const converted = value * CURRENCY_RATES[currency.value]
        return `${CURRENCY_SYMBOLS[currency.value]} ${converted.toFixed(2)}`
    }

    return { currency, symbol, format }
}
