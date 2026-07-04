import './assets/css/main.css'

import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'
import { clerkPlugin, updateClerkOptions } from '@clerk/vue'
import { enUS, jaJP } from '@clerk/localizations'
import { addCollection } from '@iconify/vue'
import { icons } from '@iconify-json/lucide'

import App from '@/App.vue'
import { currentLocale, i18n } from '@/i18n'
import router from '@/router'
import { settings } from '@/settings'

const app = createApp(App)

addCollection(icons)

app.use(createPinia())
app.use(router)
app.use(ui)
app.use(i18n)

if (settings.clerkEnabled) {
  app.use(clerkPlugin, {
    publishableKey: settings.clerkPublishableKey,
    localization: currentLocale() === 'ja' ? jaJP : enUS,
  })

  watch(i18n.global.locale, (locale) => {
    updateClerkOptions({ localization: locale === 'ja' ? jaJP : enUS })
  })
}

app.mount('#app')
