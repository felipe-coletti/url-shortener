import mongoose from 'mongoose'
import { createApp } from './app.js'
import { config } from './config.js'

if (!config.mongoUri) {
    console.error('A variável de ambiente MONGO_URI é obrigatória.')
    process.exit(1)
}

try {
    await mongoose.connect(config.mongoUri)
    console.log('MongoDB conectado')
} catch (err) {
    console.error('Não foi possível conectar ao MongoDB:', err.message)
    process.exit(1)
}

const server = createApp(config).listen(config.port, () => {
    console.log(`Servidor ouvindo na porta ${config.port}`)
})

function shutdown(signal) {
    console.log(`${signal} recebido, encerrando...`)
    server.close(async () => {
        await mongoose.disconnect()
        process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
