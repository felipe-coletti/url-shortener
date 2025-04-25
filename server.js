const express = require('express')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const app = express()
const port = 3000

app.use(express.static('public'))

mongoose
    .connect('mongodb://localhost:27017/linkshortener', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Conectado ao MongoDB')
    })
    .catch((err) => {
        console.error('Erro ao conectar ao MongoDB', err)
    })

const LinkSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true },
    expiresAt: { type: Date, required: true },
})
const Link = mongoose.model('Link', LinkSchema)

app.use(express.json())
app.post('/shorten', async (req, res) => {
    const { url, expiration } = req.body

    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ error: 'URL inválida. Deve começar com "http".' })
    }

    let expiresAt = new Date()

    expiresAt.setDate(expiresAt.getDate() + (expiration || 30))

    const shortUrl = uuidv4().slice(0, 8)
    const newLink = new Link({
        originalUrl: url,
        shortUrl: shortUrl,
        expiresAt: expiresAt,
    })

    try {
        await newLink.save()

        res.json({
            shortUrl: `${req.protocol}://${req.get('host')}/${shortUrl}`,
            expiresAt,
        })
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar o link.' })
    }
})

app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params

    const link = await Link.findOne({ shortUrl })

    if (!link) {
        return res.status(404).json({ error: 'Link não encontrado.' })
    }

    if (new Date() > link.expiresAt) {
        return res.status(410).json({ error: 'O link expirou.' })
    }

    res.redirect(link.originalUrl)
})

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
})
