import mongoose from 'mongoose'

const LinkSchema = new mongoose.Schema(
    {
        originalUrl: { type: String, required: true },
        shortUrl: { type: String, required: true, unique: true },
        // Índice TTL: o MongoDB apaga o documento assim que expiresAt passa.
        expiresAt: { type: Date, required: true, index: { expires: 0 } },
    },
    { timestamps: true }
)

export default mongoose.model('Link', LinkSchema)
