import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Link from '../models/link.js'
import { getAdScript } from '../utils/ads.js'
import { esc } from '../utils/escape.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const template = fs.readFileSync(path.join(__dirname, '../views/redirect.html'), 'utf-8')
const router = Router()
const BASE_URL = process.env.BASE_URL
const urlPattern = /^https?:\/\/.+/i

router.post('/shorten', async (req, res) => {
    const { url, expiration } = req.body

    if (!url || !urlPattern.test(url))
        return res.status(400).json({ error: 'Invalid URL.' })

    if (url.length > 2048)
        return res.status(400).json({ error: 'URL too long.' })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (expiration || 30))
    const link = new Link({ originalUrl: url, shortUrl: uuidv4().slice(0, 8), expiresAt })
    
    await link.save()

    res.json({ shortUrl: `${BASE_URL}/${link.shortUrl}`, expiresAt })
})

router.get('/:shortUrl', async (req, res) => {
    const link = await Link.findOne({ shortUrl: req.params.shortUrl })

    if (!link) return res.status(404).json({ error: 'Not found.' })
    if (new Date() > link.expiresAt) return res.status(410).json({ error: 'Expired.' })

    const dest = link.originalUrl
    const html = template
        .replace(/\{\{AD_SCRIPT\}\}/g, getAdScript())
        .replace(/\{\{DESTINATION\}\}/g, esc(dest))
        .replace(/\{\{DESTINATION_JS\}\}/g, JSON.stringify(dest))

    res.type('html').send(html)
})

export default router