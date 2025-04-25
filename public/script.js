document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form')

    form.addEventListener('submit', function (event) {
        event.preventDefault()
        shortenUrl()
    })
})

function shortenUrl() {
    const urlInput = document.getElementById('url')
    const expirationInput = document.getElementById('expiration')
    const resultDiv = document.getElementById('result')

    const url = urlInput.value
    const expiration = expirationInput.value

    resultDiv.innerHTML = ''
    resultDiv.style.display = 'none'

    if (!url) {
        resultDiv.innerHTML = 'Por favor, insira uma URL válida.'
        resultDiv.style.display = 'flex'
        return
    }

    const shortenedUrl = `https://short.ly/${btoa(url).slice(0, 8)}`

    resultDiv.innerHTML = `
      <div class="information">
        <h2 class="secondary-title">Link encurtado</h2>
        <a class="link" href="${shortenedUrl}" target="_blank">${shortenedUrl}</a>
      </div>
      <div class="information">
        <h2 class="secondary-title">Expiração</h2>
        <p class="paragraph">${expiration ? expiration + ' dias' : 'Sem expiração'}</p>
      </div
    `
    resultDiv.style.display = 'flex'

    urlInput.value = ''
    expirationInput.value = ''
}
