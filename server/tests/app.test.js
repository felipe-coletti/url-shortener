import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'

const links = new Map()
let failNextWithDuplicate = 0

const FakeLink = {
    async create(doc) {
        if (failNextWithDuplicate > 0) {
            failNextWithDuplicate--
            throw Object.assign(new Error('duplicate'), { code: 11000 })
        }
        links.set(doc.shortUrl, doc)
        return doc
    },
    findOne({ shortUrl }) {
        return { lean: async () => links.get(shortUrl) ?? null }
    },
}

const config = {
    baseUrl: '',
    trustProxy: false,
    blockedHosts: ['ruim.com'],
    defaultExpirationDays: 30,
    maxExpirationDays: 365,
    ad: { scriptSrc: '', zoneId: '' },
}

let server
let base

before(async () => {
    server = createApp(config, { LinkModel: FakeLink }).listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    base = `http://127.0.0.1:${server.address().port}`
})

after(() => server.close())

const shorten = (body) =>
    fetch(`${base}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    })

test('serve a página inicial e os assets', async () => {
    const page = await fetch(`${base}/`)
    assert.equal(page.status, 200)
    assert.match(await page.text(), /Encurtador de Link/)
    assert.equal((await fetch(`${base}/js/script.js`)).status, 200)
    assert.equal((await fetch(`${base}/js/redirect.js`)).status, 200)
})

test('encurta, redireciona e trata expiração', async () => {
    const res = await shorten({ url: 'https://exemplo.com/pagina', expiration: 7 })
    assert.equal(res.status, 201)
    const { shortUrl, expiresAt } = await res.json()
    assert.match(shortUrl, new RegExp(`^${base}/[A-Za-z0-9_-]{8}$`))
    const days = (new Date(expiresAt) - Date.now()) / 86_400_000
    assert.ok(days > 6.99 && days <= 7)

    const page = await fetch(shortUrl)
    assert.equal(page.status, 200)
    assert.match(await page.text(), /data-destination="https:\/\/exemplo.com\/pagina"/)

    links.get(shortUrl.split('/').pop()).expiresAt = new Date(Date.now() - 1000)
    assert.equal((await fetch(shortUrl)).status, 410)
})

test('tenta outro código em caso de colisão', async () => {
    failNextWithDuplicate = 2
    assert.equal((await shorten({ url: 'https://exemplo.com' })).status, 201)
})

test('rejeita entradas inválidas com 400', async () => {
    for (const body of [{}, { url: 'nada' }, { url: 'https://ruim.com' }, { url: 'https://x.com', expiration: -3 }, '{quebrado'])
        assert.equal((await shorten(body)).status, 400, JSON.stringify(body))
})

test('códigos inexistentes e inválidos retornam 404', async () => {
    assert.equal((await fetch(`${base}/abcdefgh`)).status, 404)
    assert.equal((await fetch(`${base}/favicon.ico`)).status, 404)
})

test('healthcheck indica banco indisponível', async () => {
    assert.equal((await fetch(`${base}/healthz`)).status, 503)
})
