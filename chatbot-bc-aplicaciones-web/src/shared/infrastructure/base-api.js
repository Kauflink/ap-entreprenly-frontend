import axios from 'axios'

export class BaseApi {
  #http

  constructor() {
    this.#http = axios.create({
      baseURL: import.meta.env.VITE_ENTREPENLY_PLATFORM_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }

  get http() {
    return this.#http
  }
}
