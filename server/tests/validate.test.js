import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateExpiration, validateUrl } from '../utils/validate.js'
import { render } from '../utils/render.js'
import { esc } from '../utils/escape.js'
import { getAdScript } from '../utils/ads.js'

test('validateUrl aceita http e https', () => {
    assert.equal(validateUrl('https://exemplo.com/a?b=1').url, 'https://exemplo.com/a?b=1')
    assert.equal(validateUrl('  http://exemplo.com ').url, 'http://exemplo.com/')
})

test('validateUrl rejeita entradas inválidas', () => {
    for (const input of [undefined, '', 'exemplo.com', 'javascript:alert(1)', 'ftp://x.com', 42, {}])
        assert.ok(validateUrl(input).error, String(input))
    assert.ok(validateUrl(`https://x.com/${'a'.repeat(2048)}`).error)
})

test('validateUrl bloqueia o próprio host e domínios bloqueados', () => {
    assert.ok(validateUrl('https://encurta.me/abc', { ownHost: 'encurta.me' }).error)
    assert.ok(validateUrl('https://sub.ruim.com', { blockedHosts: ['ruim.com'] }).error)
    assert.ok(validateUrl('https://naoruim.com', { blockedHosts: ['ruim.com'] }).url)
})

test('validateExpiration usa padrão e limita o intervalo', () => {
    const opts = { defaultDays: 30, maxDays: 365 }
    assert.equal(validateExpiration(undefined, opts).days, 30)
    assert.equal(validateExpiration('', opts).days, 30)
    assert.equal(validateExpiration('7', opts).days, 7)
    for (const input of [0, -1, 366, 1.5, 'abc', '1e9']) assert.ok(validateExpiration(input, opts).error, String(input))
})

test('render não interpreta padrões $ do replace e escapa atributos', () => {
    const dest = 'https://a.com/$`$&$\'" onmouseover="alert(1)'
    const html = render('redirect.html', { AD_SCRIPT: '', DESTINATION: esc(dest) })
    assert.ok(!html.includes('" onmouseover="'))
    assert.ok(html.includes('data-destination="https://a.com/$`$&amp;$&#39;&quot; onmouseover=&quot;alert(1)"'))
    assert.ok(!html.includes('<!DOCTYPE html>', 20), 'template não deve ser duplicado')
})

test('getAdScript escapa a configuração e fica vazio sem script', () => {
    assert.equal(getAdScript({}), '')
    assert.equal(
        getAdScript({ scriptSrc: 'https://ads.example/s.js', zoneId: '1"><x' }),
        '<script async src="https://ads.example/s.js" data-zone="1&quot;&gt;&lt;x"></script>'
    )
})
