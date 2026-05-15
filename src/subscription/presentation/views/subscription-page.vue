<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import useSubscriptionStore from '@/subscription/application/subscription.store.js'
import PlanOverview from '@/subscription/presentation/components/plan-overview.vue'
import PlanUsage from '@/subscription/presentation/components/plan-usage.vue'
import BillingSetup from '@/subscription/presentation/components/billing-setup.vue'
import SubscriptionActivity from '@/subscription/presentation/components/subscription-activity.vue'
import UpgradePlanModal from '@/subscription/presentation/components/upgrade-plan-modal.vue'
import SubscriptionPlanActionModal from '@/subscription/presentation/components/subscription-plan-action-modal.vue'
import PaymentMethodModal from '@/subscription/presentation/components/payment-method-modal.vue'
import BillingDataModal from '@/subscription/presentation/components/billing-data-modal.vue'
import SubscriptionHistoryModal from '@/subscription/presentation/components/subscription-history-modal.vue'

const { t } = useI18n()
const subscriptionApp = useSubscriptionStore()
const {
    dashboard,
    loading,
    selectedCycle,
    controlPlanSelected,
    feedback,
    error
} = storeToRefs(subscriptionApp)

const upgradeModalOpen = ref(false)
const planActionModalMode = ref(null)
const paymentMethodModalOpen = ref(false)
const billingDataModalOpen = ref(false)
const historyModalOpen = ref(false)
const historyDownloaded = ref(false)

onMounted(() => {
    subscriptionApp.loadDashboard()
})

function selectBillingCycle(cycle) {
    subscriptionApp.selectBillingCycle(cycle)
}

function selectControlPlan() {
    subscriptionApp.selectControlPlan()
    upgradeModalOpen.value = true
}

function closeUpgradeModal() {
    upgradeModalOpen.value = false
}

function activateControlPlan() {
    subscriptionApp.activateControlPlan()
}

function openRenewalModal() {
    planActionModalMode.value = 'renew'
}

function openCancellationModal() {
    planActionModalMode.value = 'cancel'
}

function openKeepPlanModal() {
    planActionModalMode.value = 'keep'
}

function closePlanActionModal() {
    planActionModalMode.value = null
}

function confirmCancellation() {
    subscriptionApp.scheduleCancellation()
        .then(() => { planActionModalMode.value = 'cancel-success' })
}

function keepControlPlan() {
    subscriptionApp.keepControlPlan()
        .then(() => closePlanActionModal())
}

function openPaymentMethodModal() {
    paymentMethodModalOpen.value = true
}

function closePaymentMethodModal() {
    paymentMethodModalOpen.value = false
}

function savePaymentMethod(paymentMethod) {
    subscriptionApp.addPaymentMethod(paymentMethod)
        .then(() => closePaymentMethodModal())
}

function saveUpgradePaymentMethod(paymentMethod) {
    subscriptionApp.addPaymentMethod(paymentMethod)
}

function selectUpgradePaymentMethod(paymentMethodId) {
    subscriptionApp.selectPaymentMethod(paymentMethodId)
}

function openBillingDataModal() {
    billingDataModalOpen.value = true
}

function closeBillingDataModal() {
    billingDataModalOpen.value = false
}

function saveFiscalData(fiscalData) {
    subscriptionApp.completeFiscalData(fiscalData)
        .then(() => closeBillingDataModal())
}

function saveUpgradeFiscalData(fiscalData) {
    subscriptionApp.completeFiscalData(fiscalData)
}

function openHistoryModal() {
    historyDownloaded.value = false
    historyModalOpen.value = true
}

function closeHistoryModal() {
    historyModalOpen.value = false
    historyDownloaded.value = false
}

function downloadActivityHistory() {
    subscriptionApp.downloadActivityHistory()
    historyDownloaded.value = true
}

function reloadDashboard() {
    subscriptionApp.loadDashboard()
}
</script>

<template>
    <div class="subscription-page">
        <header class="page-header">
            <h1>{{ t('subscription.page.title') }}</h1>
            <p>{{ t('subscription.page.description') }}</p>
        </header>

        <p v-if="loading" class="loading-message" role="status">
            {{ t('subscription.page.loading') }}
        </p>

        <section v-else-if="error" class="error-message" role="alert">
            <strong>{{ t('subscription.page.errorTitle') }}</strong>
            <span>{{ t('subscription.page.errorDescription') }}</span>
            <small>{{ error }}</small>
            <button type="button" @click="reloadDashboard">
                {{ t('subscription.page.retry') }}
            </button>
        </section>

        <template v-else>
            <p v-if="feedback" class="feedback-message" role="status" aria-live="polite">
                {{ feedback }}
            </p>

            <PlanOverview
                :current-plan="dashboard.currentPlan"
                :recommended-plan="dashboard.recommendedPlan"
                :selected-cycle="selectedCycle"
                :control-plan-selected="controlPlanSelected"
                @billing-cycle-selected="selectBillingCycle"
                @control-plan-requested="selectControlPlan"
                @renewal-requested="openRenewalModal"
                @cancellation-requested="openCancellationModal"
                @keep-plan-requested="openKeepPlanModal"
            />

            <div class="secondary-grid">
                <PlanUsage
                    :limits="dashboard.limits"
                    :plan-status="dashboard.currentPlan.status"
                />
                <BillingSetup
                    :billing-setup="dashboard.billingSetup"
                    @payment-method-requested="openPaymentMethodModal"
                    @fiscal-data-requested="openBillingDataModal"
                />
            </div>

            <SubscriptionActivity
                :activity="dashboard.activity"
                :billing-setup="dashboard.billingSetup"
                :current-plan="dashboard.currentPlan"
                :billing-cycle="dashboard.defaultBillingCycle"
                @history-download-requested="openHistoryModal"
            />

            <UpgradePlanModal
                v-if="upgradeModalOpen"
                :plan="dashboard.recommendedPlan"
                :billing-cycle="selectedCycle"
                :billing-setup="dashboard.billingSetup"
                @closed="closeUpgradeModal"
                @fiscal-data-saved="saveUpgradeFiscalData"
                @payment-method-saved="saveUpgradePaymentMethod"
                @payment-method-selected="selectUpgradePaymentMethod"
                @subscription-activated="activateControlPlan"
            />

            <SubscriptionPlanActionModal
                v-if="planActionModalMode"
                :mode="planActionModalMode"
                :current-plan="dashboard.currentPlan"
                :billing-cycle="dashboard.defaultBillingCycle"
                @closed="closePlanActionModal"
                @cancellation-confirmed="confirmCancellation"
                @keep-plan-confirmed="keepControlPlan"
            />

            <PaymentMethodModal
                v-if="paymentMethodModalOpen"
                @closed="closePaymentMethodModal"
                @saved="savePaymentMethod"
            />

            <BillingDataModal
                v-if="billingDataModalOpen"
                :fiscal-data="dashboard.billingSetup.fiscalData"
                @closed="closeBillingDataModal"
                @saved="saveFiscalData"
            />

            <SubscriptionHistoryModal
                v-if="historyModalOpen"
                :activity="dashboard.activity"
                :billing-setup="dashboard.billingSetup"
                :current-plan="dashboard.currentPlan"
                :billing-cycle="dashboard.defaultBillingCycle"
                :downloaded="historyDownloaded"
                @closed="closeHistoryModal"
                @history-download-requested="downloadActivityHistory"
            />
        </template>
    </div>
</template>

<style scoped>
.subscription-page {
    display: grid;
    gap: 22px;
}

.page-header {
    display: grid;
    gap: 16px;
    margin-bottom: 2px;
}

.page-header h1 {
    color: var(--color-text-strong);
    font-size: 38px;
    font-weight: 800;
    line-height: 1.12;
    margin: 0;
}

.page-header p {
    max-width: 780px;
    color: var(--color-text-muted);
    font-size: 18px;
    line-height: 1.55;
    margin: 0;
}

.secondary-grid {
    display: grid;
    grid-template-columns: 0.95fr 1.05fr;
    gap: 22px;
}

.loading-message,
.feedback-message,
.error-message {
    border: 1px solid var(--color-inner-bg);
    border-radius: 14px;
    margin: 0;
    padding: 14px 18px;
}

.loading-message {
    background: var(--color-card-bg);
    color: #4f463f;
}

.feedback-message {
    background: #fff8e9;
    color: var(--color-label-accent);
    font-weight: 700;
}

.error-message {
    display: grid;
    gap: 10px;
    border-color: #f1beb8;
    background: #fff7f5;
    color: #5d1d16;
}

.error-message strong {
    font-size: 16px;
}

.error-message span,
.error-message small {
    line-height: 1.5;
}

.error-message small {
    color: #8a3b33;
}

.error-message button {
    justify-self: start;
    min-height: 44px;
    border: 0;
    border-radius: 999px;
    background: var(--color-primary);
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-weight: 800;
    padding: 0 22px;
}

.error-message button:focus-visible {
    outline: 3px solid rgb(243 131 19 / 32%);
    outline-offset: 3px;
}

@media (max-width: 1040px) {
    .secondary-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 620px) {
    .page-header h1 {
        font-size: 32px;
    }

    .page-header p {
        font-size: 16px;
    }
}
</style>
