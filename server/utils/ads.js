import { esc } from './escape.js'

// Use exatamente o endereço do script que o painel do seu provedor de anúncios fornecer.
export function getAdScript({ scriptSrc, zoneId } = {}) {
    if (!scriptSrc) return ''

    const zone = zoneId ? ` data-zone="${esc(zoneId)}"` : ''

    return `<script async src="${esc(scriptSrc)}"${zone}></script>`
}
