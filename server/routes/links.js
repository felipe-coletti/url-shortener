import { Router } from 'express'
import crypto from 'node:crypto'
import rateLimit from 'express-rate-limit'
import Link from '../models/link.js'
import { getAdScript } from '../utils/ads.js'
import { esc } from '../utils/escape.js'
import { render } from '../utils/render.js'
import { CODE_PATTERN, validateExpiration, validateUrl } from '../utils/validate.js'

const MAX_CODE_ATTEMPTS = 5

function generateCode() {
    return crypto.randomBytes(6).toString('base64url') // 8 caracteres
}

function baseUrlFor(req, config) {
    return config.baseUrl || `${req.protocol}://${req.get('host')}`
}

function sendMessage(res, status, title, message) {
    res.status(status)
        .type('html')
        .send(render('message.html', { TITLE: esc(title), MESSAGE: esc(message) }))
}

export function createLinkRouter(config, { LinkModel = Link } = {}) {
    const router = Router()

    const shortenLimiter = rateLimit({
        windowMs: 60_000,
        limit: 10,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: 'Muitas requisições. Tente novamente em instantes.' },
    })

    router.post('/shorten', shortenLimiter, async (req, res) => {
        const { url: rawUrl, expiration } = req.body ?? {}
        const baseUrl = baseUrlFor(req, config)

        const { url, error: urlError } = validateUrl(rawUrl, {
            blockedHosts: config.blockedHosts,
            ownHost: new URL(baseUrl).hostname,
        })
        if (urlError) return res.status(400).json({ error: urlError })

        const { days, error: expirationError } = validateExpiration(expiration, {
            defaultDays: config.defaultExpirationDays,
            maxDays: config.maxExpirationDays,
        })
        if (expirationError) return res.status(400).json({ error: expirationError })

        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

        for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
            try {
                const link = await LinkModel.create({
                    originalUrl: url,
                    shortUrl: generateCode(),
                    expiresAt,
                })

                return res.status(201).json({
                    shortUrl: `${baseUrl}/${link.shortUrl}`,
                    expiresAt: link.expiresAt,
                })
            } catch (err) {
                // 11000 = chave duplicada: gera outro código e tenta de novo.
                if (err?.code !== 11000 || attempt === MAX_CODE_ATTEMPTS) throw err
            }
        }
    })

    router.get('/:code', async (req, res, next) => {
        const { code } = req.params

        if (!CODE_PATTERN.test(code)) return next()

        const link = await LinkModel.findOne({ shortUrl: code }).lean()

        if (!link) return sendMessage(res, 404, 'Link não encontrado', 'Este link não existe ou foi removido.')

        if (new Date() > link.expiresAt)
            return sendMessage(res, 410, 'Link expirado', 'Este link expirou e não está mais disponível.')

        res.set('Cache-Control', 'no-store')
        res.type('html').send(
            render('redirect.html', {
                AD_SCRIPT: getAdScript(config.ad),
                DESTINATION: esc(link.originalUrl),
            })
        )
    })

    return router
}
