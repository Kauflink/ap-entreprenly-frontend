import axios from 'axios'

export class BaseApi {
    #http

    constructor() {
        this.#http = axios.create({
            baseURL: 'http://localhost:3000/api/v1',
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
