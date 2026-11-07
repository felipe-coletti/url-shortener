const dest = document.body.dataset.destination
const t = 5
const el = document.getElementById('countdown')
const timer = setInterval(() => {
    t--
    el.textContent = t
    
    if (t <= 0) {
        clearInterval(timer)
        window.location.replace(dest)
    }
}, 1000)