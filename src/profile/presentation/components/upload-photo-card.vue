<script setup>
import { computed, ref, useTemplateRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import useProfileStore from '@/profile/application/profile.store.js'

const { t } = useI18n()
const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

const previewUrl = ref(null)
const fileInput = useTemplateRef('fileInput')
const displayedUrl = computed(() => previewUrl.value ?? profile.value.avatarUrl)

function triggerFileInput() {
    fileInput.value?.click()
}

function onFileSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
        previewUrl.value = reader.result
        profileStore.updateProfile({ avatarUrl: reader.result })
    }
    reader.readAsDataURL(file)
}
</script>

<template>
    <div class="card">
        <h2 class="card__title">{{ t('profile.uploadPhoto.title') }}</h2>

        <div class="dropzone">
            <div class="dropzone__avatar">
                <img
                    v-if="displayedUrl"
                    :src="displayedUrl"
                    :alt="t('profile.uploadPhoto.previewAlt')"
                    class="dropzone__img"
                />
                <span v-else class="material-icons dropzone__icon" aria-hidden="true">person</span>
            </div>

            <div class="dropzone__actions">
                <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="visually-hidden"
                    :aria-label="t('profile.uploadPhoto.fileInputLabel')"
                    @change="onFileSelected"
                />
                <button type="button" class="btn-select" @click="triggerFileInput">
                    {{ t('profile.uploadPhoto.selectAction') }}
                </button>
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
    display: flex;
    flex-direction: column;
    gap: clamp(5px, 0.74dvh, 8px);
    height: 100%;
    box-sizing: border-box;
}

.card__title {
    font-weight: 800;
    font-size: clamp(13px, 1.48dvh, 16px);
    line-height: 1.3;
    color: var(--color-text-primary);
    margin: 0;
    text-align: left;
}

.dropzone {
    background: var(--color-inner-bg);
    border-radius: 25px;
    box-shadow: var(--color-card-shadow);
    padding: clamp(6px, 0.93dvh, 10px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(5px, 0.74dvh, 8px);
    flex: 1;
    min-height: 0;
}

.dropzone__avatar {
    width: clamp(60px, 9.44dvh, 101px);
    height: clamp(60px, 9.44dvh, 102px);
    border-radius: 50%;
    background: var(--color-avatar-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
}

.dropzone__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.dropzone__icon {
    color: var(--color-avatar-fg);
    font-size: clamp(32px, 4.81dvh, 52px);
}

.dropzone__actions {
    display: flex;
    justify-content: center;
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

.btn-select {
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    border-radius: 25px;
    padding: clamp(5px, 0.65dvh, 7px) 24px;
    font-weight: 800;
    font-size: clamp(10px, 1.11dvh, 12px);
    line-height: 1.3;
    color: var(--color-btn-select-text);
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-select:hover {
    background: var(--color-bg-page);
}

.btn-select:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
</style>
