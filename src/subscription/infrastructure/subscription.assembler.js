import { BillingSetup } from '@/subscription/domain/model/billing-setup-entity.js'
import { SubscriptionActivity } from '@/subscription/domain/model/subscription-activity-entity.js'
import { SubscriptionDashboard } from '@/subscription/domain/model/subscription-dashboard-entity.js'
import { SubscriptionLimit } from '@/subscription/domain/model/subscription-limit-entity.js'
import { PlanFeature, SubscriptionPlan } from '@/subscription/domain/model/subscription-plan-entity.js'

export class SubscriptionAssembler {
    static toEntityFromResponse(response) {
        return new SubscriptionDashboard({
            defaultBillingCycle: response.defaultBillingCycle,
            currentPlan: this.toPlanEntityFromResponse(response.currentPlan),
            recommendedPlan: this.toPlanEntityFromResponse(response.recommendedPlan),
            limits: (response.limits ?? []).map(limit => this.toLimitEntityFromResponse(limit)),
            billingSetup: this.toBillingSetupEntityFromResponse(response.billingSetup ?? {}),
            activity: (response.activity ?? []).map(activity => this.toActivityEntityFromResponse(activity))
        })
    }

    static toResourceFromEntity(dashboard) {
        return {
            id: 1,
            defaultBillingCycle: dashboard.defaultBillingCycle,
            currentPlan: this.toPlanResponseFromEntity(dashboard.currentPlan),
            recommendedPlan: this.toPlanResponseFromEntity(dashboard.recommendedPlan),
            limits: dashboard.limits.map(limit => ({
                id: limit.id,
                label: limit.label,
                usedValue: limit.usedValue,
                maxValue: limit.maxValue
            })),
            billingSetup: this.toBillingSetupResponseFromEntity(dashboard.billingSetup),
            activity: dashboard.activity.map(item => ({
                id: item.id,
                title: item.title,
                detail: item.detail
            }))
        }
    }

    static toPlanResponseFromEntity(plan) {
        const response = {
            id: plan.id,
            name: plan.name,
            shortDescription: plan.shortDescription,
            monthlyPrice: plan.monthlyPrice,
            annualPrice: plan.annualPrice,
            status: plan.status,
            statusLabel: plan.statusLabel,
            badgeLabel: plan.badgeLabel,
            recommended: plan.recommended,
            features: plan.features.map(feature => ({
                description: feature.description,
                available: feature.available
            }))
        }

        if (plan.currentPeriodStartDate) response.currentPeriodStartDate = plan.currentPeriodStartDate
        if (plan.currentPeriodEndDate) response.currentPeriodEndDate = plan.currentPeriodEndDate

        return response
    }

    static toBillingSetupResponseFromEntity(billingSetup) {
        return {
            paymentMethodTitle: billingSetup.paymentMethodTitle,
            paymentMethodDescription: billingSetup.paymentMethodDescription,
            paymentMethodActionLabel: billingSetup.paymentMethodActionLabel,
            fiscalDataTitle: billingSetup.fiscalDataTitle,
            fiscalDataDescription: billingSetup.fiscalDataDescription,
            fiscalDataActionLabel: billingSetup.fiscalDataActionLabel,
            hasPaymentMethod: billingSetup.hasPaymentMethod,
            hasFiscalData: billingSetup.hasFiscalData,
            paymentMethods: billingSetup.paymentMethods.map(paymentMethod => ({
                id: paymentMethod.id,
                cardBrand: paymentMethod.cardBrand,
                lastFour: paymentMethod.lastFour,
                holderName: paymentMethod.holderName,
                expiryMonth: paymentMethod.expiryMonth,
                expiryYear: paymentMethod.expiryYear,
                isDefault: paymentMethod.isDefault
            })),
            fiscalData: billingSetup.fiscalData
                ? {
                    documentType: billingSetup.fiscalData.documentType,
                    documentNumber: billingSetup.fiscalData.documentNumber,
                    businessName: billingSetup.fiscalData.businessName,
                    receiptEmail: billingSetup.fiscalData.receiptEmail,
                    fiscalAddress: billingSetup.fiscalData.fiscalAddress
                }
                : null
        }
    }

    static toPlanEntityFromResponse(response = {}) {
        return new SubscriptionPlan({
            id: response.id,
            name: response.name,
            shortDescription: response.shortDescription,
            monthlyPrice: response.monthlyPrice,
            annualPrice: response.annualPrice,
            status: response.status,
            statusLabel: response.statusLabel,
            badgeLabel: response.badgeLabel,
            recommended: response.recommended,
            currentPeriodStartDate: response.currentPeriodStartDate ?? '',
            currentPeriodEndDate: response.currentPeriodEndDate ?? '',
            features: (response.features ?? []).map(feature => this.toFeatureEntityFromResponse(feature))
        })
    }

    static toFeatureEntityFromResponse(response = {}) {
        return new PlanFeature({
            description: response.description,
            available: response.available
        })
    }

    static toLimitEntityFromResponse(response = {}) {
        return new SubscriptionLimit({
            id: response.id,
            label: response.label,
            usedValue: response.usedValue,
            maxValue: response.maxValue
        })
    }

    static toBillingSetupEntityFromResponse(response = {}) {
        return new BillingSetup({
            paymentMethodTitle: response.paymentMethodTitle,
            paymentMethodDescription: response.paymentMethodDescription,
            paymentMethodActionLabel: response.paymentMethodActionLabel,
            fiscalDataTitle: response.fiscalDataTitle,
            fiscalDataDescription: response.fiscalDataDescription,
            fiscalDataActionLabel: response.fiscalDataActionLabel,
            hasPaymentMethod: response.hasPaymentMethod,
            hasFiscalData: response.hasFiscalData,
            paymentMethods: response.paymentMethods ?? [],
            fiscalData: response.fiscalData ?? null
        })
    }

    static toActivityEntityFromResponse(response = {}) {
        return new SubscriptionActivity({
            id: response.id,
            title: response.title,
            detail: response.detail
        })
    }
}
