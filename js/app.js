/* ==========================================================================
   DÉPANNAGE24.BE - COMMERCIAL GRADE JS CONTROLLER
   Handles language switching, GPS location resolution, WhatsApp dispatch,
   city pill triggers, Hero location selector, FAQ accordion, Schema.org,
   Emergency GPS Permission Warning Modal, and Live Radar Dispatch Widget.
   ========================================================================== */

(function () {
  let currentLang = 'fr';
  let pendingFallbackText = '';
  const PHONE_NUMBER = '+32492948804';
  const WHATSAPP_NUMBER = '32492948804';

  document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initFAQAccordion();
    initQuickForm();
    initLocationButtons();
    initCityPills();
    initHeroCitySelector();
    initHeroCombobox();
    initGpsModal();
    initRadarWidget();
    initReviewsCarousel();
    initGalleryCarousel();
    initStickyHeader();
    initSchemaOrg();
    updatePageContent();
  });

  function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  function initLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.getAttribute('data-lang');
        if (lang && window.TRANSLATIONS && window.TRANSLATIONS[lang]) {
          currentLang = lang;
          langBtns.forEach(b => b.classList.remove('active'));
          document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`).forEach(b => b.classList.add('active'));
          updatePageContent();
        }
      });
    });
  }

  function updatePageContent() {
    const t = window.TRANSLATIONS ? window.TRANSLATIONS[currentLang] : null;
    if (!t) return;

    document.documentElement.lang = currentLang === 'fr' ? 'fr-BE' : (currentLang === 'nl' ? 'nl-BE' : 'en');
    document.title = t.meta.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t.meta.description);

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(t, key);
      if (value) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = value;
        } else if (el.tagName === 'OPTION') {
          el.textContent = value;
        } else {
          el.innerHTML = value;
        }
      }
    });
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
  }

  function openWhatsApp(msgText) {
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msgText)}`;
    const win = window.open(waUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = waUrl;
    }
  }

  function showGpsPermissionModal(fallbackText) {
    pendingFallbackText = fallbackText;
    const modal = document.getElementById('gpsModal');
    if (modal) {
      modal.classList.add('open');
    } else {
      openWhatsApp(fallbackText);
    }
  }

  function initGpsModal() {
    const modal = document.getElementById('gpsModal');
    const btnContinue = document.getElementById('gpsModalContinue');
    const btnClose = document.getElementById('gpsModalClose');

    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        if (modal) modal.classList.remove('open');
        openWhatsApp(pendingFallbackText);
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (modal) modal.classList.remove('open');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    }
  }

  function initRadarWidget() {
    const heroCityBtns = document.querySelectorAll('.hero-city-btn');
    const statusLine = document.getElementById('radarStatusLine');

    if (!statusLine) return;

    heroCityBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        const city = btn.getAttribute('data-city') || btn.textContent.replace('📍', '').trim();
        updateRadarForCity(city);
      });
    });
  }

  function updateRadarForCity(city) {
    const statusLine = document.getElementById('radarStatusLine');
    const etaVal = document.getElementById('radarEtaVal');
    if (!statusLine) return;

    if (currentLang === 'fr') {
      statusLine.innerHTML = `🟢 Patrouille détectée à proximité de <strong>${city}</strong>`;
      if (etaVal) etaVal.textContent = '~15 - 25 min';
    } else if (currentLang === 'nl') {
      statusLine.innerHTML = `🟢 Patrouille gedetecteerd nabij <strong>${city}</strong>`;
      if (etaVal) etaVal.textContent = '~15 - 25 min';
    } else {
      statusLine.innerHTML = `🟢 Patrol unit active near <strong>${city}</strong>`;
      if (etaVal) etaVal.textContent = '~15 - 25 min';
    }
  }

  function dispatchCityEmergency(cityName, triggerElement) {
    if (!cityName) return;
    updateRadarForCity(cityName);

    const originalText = triggerElement ? triggerElement.innerHTML : '';
    if (triggerElement) {
      triggerElement.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Localisation...`;
      triggerElement.style.opacity = '0.7';
    }

    const fallbackMsg = currentLang === 'fr'
      ? `Bonjour, j'ai besoin d'un dépannage d'urgence à ${cityName}.\n📍 [Partagez votre position via le bouton "+" de WhatsApp]`
      : currentLang === 'nl'
      ? `Hallo, ik heb dringende pechverhelping nodig in ${cityName}.\n📍 [Deel uw locatie via de "+"-knop in WhatsApp]`
      : `Hello, I need emergency roadside assistance in ${cityName}.\n📍 [Share your location via the "+" button in WhatsApp]`;

    function restoreBtn() {
      if (triggerElement) {
        triggerElement.innerHTML = originalText;
        triggerElement.style.opacity = '1';
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          restoreBtn();
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const gpsMsg = currentLang === 'fr'
            ? `Bonjour, j'ai besoin d'un dépannage d'urgence à ${cityName}.\n📍 Ma position GPS : https://maps.google.com/?q=${lat},${lng}`
            : currentLang === 'nl'
            ? `Hallo, ik heb dringende pechverhelping nodig in ${cityName}.\n📍 Mijn GPS-locatie: https://maps.google.com/?q=${lat},${lng}`
            : `Hello, I need emergency roadside assistance in ${cityName}.\n📍 My GPS location: https://maps.google.com/?q=${lat},${lng}`;

          // USER PRESSED "ALLOW" -> OPEN WHATSAPP WITH GPS COORDINATES
          openWhatsApp(gpsMsg);
        },
        (err) => {
          restoreBtn();
          // LOCATION FORBIDDEN IN SETTINGS / DENIED / ERROR -> SHOW WARNING MODAL WINDOW!
          showGpsPermissionModal(fallbackMsg);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      restoreBtn();
      showGpsPermissionModal(fallbackMsg);
    }
  }

  function initHeroCitySelector() {
    const heroCityBtns = document.querySelectorAll('.hero-quick-cities .hero-city-btn');
    heroCityBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const city = btn.getAttribute('data-city') || btn.textContent.replace('📍', '').trim();
        
        // Highlight active city button
        heroCityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Select city in hero combobox
        if (window.selectHeroCommune) {
          window.selectHeroCommune(city, false);
        }
        
        // Trigger Geolocation request & WhatsApp dispatch
        dispatchCityEmergency(city);
      });
    });
  }

  function initHeroCombobox() {
    const combobox = document.getElementById('bxlCombobox');
    const trigger = document.getElementById('bxlComboboxTrigger');
    const dropdown = document.getElementById('bxlComboboxDropdown');
    const searchInput = document.getElementById('bxlComboboxSearchInput');
    const valueDisplay = document.getElementById('bxlComboboxValue');
    const list = document.getElementById('bxlComboboxList');
    const options = list ? list.querySelectorAll('.bxl-combobox-option') : [];
    const emptyState = document.getElementById('bxlComboboxEmpty');
    const countDisplay = document.getElementById('bxlComboboxCount');
    const selectionBadge = document.getElementById('bxlSelectionBadge');
    const activeCommuneName = document.getElementById('bxlActiveCommuneName');

    if (!combobox || !trigger || !dropdown) return;

    let selectedValue = '';
    let focusedIndex = -1;

    function normalizeStr(str) {
      return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim() : '';
    }

    function openDropdown() {
      combobox.classList.add('open');
      dropdown.removeAttribute('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      if (searchInput) {
        searchInput.value = '';
        filterOptions('');
        setTimeout(() => searchInput.focus(), 60);
      }
    }

    function closeDropdown() {
      combobox.classList.remove('open');
      dropdown.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
      focusedIndex = -1;
      clearFocusedOption();
    }

    function toggleDropdown(e) {
      e?.stopPropagation();
      if (combobox.classList.contains('open')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }

    function clearFocusedOption() {
      options.forEach(opt => opt.classList.remove('is-focused'));
    }

    function setFocusedOption(visibleOptions, index) {
      clearFocusedOption();
      if (visibleOptions.length === 0) return;
      focusedIndex = Math.max(0, Math.min(index, visibleOptions.length - 1));
      const target = visibleOptions[focusedIndex];
      if (target) {
        target.classList.add('is-focused');
        target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        trigger.setAttribute('aria-activedescendant', target.id);
      }
    }

    function filterOptions(query) {
      const normQuery = normalizeStr(query);
      let matchCount = 0;

      const headers = list ? list.querySelectorAll('.bxl-combobox-header') : [];
      headers.forEach(h => {
        h.style.display = normQuery ? 'none' : 'block';
      });

      options.forEach(option => {
        const val = option.getAttribute('data-value') || '';
        const text = option.textContent || '';
        const keywords = option.getAttribute('data-keywords') || '';
        const combined = `${val} ${text} ${keywords}`;
        const normCombined = normalizeStr(combined);

        if (!normQuery || normCombined.includes(normQuery)) {
          option.style.display = 'flex';
          matchCount++;
        } else {
          option.style.display = 'none';
        }
      });

      if (emptyState) {
        emptyState.hidden = matchCount > 0;
      }

      if (countDisplay) {
        if (!normQuery) {
          const t = window.TRANSLATIONS ? window.TRANSLATIONS[currentLang] : null;
          countDisplay.textContent = t?.hero?.communesAvailable || '39 zones d\'intervention 24/7';
        } else {
          countDisplay.textContent = `${matchCount} zone${matchCount > 1 ? 's' : ''} trouvée${matchCount > 1 ? 's' : ''}`;
        }
      }
    }

    function selectCommune(val, triggerDispatch = false) {
      selectedValue = val;

      if (val) {
        if (valueDisplay) valueDisplay.textContent = val;
        trigger.classList.add('has-value');

        options.forEach(opt => {
          if (opt.getAttribute('data-value') === val) {
            opt.classList.add('is-selected');
            opt.setAttribute('aria-selected', 'true');
          } else {
            opt.classList.remove('is-selected');
            opt.setAttribute('aria-selected', 'false');
          }
        });

        // Highlight matching quick city button
        const quickBtns = document.querySelectorAll('.hero-quick-cities .hero-city-btn');
        quickBtns.forEach(qb => {
          const qbCity = qb.getAttribute('data-city') || qb.textContent.replace('📍', '').trim();
          if (qbCity.toLowerCase() === val.toLowerCase()) {
            qb.classList.add('active');
          } else {
            qb.classList.remove('active');
          }
        });

        if (selectionBadge && activeCommuneName) {
          activeCommuneName.textContent = val;
          selectionBadge.hidden = false;
        }

        updateRadarForCity(val);

        const formLocation = document.getElementById('formLocation');
        if (formLocation) {
          formLocation.value = val;
        }

        window.selectedCommune = val;

        if (triggerDispatch) {
          dispatchCityEmergency(val);
        }
      } else {
        if (valueDisplay) {
          const t = window.TRANSLATIONS ? window.TRANSLATIONS[currentLang] : null;
          valueDisplay.textContent = t?.hero?.locationPlaceholder || 'Sélectionnez votre commune';
        }
        trigger.classList.remove('has-value');
        options.forEach(opt => {
          opt.classList.remove('is-selected');
          opt.setAttribute('aria-selected', 'false');
        });
        if (selectionBadge) selectionBadge.hidden = true;
        window.selectedCommune = null;
      }

      closeDropdown();
    }

    window.selectHeroCommune = selectCommune;

    trigger.addEventListener('click', toggleDropdown);
    trigger.addEventListener('keydown', (e) => {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        if (!combobox.classList.contains('open')) {
          openDropdown();
        }
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterOptions(e.target.value);
      });

      searchInput.addEventListener('keydown', (e) => {
        const visibleOptions = Array.from(options).filter(opt => opt.style.display !== 'none');

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusedOption(visibleOptions, focusedIndex + 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusedOption(visibleOptions, focusedIndex - 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (focusedIndex >= 0 && visibleOptions[focusedIndex]) {
            const val = visibleOptions[focusedIndex].getAttribute('data-value');
            selectCommune(val, true);
          } else if (visibleOptions.length > 0) {
            const val = visibleOptions[0].getAttribute('data-value');
            selectCommune(val, true);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown();
          trigger.focus();
        } else if (e.key === 'Tab') {
          closeDropdown();
        }
      });
    }

    // Direct, 100% reliable option selection for every city in the dropdown
    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const val = opt.getAttribute('data-value') || opt.textContent.trim();
        if (searchInput) searchInput.blur();
        
        selectCommune(val, false);
        dispatchCityEmergency(val, opt);
      });
    });

    document.addEventListener('click', (e) => {
      if (!combobox.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  function initCityPills() {
    const cityPills = document.querySelectorAll('.city-pills-grid .city-pill');
    cityPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cityName = pill.getAttribute('data-city') || pill.querySelector('span:last-child')?.textContent || 'votre zone';
        dispatchCityEmergency(cityName, pill);
      });
    });
  }

  function initLocationButtons() {
    const locationBtns = document.querySelectorAll('.btn-whatsapp-dynamic');
    locationBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const directText = currentLang === 'fr'
          ? "Bonjour, j'ai besoin d'un dépannage d'urgence."
          : currentLang === 'nl'
          ? "Hallo, ik heb dringende pechverhelping nodig."
          : "Hello, I need emergency roadside assistance.";

        openWhatsApp(directText);
      });
    });
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

      const labels = currentLang === 'en' ? {
        header: "EMERGENCY ROADSIDE ASSISTANCE REQUEST:",
        name: "Name",
        phone: "Phone",
        location: "Location",
        vehicle: "Vehicle",
        problem: "Problem"
      } : (currentLang === 'nl' ? {
        header: "DRINGENDE PECHVERHELPING AANVRAAG:",
        name: "Naam",
        phone: "Tel",
        location: "Locatie",
        vehicle: "Voertuig",
        problem: "Probleem"
      } : {
        header: "URGENCE DÉPANNAGE24:",
        name: "Nom",
        phone: "Tel",
        location: "Localisation",
        vehicle: "Véhicule",
        problem: "Problème"
      });

      const text =
        `${labels.header}\n` +
        `- ${labels.name}: ${name}\n` +
        `- ${labels.phone}: ${phone}\n` +
        `- ${labels.location}: ${location}\n` +
        `- ${labels.vehicle}: ${vehicle}\n` +
        `- ${labels.problem}: ${problem}`;

      openWhatsApp(text);
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
          "telephone": PHONE_NUMBER,
          "priceRange": "$$",
          "areaServed": ["Brussels", "Leuven", "Ixelles", "Schaerbeek", "Anderlecht", "Uccle"],
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "00:00",
            "closes": "23:59"
          }
        },
        {
          "@type": "EmergencyService",
          "name": "Dépannage24 Roadside Assistance",
          "telephone": PHONE_NUMBER,
          "serviceArea": "Brussels & Leuven"
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);
  }

  /* INSTANT WHATSAPP DISPATCH FOR SITUATION CARDS (NO GPS PROMPTS) */
  window.triggerSituation = function(situationKey) {
    const langMsgs = {
      fr: {
        battery: "Bonjour, ma voiture ne démarre pas (batterie). J'ai besoin d'une assistance dépannage.",
        towing: "Bonjour, j'ai besoin d'un remorquage automobile urgent.",
        tire: "Bonjour, j'ai un pneu crevé. J'ai besoin d'assistance sur place.",
        fuel: "Bonjour, je suis en panne de carburant. J'ai besoin d'une livraison de carburant.",
        accident: "Bonjour, j'ai eu un accident. J'ai besoin d'un remorquage d'urgence.",
        keys: "Bonjour, mes clés sont bloquées à l'intérieur de ma voiture.",
        ev: "Bonjour, mon véhicule électrique est immobilisé. J'ai besoin d'un remorquage.",
        van: "Bonjour, j'ai besoin d'un remorquage pour utilitaire / camionnette."
      },
      en: {
        battery: "Hello, my car won't start (battery issue). I need breakdown assistance.",
        towing: "Hello, I need urgent car towing.",
        tire: "Hello, I have a flat tire. I need roadside assistance.",
        fuel: "Hello, I ran out of fuel. I need emergency fuel delivery.",
        accident: "Hello, I had an accident. I need urgent towing.",
        keys: "Hello, my keys are locked inside my car.",
        ev: "Hello, my electric vehicle is broken down. I need towing assistance.",
        van: "Hello, I need towing for a van / commercial vehicle."
      },
      nl: {
        battery: "Hallo, mijn wagen start niet (accu probleem). Ik heb pechverhelping nodig.",
        towing: "Hallo, ik heb dringend een takeldienst nodig.",
        tire: "Hallo, ik heb een lekke band. Ik heb pechverhelping ter plaatse nodig.",
        fuel: "Hallo, ik sta zonder brandstof. Ik heb brandstoflevering nodig.",
        accident: "Hallo, ik heb een ongeval gehad. Ik heb een dringende takeldienst nodig.",
        keys: "Hallo, mijn sleutels zitten opgesloten in mijn auto.",
        ev: "Hallo, mijn elektrisch voertuig staat stil. Ik heb een takeldienst nodig.",
        van: "Hallo, ik heb een takeldienst nodig voor een bestelwagen."
      }
    };

    const fallbackMsg = currentLang === 'en'
      ? "Hello, I need emergency roadside assistance."
      : (currentLang === 'nl' ? "Hallo, ik heb dringende pechverhelping nodig." : "Bonjour, j'ai besoin d'assistance.");

    const msgText = langMsgs[currentLang]?.[situationKey] || fallbackMsg;
    
    // Instant 1-click open — Zero GPS prompts or permission modal delays!
    openWhatsApp(msgText);
  };

  function initReviewsCarousel() {
    const track = document.getElementById('reviewsCarouselTrack');
    const prevBtn = document.getElementById('reviewsCarouselPrev');
    const nextBtn = document.getElementById('reviewsCarouselNext');
    const dotsContainer = document.getElementById('reviewsCarouselDots');
    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    // Build pagination dots dynamically
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = `dot-indicator ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
          slides[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateActiveDot() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.dot-indicator');
      const trackRect = track.getBoundingClientRect();
      
      let closestIdx = 0;
      let minDiff = Infinity;
      
      slides.forEach((slide, idx) => {
        const slideRect = slide.getBoundingClientRect();
        const diff = Math.abs(slideRect.left - trackRect.left);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      dots.forEach((d, idx) => {
        if (idx === closestIdx) {
          d.classList.add('active');
        } else {
          d.classList.remove('active');
        }
      });
    }

    track.addEventListener('scroll', updateActiveDot, { passive: true });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const slideWidth = slides[0].offsetWidth + 20;
        track.scrollBy({ left: -slideWidth, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const slideWidth = slides[0].offsetWidth + 20;
        track.scrollBy({ left: slideWidth, behavior: 'smooth' });
      });
    }

    // Auto-play loop (scrolls every 5 seconds, pauses on hover or touch)
    let autoPlayTimer = setInterval(() => {
      const slideWidth = slides[0].offsetWidth + 20;
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: slideWidth, behavior: 'smooth' });
      }
    }, 5000);

    track.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    track.addEventListener('mouseleave', () => {
      clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(() => {
        const slideWidth = slides[0].offsetWidth + 20;
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: slideWidth, behavior: 'smooth' });
        }
      }, 5000);
    });
  }

  function initGalleryCarousel() {
    const grid = document.getElementById('galleryGrid');
    const prevBtn = document.getElementById('galleryCarouselPrev');
    const nextBtn = document.getElementById('galleryCarouselNext');

    if (!grid) return;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        grid.scrollBy({ left: -grid.clientWidth * 0.85, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        grid.scrollBy({ left: grid.clientWidth * 0.85, behavior: 'smooth' });
      });
    }
  }
})();
