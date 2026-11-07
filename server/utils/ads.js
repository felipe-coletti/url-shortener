export function getAdScript() {
    const { AD_PROVIDER, AD_ZONE_ID } = process.env
    
    const configs = {
        adsterra: `<script src='//pl.hbck.me/scripts/zone.js' data-zone='${AD_ZONE_ID}'></script>`,
        propellerads: `<script src='//pl.profitablecpmrate.com/zone.js' data-zone='${AD_ZONE_ID}'></script>`,
        monetag: `<script src='//app.monetag.com/adsense/zone.js' data-zone='${AD_ZONE_ID}'></script>`,
    }

    return configs[AD_PROVIDER] || ''
}   