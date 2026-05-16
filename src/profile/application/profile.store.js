import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { ProfileApi } from '@/profile/infrastructure/profile-api.js'
import { UserProfile } from '@/profile/domain/model/user-profile-entity.js'
import { UserPreferences } from '@/profile/domain/model/user-preferences-entity.js'
import { NotificationSettings } from '@/profile/domain/model/notification-settings-entity.js'
import i18n from '@/i18n.js'

const profileApi = new ProfileApi()

function readStorage(key) {
    try { return localStorage.getItem(key) } catch { return null }
}

function writeStorage(key, value) {
    try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

const useProfileStore = defineStore('profile', () => {
    const profile = ref(new UserProfile())
    const preferences = ref(new UserPreferences({
        language: readStorage('entreprenly-lang') ?? 'es',
        theme: readStorage('entreprenly-theme') ?? 'light',
        currency: readStorage('entreprenly-currency') ?? 'PEN'
    }))
    const notificationSettings = ref(new NotificationSettings())
    const loaded = ref(false)
    const loading = ref(false)
    const errors = ref([])

    const fullName = computed(() => profile.value.fullName)
    const roleAndPlan = computed(() => profile.value.roleAndPlan)

    watch(() => preferences.value.language, language => {
        if (!language) return
        writeStorage('entreprenly-lang', language)
        if (i18n.global.locale.value !== language) {
            i18n.global.locale.value = language
        }
    }, { immediate: true })

    watch(() => preferences.value.theme, theme => {
        if (!theme) return
        document.documentElement.dataset.theme = theme
        writeStorage('entreprenly-theme', theme)
    }, { immediate: true })

    watch(() => preferences.value.currency, currency => {
        if (!currency) return
        writeStorage('entreprenly-currency', currency)
    }, { immediate: true })

    function loadProfile() {
        if (loaded.value) return Promise.resolve()
        loading.value = true
        return profileApi.getProfile().then(response => {
            profile.value = response.profile
            preferences.value = response.preferences
            notificationSettings.value = response.notificationSettings
            loaded.value = true
        }).catch(error => {
            errors.value.push(error)
            console.error('Failed to load profile', error)
        }).finally(() => {
            loading.value = false
        })
    }

    function persist() {
        return profileApi.updateProfile(profile.value, preferences.value, notificationSettings.value)
            .then(response => {
                profile.value = response.profile
                preferences.value = response.preferences
                notificationSettings.value = response.notificationSettings
            })
            .catch(error => {
                errors.value.push(error)
                console.error('Failed to persist profile changes', error)
            })
    }

    function updateProfile(partial) {
        profile.value = new UserProfile({ ...profile.value, ...partial })
        return persist()
    }

    function updatePreferences(partial) {
        preferences.value = new UserPreferences({ ...preferences.value, ...partial })
        return persist()
    }

    function updateNotifications(partial) {
        notificationSettings.value = new NotificationSettings({ ...notificationSettings.value, ...partial })
        return persist()
    }

    return {
        profile, preferences, notificationSettings,
        loaded, loading, errors,
        fullName, roleAndPlan,
        loadProfile,
        updateProfile, updatePreferences, updateNotifications
    }
})

export default useProfileStore
