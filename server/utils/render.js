import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const viewsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../views')
const cache = new Map()

function load(name) {
    if (!cache.has(name)) cache.set(name, fs.readFileSync(path.join(viewsDir, name), 'utf-8'))
    return cache.get(name)
}

// Os valores precisam vir já escapados. A substituição usa função para que
// sequências como "$&" ou "$'" no valor não sejam interpretadas pelo replace.
export function render(name, values) {
    return load(name).replace(/\{\{([A-Z_]+)\}\}/g, (match, key) =>
        Object.hasOwn(values, key) ? String(values[key]) : match
    )
}
