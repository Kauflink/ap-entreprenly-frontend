const CARD_BRANDS = {
    visa: {
        id: 'visa',
        label: 'Visa',
        shortLabel: 'VISA',
        ariaLabel: 'Tarjeta Visa'
    },
    mastercard: {
        id: 'mastercard',
        label: 'Mastercard',
        shortLabel: 'MC',
        ariaLabel: 'Tarjeta Mastercard'
    },
    'american-express': {
        id: 'american-express',
        label: 'American Express',
        shortLabel: 'AMEX',
        ariaLabel: 'Tarjeta American Express'
    },
    'diners-club': {
        id: 'diners-club',
        label: 'Diners Club',
        shortLabel: 'DINERS',
        ariaLabel: 'Tarjeta Diners Club'
    },
    discover: {
        id: 'discover',
        label: 'Discover',
        shortLabel: 'DISC',
        ariaLabel: 'Tarjeta Discover'
    },
    jcb: {
        id: 'jcb',
        label: 'JCB',
        shortLabel: 'JCB',
        ariaLabel: 'Tarjeta JCB'
    },
    unionpay: {
        id: 'unionpay',
        label: 'UnionPay',
        shortLabel: 'UP',
        ariaLabel: 'Tarjeta UnionPay'
    },
    unknown: {
        id: 'unknown',
        label: 'Tarjeta',
        shortLabel: 'CARD',
        ariaLabel: 'Tarjeta'
    }
}

export function detectCardBrand(cardNumber) {
    const digits = String(cardNumber ?? '').replace(/\D/g, '')

    if (/^4/.test(digits)) return CARD_BRANDS.visa
    if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return CARD_BRANDS.mastercard
    if (/^3[47]/.test(digits)) return CARD_BRANDS['american-express']
    if (/^3(0[0-5]|[68])/.test(digits)) return CARD_BRANDS['diners-club']
    if (/^(6011|65|64[4-9])/.test(digits)) return CARD_BRANDS.discover
    if (/^(2131|1800|35)/.test(digits)) return CARD_BRANDS.jcb
    if (/^62/.test(digits)) return CARD_BRANDS.unionpay

    return CARD_BRANDS.unknown
}

export function resolveCardBrand(cardBrand) {
    const normalizedBrand = String(cardBrand ?? '').trim().toLowerCase()

    if (normalizedBrand.includes('visa')) return CARD_BRANDS.visa
    if (normalizedBrand.includes('master')) return CARD_BRANDS.mastercard
    if (normalizedBrand.includes('american') || normalizedBrand.includes('amex')) return CARD_BRANDS['american-express']
    if (normalizedBrand.includes('diners')) return CARD_BRANDS['diners-club']
    if (normalizedBrand.includes('discover')) return CARD_BRANDS.discover
    if (normalizedBrand.includes('jcb')) return CARD_BRANDS.jcb
    if (normalizedBrand.includes('union')) return CARD_BRANDS.unionpay

    return CARD_BRANDS.unknown
}

export function paymentMethodIdentity(paymentMethod = {}) {
    return [
        paymentMethod.cardBrand,
        paymentMethod.lastFour,
        paymentMethod.holderName,
        paymentMethod.expiryMonth,
        paymentMethod.expiryYear
    ].map(value => String(value ?? '').trim().toLowerCase()).join('|')
}

export function normalizePaymentMethods(paymentMethods = []) {
    const paymentMethodsByIdentity = new Map()

    paymentMethods.forEach(paymentMethod => {
        paymentMethodsByIdentity.set(paymentMethodIdentity(paymentMethod), paymentMethod)
    })

    return [...paymentMethodsByIdentity.values()]
}

export class BillingSetup {
    constructor({
        paymentMethodTitle = '',
        paymentMethodDescription = '',
        paymentMethodActionLabel = '',
        fiscalDataTitle = '',
        fiscalDataDescription = '',
        fiscalDataActionLabel = '',
        hasPaymentMethod = null,
        hasFiscalData = null,
        paymentMethods = [],
        fiscalData = null
    } = {}) {
        this.paymentMethodTitle = paymentMethodTitle
        this.paymentMethodDescription = paymentMethodDescription
        this.paymentMethodActionLabel = paymentMethodActionLabel
        this.fiscalDataTitle = fiscalDataTitle
        this.fiscalDataDescription = fiscalDataDescription
        this.fiscalDataActionLabel = fiscalDataActionLabel
        const normalizedPaymentMethods = normalizePaymentMethods(paymentMethods)

        this.paymentMethods = normalizedPaymentMethods
        this.fiscalData = fiscalData
        this.hasPaymentMethod = hasPaymentMethod ?? normalizedPaymentMethods.length > 0
        this.hasFiscalData = hasFiscalData ?? fiscalData !== null
    }
}
