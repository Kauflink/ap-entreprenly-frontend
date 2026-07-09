import { computed, ref } from 'vue'

const PEN_TO_USD_RATE = 1 / 3.75
const STORAGE_KEY = 'entreprenly-currency'

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

function loadCurrency() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (isSupportedCurrency(stored)) return stored
    } catch { /* ignore */ }
    return 'PEN'
}

// Single source of truth for the active currency, shared across the whole app.
// Every consumer reads this same signal, so the form and the list can never
// disagree. The profile store keeps it in sync with the user's preference.
const currencyRef = ref(loadCurrency())

export function setCurrency(value) {
    if (!isSupportedCurrency(value)) return
    currencyRef.value = value
    try { localStorage.setItem(STORAGE_KEY, value) } catch { /* ignore */ }
}

export function useCurrencyFormatter() {
    const currency = computed(() => currencyRef.value)
    const symbol = computed(() => CURRENCY_SYMBOLS[currencyRef.value])

    function format(priceInPen) {
        const converted = Number(priceInPen ?? 0) * CURRENCY_RATES[currencyRef.value]
        return `${CURRENCY_SYMBOLS[currencyRef.value]} ${converted.toFixed(2)}`
    }

    // Base currency (PEN) -> display currency, for pre-filling inputs when editing.
    function fromBaseCurrency(priceInPen) {
        return Math.round(Number(priceInPen ?? 0) * CURRENCY_RATES[currencyRef.value] * 100) / 100
    }

    // Display currency -> base currency (PEN), for persisting what the user typed.
    function toBaseCurrency(displayPrice) {
        return Math.round((Number(displayPrice ?? 0) / CURRENCY_RATES[currencyRef.value]) * 100) / 100
    }

    return { currency, symbol, format, fromBaseCurrency, toBaseCurrency }
}
