const dest = document.body.dataset.destination
const el = document.getElementById('countdown')
let remaining = 5

const timer = setInterval(() => {
    remaining--
    el.textContent = remaining

    if (remaining <= 0) {
        clearInterval(timer)
        window.location.replace(dest)
    }
}, 1000)
