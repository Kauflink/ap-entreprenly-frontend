import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { ProfileApi } from '@/profile/infrastructure/profile-api.js'
import { UserProfile } from '@/profile/domain/model/user-profile-entity.js'
import { UserPreferences } from '@/profile/domain/model/user-preferences-entity.js'
import { NotificationSettings } from '@/profile/domain/model/notification-settings-entity.js'
import useAuthStore from '@/auth/application/auth.store.js'
import i18n from '@/i18n.js'
import { setCurrency } from '@/shared/infrastructure/currency-formatter.js'

const profileApi = new ProfileApi()

function readStorage(key) {
    try { return localStorage.getItem(key) } catch { return null }
}

function writeStorage(key, value) {
    try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

const useProfileStore = defineStore('profile', () => {
    const authStore = useAuthStore()

    const profile = ref(new UserProfile())
    const preferences = ref(new UserPreferences({
        language: readStorage('entreprenly-lang') ?? 'es',
        theme: readStorage('entreprenly-theme') ?? 'light',
        currency: readStorage('entreprenly-currency') ?? 'PEN'
    }))
    const notificationSettings = ref(new NotificationSettings())
    const profileId = ref(0)
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
        setCurrency(currency)
    }, { immediate: true })

    function applyModels(models) {
        profileId.value = models.id
        profile.value = models.profile
        preferences.value = models.preferences
        notificationSettings.value = models.notificationSettings
    }

    function reset() {
        profileId.value = 0
        profile.value = new UserProfile()
        notificationSettings.value = new NotificationSettings()
    }

    function loadProfile() {
        const userId = authStore.userId
        if (!userId) return Promise.resolve()
        loading.value = true
        return profileApi.getProfile(userId)
            .then(applyModels)
            .catch(error => {
                errors.value.push(error)
                console.error('Failed to load profile', error)
            })
            .finally(() => {
                loading.value = false
            })
    }

    function persist(request) {
        return request
            .then(applyModels)
            .catch(error => {
                errors.value.push(error)
                console.error('Failed to persist profile changes', error)
            })
    }

    function updateProfile(partial) {
        profile.value = new UserProfile({ ...profile.value, ...partial })
        return persist(profileApi.updateProfile(profileId.value, profile.value))
    }

    function updatePreferences(partial) {
        preferences.value = new UserPreferences({ ...preferences.value, ...partial })
        return persist(profileApi.updatePreferences(profileId.value, preferences.value))
    }

    function updateNotifications(partial) {
        notificationSettings.value = new NotificationSettings({ ...notificationSettings.value, ...partial })
        return persist(profileApi.updateNotifications(profileId.value, notificationSettings.value))
    }

    watch(() => authStore.user, user => {
        if (user) loadProfile()
        else reset()
    }, { immediate: true })

    return {
        profile, preferences, notificationSettings,
        profileId, loading, errors,
        fullName, roleAndPlan,
        loadProfile,
        updateProfile, updatePreferences, updateNotifications
    }
})

export default useProfileStore
