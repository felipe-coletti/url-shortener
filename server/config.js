import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Carrega server/.env se existir, independentemente da pasta de onde o app foi iniciado.
// Variáveis já definidas no sistema (ex.: painel da hospedagem) têm prioridade.
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env'), quiet: true })

function list(value) {
    return (value || '')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
}

const trustProxy = process.env.TRUST_PROXY ?? '1'

export const config = {
    port: Number(process.env.PORT || process.env.APP_PORT || 3000),
    mongoUri: process.env.MONGO_URI,
    // Sem barra no final. Se vazio, a URL base é deduzida de cada requisição.
    baseUrl: (process.env.BASE_URL || '').replace(/\/+$/, ''),
    // Número de proxies na frente do app (1 na maioria das hospedagens), ou "false".
    trustProxy: trustProxy === 'false' ? false : Number(trustProxy),
    blockedHosts: list(process.env.BLOCKED_HOSTS),
    defaultExpirationDays: 30,
    maxExpirationDays: 365,
    ad: {
        scriptSrc: process.env.AD_SCRIPT_SRC || '',
        zoneId: process.env.AD_ZONE_ID || '',
    },
}
