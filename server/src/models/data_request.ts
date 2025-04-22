import { randomUUID } from "crypto"

export class DataRequest {
    id: string
    user_id: string
    data_type: string
    min: number
    max: number
    leq: boolean
    geq: boolean
    exp_date: number

    constructor(
        user_id: string, 
        data_type: string, 
        min: number, 
        max: number, 
        leq: boolean, 
        geq: boolean
    ) {
        this.id = randomUUID().toString().toLowerCase()
        this.user_id = user_id
        this.data_type = data_type
        this.min = min
        this.max = max
        this.leq = leq
        this.geq = geq
        const now = new Date()
        now.setMonth(now.getMonth() + 1)
        this.exp_date = now.getTime()
    }
}