<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import useProfileStore from '@/profile/application/profile.store.js'

const { t } = useI18n()
const profileStore = useProfileStore()
const { profile, fullName, roleAndPlan } = storeToRefs(profileStore)

const previewUrl = ref(null)
const saving = ref(false)
const fileInput = useTemplateRef('fileInput')
const displayedUrl = computed(() => previewUrl.value ?? profile.value.avatarUrl)

function triggerFileInput() {
    fileInput.value?.click()
}

function onFileSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return
    saving.value = true
    const reader = new FileReader()
    reader.onload = () => {
        previewUrl.value = reader.result
        Promise.resolve(profileStore.updateProfile({ avatarUrl: reader.result }))
            .finally(() => { saving.value = false })
    }
    reader.readAsDataURL(file)
}
</script>

<template>
    <div class="card">
        <div class="inner">
            <div class="avatar" aria-hidden="true">
                <img
                    v-if="displayedUrl"
                    :src="displayedUrl"
                    :alt="t('profile.userInfo.avatarAlt')"
                    class="avatar__img"
                />
                <span v-else class="material-icons avatar__icon">person</span>
            </div>
            <div class="info">
                <p class="info__name">{{ fullName }}</p>
                <p class="info__role">{{ roleAndPlan }}</p>
                <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="visually-hidden"
                    :aria-label="t('profile.uploadPhoto.fileInputLabel')"
                    @change="onFileSelected"
                />
                <button
                    type="button"
                    class="btn-select"
                    :disabled="saving"
                    @click="triggerFileInput"
                >
                    {{ t('profile.uploadPhoto.selectAction') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    display: flex;
    box-sizing: border-box;
    height: 100%;
    padding: clamp(16px, 2dvh, 22px);
    border: 1px solid var(--color-card-border);
    border-radius: 25px;
    background: var(--color-card-bg);
    box-shadow: var(--color-card-shadow);
}

.inner {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: clamp(18px, 2vw, 28px);
    box-sizing: border-box;
    min-height: 210px;
    padding: clamp(18px, 2.4vw, 34px);
    border-radius: 25px;
    background: var(--color-inner-bg);
    box-shadow: var(--color-card-shadow);
}

.avatar {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: clamp(76px, 8vw, 112px);
    height: clamp(76px, 8vw, 112px);
    overflow: hidden;
    border-radius: 50%;
    background: var(--color-avatar-bg);
}

.avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar__icon {
    color: var(--color-avatar-fg);
    font-size: clamp(38px, 4vw, 56px);
}

.info {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
}

.info__name {
    margin: 0;
    color: var(--color-text-primary);
    font-family: 'Reddit Sans', sans-serif;
    font-size: clamp(14px, 1.1vw, 18px);
    font-weight: 700;
    line-height: 1.3;
}

.info__role {
    margin: 0 0 8px;
    color: var(--color-text-role);
    font-family: 'Reddit Sans', sans-serif;
    font-size: clamp(11px, 0.9vw, 13px);
    font-weight: 500;
    line-height: 1.3;
}

.btn-select {
    min-height: 34px;
    padding: 0 22px;
    border: 1px solid var(--color-card-border);
    border-radius: 999px;
    background: var(--color-card-bg);
    color: var(--color-btn-select-text);
    cursor: pointer;
    font-family: 'Reddit Sans', sans-serif;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.3;
    transition: background-color 0.2s, opacity 0.2s;
}

.btn-select:hover:not(:disabled) {
    background: var(--color-bg-page);
}

.btn-select:disabled {
    cursor: not-allowed;
    opacity: 0.55;
}

.btn-select:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
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

@media (max-width: 620px) {
    .card {
        height: auto;
        padding: 16px;
        border-radius: 18px;
    }

    .inner {
        min-height: 0;
        justify-content: flex-start;
        padding: 16px;
        border-radius: 18px;
    }

    .avatar {
        width: 72px;
        height: 72px;
    }
}
</style>
