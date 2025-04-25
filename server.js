// server.js

require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const app = express()

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI
const BASE_URL = process.env.BASE_URL

app.use(express.static('public'))
app.use(express.json())

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err)
    })

const LinkSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true },
    expiresAt: { type: Date, required: true },
})

const Link = mongoose.model('Link', LinkSchema)

app.post('/shorten', async (req, res) => {
    const { url, expiration } = req.body

    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid URL. Must start with "http".' })
    }

    const expiresAt = new Date()

    expiresAt.setDate(expiresAt.getDate() + (expiration || 30))

    const shortUrl = uuidv4().slice(0, 8)
    const newLink = new Link({
        originalUrl: url,
        shortUrl,
        expiresAt,
    })

    try {
        await newLink.save()

        res.json({
            shortUrl: `${BASE_URL}/${shortUrl}`,
            expiresAt,
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to save the link.' })
    }
})

app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params

    const link = await Link.findOne({ shortUrl })

    if (!link) {
        return res.status(404).json({ error: 'Link not found.' })
    }
    if (new Date() > link.expiresAt) {
        return res.status(410).json({ error: 'The link has expired.' })
    }

    res.redirect(link.originalUrl)
})

app.listen(PORT, () => {
    console.log(`Server is running at ${BASE_URL}`)
})
