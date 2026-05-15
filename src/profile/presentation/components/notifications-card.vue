<script setup>
import { reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import useProfileStore from '@/profile/application/profile.store.js'

const { t } = useI18n()
const profileStore = useProfileStore()
const { notificationSettings } = storeToRefs(profileStore)

const form = reactive({
    stockAlerts: notificationSettings.value.stockAlerts,
    paymentAlerts: notificationSettings.value.paymentAlerts,
    chatbotMessages: notificationSettings.value.chatbotMessages
})

watch(notificationSettings, current => {
    form.stockAlerts = current.stockAlerts
    form.paymentAlerts = current.paymentAlerts
    form.chatbotMessages = current.chatbotMessages
}, { deep: true })

function onToggle(key, event) {
    const value = event.target.checked
    form[key] = value
    profileStore.updateNotifications({ [key]: value })
}
</script>

<template>
    <div class="card">
        <h2 class="card__title">{{ t('profile.notifications.title') }}</h2>

        <form @submit.prevent>
            <div class="toggle-item">
                <div class="toggle-item__text">
                    <p class="toggle-item__name">{{ t('profile.notifications.items.stock.name') }}</p>
                    <p class="toggle-item__desc">{{ t('profile.notifications.items.stock.desc') }}</p>
                </div>
                <label
                    class="toggle-item__switch"
                    :aria-label="t('profile.notifications.items.stock.toggleLabel')"
                >
                    <input
                        type="checkbox"
                        :checked="form.stockAlerts"
                        class="visually-hidden"
                        @change="onToggle('stockAlerts', $event)"
                    />
                    <span class="toggle-item__track" aria-hidden="true"></span>
                </label>
            </div>

            <div class="toggle-item">
                <div class="toggle-item__text">
                    <p class="toggle-item__name">{{ t('profile.notifications.items.payment.name') }}</p>
                    <p class="toggle-item__desc">{{ t('profile.notifications.items.payment.desc') }}</p>
                </div>
                <label
                    class="toggle-item__switch"
                    :aria-label="t('profile.notifications.items.payment.toggleLabel')"
                >
                    <input
                        type="checkbox"
                        :checked="form.paymentAlerts"
                        class="visually-hidden"
                        @change="onToggle('paymentAlerts', $event)"
                    />
                    <span class="toggle-item__track" aria-hidden="true"></span>
                </label>
            </div>

            <div class="toggle-item">
                <div class="toggle-item__text">
                    <p class="toggle-item__name">{{ t('profile.notifications.items.chatbot.name') }}</p>
                    <p class="toggle-item__desc">{{ t('profile.notifications.items.chatbot.desc') }}</p>
                </div>
                <label
                    class="toggle-item__switch"
                    :aria-label="t('profile.notifications.items.chatbot.toggleLabel')"
                >
                    <input
                        type="checkbox"
                        :checked="form.chatbotMessages"
                        class="visually-hidden"
                        @change="onToggle('chatbotMessages', $event)"
                    />
                    <span class="toggle-item__track" aria-hidden="true"></span>
                </label>
            </div>
        </form>
    </div>
</template>

<style scoped>
.card {
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    box-shadow: var(--color-card-shadow);
    border-radius: 25px;
    padding: clamp(8px, 1.11dvh, 12px) 24px;
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 0.93dvh, 10px);
    flex: 1;
    min-height: 0;
}

.card__title {
    font-weight: 800;
    font-size: clamp(13px, 1.48dvh, 16px);
    color: var(--color-text-primary);
    margin: 0;
    text-align: left;
}

form {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.11dvh, 12px);
    flex: 1;
    min-height: 0;
    justify-content: space-between;
}

.toggle-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: var(--color-inner-bg);
    border: 1px solid var(--color-inner-border);
    border-radius: 25px;
    padding: clamp(10px, 1.85dvh, 20px) 20px;
    flex: 1;
    min-height: 0;
}

.toggle-item__text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.toggle-item__name {
    font-weight: 800;
    font-size: clamp(11px, 1.3dvh, 14px);
    color: var(--color-text-primary);
    margin: 0;
}

.toggle-item__desc {
    font-weight: 800;
    font-size: clamp(10px, 1.11dvh, 12px);
    color: var(--color-text-muted);
    margin: 0;
}

.toggle-item__switch {
    flex-shrink: 0;
    cursor: pointer;
}

.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.toggle-item__track {
    display: block;
    width: 36px;
    height: 20px;
    background: var(--color-card-border);
    border-radius: 10px;
    position: relative;
    transition: background-color 0.2s;
}

.toggle-item__track::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: var(--color-card-bg);
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.toggle-item__switch input:checked + .toggle-item__track {
    background: var(--color-primary);
}

.toggle-item__switch input:checked + .toggle-item__track::after {
    transform: translateX(16px);
}
</style>
