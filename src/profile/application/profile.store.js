import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ProfileApi } from '@/profile/infrastructure/profile-api.js'
import { UserPreferences } from '@/profile/domain/model/user-preferences-entity.js'
import i18n from '@/i18n.js'

const profileApi = new ProfileApi()

function readStorage(key, fallback) {
    try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}

function writeStorage(key, value) {
    try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

const useProfileStore = defineStore('profile', () => {
    const profileId   = ref(0)
    const preferences = ref(new UserPreferences({
        language: readStorage('entreprenly-lang', 'es'),
        theme:    readStorage('entreprenly-theme', 'light'),
        currency: readStorage('entreprenly-currency', 'PEN')
    }))

    // Apply locale from localStorage immediately so the UI is correct on reload.
    i18n.global.locale.value = preferences.value.language

    function _applyResource(data) {
        profileId.value = data.id
        const p = data.preferences
        preferences.value = new UserPreferences({
            language: p.language ?? 'es',
            timezone: p.timezone ?? '',
            theme:    p.theme    ?? 'light',
            currency: p.currency ?? 'PEN'
        })
        i18n.global.locale.value = preferences.value.language
        writeStorage('entreprenly-lang',     preferences.value.language)
        writeStorage('entreprenly-theme',    preferences.value.theme)
        writeStorage('entreprenly-currency', preferences.value.currency)
    }

    function loadProfile() {
        return profileApi.getProfile()
            .then(_applyResource)
            .catch(() => { /* user not logged in yet — ignore */ })
    }

    function updatePreferences(partial) {
        preferences.value = new UserPreferences({ ...preferences.value, ...partial })
        if (partial.language) {
            i18n.global.locale.value = partial.language
            writeStorage('entreprenly-lang', partial.language)
        }
        if (!profileId.value) return Promise.resolve()
        return profileApi.updatePreferences(profileId.value, preferences.value)
            .then(_applyResource)
            .catch(err => console.error('Preferences update failed', err))
    }

    // Auto-load when the store is first used.
    loadProfile()

    return { profileId, preferences, loadProfile, updatePreferences }
})

export default useProfileStore
