document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('form').addEventListener('submit', (event) => {
        event.preventDefault()
        shortenUrl()
    })
})

function element(tag, className, text) {
    const el = document.createElement(tag)
    if (className) el.className = className
    if (text !== undefined) el.textContent = text
    return el
}

function information(title, content) {
    const wrapper = element('div', 'information')
    wrapper.append(element('h2', 'secondary-title', title), content)
    return wrapper
}

function showResult(...children) {
    const resultDiv = document.getElementById('result')
    resultDiv.replaceChildren(...children)
    resultDiv.hidden = false
}

function showError(message) {
    showResult(element('p', 'paragraph error', message))
}

async function shortenUrl() {
    const urlInput = document.getElementById('url')
    const expirationInput = document.getElementById('expiration')
    const button = document.getElementById('button')

    const url = urlInput.value.trim()
    const expiration = expirationInput.value

    if (!url) return showError('Por favor, insira uma URL válida.')

    button.disabled = true

    try {
        const response = await fetch('/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, expiration: expiration ? Number(expiration) : undefined }),
        })
        const data = await response.json().catch(() => ({}))

        if (!response.ok) return showError(data.error || 'Não foi possível encurtar o link.')

        const link = element('a', 'link', data.shortUrl)
        link.href = data.shortUrl
        link.target = '_blank'
        link.rel = 'noopener'

        const expiresAt = new Date(data.expiresAt).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        })

        showResult(
            information('Link encurtado', link),
            information('Expira em', element('p', 'paragraph', expiresAt))
        )

        urlInput.value = ''
        expirationInput.value = ''
    } catch {
        showError('Erro de conexão. Tente novamente.')
    } finally {
        button.disabled = false
    }
}
