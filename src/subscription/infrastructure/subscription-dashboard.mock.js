export const SUBSCRIPTION_DASHBOARD_RESPONSE = {
    id: 1,
    defaultBillingCycle: 'monthly',
    currentPlan: {
        id: 'plan-free',
        name: 'Plan Free',
        shortDescription: 'Incluido automaticamente al crear la cuenta. No requiere tarjeta ni genera cargos.',
        monthlyPrice: 0,
        annualPrice: 0,
        status: 'free',
        statusLabel: 'Plan Free activo',
        badgeLabel: 'Plan actual',
        recommended: false,
        features: [
            { description: 'Inventario basico con productos y lotes limitados.', available: true },
            { description: 'Registro manual de movimientos principales.', available: true },
            { description: 'Sin chatbot de WhatsApp ni automatizaciones avanzadas.', available: true }
        ]
    },
    recommendedPlan: {
        id: 'plan-control',
        name: 'Plan Control',
        shortDescription: 'Opera sin restricciones con automatizaciones, alertas y trazabilidad completa.',
        monthlyPrice: 89,
        annualPrice: 890,
        status: 'active',
        statusLabel: 'Recomendado',
        badgeLabel: 'Recomendado',
        recommended: true,
        features: [
            { description: 'Productos y lotes ilimitados', available: true },
            { description: 'Ventas, pedidos, caja y trazabilidad en un solo flujo.', available: true },
            { description: 'Chatbot de WhatsApp y alertas operativas incluidas.', available: true }
        ]
    },
    limits: [
        { id: 'products', label: 'Productos', usedValue: 18, maxValue: 40 },
        { id: 'active-batches', label: 'Lotes activos', usedValue: 6, maxValue: 20 },
        { id: 'users', label: 'Usuarios', usedValue: 1, maxValue: 1 }
    ],
    billingSetup: {
        paymentMethodTitle: 'Metodo de pago',
        paymentMethodDescription: 'Aun no hay tarjeta o medio de pago registrado.',
        paymentMethodActionLabel: 'Agregar metodo de pago',
        fiscalDataTitle: 'Datos de facturacion',
        fiscalDataDescription: 'Completa RUC, razon social y correo de comprobantes.',
        fiscalDataActionLabel: 'Completar datos',
        hasPaymentMethod: false,
        hasFiscalData: false,
        paymentMethods: [],
        fiscalData: null
    },
    activity: [
        {
            id: 'created-account',
            title: 'Cuenta creada',
            detail: '16 abril 2026 - Plan Free asignado automaticamente'
        },
        {
            id: 'current-status',
            title: 'Estado actual',
            detail: 'Plan Free activo - Sin cargos registrados'
        },
        {
            id: 'billing',
            title: 'Facturacion',
            detail: 'Pendiente de completar para actualizar a Plan Control'
        }
    ]
}

export const ACTIVE_SUBSCRIPTION_DASHBOARD_RESPONSE = {
    id: 1,
    defaultBillingCycle: 'monthly',
    currentPlan: {
        id: 'plan-control',
        name: 'Plan Control',
        shortDescription: 'Tu plan sigue activo hasta el 10 de junio de 2026. Se renovara automaticamente.',
        monthlyPrice: 89,
        annualPrice: 890,
        status: 'active',
        statusLabel: 'Plan Control activo',
        badgeLabel: 'Plan actual',
        recommended: false,
        currentPeriodStartDate: '2026-05-10',
        currentPeriodEndDate: '2026-06-10',
        features: [
            { description: 'Productos y lotes ilimitados', available: true },
            { description: 'Ventas, pedidos, caja y trazabilidad en un solo flujo.', available: true },
            { description: 'Chatbot de WhatsApp y alertas operativas incluidas.', available: true }
        ]
    },
    recommendedPlan: {
        id: 'plan-control',
        name: 'Plan Control',
        shortDescription: 'Opera sin restricciones con automatizaciones, alertas y trazabilidad completa.',
        monthlyPrice: 89,
        annualPrice: 890,
        status: 'active',
        statusLabel: 'Recomendado',
        badgeLabel: 'Recomendado',
        recommended: true,
        features: [
            { description: 'Productos y lotes ilimitados', available: true },
            { description: 'Ventas, pedidos, caja y trazabilidad en un solo flujo.', available: true },
            { description: 'Chatbot de WhatsApp y alertas operativas incluidas.', available: true }
        ]
    },
    limits: [
        { id: 'products', label: 'Productos', usedValue: 18, maxValue: 0 },
        { id: 'active-batches', label: 'Lotes activos', usedValue: 6, maxValue: 0 },
        { id: 'users', label: 'Usuarios', usedValue: 1, maxValue: 5 }
    ],
    billingSetup: {
        paymentMethodTitle: 'Metodo de pago',
        paymentMethodDescription: 'Aun no hay tarjeta o medio de pago registrado.',
        paymentMethodActionLabel: 'Agregar metodos de pago',
        fiscalDataTitle: 'Datos de facturacion',
        fiscalDataDescription: 'Completa RUC, razon social y correo de comprobantes.',
        fiscalDataActionLabel: 'Completar datos',
        hasPaymentMethod: false,
        hasFiscalData: false,
        paymentMethods: [],
        fiscalData: null
    },
    activity: [
        {
            id: 'created-account',
            title: 'Cuenta creada',
            detail: '16 abril 2026 - Plan Free asignado automaticamente'
        },
        {
            id: 'current-status',
            title: 'Estado actual',
            detail: 'Plan Control activo'
        },
        {
            id: 'billing',
            title: 'Facturacion',
            detail: 'Proxima renovacion: 10 de junio de 2026 - pago mensual'
        }
    ]
}
