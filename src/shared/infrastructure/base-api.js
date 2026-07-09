import axios from 'axios'

const STORAGE_KEY = 'entreprenly-auth'
const authPath = import.meta.env.VITE_AUTH_ENDPOINT_PATH ?? '/authentication'

function readToken() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        return JSON.parse(raw).token ?? null
    } catch {
        return null
    }
}

export class BaseApi {
    #http

    constructor() {
        this.#http = axios.create({
            baseURL: import.meta.env.VITE_ENTREPENLY_PLATFORM_API_URL ?? 'http://localhost:3000/api/v1',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        })

        this.#http.interceptors.request.use(config => {
            const token = readToken()
            const isAuthEndpoint = (config.url ?? '').includes(`${authPath}/`)
            if (token && !isAuthEndpoint) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        })
    }

    get http() {
        return this.#http
    }
}
