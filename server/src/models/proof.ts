import { randomUUID } from "crypto"

export class Proof {
    id: string
    data_request_id: string
    user_id: string
    created_at: number

    constructor(data_request_id: string, user_id: string) {
        this.id = randomUUID().toString().toLowerCase()
        this.data_request_id = data_request_id
        this.user_id = user_id
        this.created_at = Date.now()
    }
}