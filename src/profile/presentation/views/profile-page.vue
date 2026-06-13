<script setup>
import { useI18n } from 'vue-i18n'
import UserInfoCard from '@/profile/presentation/components/user-info-card.vue'
import UpdateProfileCard from '@/profile/presentation/components/update-profile-card.vue'
import PreferencesCard from '@/profile/presentation/components/preferences-card.vue'
import PhoneVerifyCard from '@/profile/presentation/components/phone-verify-card.vue'
import EmailChangeCard from '@/profile/presentation/components/email-change-card.vue'
import ChangePasswordCard from '@/profile/presentation/components/change-password-card.vue'
import NotificationsCard from '@/profile/presentation/components/notifications-card.vue'

const { t } = useI18n()
</script>

<template>
    <main class="page" :aria-label="t('profile.page.ariaLabel')">
        <header class="page-header">
            <p class="eyebrow">{{ t('profile.page.eyebrow') }}</p>
            <h1>{{ t('profile.page.title') }}</h1>
            <p>{{ t('profile.page.subtitle') }}</p>
        </header>

        <div class="grid">
            <section class="profile-panel profile-panel--identity" :aria-label="t('profile.page.identitySection')">
                <UserInfoCard />
            </section>

            <section class="profile-panel profile-panel--personal" :aria-label="t('profile.page.personalSection')">
                <UpdateProfileCard />
            </section>

            <section class="profile-panel profile-panel--preferences" :aria-label="t('profile.page.preferencesSection')">
                <PreferencesCard />
            </section>

            <section class="profile-stack profile-stack--contact" :aria-label="t('profile.page.contactSection')">
                <PhoneVerifyCard />
                <EmailChangeCard />
            </section>

            <section class="profile-panel profile-panel--security" :aria-label="t('profile.page.securitySection')">
                <ChangePasswordCard />
            </section>

            <section class="profile-panel profile-panel--notifications" :aria-label="t('profile.page.notificationsSection')">
                <NotificationsCard />
            </section>
        </div>
    </main>
</template>

<style scoped>
.page {
    --color-card-shadow: 0 10px 26px rgb(0 0 0 / 10%);
    --profile-gap: clamp(16px, 1.7vw, 24px);

    background: var(--color-bg-page);
    box-sizing: border-box;
    min-height: calc(100dvh - 98px);
    width: 100%;
}

.page-header {
    max-width: 1510px;
    width: 100%;
    margin: 0 auto clamp(18px, 2vw, 28px);
}

.eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    margin: 0 0 8px;
    padding: 0 14px;
    border-radius: 999px;
    background: var(--color-inner-bg);
    color: var(--color-label-accent);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
}

.page-header h1 {
    margin: 0;
    color: var(--color-text-strong);
    font-size: clamp(28px, 3vw, 42px);
    font-weight: 800;
    line-height: 1.1;
}

.page-header p:last-child {
    max-width: 720px;
    margin: 10px 0 0;
    color: var(--color-text-muted);
    font-size: clamp(14px, 1.1vw, 16px);
    line-height: 1.6;
}

.grid {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-areas:
        'identity identity identity identity personal personal personal personal preferences preferences preferences preferences'
        'contact contact contact contact contact contact security security security security security security'
        'notifications notifications notifications notifications notifications notifications notifications notifications notifications notifications notifications notifications';
    gap: var(--profile-gap);
    max-width: 1510px;
    width: 100%;
    margin: 0 auto;
    align-items: stretch;
}

.profile-panel,
.profile-stack {
    min-width: 0;
}

.profile-panel {
    display: flex;
}

.profile-stack {
    display: grid;
    gap: var(--profile-gap);
    align-content: stretch;
}

.profile-panel > *,
.profile-stack > * {
    width: 100%;
}

.profile-panel--identity {
    grid-area: identity;
}

.profile-panel--personal {
    grid-area: personal;
}

.profile-panel--preferences {
    grid-area: preferences;
}

.profile-stack--contact {
    grid-area: contact;
    grid-template-rows: repeat(2, minmax(0, 1fr));
}

.profile-panel--security {
    grid-area: security;
}

.profile-panel--notifications {
    grid-area: notifications;
}

@media (max-width: 1360px) {
    .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-areas:
            'identity personal'
            'contact preferences'
            'security security'
            'notifications notifications';
    }
}

@media (max-width: 900px) {
    .grid {
        grid-template-columns: 1fr;
        grid-template-areas:
            'identity'
            'personal'
            'contact'
            'preferences'
            'security'
            'notifications';
    }

    .profile-stack--contact {
        grid-template-rows: auto;
    }
}

@media (max-width: 620px) {
    .page {
        --profile-gap: 14px;
        min-height: auto;
    }

    .page-header {
        margin-bottom: 16px;
    }
}
</style>
