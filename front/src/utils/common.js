import { ETHERSCAN_URL } from "./Constants"

export const openAddress = (address) => {
    return `${ETHERSCAN_URL}/address/${address}`
}

export const openTx = (hash) => {
    return `${ETHERSCAN_URL}/tx/${hash}`

}