/* ==========================================================================
   FORMS — Formulaires multi-steps, logique conditionnelle,
   validation, custom fields, webhooks, toasts
   Zéro dépendances.
   ========================================================================== */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* =====================================================================
     TOASTS
     ===================================================================== */

  var toastContainer = null;

  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  window.showToast = function (message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;

    var container = getToastContainer();
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;

    var icons = {
      success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6v4M10 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3.5 17h13L10 3 3.5 17z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M10 9v4M10 7h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };

    toast.innerHTML = ''
      + '<span class="toast__icon">' + (icons[type] || icons.info) + '</span>'
      + '<span class="toast__message">' + escapeHtml(message) + '</span>'
      + '<button class="toast__close">&times;</button>';

    toast.querySelector('.toast__close').addEventListener('click', function () {
      dismissToast(toast);
    });

    container.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('toast--visible');
    });

    setTimeout(function () {
      dismissToast(toast);
    }, duration);
  };

  function dismissToast(toast) {
    if (toast.__dismissed) return;
    toast.__dismissed = true;
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', function () {
      toast.remove();
    });
    // Fallback si pas de transition CSS
    setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, 500);
  }

  /* =====================================================================
     CUSTOM FORM ELEMENTS
     ===================================================================== */

  function initCustomSelects(root) {
    var selects = root.querySelectorAll('.form__select');
    selects.forEach(function (select) {
      if (select.__selectInit) return;
      select.__selectInit = true;

      var trigger = select.querySelector('.form__select-trigger');
      var options = select.querySelector('.form__select-options');
      var name = select.getAttribute('data-name');
      var placeholder = trigger.textContent;

      // Hidden input pour la valeur
      var hidden = select.querySelector('input[type="hidden"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        select.appendChild(hidden);
      }

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        // Fermer les autres selects
        document.querySelectorAll('.form__select--open').forEach(function (s) {
          if (s !== select) s.classList.remove('form__select--open');
        });
        select.classList.toggle('form__select--open');
      });

      options.addEventListener('click', function (e) {
        var option = e.target.closest('.form__select-option');
        if (!option) return;

        var value = option.getAttribute('data-value');
        var label = option.textContent;

        hidden.value = value;
        trigger.textContent = label;
        trigger.classList.add('form__select-trigger--filled');
        select.classList.remove('form__select--open');

        // Marquer l'option active
        options.querySelectorAll('.form__select-option').forEach(function (o) {
          o.classList.toggle('form__select-option--active', o === option);
        });

        // Déclencher change pour la logique conditionnelle
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    // Fermer tous les selects au clic extérieur
    if (!window.__selectCloseInit) {
      window.__selectCloseInit = true;
      document.addEventListener('click', function () {
        document.querySelectorAll('.form__select--open').forEach(function (s) {
          s.classList.remove('form__select--open');
        });
      });
    }
  }

  function initCustomNumbers(root) {
    var numbers = root.querySelectorAll('.form__number');
    numbers.forEach(function (el) {
      if (el.__numberInit) return;
      el.__numberInit = true;

      var input = el.querySelector('.form__number-input');
      var minBtn = el.querySelector('.form__number-minus');
      var plusBtn = el.querySelector('.form__number-plus');
      var min = parseFloat(input.getAttribute('min')) || 0;
      var max = parseFloat(input.getAttribute('max')) || 999999;
      var step = parseFloat(input.getAttribute('step')) || 1;

      function update(val) {
        val = Math.max(min, Math.min(max, val));
        input.value = val;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      minBtn.addEventListener('click', function () {
        update(parseFloat(input.value || 0) - step);
      });

      plusBtn.addEventListener('click', function () {
        update(parseFloat(input.value || 0) + step);
      });
    });
  }

  function initCustomMultiSelects(root) {
    var multiSelects = root.querySelectorAll('.form__multiselect');
    multiSelects.forEach(function (el) {
      if (el.__multiSelectInit) return;
      el.__multiSelectInit = true;

      var trigger = el.querySelector('.form__multiselect-trigger');
      var options = el.querySelector('.form__multiselect-options');
      var name = el.getAttribute('data-name');
      var placeholder = trigger.getAttribute('data-placeholder') || trigger.textContent;
      var selected = [];

      // Hidden input
      var hidden = el.querySelector('input[type="hidden"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        el.appendChild(hidden);
      }

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        document.querySelectorAll('.form__multiselect--open').forEach(function (s) {
          if (s !== el) s.classList.remove('form__multiselect--open');
        });
        el.classList.toggle('form__multiselect--open');
      });

      options.addEventListener('click', function (e) {
        e.stopPropagation();
        var option = e.target.closest('.form__multiselect-option');
        if (!option) return;

        var value = option.getAttribute('data-value');
        option.classList.toggle('form__multiselect-option--active');

        var idx = selected.indexOf(value);
        if (idx > -1) {
          selected.splice(idx, 1);
        } else {
          selected.push(value);
        }

        hidden.value = selected.join(',');
        trigger.textContent = selected.length > 0
          ? selected.length + ' sélectionné' + (selected.length > 1 ? 's' : '')
          : placeholder;
        if (selected.length > 0) {
          trigger.classList.add('form__multiselect-trigger--filled');
        } else {
          trigger.classList.remove('form__multiselect-trigger--filled');
        }

        hidden.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  function initCustomRadioGroups(root) {
    var groups = root.querySelectorAll('.form__radio-group');
    groups.forEach(function (group) {
      if (group.__radioInit) return;
      group.__radioInit = true;

      var name = group.getAttribute('data-name');
      var hidden = group.querySelector('input[type="hidden"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        group.appendChild(hidden);
      }

      group.addEventListener('click', function (e) {
        var option = e.target.closest('.form__radio-option');
        if (!option) return;

        var value = option.getAttribute('data-value');
        hidden.value = value;

        group.querySelectorAll('.form__radio-option').forEach(function (o) {
          o.classList.toggle('form__radio-option--active', o === option);
        });

        hidden.dispatchEvent(new Event('change', { bubbles: true }));
        group.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  function initCustomCheckboxGroups(root) {
    var groups = root.querySelectorAll('.form__checkbox-group');
    groups.forEach(function (group) {
      if (group.__checkboxInit) return;
      group.__checkboxInit = true;

      var name = group.getAttribute('data-name');
      var selected = [];
      var hidden = group.querySelector('input[type="hidden"]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        group.appendChild(hidden);
      }

      group.addEventListener('click', function (e) {
        var option = e.target.closest('.form__checkbox-option');
        if (!option) return;

        var value = option.getAttribute('data-value');
        option.classList.toggle('form__checkbox-option--active');

        var idx = selected.indexOf(value);
        if (idx > -1) {
          selected.splice(idx, 1);
        } else {
          selected.push(value);
        }

        hidden.value = selected.join(',');
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }

  /* =====================================================================
     CONDITIONAL LOGIC
     ===================================================================== */

  function initConditionalLogic(form) {
    var conditionalFields = form.querySelectorAll('[data-condition]');
    if (conditionalFields.length === 0) return;

    function evaluateConditions() {
      conditionalFields.forEach(function (field) {
        var condition = field.getAttribute('data-condition');
        var visible = evaluateCondition(form, condition);

        if (visible) {
          field.classList.remove('form__field--hidden');
          field.removeAttribute('data-hidden');
        } else {
          field.classList.add('form__field--hidden');
          field.setAttribute('data-hidden', 'true');
        }
      });
    }

    // Écouter tous les changements dans le formulaire
    form.addEventListener('change', evaluateConditions);
    form.addEventListener('input', evaluateConditions);

    // Évaluer les conditions au chargement
    evaluateConditions();
  }

  function evaluateCondition(form, condition) {
    // Formats supportés :
    // "fieldName=value"           → égal
    // "fieldName!=value"          → différent
    // "fieldName=value1,value2"   → l'un des deux (OR)
    // "fieldName>5"               → supérieur
    // "fieldName<5"               → inférieur
    // "fieldName=*"               → non vide

    var match;

    // Not equals
    match = condition.match(/^([^!=<>]+)!=(.+)$/);
    if (match) {
      var val = getFieldValue(form, match[1].trim());
      return val !== match[2].trim();
    }

    // Greater than
    match = condition.match(/^([^!=<>]+)>(.+)$/);
    if (match) {
      var val = parseFloat(getFieldValue(form, match[1].trim()));
      return val > parseFloat(match[2].trim());
    }

    // Less than
    match = condition.match(/^([^!=<>]+)<(.+)$/);
    if (match) {
      var val = parseFloat(getFieldValue(form, match[1].trim()));
      return val < parseFloat(match[2].trim());
    }

    // Equals (with OR support)
    match = condition.match(/^([^!=<>]+)=(.+)$/);
    if (match) {
      var fieldName = match[1].trim();
      var expected = match[2].trim();
      var val = getFieldValue(form, fieldName);

      // Wildcard : non vide
      if (expected === '*') return val !== '';

      // OR : "value1,value2"
      var values = expected.split(',').map(function (v) { return v.trim(); });
      return values.indexOf(val) > -1;
    }

    return true;
  }

  function getFieldValue(form, name) {
    // Native input/select
    var input = form.querySelector('[name="' + name + '"]');
    if (input) {
      if (input.type === 'checkbox') return input.checked ? input.value : '';
      if (input.type === 'radio') {
        var checked = form.querySelector('[name="' + name + '"]:checked');
        return checked ? checked.value : '';
      }
      return input.value;
    }

    // Custom element (data-name)
    var custom = form.querySelector('[data-name="' + name + '"] input[type="hidden"]');
    if (custom) return custom.value;

    return '';
  }

  /* =====================================================================
     MULTI-STEP FORMS
     ===================================================================== */

  function initSteps(form) {
    var steps = form.querySelectorAll('.form__step');
    if (steps.length <= 1) return null;

    var currentStep = 0;
    var prevBtn = form.querySelector('.form__prev');
    var nextBtn = form.querySelector('.form__next');
    var submitBtn = form.querySelector('.form__submit');
    var progressBar = form.querySelector('.form__progress-bar');
    var stepIndicators = form.querySelector('.form__step-indicators');

    // Créer les indicateurs de step
    if (stepIndicators) {
      stepIndicators.innerHTML = '';
      for (var i = 0; i < steps.length; i++) {
        var label = steps[i].getAttribute('data-step-label') || 'Étape ' + (i + 1);
        var indicator = document.createElement('div');
        indicator.className = 'form__step-indicator';
        indicator.textContent = label;
        stepIndicators.appendChild(indicator);
      }
    }

    function showStep(index) {
      steps.forEach(function (step, i) {
        step.classList.toggle('form__step--active', i === index);
      });

      currentStep = index;

      // Boutons de navigation
      if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : '';
      if (nextBtn) nextBtn.style.display = index === steps.length - 1 ? 'none' : '';
      if (submitBtn) submitBtn.style.display = index === steps.length - 1 ? '' : 'none';

      // Barre de progression
      if (progressBar) {
        var percent = ((index + 1) / steps.length) * 100;
        progressBar.style.width = percent + '%';
      }

      // Indicateurs
      if (stepIndicators) {
        var indicators = stepIndicators.querySelectorAll('.form__step-indicator');
        indicators.forEach(function (ind, i) {
          ind.classList.toggle('form__step-indicator--active', i === index);
          ind.classList.toggle('form__step-indicator--done', i < index);
        });
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        // Valider le step courant avant d'avancer
        if (validateStep(form, steps[currentStep])) {
          showStep(currentStep + 1);
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        showStep(currentStep - 1);
      });
    }

    showStep(0);

    return {
      getCurrentStep: function () { return currentStep; },
      getSteps: function () { return steps; }
    };
  }

  /* =====================================================================
     VALIDATION
     ===================================================================== */

  function validateStep(form, stepEl) {
    var fields = stepEl.querySelectorAll('[data-validate], [required]');
    var valid = true;

    fields.forEach(function (field) {
      // Ignorer les champs cachés par logique conditionnelle
      var wrapper = field.closest('.form__field');
      if (wrapper && wrapper.hasAttribute('data-hidden')) return;

      if (!validateField(field)) {
        valid = false;
      }
    });

    if (!valid) {
      window.showToast('Veuillez remplir tous les champs obligatoires.', 'error');
    }

    return valid;
  }

  function validateField(field) {
    var value = field.value.trim();
    var rules = field.getAttribute('data-validate') || '';
    var isRequired = field.hasAttribute('required') || rules.indexOf('required') > -1;
    var wrapper = field.closest('.form__field');
    var errorEl = wrapper ? wrapper.querySelector('.form__error') : null;

    // Clear previous error
    if (wrapper) wrapper.classList.remove('form__field--error');
    if (errorEl) errorEl.textContent = '';

    function setError(msg) {
      if (wrapper) wrapper.classList.add('form__field--error');
      if (errorEl) {
        errorEl.textContent = msg;
      } else if (wrapper) {
        var err = document.createElement('span');
        err.className = 'form__error';
        err.textContent = msg;
        wrapper.appendChild(err);
      }
      return false;
    }

    if (isRequired && !value) {
      return setError('Ce champ est obligatoire.');
    }

    if (!value) return true; // Pas requis et vide = OK

    // Validation rules
    var ruleList = rules.split('|');
    for (var i = 0; i < ruleList.length; i++) {
      var rule = ruleList[i].trim();
      if (rule === 'required') continue;

      if (rule === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return setError('Adresse email invalide.');
        }
      }

      if (rule === 'phone') {
        if (!/^[+\d\s()-]{6,20}$/.test(value)) {
          return setError('Numéro de téléphone invalide.');
        }
      }

      if (rule === 'url') {
        if (!/^https?:\/\/.+/.test(value)) {
          return setError('URL invalide.');
        }
      }

      var minMatch = rule.match(/^min:(\d+)$/);
      if (minMatch) {
        if (value.length < parseInt(minMatch[1])) {
          return setError('Minimum ' + minMatch[1] + ' caractères.');
        }
      }

      var maxMatch = rule.match(/^max:(\d+)$/);
      if (maxMatch) {
        if (value.length > parseInt(maxMatch[1])) {
          return setError('Maximum ' + maxMatch[1] + ' caractères.');
        }
      }
    }

    return true;
  }

  /* =====================================================================
     DATE FORMAT
     ===================================================================== */

  function getDateNow() {
    var mois = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    var d = new Date();
    return d.getDate() + ' ' + mois[d.getMonth()] + ' ' + d.getFullYear() + ', '
      + d.getHours() + 'h' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  }

  /* =====================================================================
     COLLECT FORM DATA (respecting conditional logic)
     ===================================================================== */

  function collectFormData(form) {
    var data = {};

    // Collecter les champs natifs
    var inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(function (input) {
      var name = input.name;
      if (!name) return;
      if (input.type === 'hidden' && input.closest('.form__select, .form__multiselect, .form__radio-group, .form__checkbox-group')) return;

      // Vérifier si le champ est dans un wrapper caché par logique conditionnelle
      var wrapper = input.closest('.form__field');
      if (wrapper && wrapper.hasAttribute('data-hidden')) return;

      // Vérifier si dans un step non actif (pour les forms multi-step avec marche arrière)
      // On inclut tous les steps visités sauf les champs cachés par condition
      if (input.type === 'checkbox') {
        data[name] = input.checked ? (input.value || 'true') : '';
      } else if (input.type === 'radio') {
        if (input.checked) data[name] = input.value;
      } else {
        if (input.value) data[name] = input.value;
      }
    });

    // Collecter les champs custom (hidden inputs)
    var customHiddens = form.querySelectorAll('.form__select input[type="hidden"], .form__multiselect input[type="hidden"], .form__radio-group input[type="hidden"], .form__checkbox-group input[type="hidden"]');
    customHiddens.forEach(function (hidden) {
      if (!hidden.name || !hidden.value) return;
      var wrapper = hidden.closest('.form__field');
      if (wrapper && wrapper.hasAttribute('data-hidden')) return;
      data[hidden.name] = hidden.value;
    });

    return data;
  }

  /* =====================================================================
     WEBHOOK SUBMISSION
     ===================================================================== */

  function submitToWebhook(form, formData) {
    var webhookUrl = form.getAttribute('data-form-webhook');
    var redirectUrl = form.getAttribute('data-form-redirect');
    var submitBtn = form.querySelector('.form__submit');

    if (!webhookUrl) {
      window.showToast('Aucune URL de webhook configurée.', 'error');
      return;
    }

    // Metadata toujours présente
    var utms = typeof window.getUTMs === 'function' ? window.getUTMs() : {};
    var payload = {};

    // Ajouter les champs du formulaire
    for (var key in formData) {
      if (formData.hasOwnProperty(key)) {
        payload[key] = formData[key];
      }
    }

    // Ajouter les metadata
    payload.date_now = getDateNow();
    payload.url = window.location.href;
    payload.user_agent = navigator.userAgent;

    // Ajouter les UTMs
    for (var utmKey in utms) {
      if (utms.hasOwnProperty(utmKey) && utms[utmKey]) {
        payload[utmKey] = utms[utmKey];
      }
    }

    // État loading
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('data-original-text', submitBtn.textContent);
      submitBtn.textContent = 'Envoi en cours...';
    }

    // Envoi
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function (response) {
      if (response.ok || response.status === 0) {
        var successMsg = form.getAttribute('data-form-success') || 'Formulaire envoyé avec succès !';
        window.showToast(successMsg, 'success');

        // Reset form
        form.reset();
        // Reset custom selects
        form.querySelectorAll('.form__select').forEach(function (sel) {
          var trigger = sel.querySelector('.form__select-trigger');
          var hidden = sel.querySelector('input[type="hidden"]');
          if (trigger) {
            trigger.classList.remove('form__select-trigger--filled');
            trigger.textContent = trigger.getAttribute('data-placeholder') || 'Choisir...';
          }
          if (hidden) hidden.value = '';
          sel.querySelectorAll('.form__select-option--active').forEach(function (o) {
            o.classList.remove('form__select-option--active');
          });
        });
        // Reset custom radio groups
        form.querySelectorAll('.form__radio-group').forEach(function (group) {
          var hidden = group.querySelector('input[type="hidden"]');
          if (hidden) hidden.value = '';
          group.querySelectorAll('.form__radio-option--active').forEach(function (o) {
            o.classList.remove('form__radio-option--active');
          });
        });
        // Reset custom checkbox groups
        form.querySelectorAll('.form__checkbox-group').forEach(function (group) {
          var hidden = group.querySelector('input[type="hidden"]');
          if (hidden) hidden.value = '';
          group.querySelectorAll('.form__checkbox-option--active').forEach(function (o) {
            o.classList.remove('form__checkbox-option--active');
          });
        });
        // Reset custom multiselects
        form.querySelectorAll('.form__multiselect').forEach(function (ms) {
          var trigger = ms.querySelector('.form__multiselect-trigger');
          var hidden = ms.querySelector('input[type="hidden"]');
          if (trigger) {
            trigger.classList.remove('form__multiselect-trigger--filled');
            trigger.textContent = trigger.getAttribute('data-placeholder') || 'Choisir...';
          }
          if (hidden) hidden.value = '';
          ms.querySelectorAll('.form__multiselect-option--active').forEach(function (o) {
            o.classList.remove('form__multiselect-option--active');
          });
        });

        // Redirection
        if (redirectUrl) {
          // Ajouter les params d'URL actuels à la redirection
          var params = typeof window.getUrlParams === 'function' ? window.getUrlParams() : {};
          var query = '';
          var pairs = [];
          for (var k in params) {
            if (params.hasOwnProperty(k)) {
              pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
            }
          }
          if (pairs.length > 0) query = '?' + pairs.join('&');

          setTimeout(function () {
            window.location.href = redirectUrl + query;
          }, 1000);
        }
      } else {
        throw new Error('HTTP ' + response.status);
      }
    })
    .catch(function (err) {
      var errorMsg = form.getAttribute('data-form-error') || 'Une erreur est survenue. Veuillez réessayer.';
      window.showToast(errorMsg, 'error');
      console.error('[forms] Erreur webhook:', err);
    })
    .finally(function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Envoyer';
      }
    });
  }

  /* =====================================================================
     FORM INIT
     ===================================================================== */

  /* =====================================================================
     FLOATING LABELS
     ===================================================================== */

  function initFloatingLabels(root) {
    var fields = root.querySelectorAll('.form__field--float');
    fields.forEach(function (field) {
      var inputs = field.querySelectorAll('.form__input, .form__textarea');
      inputs.forEach(function (input) {
        if (!input.hasAttribute('placeholder')) {
          input.setAttribute('placeholder', ' ');
        }
      });
      // Custom selects : toggle --filled class
      var select = field.querySelector('.form__select');
      if (select) {
        var hidden = select.querySelector('input[type="hidden"]');
        if (hidden) {
          var check = function () {
            field.classList.toggle('form__field--filled', !!hidden.value);
          };
          hidden.addEventListener('change', check);
          check();
        }
      }
    });
  }

  function initForms(root) {
    root = root || document;

    // Init floating labels
    initFloatingLabels(root);

    // Init custom elements everywhere (standalone demos, etc.)
    initCustomSelects(root);
    initCustomNumbers(root);
    initCustomMultiSelects(root);
    initCustomRadioGroups(root);
    initCustomCheckboxGroups(root);

    // Init conditional logic on all forms
    var allForms = root.querySelectorAll('.form');
    allForms.forEach(function (form) {
      if (!form.__conditionInit) {
        form.__conditionInit = true;
        initConditionalLogic(form);
      }
    });

    // Webhook forms (submission handling)
    var forms = root.querySelectorAll('.form[data-form-webhook]');

    forms.forEach(function (form) {
      if (form.__formInit) return;
      form.__formInit = true;

      // Init steps
      var stepManager = initSteps(form);

      // Validation en temps réel
      form.addEventListener('blur', function (e) {
        if (e.target.hasAttribute('data-validate') || e.target.hasAttribute('required')) {
          validateField(e.target);
        }
      }, true);

      // Soumission
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Valider le dernier step (ou le formulaire entier si pas de steps)
        var lastStep = stepManager
          ? stepManager.getSteps()[stepManager.getCurrentStep()]
          : form;

        if (!validateStep(form, lastStep)) return;

        var formData = collectFormData(form);
        submitToWebhook(form, formData);
      });
    });
  }

  // Exposer pour l'initialisation globale
  window.initForms = initForms;

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initForms(); });
  } else {
    initForms();
  }
})();
