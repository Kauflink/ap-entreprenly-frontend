<script setup>
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import useProfileStore from '@/profile/application/profile.store.js'

const { t } = useI18n()
const profileStore = useProfileStore()
const { profile, fullName, roleAndPlan } = storeToRefs(profileStore)
</script>

<template>
    <div class="card">
        <div class="inner">
            <div class="avatar" aria-hidden="true">
                <img
                    v-if="profile.avatarUrl"
                    :src="profile.avatarUrl"
                    :alt="t('profile.userInfo.avatarAlt')"
                    class="avatar__img"
                />
                <span v-else class="material-icons avatar__icon">person</span>
            </div>
            <div class="info">
                <p class="info__name">{{ fullName }}</p>
                <p class="info__role">{{ roleAndPlan }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    box-shadow: var(--color-card-shadow);
    border-radius: 25px;
    padding: clamp(14px, 2dvh, 22px);
    height: 100%;
    box-sizing: border-box;
    display: flex;
}

.inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 17px;
    background: var(--color-inner-bg);
    border-radius: 25px;
    padding: clamp(7px, 0.94dvh, 10px);
    box-shadow: var(--color-card-shadow);
    flex: 1;
    box-sizing: border-box;
}

.avatar {
    width: clamp(48px, 6.77dvh, 73px);
    height: clamp(48px, 6.77dvh, 73px);
    border-radius: 50%;
    background: var(--color-avatar-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
}

.avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar__icon {
    color: var(--color-avatar-fg);
    font-size: clamp(24px, 3.46dvh, 37px);
}

.info {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.info__name {
    font-weight: 500;
    font-size: clamp(11px, 1.26dvh, 14px);
    line-height: 1.3;
    color: var(--color-text-primary);
    margin: 0;
}

.info__role {
    font-weight: 500;
    font-size: clamp(9px, 1.02dvh, 11px);
    line-height: 1.3;
    color: var(--color-text-role);
    margin: 0;
}
</style>
