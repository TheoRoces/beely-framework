/* ========================================================================== */
/*   CONFIG SITE — Configuration client unique                                */
/*   Seul fichier a modifier pour configurer le site.                          */
/* ========================================================================== */


/* ---------- SITE ---------- */

window.SITE_CONFIG = {
  /* --- Identité du site --- */
  name: 'Theo Roces',
  favicon: ''
};

/* ---------- COOKIES & ANALYTICS ---------- */

window.COOKIES_CONFIG = {
  /* --- Plateformes analytics --- */
  ga4: '',
  gtm: '',
  clarity: '',
  fbPixel: '',
  hotjar: '',
  linkedin: '',
  tiktok: '',

  /* --- Catégories de consentement --- */
  categories: {
    functional: {
      label: 'Fonctionnel',
      description: 'Propagation des paramètres UTM entre les pages (URL uniquement, aucun stockage).',
      services: [],
      required: true
    },
    analytics: {
      label: 'Analytique',
      description: 'Mesure d\'audience et analyse du trafic.',
      services: ['ga4', 'gtm', 'clarity', 'hotjar']
    },
    marketing: {
      label: 'Marketing',
      description: 'Publicité ciblée et suivi des conversions.',
      services: ['fbPixel', 'linkedin', 'tiktok']
    }
  },

  /* --- Bannière de consentement --- */
  banner: {
    title: 'Ce site utilise des cookies',
    text: 'Nous utilisons des cookies pour analyser le trafic et am\\\\u00e9liorer votre exp\\\\u00e9rience.',
    acceptText: 'Tout accepter',
    rejectText: 'Tout refuser',
    settingsText: 'Personnaliser',
    saveText: 'Enregistrer mes choix',
    cookieName: 'cookie_consent',
    cookieDuration: 395,
    consentVersion: '1.0',
    privacyUrl: '/confidentialite.html',
    privacyText: 'Politique de confidentialit\\\\u00e9'
  },

  consentEndpoint: '/api/consent.php'
};

/* ---------- BLOG ---------- */

window.BLOG_CONFIG = {
  baserow: {
    url: 'https://api.baserow.io',
    token: '',
    tableId: '866150',
  },
  proxyUrl: '/api/baserow.php',

  /* --- Options d'affichage --- */
  perPage: 12,
  dateFormat: 'fr-FR',
  defaultImage: '',
  articlePage: 'blog/article',
  blogPage: 'blog',
};

/* ---------- MENTIONS LEGALES ---------- */

window.LEGAL_CONFIG = {
  /* --- Editeur du site --- */
  company: '',
  legalForm: '',
  siret: '',
  registration: '',
  representative: '',
  address: '',
  phone: '',
  email: '',
  website: '',

  /* --- Hebergement --- */
  hosting: {
    name: '',
    address: '',
    url: '',
    contact: ''
  },

  /* --- Developpeur (optionnel, masque si name est vide) --- */
  developer: {
    name: '',
    url: '',
    address: ''
  }
};
