import { BaseApi } from '@/shared/infrastructure/base-api.js'

const STORAGE_KEY = 'entreprenly-auth'
const profilesPath = import.meta.env.VITE_PROFILES_ENDPOINT_PATH ?? '/profiles'

function readUserId() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw).id ?? 0) : 0
    } catch {
        return 0
    }
}

export class ProfileApi extends BaseApi {
    getProfile() {
        const userId = readUserId()
        if (!userId) return Promise.reject(new Error('No authenticated user'))
        return this.http
            .get(`${profilesPath}/by-user/${userId}`)
            .then(res => ({ id: res.data.id, userId: res.data.userId, preferences: res.data.preferences ?? {} }))
    }

    updatePreferences(profileId, preferences) {
        return this.http
            .put(`${profilesPath}/${profileId}/preferences`, {
                language: preferences.language,
                timezone: preferences.timezone ?? '',
                theme:    preferences.theme    ?? 'light',
                currency: preferences.currency ?? 'PEN'
            })
            .then(res => ({ id: res.data.id, preferences: res.data.preferences ?? {} }))
    }
}
