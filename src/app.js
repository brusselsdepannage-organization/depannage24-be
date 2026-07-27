/* ==========================================================================
   DÉPANNAGE24.BE - INTERACTIVE APP LOGIC & ROUTER
   Handles language switching, dynamic SEO meta updates, FAQ accordions,
   WhatsApp location message generator, and JSON-LD schema injection.
   ========================================================================== */

import { translations } from './i18n/translations.js';

let currentLang = 'fr';
const PHONE_NUMBER = '+32491747340';
const WHATSAPP_NUMBER = '32491747340';

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initFAQAccordion();
  initQuickForm();
  initSchemaOrg();
  updatePageContent();
});

function initLanguageSwitcher() {
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.getAttribute('data-lang');
      if (lang && translations[lang]) {
        currentLang = lang;
        langBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`).forEach(b => b.classList.add('active'));
        updatePageContent();
      }
    });
  });
}

function updatePageContent() {
  const t = translations[currentLang];
  if (!t) return;

  document.documentElement.lang = currentLang === 'fr' ? 'fr-BE' : (currentLang === 'nl' ? 'nl-BE' : 'en');
  document.title = t.meta.title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', t.meta.description);

  // Update elements with data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = getNestedValue(t, key);
    if (value) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = value;
      } else {
        el.innerHTML = value;
      }
    }
  });

  // Update WhatsApp links
  const whatsappBtns = document.querySelectorAll('.btn-whatsapp-dynamic');
  whatsappBtns.forEach(btn => {
    const defaultMsg = encodeURIComponent(
      currentLang === 'fr' 
        ? "Bonjour, j’ai besoin d’un dépannage. Voici ma localisation :"
        : currentLang === 'nl'
        ? "Hallo, ik heb pechverhelping nodig. Hier is mijn locatie:"
        : "Hello, I need roadside assistance. Here is my location:"
    );
    btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMsg}`;
  });
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
}

function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-question');
    if (q) {
      q.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

function initQuickForm() {
  const form = document.getElementById('emergencyForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('formName')?.value || '';
    const phone = document.getElementById('formPhone')?.value || '';
    const location = document.getElementById('formLocation')?.value || '';
    const vehicle = document.getElementById('formVehicle')?.value || '';
    const problem = document.getElementById('formProblem')?.value || '';

    const text = encodeURIComponent(
      `URGENCE DÉPANNAGE24:\n` +
      `- Nom: ${name}\n` +
      `- Tel: ${phone}\n` +
      `- Localisation: ${location}\n` +
      `- Véhicule: ${vehicle}\n` +
      `- Problème: ${problem}`
    );

    // Direct user to WhatsApp with filled message
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  });
}

function initSchemaOrg() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutomotiveBusiness",
        "@id": "https://depannage24.be/#organization",
        "name": "Dépannage24.be",
        "url": "https://depannage24.be",
        "logo": "https://depannage24.be/images/logo_depannage24.svg",
        "telephone": PHONE_NUMBER,
        "priceRange": "$$",
        "areaServed": [
          { "@type": "City", "name": "Brussels" },
          { "@type": "City", "name": "Leuven" },
          { "@type": "AdministrativeArea", "name": "Brussels-Capital Region" },
          { "@type": "AdministrativeArea", "name": "Flemish Brabant" }
        ],
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
          ],
          "opens": "00:00",
          "closes": "23:59"
        }
      },
      {
        "@type": "EmergencyService",
        "name": "Dépannage24 Roadside Assistance",
        "telephone": PHONE_NUMBER,
        "serviceArea": "Brussels & Leuven",
        "availableLanguage": ["French", "English", "Dutch"]
      }
    ]
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schemaData);
  document.head.appendChild(script);
}

// Quick Situation Trigger
window.triggerSituation = function(situationKey) {
  const langMsgs = {
    fr: {
      battery: "Bonjour, ma voiture ne démarre pas (batterie). Voici ma position :",
      towing: "Bonjour, j'ai besoin d'un remorquage voiture. Voici ma position :",
      tire: "Bonjour, j'ai un pneu crevé. Voici ma position :",
      fuel: "Bonjour, je suis en panne de carburant. Voici ma position :",
      accident: "Bonjour, j'ai eu un accident. Voici ma position :",
      moto: "Bonjour, ma moto est immobilisée. Voici ma position :"
    },
    en: {
      battery: "Hello, my car won't start (battery). Here is my location:",
      towing: "Hello, I need a car tow. Here is my location:",
      tire: "Hello, I have a flat tire. Here is my location:",
      fuel: "Hello, I ran out of fuel. Here is my location:",
      accident: "Hello, I had an accident. Here is my location:",
      moto: "Hello, my motorcycle is broken down. Here is my location:"
    },
    nl: {
      battery: "Hallo, mijn wagen start niet (accu). Hier is mijn locatie:",
      towing: "Hallo, ik heb een takeldienst nodig. Hier is mijn locatie:",
      tire: "Hallo, ik heb een lekke band. Hier is mijn locatie:",
      fuel: "Hallo, ik sta zonder brandstof. Hier is mijn locatie:",
      accident: "Hallo, ik heb een ongeval gehad. Hier is mijn locatie:",
      moto: "Hallo, mijn motorfiets staat stil. Hier is mijn locatie:"
    }
  };

  const msg = langMsgs[currentLang]?.[situationKey] || "Bonjour, j'ai besoin d'assistance.";
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
};
