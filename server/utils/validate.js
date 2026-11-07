export const CODE_PATTERN = /^[A-Za-z0-9_-]{8}$/
export const MAX_URL_LENGTH = 2048

export function validateUrl(input, { blockedHosts = [], ownHost } = {}) {
    if (typeof input !== 'string' || !input.trim()) return { error: 'Informe uma URL.' }

    const value = input.trim()

    if (value.length > MAX_URL_LENGTH) return { error: 'URL muito longa.' }

    let url
    try {
        url = new URL(value)
    } catch {
        return { error: 'URL inválida.' }
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:')
        return { error: 'Apenas URLs http e https são aceitas.' }

    const host = url.hostname.toLowerCase()

    if (ownHost && host === ownHost.toLowerCase())
        return { error: 'Não é possível encurtar links deste próprio site.' }

    if (blockedHosts.some((blocked) => host === blocked || host.endsWith(`.${blocked}`)))
        return { error: 'Este domínio não é permitido.' }

    return { url: url.href }
}

export function validateExpiration(input, { defaultDays, maxDays }) {
    if (input === undefined || input === null || input === '') return { days: defaultDays }

    const days = Number(input)

    if (!Number.isInteger(days) || days < 1 || days > maxDays)
        return { error: `A expiração deve ser um número inteiro entre 1 e ${maxDays} dias.` }

    return { days }
}
