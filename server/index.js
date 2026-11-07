import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import linkRoutes from './routes/links.js'
import rateLimit from 'express-rate-limit'

const app = express()
const PORT = process.env.APP_PORT || 3000

app.use(express.static('public'))
app.use(express.json())
app.use(linkRoutes)
app.use(rateLimit({
    windowMs: 60_000,
    max: 30,
    standardHeaders: true,
}))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))   