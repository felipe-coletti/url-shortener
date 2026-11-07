import mongoose from 'mongoose'

const LinkSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl:    { type: String, required: true, unique: true },
    expiresAt:   { type: Date,   required: true },
})

export default mongoose.model('Link', LinkSchema)   