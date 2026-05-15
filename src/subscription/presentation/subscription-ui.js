export function formatCurrency(priceInPen) {
    return `S/ ${Number(priceInPen ?? 0).toFixed(2)}`
}

export function toLocalDate(dateValue) {
    const [year, month, day] = String(dateValue ?? '').split('-').map(value => Number(value))
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
}

export function formatPlanDate(dateValue, locale, fallback) {
    const date = dateValue instanceof Date ? dateValue : toLocalDate(dateValue)

    if (date === null) return fallback

    return new Intl.DateTimeFormat(dateLocale(locale), {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date)
}

export function dateLocale(locale) {
    return String(locale ?? 'en').startsWith('es') ? 'es-PE' : 'en-US'
}

export function addMonthsPreservingMonthEnd(date, months) {
    const targetMonthStart = new Date(date.getFullYear(), date.getMonth() + months, 1)
    const originalMonthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const targetMonthLastDay = new Date(
        targetMonthStart.getFullYear(),
        targetMonthStart.getMonth() + 1,
        0
    ).getDate()
    const targetDay = date.getDate() === originalMonthLastDay
        ? targetMonthLastDay
        : Math.min(date.getDate(), targetMonthLastDay)

    return new Date(targetMonthStart.getFullYear(), targetMonthStart.getMonth(), targetDay)
}

export function cardBrandLabel(cardBrand, genericLabel) {
    const normalizedBrand = String(cardBrand ?? '').trim().toLowerCase()
    return ['tarjeta', 'card'].includes(normalizedBrand) ? genericLabel : cardBrand
}

export function buildActivityRows({
    activity,
    billingSetup,
    currentPlan,
    billingCycle,
    t,
    locale
}) {
    return [
        ...(activity ?? []).map(item => toActivityRow(item, currentPlan, billingCycle, t, locale)),
        {
            id: 'payment-method',
            title: t('subscription.history.paymentMethod.title'),
            detail: paymentMethodDetail(billingSetup, t)
        },
        {
            id: 'fiscal-data',
            title: t('subscription.history.fiscalData.title'),
            detail: fiscalDataDetail(billingSetup, t)
        }
    ]
}

function toActivityRow(item, currentPlan, billingCycle, t, locale) {
    if (item.id === 'created-account') {
        return {
            id: item.id,
            title: t('subscription.activity.created-account.title'),
            detail: t('subscription.activity.created-account.detail')
        }
    }

    if (item.id === 'current-status') {
        return {
            id: item.id,
            title: t('subscription.activity.current-status.title'),
            detail: t(`subscription.activity.current-status.detail.${currentPlan.status}`, {
                price: formatCurrency(currentPlan.monthlyPrice)
            })
        }
    }

    if (item.id === 'billing') {
        return toBillingActivityRow(item, currentPlan, billingCycle, t, locale)
    }

    return {
        id: item.id,
        title: item.title,
        detail: item.detail
    }
}

function toBillingActivityRow(item, currentPlan, billingCycle, t, locale) {
    if (currentPlan.status === 'free') {
        return {
            id: item.id,
            title: t('subscription.activity.billing.title'),
            detail: t('subscription.activity.billing.detail.free')
        }
    }

    const cancellationScheduled = currentPlan.status === 'scheduled-cancellation'

    return {
        id: item.id,
        title: t('subscription.activity.billing.title'),
        detail: t(cancellationScheduled
            ? 'subscription.activity.billing.detail.accessUntil'
            : 'subscription.activity.billing.detail.renewalWithDate',
        {
            date: formatPlanDate(
                currentPlan.currentPeriodEndDate,
                locale,
                t('subscription.planAction.fallbackDate')
            ),
            cycle: billingCycle === 'annual'
                ? t('subscription.overview.priceLabel.annual')
                : t('subscription.overview.priceLabel.monthly')
        })
    }
}

function selectedPaymentMethod(billingSetup) {
    return billingSetup.paymentMethods.find(method => method.isDefault)
        ?? billingSetup.paymentMethods.at(-1)
        ?? null
}

function paymentMethodDetail(billingSetup, t) {
    const paymentMethod = selectedPaymentMethod(billingSetup)

    if (!paymentMethod) return t('subscription.history.paymentMethod.empty')

    return t('subscription.history.paymentMethod.detail', {
        brand: cardBrandLabel(paymentMethod.cardBrand, t('subscription.cardBrand.generic')),
        lastFour: paymentMethod.lastFour
    })
}

function fiscalDataDetail(billingSetup, t) {
    const fiscalData = billingSetup.fiscalData

    if (fiscalData === null) return t('subscription.history.fiscalData.empty')

    return t('subscription.history.fiscalData.detail', {
        documentType: fiscalData.documentType,
        documentNumber: fiscalData.documentNumber,
        businessName: fiscalData.businessName
    })
}
