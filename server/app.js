import express from 'express'
import helmet from 'helmet'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createLinkRouter } from './routes/links.js'
import { esc } from './utils/escape.js'
import { render } from './utils/render.js'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export function createApp(config, options = {}) {
    const app = express()

    app.disable('x-powered-by')
    app.set('trust proxy', config.trustProxy)

    app.use(
        helmet({
            // Os scripts de anúncio carregam recursos de muitos domínios, por isso
            // a CSP padrão do helmet bloquearia os anúncios.
            contentSecurityPolicy: false,
            referrerPolicy: { policy: 'no-referrer' },
        })
    )

    app.get('/healthz', (req, res) => {
        const dbReady = mongoose.connection.readyState === 1
        res.status(dbReady ? 200 : 503).json({ status: dbReady ? 'ok' : 'db_unavailable' })
    })

    app.use(express.static(path.join(rootDir, 'public')))
    app.use(express.static(path.join(rootDir, '../client')))
    app.use(express.json({ limit: '10kb' }))

    app.use(createLinkRouter(config, options))

    app.use((req, res) => {
        if (req.accepts(['html', 'json']) === 'json') return res.status(404).json({ error: 'Não encontrado.' })

        res.status(404)
            .type('html')
            .send(render('message.html', { TITLE: 'Página não encontrada', MESSAGE: esc('Verifique o endereço digitado.') }))
    })

    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido.' })
        if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Requisição muito grande.' })

        console.error(err)
        res.status(500).json({ error: 'Erro interno do servidor.' })
    })

    return app
}
