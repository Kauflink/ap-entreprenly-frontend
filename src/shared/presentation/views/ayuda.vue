<script setup>
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// ── Static data ────────────────────────────────────────────────────────────────
const ARTICLES = [
  {
    id: 1, titleKey: 'dashboard-help.articles.1.title', categoryKey: 'dashboard-help.articles.1.category',
    categoryId: 'inventario', readTime: 3, mostConsulted: true,
    stepKeys: ['dashboard-help.articles.1.steps.0', 'dashboard-help.articles.1.steps.1', 'dashboard-help.articles.1.steps.2', 'dashboard-help.articles.1.steps.3'],
    relatedIds: [4, 5]
  },
  {
    id: 2, titleKey: 'dashboard-help.articles.2.title', categoryKey: 'dashboard-help.articles.2.category',
    categoryId: 'chatbot', readTime: 5, mostConsulted: true,
    stepKeys: ['dashboard-help.articles.2.steps.0', 'dashboard-help.articles.2.steps.1', 'dashboard-help.articles.2.steps.2', 'dashboard-help.articles.2.steps.3'],
    relatedIds: [6, 7]
  },
  {
    id: 3, titleKey: 'dashboard-help.articles.3.title', categoryKey: 'dashboard-help.articles.3.category',
    categoryId: 'pedidos', readTime: 2,
    stepKeys: ['dashboard-help.articles.3.steps.0', 'dashboard-help.articles.3.steps.1', 'dashboard-help.articles.3.steps.2', 'dashboard-help.articles.3.steps.3'],
    relatedIds: [2, 8]
  },
  {
    id: 4, titleKey: 'dashboard-help.articles.4.title', categoryKey: 'dashboard-help.articles.4.category',
    categoryId: 'inventario', readTime: 5,
    stepKeys: ['dashboard-help.articles.4.steps.0', 'dashboard-help.articles.4.steps.1', 'dashboard-help.articles.4.steps.2', 'dashboard-help.articles.4.steps.3'],
    relatedIds: [1, 5]
  },
  {
    id: 5, titleKey: 'dashboard-help.articles.5.title', categoryKey: 'dashboard-help.articles.5.category',
    categoryId: 'ventas', readTime: 2,
    stepKeys: ['dashboard-help.articles.5.steps.0', 'dashboard-help.articles.5.steps.1', 'dashboard-help.articles.5.steps.2', 'dashboard-help.articles.5.steps.3'],
    relatedIds: [3, 1]
  },
  {
    id: 6, titleKey: 'dashboard-help.articles.6.title', categoryKey: 'dashboard-help.articles.6.category',
    categoryId: 'chatbot', readTime: 3,
    stepKeys: ['dashboard-help.articles.6.steps.0', 'dashboard-help.articles.6.steps.1', 'dashboard-help.articles.6.steps.2', 'dashboard-help.articles.6.steps.3'],
    relatedIds: [2, 3]
  },
  {
    id: 7, titleKey: 'dashboard-help.articles.7.title', categoryKey: 'dashboard-help.articles.7.category',
    categoryId: 'chatbot', readTime: 4,
    stepKeys: ['dashboard-help.articles.7.steps.0', 'dashboard-help.articles.7.steps.1', 'dashboard-help.articles.7.steps.2', 'dashboard-help.articles.7.steps.3'],
    relatedIds: [2, 3]
  },
  {
    id: 8, titleKey: 'dashboard-help.articles.8.title', categoryKey: 'dashboard-help.articles.8.category',
    categoryId: 'pedidos', readTime: 4,
    stepKeys: ['dashboard-help.articles.8.steps.0', 'dashboard-help.articles.8.steps.1', 'dashboard-help.articles.8.steps.2', 'dashboard-help.articles.8.steps.3'],
    relatedIds: [3, 2]
  }
]

const CATEGORIES = (() => {
  const ids = [...new Set(ARTICLES.map(a => a.categoryId))]
  return ids.map(id => ({
    id,
    nameKey: `dashboard-help.categoryNames.${id}`,
    articleCount: ARTICLES.filter(a => a.categoryId === id).length
  }))
})()

const frequentArticles = ARTICLES.slice(0, 5)
const popularArticles  = ARTICLES.filter(a => a.mostConsulted)

const problemCategories = ['-- Selecciona una categoría --', 'Error técnico', 'Duda de uso', 'Solicitud de función', 'Otro']
const modules           = ['Inventario', 'Chatbot', 'Pedidos', 'Ventas', 'Suscripción']

// ── View state ─────────────────────────────────────────────────────────────────
const view              = ref('home')
const searchInput       = ref('')
const searchQuery       = ref('')
const selectedArticleId = ref(null)
const articleFeedback   = ref(null) // null | 'useful' | 'not-useful'
const formSubmitted     = ref(false)
const ticketNumber      = ref('')
const savedData         = ref(null)
const quickReportText   = ref('')
const quickReportInvalid = ref(false)

// ── Form ───────────────────────────────────────────────────────────────────────
const form = reactive({ category: '', module: '', description: '', when: '' })
const formTouched = reactive({ category: false, module: false, description: false })

// ── Computed ───────────────────────────────────────────────────────────────────
const selectedArticle = computed(() => ARTICLES.find(a => a.id === selectedArticleId.value) ?? null)

const searchResults = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  return ARTICLES.filter(a => {
    const title = t(a.titleKey).toLowerCase()
    const cat   = t(a.categoryKey).toLowerCase()
    return title.includes(q) || cat.includes(q)
  })
})

const relatedCategories = computed(() => {
  const ids = [...new Set(searchResults.value.map(a => a.categoryId))]
  return CATEGORIES.filter(c => ids.includes(c.id))
})

const relatedArticles = computed(() => {
  const art = selectedArticle.value
  if (!art) return []
  return art.relatedIds.map(id => ARTICLES.find(a => a.id === id)).filter(Boolean)
})

const isCategoryError    = computed(() => (formTouched.category    || formSubmitted.value) && !form.category)
const isModuleError      = computed(() => (formTouched.module      || formSubmitted.value) && !form.module)
const isDescriptionError = computed(() => (formTouched.description || formSubmitted.value) && form.description.trim().length < 5)

const errorCount = computed(() =>
  [isCategoryError.value, isModuleError.value, isDescriptionError.value].filter(Boolean).length
)

const formErrors = computed(() => {
  const errs = []
  if (isCategoryError.value)    errs.push(t('dashboard-help.report.categoryRequired'))
  if (isDescriptionError.value) errs.push(t('dashboard-help.report.descriptionRequired'))
  return errs
})

const nowString = computed(() => {
  return new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' · ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
})

// ── Actions ────────────────────────────────────────────────────────────────────
function onSearch() {
  const q = searchInput.value.trim()
  if (!q) return
  searchQuery.value = q
  view.value = 'results'
}

function onClearSearch() {
  searchInput.value = ''
  searchQuery.value = ''
  view.value = 'home'
}

function onOpenArticle(id) {
  selectedArticleId.value = id
  articleFeedback.value   = null
  quickReportText.value   = ''
  quickReportInvalid.value = false
  view.value = 'article'
}

function onArticleFeedback(useful) {
  articleFeedback.value = useful ? 'useful' : 'not-useful'
}

function onGoReport(prefillModuleKey) {
  Object.assign(form, { category: '', module: '', description: '', when: '' })
  Object.assign(formTouched, { category: false, module: false, description: false })
  formSubmitted.value = false
  if (prefillModuleKey) form.module = t(prefillModuleKey)
  view.value = 'report'
}

function onSubmitReport() {
  formSubmitted.value = true
  if (errorCount.value > 0) return
  savedData.value = { category: form.category, module: form.module, description: form.description }
  ticketNumber.value = `#TKT-2026-${Math.floor(10000 + Math.random() * 89999)}`
  view.value = 'success'
}

function onSubmitQuickReport() {
  if (!quickReportText.value.trim()) { quickReportInvalid.value = true; return }
  const art = selectedArticle.value
  ticketNumber.value = `#TKT-2026-${Math.floor(10000 + Math.random() * 89999)}`
  savedData.value = {
    category:    art ? t(art.categoryKey) : '',
    module:      art ? t(art.categoryKey) : '',
    description: quickReportText.value
  }
  view.value = 'success'
}

function onRetry()       { view.value = 'report' }

function onBackToHome() {
  view.value = 'home'
  selectedArticleId.value = null
  searchInput.value = ''
  searchQuery.value = ''
  articleFeedback.value = null
  quickReportText.value = ''
  quickReportInvalid.value = false
  formSubmitted.value = false
  Object.assign(form, { category: '', module: '', description: '', when: '' })
}

function onBackToArticle() {
  articleFeedback.value = null
  quickReportText.value = ''
  quickReportInvalid.value = false
  view.value = 'article'
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function categoryBg(categoryId) {
  const map = { inventario: 'icon-bg--orange', chatbot: 'icon-bg--blue', pedidos: 'icon-bg--gray', ventas: 'icon-bg--green' }
  return map[categoryId] ?? 'icon-bg--gray'
}

function highlightQuery(titleKey) {
  const title = t(titleKey)
  const q = searchQuery.value.trim()
  if (!q) return title
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return title.replace(new RegExp(`(${safe})`, 'gi'), '<mark class="hl">$1</mark>')
}
</script>

<template>
  <div class="help-page">

    <!-- ══════════════════════════════════════════════════ HOME ══ -->
    <div v-if="view === 'home'" class="help-inner">
      <h1 class="page-title">{{ t('dashboard-help.title') }}</h1>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <div class="search-bar__input-wrap">
          <svg class="search-bar__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            v-model="searchInput"
            type="search"
            :placeholder="t('dashboard-help.searchPlaceholder')"
            class="search-bar__input"
            @keydown.enter="onSearch"
          />
        </div>
        <button type="button" class="btn-primary" @click="onSearch">{{ t('dashboard-help.searchBtn') }}</button>
      </div>

      <!-- Grid principal -->
      <div class="two-col">
        <!-- Izquierda -->
        <div class="two-col__main">

          <!-- Artículos frecuentes -->
          <section class="card">
            <div class="card__header">
              <h2 class="card__title">{{ t('dashboard-help.frequentArticles') }}</h2>
              <button type="button" class="link-sm">{{ t('dashboard-help.popular') }}</button>
            </div>
            <ul class="article-list" role="list">
              <li v-for="article in frequentArticles" :key="article.id" class="article-item">
                <button type="button" class="article-btn" @click="onOpenArticle(article.id)">
                  <div class="article-btn__info">
                    <p class="article-btn__title">{{ t(article.titleKey) }}</p>
                    <p class="article-btn__meta">
                      {{ t(article.categoryKey) }} · {{ article.readTime }} {{ t('dashboard-help.readTime') }}
                      <span v-if="article.mostConsulted" class="meta-popular"> · {{ t('dashboard-help.mostConsulted') }}</span>
                    </p>
                  </div>
                  <svg class="article-btn__arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            </ul>
          </section>

          <!-- Explorar por categoría -->
          <section>
            <h2 class="section-title">{{ t('dashboard-help.exploreByCategory') }}</h2>
            <div class="cat-grid">
              <button v-for="cat in CATEGORIES" :key="cat.id" type="button" class="cat-card">
                <span :class="['cat-icon', categoryBg(cat.id)]" aria-hidden="true">
                  <svg v-if="cat.id === 'inventario'" class="cat-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                  <svg v-else-if="cat.id === 'chatbot'" class="cat-svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4v13c0 1.1.9 2 2 2h3l3 3 3-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
                  </svg>
                  <svg v-else-if="cat.id === 'pedidos'" class="cat-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <svg v-else class="cat-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
                <div>
                  <p class="cat-card__name">{{ t(cat.nameKey) }}</p>
                  <p class="cat-card__count">{{ cat.articleCount }} {{ t('dashboard-help.articlesLabel') }}</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        <!-- Sidebar derecho -->
        <aside class="two-col__side">
          <div class="cta-card">
            <p class="cta-card__title">{{ t('dashboard-help.ctaTitle') }}</p>
            <p class="cta-card__sub">{{ t('dashboard-help.ctaSub') }}</p>
            <button type="button" class="btn-cta" @click="onGoReport()">
              <svg class="btn-cta__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {{ t('dashboard-help.ctaBtn') }}
            </button>
          </div>

          <div class="card contact-card">
            <h2 class="card__title">{{ t('dashboard-help.contactSupport.title') }}</h2>
            <dl class="contact-dl">
              <div class="contact-dl__row">
                <dt class="contact-dl__label">{{ t('dashboard-help.contactSupport.emailLabel') }}</dt>
                <dd class="contact-dl__value contact-dl__value--orange">{{ t('dashboard-help.contactSupport.email') }}</dd>
              </div>
              <div class="contact-dl__row">
                <dt class="contact-dl__label">WhatsApp</dt>
                <dd class="contact-dl__value">{{ t('dashboard-help.contactSupport.whatsapp') }}</dd>
              </div>
              <div class="contact-dl__row">
                <dt class="contact-dl__label">{{ t('dashboard-help.contactSupport.hoursLabel') }}</dt>
                <dd class="contact-dl__value">{{ t('dashboard-help.contactSupport.hours') }}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════ RESULTS ══ -->
    <div v-else-if="view === 'results'" class="help-inner">
      <h1 class="page-title">{{ t('dashboard-help.title') }}</h1>

      <div class="search-bar">
        <div class="search-bar__input-wrap">
          <svg class="search-bar__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input v-model="searchInput" type="search" :placeholder="t('dashboard-help.searchPlaceholder')" class="search-bar__input" @keydown.enter="onSearch" />
        </div>
        <button type="button" class="btn-primary" @click="onSearch">{{ t('dashboard-help.searchBtn') }}</button>
      </div>

      <p class="results-count" aria-live="polite">
        <strong>{{ searchResults.length }}</strong>
        {{ t('dashboard-help.results.count_other', { count: searchResults.length }) }}
        "<strong class="results-count__q">{{ searchQuery }}</strong>"
      </p>

      <div class="two-col">
        <div class="two-col__main">
          <div class="card">
            <div class="card__header">
              <div>
                <h2 class="card__title">{{ t('dashboard-help.results.resultsTitle') }}</h2>
                <p class="card__sub">{{ searchResults.length }} {{ t('dashboard-help.results.articlesFound') }}</p>
              </div>
              <button type="button" class="link-sm" @click="onClearSearch">{{ t('dashboard-help.results.clearSearch') }}</button>
            </div>

            <!-- Con resultados -->
            <ul v-if="searchResults.length > 0" class="article-list" role="list">
              <li v-for="article in searchResults" :key="article.id" class="article-item">
                <button type="button" class="article-btn article-btn--with-icon" @click="onOpenArticle(article.id)">
                  <span :class="['cat-icon cat-icon--sm', categoryBg(article.categoryId)]" aria-hidden="true">
                    <svg class="cat-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <div class="article-btn__info">
                    <p class="article-btn__title" v-html="highlightQuery(article.titleKey)"></p>
                    <div class="article-btn__meta-row">
                      <span>{{ t(article.categoryKey) }} · {{ article.readTime }} {{ t('dashboard-help.readTime') }}</span>
                      <span v-if="article.mostConsulted" class="meta-popular">· {{ t('dashboard-help.mostConsulted') }}</span>
                    </div>
                  </div>
                  <svg class="article-btn__arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            </ul>

            <!-- Sin resultados -->
            <div v-else class="no-results" role="status">
              <svg class="no-results__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <p class="no-results__title">{{ t('dashboard-help.results.noResults', { q: searchQuery }) }}</p>
              <p class="no-results__sub">{{ t('dashboard-help.results.noResultsSub') }}</p>
              <div class="no-results__suggestions">
                <p class="no-results__suggestions-label">{{ t('dashboard-help.results.suggestions') }}</p>
                <ul>
                  <li>• {{ t('dashboard-help.results.suggestion1') }}</li>
                  <li>• {{ t('dashboard-help.results.suggestion2') }}</li>
                  <li>• {{ t('dashboard-help.results.suggestion3') }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <aside class="two-col__side">
          <div v-if="relatedCategories.length > 0" class="card">
            <h3 class="card__title">{{ t('dashboard-help.results.relatedCategories') }}</h3>
            <ul class="related-cats" role="list">
              <li v-for="cat in relatedCategories" :key="cat.id" class="related-cat">
                <span :class="['cat-icon cat-icon--sm', categoryBg(cat.id)]" aria-hidden="true">
                  <svg class="cat-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <div>
                  <p class="related-cat__name">{{ t(cat.nameKey) }}</p>
                  <p class="related-cat__count">{{ cat.articleCount }} {{ t('dashboard-help.articlesLabel') }}</p>
                </div>
              </li>
            </ul>
          </div>
          <div class="cta-card">
            <p class="cta-card__title">{{ t('dashboard-help.ctaTitle') }}</p>
            <p class="cta-card__sub">{{ t('dashboard-help.ctaSub') }}</p>
            <button type="button" class="btn-cta" @click="onGoReport()">{{ t('dashboard-help.results.report') }}</button>
          </div>
        </aside>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════ ARTICLE ══ -->
    <template v-else-if="view === 'article' && selectedArticle">
      <div class="help-inner">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb" role="list">
            <li>
              <button type="button" class="breadcrumb__back" @click="onBackToHome">
                ← {{ t(selectedArticle.categoryKey) }}
              </button>
            </li>
            <li aria-hidden="true"><span class="breadcrumb__sep">›</span></li>
            <li class="breadcrumb__current">{{ t(selectedArticle.titleKey) }}</li>
          </ol>
        </nav>

        <div class="art-header">
          <div>
            <h1 class="art-title">{{ t(selectedArticle.titleKey) }}</h1>
            <p class="art-meta">{{ t(selectedArticle.categoryKey) }} · {{ selectedArticle.readTime }} {{ t('dashboard-help.readTime') }}</p>
          </div>
          <span class="art-cat-badge">{{ t(selectedArticle.categoryKey) }}</span>
        </div>

        <div class="two-col">
          <div class="two-col__main">
            <!-- Pasos -->
            <article class="card">
              <h2 class="card__title">{{ t('dashboard-help.article.stepsTitle') }}</h2>
              <ol class="steps-list" role="list">
                <li v-for="(stepKey, idx) in selectedArticle.stepKeys" :key="idx" class="step">
                  <span :class="['step__num', idx === selectedArticle.stepKeys.length - 1 ? 'step__num--last' : '']" aria-hidden="true">{{ idx + 1 }}</span>
                  <p class="step__text" v-html="t(stepKey)"></p>
                </li>
              </ol>

              <!-- Feedback -->
              <div class="feedback">
                <template v-if="articleFeedback === null">
                  <p class="feedback__question">{{ t('dashboard-help.article.useful') }}</p>
                  <div class="feedback__btns">
                    <button type="button" class="btn-feedback btn-feedback--yes" @click="onArticleFeedback(true)">
                      👍 {{ t('dashboard-help.article.yes') }}
                    </button>
                    <button type="button" class="btn-feedback btn-feedback--no" @click="onArticleFeedback(false)">
                      👎 {{ t('dashboard-help.article.no') }}
                    </button>
                  </div>
                </template>
                <div v-else-if="articleFeedback === 'useful'" class="feedback__thanks" role="status">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ t('dashboard-help.article.thanks') }}</span>
                </div>
                <template v-else>
                  <div class="not-useful-banner">
                    <span aria-hidden="true">👎</span>
                    <div>
                      <p class="not-useful-banner__title">{{ t('dashboard-help.article.notUsefulBanner') }}</p>
                      <p class="not-useful-banner__sub">{{ t('dashboard-help.article.notUsefulBannerSub') }}</p>
                    </div>
                  </div>
                  <div class="quick-report-box">
                    <p class="quick-report-box__title">{{ t('dashboard-help.article.quickReport.title') }}</p>
                    <p class="quick-report-box__sub">{{ t('dashboard-help.article.quickReport.sub') }}</p>
                    <textarea
                      v-model="quickReportText"
                      rows="3"
                      :placeholder="t('dashboard-help.article.quickReport.placeholder')"
                      :class="['quick-report-textarea', { 'quick-report-textarea--error': quickReportInvalid }]"
                      :aria-invalid="quickReportInvalid ? 'true' : 'false'"
                      @input="quickReportInvalid = false"
                    ></textarea>
                    <p v-if="quickReportInvalid" class="field-error" role="alert">
                      {{ t('dashboard-help.article.quickReport.required') }}
                    </p>
                    <div class="quick-report-btns">
                      <button type="button" class="btn-cta btn-cta--sm" @click="onSubmitQuickReport">
                        {{ t('dashboard-help.article.quickReport.submit') }}
                      </button>
                      <button type="button" class="btn-outline btn-outline--sm" @click="onBackToArticle">
                        {{ t('dashboard-help.article.cancel') }}
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </article>
          </div>

          <aside class="two-col__side">
            <!-- Artículos relacionados -->
            <div v-if="relatedArticles.length > 0" class="card">
              <h2 class="card__title">{{ t('dashboard-help.article.related') }}</h2>
              <ul class="related-list" role="list">
                <li v-for="related in relatedArticles" :key="related.id">
                  <button type="button" class="related-btn" @click="onOpenArticle(related.id)">
                    <span :class="['cat-icon cat-icon--xs', categoryBg(related.categoryId)]" aria-hidden="true">
                      <svg class="cat-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div class="related-btn__info">
                      <p class="related-btn__title">{{ t(related.titleKey) }}</p>
                      <p class="related-btn__meta">{{ t(related.categoryKey) }} · {{ related.readTime }} {{ t('dashboard-help.readTime') }}</p>
                    </div>
                    <svg class="article-btn__arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>

            <div v-if="articleFeedback !== 'not-useful'" class="cta-card">
              <p class="cta-card__title">{{ t('dashboard-help.article.stillProblems') }}</p>
              <p class="cta-card__sub">{{ t('dashboard-help.article.stillProblemsSub') }}</p>
              <button type="button" class="btn-cta" @click="onGoReport(selectedArticle.categoryKey)">
                {{ t('dashboard-help.article.report') }}
              </button>
            </div>
            <div v-else class="card contact-card">
              <h3 class="card__title">{{ t('dashboard-help.contactSupport.title') }}</h3>
              <dl class="contact-dl">
                <div class="contact-dl__row">
                  <dt class="contact-dl__label">Email</dt>
                  <dd class="contact-dl__value contact-dl__value--orange">{{ t('dashboard-help.contactSupport.email') }}</dd>
                </div>
                <div class="contact-dl__row">
                  <dt class="contact-dl__label">WhatsApp</dt>
                  <dd class="contact-dl__value">{{ t('dashboard-help.contactSupport.whatsapp') }}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════  REPORT ══ -->
    <div v-else-if="view === 'report'" class="help-inner">
      <div class="report-header">
        <div>
          <h1 class="page-title">{{ t('dashboard-help.report.title') }}</h1>
          <p class="page-meta">{{ t('dashboard-help.title') }} · {{ t('dashboard-help.report.supportCenter') }}</p>
        </div>
        <span v-if="formSubmitted && errorCount > 0" class="error-badge">
          {{ errorCount }} {{ t('dashboard-help.report.errorsCount_other', { count: errorCount }) }}
        </span>
        <span v-else class="step-label">{{ t('dashboard-help.report.step') }}</span>
      </div>

      <!-- Banner de errores -->
      <div v-if="formSubmitted && errorCount > 0" class="error-banner" role="alert" aria-live="assertive">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div>
          <p class="error-banner__title">{{ t('dashboard-help.report.errorBannerTitle') }}</p>
          <p class="error-banner__sub">{{ t('dashboard-help.report.errorBannerSub') }}</p>
        </div>
      </div>

      <div class="two-col">
        <div class="two-col__main">
          <div class="card">
            <h2 class="card__title">{{ t('dashboard-help.report.formTitle') }}</h2>
            <p class="card__sub">{{ t('dashboard-help.report.formSubtitle') }}</p>

            <form class="report-form" novalidate @submit.prevent="onSubmitReport">
              <div class="form-row">
                <!-- Categoría -->
                <div class="form-field">
                  <label for="rep-category" class="form-label">
                    {{ t('dashboard-help.report.category') }}
                    <span class="form-required" aria-hidden="true"> *</span>
                  </label>
                  <select
                    id="rep-category"
                    v-model="form.category"
                    :class="['form-select', { 'form-select--error': isCategoryError }]"
                    :aria-invalid="isCategoryError ? 'true' : 'false'"
                    @change="formTouched.category = true"
                  >
                    <option v-for="(cat, idx) in problemCategories" :key="idx" :value="idx === 0 ? '' : cat">{{ cat }}</option>
                  </select>
                  <p v-if="isCategoryError" class="field-error" role="alert">
                    ⚠ {{ t('dashboard-help.report.categoryRequired') }}
                  </p>
                </div>

                <!-- Módulo -->
                <div class="form-field">
                  <label for="rep-module" class="form-label">
                    {{ t('dashboard-help.report.module') }}
                    <span class="form-required" aria-hidden="true"> *</span>
                  </label>
                  <select
                    id="rep-module"
                    v-model="form.module"
                    :class="['form-select', { 'form-select--error': isModuleError }]"
                    :aria-invalid="isModuleError ? 'true' : 'false'"
                    @change="formTouched.module = true"
                  >
                    <option value="">{{ t('dashboard-help.report.moduleDefault') }}</option>
                    <option v-for="mod in modules" :key="mod" :value="mod">{{ mod }}</option>
                  </select>
                  <p v-if="isModuleError" class="field-error" role="alert">
                    {{ t('dashboard-help.report.moduleRequired') }}
                  </p>
                </div>
              </div>

              <!-- Descripción -->
              <div class="form-field">
                <label for="rep-description" class="form-label">
                  {{ t('dashboard-help.report.description') }}
                  <span class="form-required" aria-hidden="true"> *</span>
                </label>
                <textarea
                  id="rep-description"
                  v-model="form.description"
                  rows="5"
                  :placeholder="t('dashboard-help.report.descriptionPlaceholder')"
                  :class="['form-textarea', { 'form-textarea--error': isDescriptionError }]"
                  :aria-invalid="isDescriptionError ? 'true' : 'false'"
                  @input="formTouched.description = true"
                ></textarea>
                <p v-if="isDescriptionError" class="field-error" role="alert">
                  ⚠ {{ t('dashboard-help.report.descriptionRequired') }}
                </p>
              </div>

              <!-- Cuándo (opcional) -->
              <div class="form-field">
                <label for="rep-when" class="form-label">
                  {{ t('dashboard-help.report.when') }}
                  <span class="form-optional"> {{ t('dashboard-help.report.whenOptional') }}</span>
                </label>
                <input
                  id="rep-when"
                  v-model="form.when"
                  type="text"
                  :placeholder="t('dashboard-help.report.whenPlaceholder')"
                  class="form-input"
                />
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary btn-primary--lg">{{ t('dashboard-help.report.submit') }}</button>
                <button type="button" class="btn-outline" @click="onBackToHome">{{ t('dashboard-help.backBtn') }}</button>
              </div>
            </form>
          </div>
        </div>

        <aside class="two-col__side">
          <template v-if="formSubmitted && errorCount > 0">
            <div class="card card--error">
              <p class="card-error__title">⚠ {{ t('dashboard-help.report.errorFieldsTitle') }}</p>
              <ul class="error-list">
                <li v-for="(err, idx) in formErrors" :key="idx">• {{ err }}</li>
              </ul>
            </div>
            <div class="card">
              <p class="card__title">{{ t('dashboard-help.report.urgentTitle') }}</p>
              <p class="card__sub">{{ t('dashboard-help.report.urgentSub') }}</p>
              <dl class="contact-dl" style="margin-top: 0.75rem">
                <div class="contact-dl__row">
                  <dt class="contact-dl__label">WhatsApp</dt>
                  <dd class="contact-dl__value contact-dl__value--orange">{{ t('dashboard-help.contactSupport.whatsapp') }}</dd>
                </div>
                <div class="contact-dl__row">
                  <dt class="contact-dl__label">Email</dt>
                  <dd class="contact-dl__value contact-dl__value--orange">{{ t('dashboard-help.contactSupport.email') }}</dd>
                </div>
              </dl>
            </div>
          </template>
          <template v-else>
            <div class="before-card">
              <p class="before-card__title">💡 {{ t('dashboard-help.report.beforeTitle') }}</p>
              <ul class="before-list">
                <li><span class="check">✓</span> {{ t('dashboard-help.report.before1') }}</li>
                <li><span class="check">✓</span> {{ t('dashboard-help.report.before2') }}</li>
                <li><span class="check">✓</span> {{ t('dashboard-help.report.before3') }}</li>
              </ul>
            </div>
            <div class="card">
              <h3 class="card__title">{{ t('dashboard-help.report.responseTimeTitle') }}</h3>
              <dl class="contact-dl" style="margin-top: 0.75rem">
                <div class="contact-dl__row">
                  <dt class="contact-dl__label">{{ t('dashboard-help.report.priorityNormal') }}</dt>
                  <dd class="contact-dl__value">{{ t('dashboard-help.report.priorityNormalVal') }}</dd>
                </div>
                <div class="contact-dl__row">
                  <dt class="contact-dl__label">{{ t('dashboard-help.report.priorityHigh') }}</dt>
                  <dd class="contact-dl__value contact-dl__value--orange">{{ t('dashboard-help.report.priorityHighVal') }}</dd>
                </div>
                <div class="contact-dl__row">
                  <dt class="contact-dl__label">{{ t('dashboard-help.report.hoursLabel') }}</dt>
                  <dd class="contact-dl__value">{{ t('dashboard-help.report.hoursVal') }}</dd>
                </div>
              </dl>
            </div>
          </template>
        </aside>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════ SUCCESS ══ -->
    <div v-else-if="view === 'success'" class="help-inner" role="main" aria-live="polite">
      <div>
        <h1 class="page-title">{{ t('dashboard-help.success.pageTitle') }}</h1>
        <p class="page-meta">{{ t('dashboard-help.title') }} · {{ t('dashboard-help.report.supportCenter') }}</p>
      </div>

      <div class="two-col">
        <div class="two-col__main">

          <div class="success-card">
            <div class="success-card__icon" aria-hidden="true">✅</div>
            <h2 class="success-card__title">{{ t('dashboard-help.success.title') }}</h2>
            <p class="success-card__sub">{{ t('dashboard-help.success.subtitle') }}</p>
            <button type="button" class="ticket-btn">
              {{ t('dashboard-help.success.ticketLabel') }} {{ ticketNumber }}
            </button>
            <p class="success-card__hint">{{ t('dashboard-help.success.ticketHint') }}</p>
          </div>

          <div v-if="savedData" class="card">
            <h3 class="card__title">{{ t('dashboard-help.success.summaryTitle') }}</h3>
            <dl class="summary-dl">
              <div class="summary-dl__row"><dt>{{ t('dashboard-help.success.ticketLabel') }}</dt><dd class="dd--orange">{{ ticketNumber }}</dd></div>
              <div class="summary-dl__row"><dt>{{ t('dashboard-help.success.categoryLabel') }}</dt><dd>{{ savedData.category }}</dd></div>
              <div class="summary-dl__row"><dt>{{ t('dashboard-help.success.moduleLabel') }}</dt><dd>{{ savedData.module }}</dd></div>
              <div class="summary-dl__row"><dt>{{ t('dashboard-help.success.dateLabel') }}</dt><dd>{{ nowString }}</dd></div>
              <div class="summary-dl__row"><dt>{{ t('dashboard-help.success.statusLabel') }}</dt><dd><span class="status-pill">{{ t('dashboard-help.success.statusValue') }}</span></dd></div>
              <div class="summary-dl__row"><dt>{{ t('dashboard-help.success.estimatedLabel') }}</dt><dd class="dd--green">{{ t('dashboard-help.success.estimatedValue') }}</dd></div>
            </dl>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-primary btn-primary--lg" @click="onBackToHome">← {{ t('dashboard-help.success.backToHome') }}</button>
            <button type="button" class="btn-outline">{{ t('dashboard-help.success.viewReports') }} →</button>
          </div>
        </div>

        <aside class="two-col__side">
          <div class="info-card info-card--blue">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="info-card__title">{{ t('dashboard-help.success.emailNotice') }}</p>
              <p class="info-card__sub">{{ t('dashboard-help.success.emailNoticeSub') }}</p>
            </div>
          </div>

          <div class="card">
            <h3 class="card__title">{{ t('dashboard-help.success.nextTitle') }}</h3>
            <ol class="next-steps">
              <li v-for="step in [1, 2, 3]" :key="step" class="next-step">
                <span class="next-step__num" aria-hidden="true">{{ step }}</span>
                <p class="next-step__text">{{ t(`dashboard-help.success.step${step}`) }}</p>
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════ ERROR ══ -->
    <div v-else-if="view === 'error'" class="help-inner" role="main" aria-live="assertive">
      <div>
        <h1 class="page-title">{{ t('dashboard-help.error.pageTitle') }}</h1>
        <p class="page-meta">{{ t('dashboard-help.title') }} · {{ t('dashboard-help.report.supportCenter') }}</p>
      </div>

      <div class="two-col">
        <div class="two-col__main">
          <div class="error-card">
            <div class="error-card__icon-wrap" aria-hidden="true">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 class="error-card__title">{{ t('dashboard-help.error.title') }}</h2>
            <p class="error-card__sub">{{ t('dashboard-help.error.subtitle') }}</p>
          </div>

          <div class="warn-banner">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p class="warn-banner__title">{{ t('dashboard-help.error.noTicket') }}</p>
              <p class="warn-banner__sub">{{ t('dashboard-help.error.noTicketSub') }}</p>
            </div>
          </div>

          <div v-if="savedData" class="card">
            <h3 class="card__title">{{ t('dashboard-help.error.dataSaved') }}</h3>
            <dl class="summary-dl">
              <div class="summary-dl__row"><dt>{{ t('dashboard-help.success.categoryLabel') }}</dt><dd>{{ savedData.category }}</dd></div>
              <div class="summary-dl__row"><dt>{{ t('dashboard-help.success.moduleLabel') }}</dt><dd>{{ savedData.module }}</dd></div>
              <div class="summary-dl__row summary-dl__row--block"><dt>{{ t('dashboard-help.error.descriptionLabel') }}</dt><dd>{{ savedData.description }}</dd></div>
            </dl>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-primary btn-primary--lg" @click="onRetry">↺ {{ t('dashboard-help.error.retry') }}</button>
            <button type="button" class="btn-outline" @click="onBackToHome">← {{ t('dashboard-help.error.backToHome') }}</button>
          </div>
        </div>

        <aside class="two-col__side">
          <div class="cta-card">
            <p class="cta-card__title">{{ t('dashboard-help.error.contactTitle') }}</p>
            <p class="cta-card__sub">{{ t('dashboard-help.error.contactSub') }}</p>
            <dl class="contact-dl" style="margin-top: 0.75rem">
              <div class="contact-dl__row">
                <dt class="contact-dl__label">WhatsApp</dt>
                <dd class="contact-dl__value" style="color:#1f2937; font-weight:600">{{ t('dashboard-help.contactSupport.whatsapp') }}</dd>
              </div>
              <div class="contact-dl__row">
                <dt class="contact-dl__label">Email</dt>
                <dd class="contact-dl__value contact-dl__value--orange">{{ t('dashboard-help.contactSupport.email') }}</dd>
              </div>
            </dl>
          </div>

          <div class="card">
            <h3 class="card__title">{{ t('dashboard-help.error.causesTitle') }}</h3>
            <ul class="causes-list">
              <li>• {{ t('dashboard-help.error.cause1') }}</li>
              <li>• {{ t('dashboard-help.error.cause2') }}</li>
              <li>• {{ t('dashboard-help.error.cause3') }}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>

  </div>
</template>

<style scoped>
.help-page  { height: 100%; overflow-y: auto; background: #f9fafb; padding: clamp(1rem, 2.5vw, 2rem); }
.help-inner { width: 100%; display: flex; flex-direction: column; gap: 1.25rem; }

.page-title { font-size: 1.5rem; font-weight: 700; color: #111827; }
.page-meta  { margin-top: 0.25rem; font-size: 0.75rem; color: #9ca3af; }
.section-title { margin-bottom: 0.75rem; font-size: 0.875rem; font-weight: 600; color: #374151; }

/* ── Search bar ──────────────────────────────────────────────────── */
.search-bar            { display: flex; gap: 0.5rem; }
.search-bar__input-wrap { position: relative; flex: 1; }
.search-bar__icon      { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 1rem; height: 1rem; color: #9ca3af; }
.search-bar__input     { width: 100%; border-radius: 0.75rem; border: 1px solid #e5e7eb; background: #fff; padding: 0.75rem 1rem 0.75rem 2.75rem; font-size: 0.875rem; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.search-bar__input:focus { border-color: #fb923c; box-shadow: 0 0 0 2px rgb(251 146 60 / 0.15); }

/* ── Grid layout ─────────────────────────────────────────────────── */
.two-col       { display: grid; grid-template-columns: 1fr clamp(16rem, 22vw, 22rem); gap: 1.25rem; align-items: start; }
.two-col__main { display: flex; flex-direction: column; gap: 1.25rem; }
.two-col__side { display: flex; flex-direction: column; gap: 1rem; }

/* ── Buttons ─────────────────────────────────────────────────────── */
.btn-primary {
  border-radius: 0.75rem; background: #f97316; padding: 0.75rem 1.5rem;
  font-size: 0.875rem; font-weight: 600; color: #fff; border: none; cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: #ea6c0a; }
.btn-primary--lg  { border-radius: 9999px; padding: 0.625rem 1.25rem; }

.btn-outline {
  border-radius: 9999px; border: 1px solid #d1d5db; background: #fff;
  padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 600; color: #6b7280; cursor: pointer; transition: background 0.2s;
}
.btn-outline:hover { background: #f9fafb; }
.btn-outline--sm  { padding: 0.375rem 1rem; font-size: 0.75rem; }

.link-sm { font-size: 0.75rem; color: #f97316; background: none; border: none; cursor: pointer; }
.link-sm:hover { text-decoration: underline; }

/* ── Card ────────────────────────────────────────────────────────── */
.card { border-radius: 1rem; background: #fff; padding: 1.25rem; box-shadow: 0 1px 3px rgb(0 0 0 / 0.07); }
.card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.card__title  { font-size: 0.875rem; font-weight: 600; color: #1f2937; }
.card__sub    { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
.card--error  { border: 1px solid #fca5a5; background: #fef2f2; }
.card-error__title { font-size: 0.875rem; font-weight: 600; color: #dc2626; }
.error-list   { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: #dc2626; list-style: none; padding: 0; }

.contact-card { margin-top: 0; }
.contact-dl   { display: flex; flex-direction: column; gap: 0.75rem; }
.contact-dl__row  { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
.contact-dl__label { font-size: 0.875rem; color: #9ca3af; }
.contact-dl__value { font-size: 0.875rem; font-weight: 500; color: #1f2937; text-align: right; }
.contact-dl__value--orange { color: #f97316; }

/* ── CTA card ────────────────────────────────────────────────────── */
.cta-card { border-radius: 1rem; border: 1px solid #fed7aa; background: #fff7ed; padding: 1.25rem; }
.cta-card__title { font-size: 0.875rem; font-weight: 600; color: #9a3412; }
.cta-card__sub   { margin-top: 0.25rem; font-size: 0.75rem; color: #c2410c; }
.btn-cta {
  margin-top: 1rem; display: inline-flex; align-items: center; gap: 0.375rem;
  border-radius: 9999px; background: #f97316; padding: 0.5rem 1rem;
  font-size: 0.75rem; font-weight: 600; color: #fff; border: none; cursor: pointer; transition: background 0.2s;
}
.btn-cta:hover { background: #ea6c0a; }
.btn-cta__icon { width: 0.875rem; height: 0.875rem; }
.btn-cta--sm   { margin-top: 0; }

/* ── Category icons ──────────────────────────────────────────────── */
.cat-icon     { display: flex; align-items: center; justify-content: center; width: 2.25rem; height: 2.25rem; border-radius: 0.75rem; flex-shrink: 0; }
.cat-icon--sm { width: 2rem; height: 2rem; border-radius: 0.5rem; }
.cat-icon--xs { width: 1.75rem; height: 1.75rem; border-radius: 0.5rem; }
.icon-bg--orange { background: #fff7ed; }
.icon-bg--blue   { background: #eff6ff; }
.icon-bg--gray   { background: #f3f4f6; }
.icon-bg--green  { background: #f0fdf4; }
.cat-svg { width: 1rem; height: 1rem; color: #6b7280; }
.icon-bg--orange .cat-svg { color: #ea580c; }
.icon-bg--blue   .cat-svg { color: #3b82f6; }
.icon-bg--green  .cat-svg { color: #22c55e; }

/* ── Category grid ───────────────────────────────────────────────── */
.cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
.cat-card {
  display: flex; align-items: center; gap: 0.75rem;
  border-radius: 0.75rem; border: 1px solid #f3f4f6; background: #fff;
  padding: 0.75rem 1rem; text-align: left; cursor: pointer;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05); transition: box-shadow 0.2s;
}
.cat-card:hover { box-shadow: 0 4px 6px rgb(0 0 0 / 0.07); }
.cat-card__name  { font-size: 0.75rem; font-weight: 600; color: #1f2937; }
.cat-card__count { font-size: 0.625rem; color: #9ca3af; }

/* ── Article list ────────────────────────────────────────────────── */
.article-list { display: flex; flex-direction: column; list-style: none; padding: 0; margin: 0; }
.article-item { border-top: 1px solid #f9fafb; }
.article-item:first-child { border-top: none; }
.article-btn {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; padding: 0.75rem 0; text-align: left; background: none; border: none;
  cursor: pointer; color: #111827; transition: color 0.15s;
}
.article-btn:hover { color: #f97316; }
.article-btn--with-icon { gap: 0.75rem; }
.article-btn__info  { flex: 1; min-width: 0; }
.article-btn__title { font-size: 0.875rem; color: inherit; }
.article-btn__meta  { margin-top: 0.25rem; font-size: 0.75rem; color: #9ca3af; }
.article-btn__meta-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
.article-btn__arrow { width: 1rem; height: 1rem; color: #d1d5db; flex-shrink: 0; }
.meta-popular { color: #fb923c; }

/* ── Results ─────────────────────────────────────────────────────── */
.results-count { font-size: 0.875rem; color: #6b7280; }
.results-count__q { color: #f97316; }
.related-cats { display: flex; flex-direction: column; gap: 0.5rem; list-style: none; padding: 0; margin: 0.75rem 0 0; }
.related-cat { display: flex; align-items: center; gap: 0.75rem; border-radius: 0.5rem; border: 1px solid #f3f4f6; padding: 0.625rem 0.75rem; }
.related-cat__name  { font-size: 0.75rem; font-weight: 500; color: #1f2937; }
.related-cat__count { font-size: 0.625rem; color: #9ca3af; }

/* ── No results ──────────────────────────────────────────────────── */
.no-results { display: flex; flex-direction: column; align-items: center; padding: 2rem 0; text-align: center; }
.no-results__icon  { width: 3rem; height: 3rem; color: #d1d5db; }
.no-results__title { margin-top: 1rem; font-weight: 600; color: #374151; }
.no-results__sub   { margin-top: 0.25rem; font-size: 0.875rem; color: #9ca3af; }
.no-results__suggestions { margin-top: 1rem; border-top: 1px solid #f3f4f6; padding-top: 1rem; width: 100%; text-align: left; }
.no-results__suggestions-label { font-size: 0.75rem; font-weight: 500; color: #6b7280; margin-bottom: 0.5rem; }
.no-results__suggestions ul { font-size: 0.75rem; color: #9ca3af; list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }

/* ── Article view ────────────────────────────────────────────────── */
.breadcrumb { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; list-style: none; padding: 0; margin: 0; }
.breadcrumb__back    { background: none; border: none; color: #f97316; cursor: pointer; }
.breadcrumb__back:hover { text-decoration: underline; }
.breadcrumb__sep     { color: #d1d5db; }
.breadcrumb__current { color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.art-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.art-title  { font-size: 1.25rem; font-weight: 700; color: #111827; }
.art-meta   { margin-top: 0.25rem; font-size: 0.75rem; color: #9ca3af; }
.art-cat-badge { flex-shrink: 0; border-radius: 9999px; border: 1px solid #fed7aa; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 500; color: #c2410c; }

/* ── Steps ───────────────────────────────────────────────────────── */
.steps-list { display: flex; flex-direction: column; gap: 1.25rem; list-style: none; padding: 0; margin: 0.75rem 0 0; }
.step { display: flex; gap: 1rem; align-items: flex-start; }
.step__num { display: flex; align-items: center; justify-content: center; width: 1.75rem; height: 1.75rem; border-radius: 9999px; background: #f97316; font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.step__num--last { background: #22c55e; }
.step__text { font-size: 0.875rem; color: #374151; line-height: 1.6; padding-top: 0.125rem; }

/* ── Feedback ────────────────────────────────────────────────────── */
.feedback { margin-top: 1.5rem; border-top: 1px solid #f3f4f6; padding-top: 1.25rem; }
.feedback__question { font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.75rem; }
.feedback__btns { display: flex; gap: 0.75rem; }
.btn-feedback { display: flex; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.375rem 1rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: 1px solid; transition: background 0.2s; }
.btn-feedback--yes { border-color: #e5e7eb; background: #fff7ed; color: #ea580c; }
.btn-feedback--yes:hover { background: #ffedd5; }
.btn-feedback--no  { border-color: #fed7aa; background: #fff; color: #f97316; }
.btn-feedback--no:hover { background: #fff7ed; }
.feedback__thanks { display: flex; align-items: center; gap: 0.5rem; color: #15803d; font-size: 0.875rem; font-weight: 500; }
.feedback__thanks svg { width: 1.25rem; height: 1.25rem; }

/* ── Not useful / quick report ───────────────────────────────────── */
.not-useful-banner { display: flex; align-items: flex-start; gap: 0.5rem; border-radius: 0.75rem; border: 1px solid #fde68a; background: #fefce8; padding: 0.75rem 1rem; }
.not-useful-banner__title { font-size: 0.875rem; font-weight: 600; color: #854d0e; }
.not-useful-banner__sub   { font-size: 0.75rem; color: #a16207; margin-top: 0.25rem; }
.quick-report-box { margin-top: 1rem; border-radius: 0.75rem; border: 1px solid #fed7aa; background: #fff7ed; padding: 1rem; }
.quick-report-box__title { font-size: 0.875rem; font-weight: 600; color: #1f2937; }
.quick-report-box__sub   { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; }
.quick-report-textarea { margin-top: 0.75rem; width: 100%; resize: none; border-radius: 0.5rem; border: 1px solid #e5e7eb; background: #fff; padding: 0.625rem 0.75rem; font-size: 0.875rem; outline: none; }
.quick-report-textarea:focus { box-shadow: 0 0 0 2px rgb(251 146 60 / 0.2); }
.quick-report-textarea--error { border-color: #fca5a5; }
.quick-report-btns { margin-top: 0.75rem; display: flex; gap: 0.5rem; }

/* ── Related articles ────────────────────────────────────────────── */
.related-list { display: flex; flex-direction: column; gap: 0.5rem; list-style: none; padding: 0; margin: 0.75rem 0 0; }
.related-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; border-radius: 0.5rem; border: 1px solid #f3f4f6; padding: 0.625rem 0.75rem; text-align: left; background: #fff; cursor: pointer; transition: background 0.15s; }
.related-btn:hover { background: #f9fafb; }
.related-btn__info  { flex: 1; min-width: 0; }
.related-btn__title { font-size: 0.75rem; font-weight: 500; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.related-btn__meta  { font-size: 0.625rem; color: #9ca3af; margin-top: 0.125rem; }

/* ── Report form ─────────────────────────────────────────────────── */
.report-header { display: flex; align-items: flex-start; justify-content: space-between; }
.step-label  { font-size: 0.75rem; color: #9ca3af; }
.error-badge { border-radius: 9999px; background: #fee2e2; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; color: #dc2626; }
.error-banner { display: flex; align-items: flex-start; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid #fca5a5; background: #fef2f2; padding: 0.75rem 1rem; }
.error-banner svg { width: 1rem; height: 1rem; color: #ef4444; flex-shrink: 0; margin-top: 0.125rem; }
.error-banner__title { font-size: 0.875rem; font-weight: 600; color: #b91c1c; }
.error-banner__sub   { font-size: 0.75rem; color: #dc2626; }
.report-form { margin-top: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.form-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-field  { display: flex; flex-direction: column; gap: 0.375rem; }
.form-label  { font-size: 0.875rem; font-weight: 500; color: #374151; }
.form-required { color: #ef4444; }
.form-optional { font-size: 0.75rem; color: #9ca3af; }
.form-select, .form-textarea, .form-input {
  border-radius: 0.5rem; border: 1px solid #e5e7eb; background: #fff;
  padding: 0.625rem 0.75rem; font-size: 0.875rem; outline: none; transition: box-shadow 0.2s;
}
.form-select:focus, .form-textarea:focus, .form-input:focus { box-shadow: 0 0 0 2px rgb(251 146 60 / 0.2); }
.form-select--error, .form-textarea--error { border-color: #f87171; background: #fef2f2; }
.form-textarea { resize: none; width: 100%; }
.form-input    { width: 100%; }
.field-error   { font-size: 0.75rem; color: #c2410c; }
.form-actions  { display: flex; gap: 0.75rem; align-items: center; padding-top: 0.25rem; }

/* ── Before reporting card ───────────────────────────────────────── */
.before-card { border-radius: 1rem; border: 1px solid #fde68a; background: #fefce8; padding: 1.25rem; }
.before-card__title { font-size: 0.875rem; font-weight: 600; color: #854d0e; }
.before-list { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; list-style: none; padding: 0; font-size: 0.75rem; color: #a16207; }
.before-list li { display: flex; align-items: flex-start; gap: 0.5rem; }
.check { color: #22c55e; flex-shrink: 0; }

/* ── Success ─────────────────────────────────────────────────────── */
.success-card { border-radius: 1rem; background: #fff7ed; padding: 2.5rem 2rem; text-align: center; }
.success-card__icon  { font-size: 3rem; }
.success-card__title { margin-top: 1rem; font-size: 1.125rem; font-weight: 700; color: #111827; }
.success-card__sub   { margin-top: 0.25rem; font-size: 0.875rem; color: #6b7280; }
.success-card__hint  { margin-top: 0.5rem; font-size: 0.75rem; color: #9ca3af; }
.ticket-btn { margin-top: 1.25rem; border-radius: 9999px; background: #f97316; padding: 0.5rem 1.5rem; font-size: 0.875rem; font-weight: 700; color: #fff; border: none; cursor: default; }
.summary-dl { display: flex; flex-direction: column; margin-top: 1rem; }
.summary-dl__row { display: flex; justify-content: space-between; padding: 0.625rem 0; border-bottom: 1px solid #f9fafb; font-size: 0.875rem; }
.summary-dl__row:last-child { border-bottom: none; }
.summary-dl__row--block { flex-direction: column; gap: 0.25rem; }
.summary-dl__row dt { color: #6b7280; }
.summary-dl__row dd { font-weight: 500; color: #1f2937; }
.dd--orange { color: #f97316; font-weight: 600; }
.dd--green  { color: #16a34a; font-weight: 600; }
.status-pill { border-radius: 9999px; background: #fff7ed; padding: 0.125rem 0.5rem; font-size: 0.75rem; font-weight: 600; color: #ea580c; }
.info-card { display: flex; align-items: flex-start; gap: 0.5rem; border-radius: 1rem; padding: 1rem; }
.info-card--blue { border: 1px solid #bfdbfe; background: #eff6ff; }
.info-card svg { width: 1rem; height: 1rem; flex-shrink: 0; color: #3b82f6; margin-top: 0.125rem; }
.info-card__title { font-size: 0.75rem; font-weight: 600; color: #1e40af; }
.info-card__sub   { font-size: 0.75rem; color: #3b82f6; margin-top: 0.25rem; }
.next-steps { display: flex; flex-direction: column; gap: 0.75rem; list-style: none; padding: 0; margin-top: 1rem; }
.next-step { display: flex; align-items: flex-start; gap: 0.75rem; }
.next-step__num  { display: flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; border-radius: 9999px; background: #f97316; font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.next-step__text { font-size: 0.75rem; color: #4b5563; padding-top: 0.25rem; }

/* ── Error view ──────────────────────────────────────────────────── */
.error-card { border-radius: 1rem; background: #fff; padding: 2.5rem 2rem; text-align: center; box-shadow: 0 1px 3px rgb(0 0 0 / 0.07); }
.error-card__icon-wrap { display: flex; align-items: center; justify-content: center; width: 4rem; height: 4rem; border-radius: 9999px; background: #fee2e2; margin: 0 auto; }
.error-card__icon-wrap svg { width: 2rem; height: 2rem; color: #ef4444; }
.error-card__title { margin-top: 1rem; font-size: 1.125rem; font-weight: 700; color: #dc2626; }
.error-card__sub   { margin-top: 0.25rem; font-size: 0.875rem; color: #6b7280; }
.warn-banner { display: flex; align-items: flex-start; gap: 0.75rem; border-radius: 0.75rem; border: 1px solid #fde68a; background: #fefce8; padding: 0.75rem 1rem; }
.warn-banner svg { width: 1rem; height: 1rem; color: #eab308; flex-shrink: 0; margin-top: 0.125rem; }
.warn-banner__title { font-size: 0.875rem; font-weight: 600; color: #854d0e; }
.warn-banner__sub   { font-size: 0.75rem; color: #a16207; margin-top: 0.25rem; }
.causes-list { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.75rem; color: #4b5563; list-style: none; padding: 0; }

/* ── Highlight ───────────────────────────────────────────────────── */
:deep(.hl) { background: transparent; color: #f97316; font-weight: 600; font-style: normal; }

/* ── Responsive ──────────────────────────────────────────────────── */
@media (min-width: 1440px) {
  .page-title   { font-size: clamp(1.5rem, 2vw, 2rem); }
  .card__title  { font-size: clamp(0.875rem, 1vw, 1.125rem); }
  .cat-grid     { grid-template-columns: repeat(4, 1fr); }
  .article-btn__title { font-size: clamp(0.875rem, 1vw, 1rem); }
}
@media (max-width: 1024px) {
  .two-col { grid-template-columns: 1fr; }
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .cat-grid { grid-template-columns: 1fr 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .search-bar { flex-direction: column; }
  .btn-primary { width: 100%; }
  .art-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
}
@media (max-width: 480px) {
  .cat-grid { grid-template-columns: 1fr; }
  .feedback__btns { flex-direction: column; }
}
</style>
