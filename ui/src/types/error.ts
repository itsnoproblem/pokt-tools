export type PocketError = {
    applicationPublicKey: string,
    blockchain: string
    bytes: number,
    code: number,
    elapsedTime: number,
    message: string,
    method: string,
    timestamp: Date,
}

export const logsAreEqual = (a: PocketError, b: PocketError): boolean => {
    return (
        a.message === b.message && a.blockchain === b.blockchain && a.code === b.code
    )
}
