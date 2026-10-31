/* ============================================================
   RED HOT SERVICE — PREMIUM INTERACTIVE VANILLA JS
   Pure DOM API, IntersectionObserver, Web Animations API, rAF
   Zero external libraries
   ============================================================ */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Pure helper functions ---------- */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function wrapIndex(index, total) {
    if (total <= 0) return 0;
    return ((index % total) + total) % total;
  }

  /* ---------- 1. Hero entrance ---------- */
  function markLoaded() {
    document.body.classList.add('is-loaded');
  }
  if (document.readyState === 'complete') {
    markLoaded();
  } else {
    window.addEventListener('load', markLoaded);
    setTimeout(markLoaded, 1200);
  }

  /* ---------- 2. Word Split Title Setup ---------- */
  var splitTitles = Array.prototype.slice.call(document.querySelectorAll('[data-split-title]'));
  if (!prefersReducedMotion) {
    splitTitles.forEach(function (heading) {
      var wordIndex = 0;
      function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          var text = node.nodeValue || '';
          var parts = text.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              var span = document.createElement('span');
              span.className = 'split-word';
              span.style.setProperty('--word-delay', (wordIndex * 0.055).toFixed(3) + 's');
              span.textContent = part;
              wordIndex++;
              frag.appendChild(span);
            }
          });
          return frag;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'BR') {
            return node.cloneNode(false);
          }
          var clone = node.cloneNode(false);
          Array.prototype.slice.call(node.childNodes).forEach(function (child) {
            clone.appendChild(processNode(child));
          });
          return clone;
        }
        return node.cloneNode(true);
      }

      var children = Array.prototype.slice.call(heading.childNodes);
      heading.innerHTML = '';
      children.forEach(function (child) {
        heading.appendChild(processNode(child));
      });
    });
  }

  /* ---------- 3. Header, Top Scroll Progress & Sliding Nav Indicator ---------- */
  var header = document.getElementById('header');
  var scrollProgressBar = document.getElementById('scrollProgressBar');
  var navIndicator = document.getElementById('navIndicator');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.header__link'));
  var scrollParallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-parallax]'));
  var hero = document.getElementById('hero');
  var heroBg = document.getElementById('heroBg');

  var lastScrollY = window.scrollY;
  var scrollTicking = false;

  function moveNavIndicator(targetLink) {
    if (!navIndicator || !targetLink) {
      if (navIndicator) navIndicator.style.opacity = '0';
      return;
    }
    var navRect = targetLink.parentElement.getBoundingClientRect();
    var linkRect = targetLink.getBoundingClientRect();
    navIndicator.style.opacity = '1';
    navIndicator.style.width = linkRect.width + 'px';
    navIndicator.style.transform = 'translateX(' + (linkRect.left - navRect.left) + 'px)';
  }

  navLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      moveNavIndicator(link);
    });
    link.addEventListener('mouseleave', function () {
      var active = document.querySelector('.header__link--active');
      moveNavIndicator(active);
    });
  });

  function onScrollFrame() {
    var y = window.scrollY;
    var docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var progress = clamp(y / docHeight, 0, 1);

    if (scrollProgressBar) {
      scrollProgressBar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
    }

    if (header) {
      header.classList.toggle('header--scrolled', y > 24);
      if (y > 360 && y > lastScrollY + 6 && !document.body.classList.contains('menu-open')) {
        header.classList.add('header--hidden');
      } else if (y < lastScrollY - 6 || y <= 360) {
        header.classList.remove('header--hidden');
      }
    }

    if (!prefersReducedMotion && !isCoarsePointer) {
      if (heroBg && hero && y < hero.offsetHeight) {
        heroBg.style.transform = 'translate3d(0,' + (y * 0.2).toFixed(1) + 'px,0)';
      }

      scrollParallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          var factor = parseFloat(el.getAttribute('data-scroll-parallax') || '-20');
          var ratio = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          var offset = ((ratio - 0.5) * factor).toFixed(1);
          el.style.transform = 'translate3d(0,' + offset + 'px,0)';
        }
      });
    }

    lastScrollY = y;
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }, { passive: true });
  onScrollFrame();

  /* ---------- 4. Custom Automotive Cursor (Desktop Fine Pointer) ---------- */
  var customCursor = document.getElementById('customCursor');
  var cursorRing = document.getElementById('customCursorRing');
  var cursorDot = document.getElementById('customCursorDot');
  var cursorLabel = document.getElementById('customCursorLabel');

  if (isFinePointer && !prefersReducedMotion && customCursor && cursorRing && cursorDot) {
    document.body.classList.add('has-custom-cursor');
    var mouseX = -100, mouseY = -100;
    var ringX = -100, ringY = -100;
    var cursorMoving = false;

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;
      cursorDot.style.transform = 'translate3d(' + mouseX.toFixed(1) + 'px,' + mouseY.toFixed(1) + 'px,0)';
      cursorRing.style.transform = 'translate3d(' + ringX.toFixed(1) + 'px,' + ringY.toFixed(1) + 'px,0)';

      if (Math.abs(mouseX - ringX) > 0.2 || Math.abs(mouseY - ringY) > 0.2) {
        requestAnimationFrame(renderCursor);
      } else {
        cursorMoving = false;
      }
    }

    window.addEventListener('mousemove', function (e) {
      if (window.innerWidth <= 1024) {
        document.body.classList.remove('cursor-active');
        return;
      }
      document.body.classList.add('cursor-active');
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursorMoving) {
        cursorMoving = true;
        requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    window.addEventListener('scroll', function () {
      customCursor.classList.remove('is-hover', 'has-label');
    }, { passive: true });

    window.addEventListener('mousedown', function () {
      customCursor.classList.add('is-down');
    });
    window.addEventListener('mouseup', function () {
      customCursor.classList.remove('is-down');
    });

    var interactiveSelector = 'a, button, summary, [role="button"], .service-card, .gallery__item, .process__step';
    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest(interactiveSelector);
      if (target) {
        customCursor.classList.add('is-hover');
        var text = target.getAttribute('data-cursor-text') || '';
        if (text && cursorLabel) {
          cursorLabel.textContent = text;
          customCursor.classList.add('has-label');
        } else {
          customCursor.classList.remove('has-label');
        }
      } else {
        customCursor.classList.remove('is-hover', 'has-label');
      }
    });
  }

  /* ---------- 5. Hero 3D Depth Mouse Parallax & Interactive Telemetry HUD ---------- */
  var parallaxLayers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax-layer]'));
  var heroGaugeNeedle = document.getElementById('heroGaugeNeedle');
  var heroGaugeArc = document.getElementById('heroGaugeArc');
  var heroHudMainVal = document.getElementById('heroHudMainVal');
  var heroHudMainLbl = document.getElementById('heroHudMainLbl');
  var hudModeBtns = Array.prototype.slice.call(document.querySelectorAll('.hero__hud-mode'));
  var baseNeedleAngle = 18;

  hudModeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      hudModeBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      var val = btn.getAttribute('data-hud-val') || '96,3%';
      var lbl = btn.getAttribute('data-hud-lbl') || '';
      var angle = parseFloat(btn.getAttribute('data-hud-angle') || '18');
      var offset = parseFloat(btn.getAttribute('data-hud-offset') || '42');
      baseNeedleAngle = angle;

      if (heroHudMainVal) heroHudMainVal.textContent = val;
      if (heroHudMainLbl) heroHudMainLbl.textContent = lbl;
      if (heroGaugeNeedle) heroGaugeNeedle.style.transform = 'rotate(' + angle + 'deg)';
      if (heroGaugeArc) heroGaugeArc.style.strokeDashoffset = String(offset);
    });
  });

  if (hero && isFinePointer && !prefersReducedMotion) {
    var heroMouseTicking = false;
    var heroNormX = 0, heroNormY = 0;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      heroNormX = (e.clientX - rect.left) / rect.width - 0.5;
      heroNormY = (e.clientY - rect.top) / rect.height - 0.5;

      if (!heroMouseTicking) {
        heroMouseTicking = true;
        requestAnimationFrame(function () {
          parallaxLayers.forEach(function (layer) {
            if (layer === heroBg && window.scrollY > 40) return;
            var depth = parseFloat(layer.getAttribute('data-parallax-layer') || '0.02');
            var dx = (heroNormX * depth * 420).toFixed(1);
            var dy = (heroNormY * depth * 420).toFixed(1);
            layer.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
          });
          if (heroGaugeNeedle) {
            var dynamicAngle = (baseNeedleAngle + heroNormX * 14).toFixed(1);
            heroGaugeNeedle.style.transform = 'rotate(' + dynamicAngle + 'deg)';
          }
          heroMouseTicking = false;
        });
      }
    }, { passive: true });

    hero.addEventListener('mouseleave', function () {
      parallaxLayers.forEach(function (layer) {
        if (layer === heroBg) return;
        layer.style.transform = 'translate3d(0,0,0)';
      });
      if (heroGaugeNeedle) {
        heroGaugeNeedle.style.transform = 'rotate(' + baseNeedleAngle + 'deg)';
      }
    });
  }

  /* ---------- 6. Magnetic Buttons & Interactive Controls ---------- */
  if (isFinePointer && !prefersReducedMotion) {
    var magneticEls = Array.prototype.slice.call(document.querySelectorAll('[data-magnetic]'));
    magneticEls.forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic') || '0.25');
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = clamp((e.clientX - cx) * strength, -12, 12);
        var dy = clamp((e.clientY - cy) * strength, -10, 10);
        el.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ---------- 7. 3D Card Tilt & Radial Cursor Spotlight ---------- */
  if (isFinePointer && !prefersReducedMotion) {
    var tiltCards = Array.prototype.slice.call(document.querySelectorAll('[data-tilt]'));
    tiltCards.forEach(function (card) {
      var maxDeg = parseFloat(card.getAttribute('data-tilt') || '5');
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        var relX = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        var relY = clamp((e.clientY - rect.top) / rect.height, 0, 1);
        var rotY = ((relX - 0.5) * 2 * maxDeg).toFixed(2);
        var rotX = ((0.5 - relY) * 2 * maxDeg).toFixed(2);

        card.style.setProperty('--spot-x', Math.round(relX * 100) + '%');
        card.style.setProperty('--spot-y', Math.round(relY * 100) + '%');
        card.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------- 8. Mobile menu ---------- */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open) {
    if (!burger || !mobileMenu) return;
    burger.classList.toggle('header__burger--open', open);
    mobileMenu.classList.toggle('mobile-menu--open', open);
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mobileMenu.setAttribute('aria-hidden', String(!open));
  }

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      setMenu(!mobileMenu.classList.contains('mobile-menu--open'));
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('mobile-menu--open')) {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* ---------- 9. Scroll Reveal & Curtain Image Reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var curtainEls = Array.prototype.slice.call(document.querySelectorAll('[data-curtain]'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    curtainEls.forEach(function (el) { el.classList.add('is-curtain-open'); });
  } else {
    var groups = new Map();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      var index = groups.get(parent);
      groups.set(parent, index + 1);
      if (index > 0) {
        el.style.setProperty('--reveal-delay', Math.min(index * 0.08, 0.4) + 's');
      }
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var curtainObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-curtain-open');
          curtainObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    curtainEls.forEach(function (el) { curtainObserver.observe(el); });
  }

  /* ---------- 10. Animated Counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-counter]'));

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (prefersReducedMotion) {
      el.textContent = target.toFixed(decimals).replace('.', ',');
      return;
    }
    var duration = 1600;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      var value = target * eased;
      el.textContent = value.toFixed(decimals).replace('.', ',');
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- 11. Interactive 4x4 SUV Technical Blueprint ---------- */
  var blueprintData = [
    {
      index: 'S.01',
      title: 'Двигатель',
      img: 'assets/service-engine.jpg',
      alt: 'Капитальный ремонт двигателя в Red Hot Service',
      desc: 'Диагностика, ремонт и капиталка бензиновых и дизельных моторов. Замена цепей и ремней ГРМ, турбин, ТНВД и форсунок.',
      specs: [
        'Бензиновые и дизельные ДВС',
        'Замена цепей и ремней ГРМ',
        'Ремонт турбин, ТНВД и форсунок'
      ]
    },
    {
      index: 'S.02',
      title: 'Трансмиссия',
      img: 'assets/workshop-parts.jpg',
      alt: 'Переборка редуктора и механической коробки передач',
      desc: 'Переборка МКПП, редукторов и раздаточных коробок. Замена масел в мостах, муфте Haldex и карданных валах.',
      specs: [
        'Переборка МКПП, раздаток и редукторов',
        'Обслуживание муфт Haldex и полного привода',
        'Замена масел в мостах и шприцевание карданов'
      ]
    },
    {
      index: 'S.03',
      title: 'Диагностика и чип-тюнинг',
      img: 'assets/service-chip.jpg',
      alt: 'Компьютерная диагностика и чип-тюнинг внедорожника',
      desc: 'Один из лучших диагностов Москвы, член ассоциации ADACT. Возвращаем к жизни автомобили, от которых отказались другие сервисы.',
      specs: [
        'Сертифицированный специалист ассоциации ADACT',
        'Глубокая моторная и компьютерная диагностика',
        'Калибровка и безопасный чип-тюнинг ЭБУ'
      ]
    },
    {
      index: 'S.04',
      title: 'Электрика',
      img: 'assets/service-electrics.jpg',
      alt: 'Ремонт электрики и электрооборудования автомобиля',
      desc: 'Поиск и устранение неисправностей электрооборудования, ремонт проводки, установка сигнализаций и дополнительного света.',
      specs: [
        'Восстановление жгутов проводки любой сложности',
        'Поиск утечек тока и плавающих ошибок',
        'Установка охранных комплексов и доп. света'
      ]
    },
    {
      index: 'S.05',
      title: 'Подготовка к бездорожью',
      img: 'assets/service-winch.jpg',
      alt: 'Установка лебёдки и силового оборудования на внедорожник',
      desc: 'Лифт подвески, силовые бамперы, лебёдки, самоблокирующиеся дифференциалы, экспедиционное оборудование.',
      specs: [
        'Лифт-комплекты подвески и усиленные амортизаторы',
        'Силовые бамперы, лебёдки и защита агрегатов',
        'Установка блокировок дифференциалов'
      ]
    },
    {
      index: 'S.06',
      title: 'Кузовной цех',
      img: 'assets/service-body.jpg',
      alt: 'Кузовной ремонт и восстановление автомобиля после ДТП',
      desc: 'Восстановление после ДТП, ремонт рам, арматурные и жестяные работы, покраска с точным подбором цвета.',
      specs: [
        'Восстановление геометрии кузова и ремонт рам',
        'Арматурные, сварочные и жестяные работы',
        'Покраска деталей с точным подбором цвета'
      ]
    }
  ];

  var nodeBtns = Array.prototype.slice.call(document.querySelectorAll('[data-node-btn]'));
  var nodeHotspots = Array.prototype.slice.call(document.querySelectorAll('[data-node-hotspot]'));
  var serviceCards = Array.prototype.slice.call(document.querySelectorAll('[data-service-index]'));
  var blueprintImg = document.getElementById('blueprintImg');
  var blueprintIndex = document.getElementById('blueprintIndex');
  var blueprintTitle = document.getElementById('blueprintTitle');
  var blueprintDesc = document.getElementById('blueprintDesc');
  var blueprintSpecs = document.getElementById('blueprintSpecs');

  function selectBlueprintNode(idx) {
    var item = blueprintData[idx];
    if (!item) return;

    nodeBtns.forEach(function (btn, i) {
      var active = i === idx;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    nodeHotspots.forEach(function (spot, i) {
      spot.classList.toggle('is-active', i === idx);
    });

    serviceCards.forEach(function (card, i) {
      card.classList.toggle('is-highlighted', i === idx);
    });

    if (blueprintImg) {
      blueprintImg.src = item.img;
      blueprintImg.alt = item.alt;
    }
    if (blueprintIndex) blueprintIndex.textContent = item.index;
    if (blueprintTitle) blueprintTitle.textContent = item.title;
    if (blueprintDesc) blueprintDesc.textContent = item.desc;
    if (blueprintSpecs) {
      blueprintSpecs.innerHTML = item.specs.map(function (s) {
        return '<li>' + s + '</li>';
      }).join('');
    }
  }

  nodeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectBlueprintNode(parseInt(btn.getAttribute('data-node-btn') || '0', 10));
    });
  });

  nodeHotspots.forEach(function (spot) {
    var idx = parseInt(spot.getAttribute('data-node-hotspot') || '0', 10);
    spot.addEventListener('click', function () { selectBlueprintNode(idx); });
    spot.addEventListener('mouseenter', function () { selectBlueprintNode(idx); });
  });

  serviceCards.forEach(function (card) {
    var idx = parseInt(card.getAttribute('data-service-index') || '0', 10);
    card.addEventListener('click', function () { selectBlueprintNode(idx); });
  });

  /* ---------- 12. Interactive Cars Brand Dossier ---------- */
  var brandItems = Array.prototype.slice.call(document.querySelectorAll('#carsBrandsList li'));
  var dossierBrand = document.getElementById('carsDossierBrand');
  var dossierModels = document.getElementById('carsDossierModels');
  var dossierFocus = document.getElementById('carsDossierFocus');

  function activateBrand(li) {
    brandItems.forEach(function (item) { item.classList.remove('is-active'); });
    li.classList.add('is-active');
    if (dossierBrand) dossierBrand.textContent = li.getAttribute('data-brand') || '';
    if (dossierModels) dossierModels.textContent = li.getAttribute('data-models') || '';
    if (dossierFocus) dossierFocus.textContent = li.getAttribute('data-focus') || '';
  }

  brandItems.forEach(function (li) {
    li.addEventListener('click', function () { activateBrand(li); });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateBrand(li);
      }
    });
  });

  /* ---------- 13. Interactive 5-Step Process Timeline ---------- */
  var processSteps = Array.prototype.slice.call(document.querySelectorAll('.process__step'));
  var processTrackFill = document.getElementById('processTrackFill');
  var processMediaBadge = document.getElementById('processMediaBadge');
  var processMediaCaption = document.getElementById('processMediaCaption');

  var stepMeta = [
    { badge: 'ЭТАП 01 / 05 · КОНСУЛЬТАЦИЯ И ПРИЁМ', caption: 'Предварительная оценка по телефону и круглосуточный приём автомобиля' },
    { badge: 'ЭТАП 02 / 05 · ДИАГНОСТИКА В РЕМЗОНЕ', caption: 'Диагностика при клиенте — показываем и объясняем каждую неисправность' },
    { badge: 'ЭТАП 03 / 05 · ПРОЗРАЧНАЯ СМЕТА ±5%', caption: 'Фиксируем стоимость работ и запчастей до начала ремонта без скрытых доплат' },
    { badge: 'ЭТАП 04 / 05 · ПРОФЕССИОНАЛЬНЫЙ РЕМОНТ', caption: 'Мастера с опытом от 10 лет. Все заменённые детали возвращаем вам' },
    { badge: 'ЭТАП 05 / 05 · КОНТРОЛЬ И ГАРАНТИЯ 12 МЕС', caption: 'Проверка автомобиля под нагрузкой и выдача с гарантией до 12 месяцев' }
  ];

  function activateProcessStep(idx) {
    processSteps.forEach(function (step, i) {
      step.classList.toggle('is-active', i <= idx);
    });
    if (processTrackFill) {
      var ratio = (idx + 1) / Math.max(1, processSteps.length);
      processTrackFill.style.transform = 'scaleY(' + ratio.toFixed(2) + ')';
    }
    var meta = stepMeta[idx];
    if (meta) {
      if (processMediaBadge) processMediaBadge.textContent = meta.badge;
      if (processMediaCaption) processMediaCaption.textContent = meta.caption;
    }
  }

  processSteps.forEach(function (step, i) {
    step.addEventListener('click', function () { activateProcessStep(i); });
    step.addEventListener('mouseenter', function () { activateProcessStep(i); });
    step.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateProcessStep(i);
      }
    });
  });

  if ('IntersectionObserver' in window && processSteps.length) {
    var stepObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = parseInt(entry.target.getAttribute('data-step-index') || '0', 10);
          activateProcessStep(idx);
        }
      });
    }, { rootMargin: '-35% 0px -45% 0px' });
    processSteps.forEach(function (step) { stepObserver.observe(step); });
  }

  /* ---------- 14. Fullscreen Gallery Lightbox ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxBackdrop = document.getElementById('lightboxBackdrop');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var lightboxThumbs = document.getElementById('lightboxThumbs');
  var lightboxStage = document.getElementById('lightboxStage');

  var galleryList = galleryItems.map(function (item) {
    var img = item.querySelector('img');
    var cap = item.querySelector('figcaption');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : '',
      caption: cap ? cap.textContent : ''
    };
  });

  var currentPhotoIndex = 0;
  var lastFocusedGalleryEl = null;

  if (lightboxThumbs && galleryList.length) {
    lightboxThumbs.innerHTML = galleryList.map(function (g, idx) {
      return '<button type="button" class="lightbox__thumb' + (idx === 0 ? ' is-active' : '') + '" data-thumb-idx="' + idx + '" aria-label="Фото ' + (idx + 1) + ': ' + g.caption + '"><img src="' + g.src + '" alt=""></button>';
    }).join('');

    Array.prototype.slice.call(lightboxThumbs.querySelectorAll('.lightbox__thumb')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        showPhoto(parseInt(btn.getAttribute('data-thumb-idx') || '0', 10));
      });
    });
  }

  function showPhoto(index) {
    if (!galleryList.length) return;
    currentPhotoIndex = wrapIndex(index, galleryList.length);
    var data = galleryList[currentPhotoIndex];
    if (lightboxImg) {
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
    }
    if (lightboxCaption) lightboxCaption.textContent = data.caption;
    if (lightboxCounter) {
      var num = String(currentPhotoIndex + 1).padStart(2, '0');
      var tot = String(galleryList.length).padStart(2, '0');
      lightboxCounter.textContent = num + ' / ' + tot;
    }
    if (lightboxThumbs) {
      Array.prototype.slice.call(lightboxThumbs.querySelectorAll('.lightbox__thumb')).forEach(function (t, i) {
        t.classList.toggle('is-active', i === currentPhotoIndex);
      });
    }
  }

  function openLightbox(index, triggerEl) {
    if (!lightbox) return;
    lastFocusedGalleryEl = triggerEl || document.activeElement;
    showPhoto(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedGalleryEl && typeof lastFocusedGalleryEl.focus === 'function') {
      lastFocusedGalleryEl.focus();
    }
  }

  galleryItems.forEach(function (item, idx) {
    item.addEventListener('click', function () { openLightbox(idx, item); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx, item);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { showPhoto(currentPhotoIndex - 1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { showPhoto(currentPhotoIndex + 1); });

  window.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showPhoto(currentPhotoIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      showPhoto(currentPhotoIndex - 1);
    }
  });

  if (lightboxStage) {
    var touchStartX = 0;
    lightboxStage.addEventListener('touchstart', function (e) {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].clientX;
      }
    }, { passive: true });
    lightboxStage.addEventListener('touchend', function (e) {
      if (e.changedTouches && e.changedTouches[0]) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 44) {
          showPhoto(dx < 0 ? currentPhotoIndex + 1 : currentPhotoIndex - 1);
        }
      }
    }, { passive: true });
  }

  /* ---------- 15. Reviews Filter ---------- */
  var reviewFilterBtns = Array.prototype.slice.call(document.querySelectorAll('[data-review-filter]'));
  var reviewCards = Array.prototype.slice.call(document.querySelectorAll('.review-card'));

  reviewFilterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-review-filter') || 'all';
      reviewFilterBtns.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      reviewCards.forEach(function (card) {
        var cats = (card.getAttribute('data-review-cat') || '').split(/\s+/);
        var match = filter === 'all' || cats.indexOf(filter) !== -1;
        card.classList.toggle('is-filtered-out', !match);
      });
    });
  });

  /* ---------- 16. FAQ: Smooth Open / Close ---------- */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var summary = item.querySelector('summary');
    var answer = item.querySelector('.faq__answer');
    if (!summary || !answer) return;

    summary.addEventListener('click', function (e) {
      if (prefersReducedMotion || typeof answer.animate !== 'function') return;
      e.preventDefault();

      if (item.open) {
        var closeAnim = answer.animate(
          [{ height: answer.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 320, easing: 'cubic-bezier(0.83, 0, 0.17, 1)' }
        );
        closeAnim.onfinish = function () { item.open = false; };
      } else {
        item.open = true;
        answer.animate(
          [{ height: '0px', opacity: 0 }, { height: answer.scrollHeight + 'px', opacity: 1 }],
          { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
      }
    });
  });

  /* ---------- 17. Active Nav Link on Scroll ---------- */
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var activeLink = null;
          navLinks.forEach(function (link) {
            var isMatch = link.getAttribute('href') === '#' + entry.target.id;
            link.classList.toggle('header__link--active', isMatch);
            if (isMatch) activeLink = link;
          });
          if (activeLink) moveNavIndicator(activeLink);
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- 18. Live Workshop Status & Copy Toast ---------- */
  var workshopStatusText = document.getElementById('workshopStatusText');
  if (workshopStatusText) {
    var now = new Date();
    var mskHour = (now.getUTCHours() + 3) % 24;
    var mskDay = now.getUTCDay();
    var isWorkDay = mskDay >= 1 && mskDay <= 6;
    var isRepairOpen = isWorkDay && mskHour >= 10 && mskHour < 20;
    workshopStatusText.textContent = isRepairOpen
      ? 'Ремзона открыта сейчас (до 20:00) · Приём авто 24/7'
      : 'Приём автомобилей открыт 24/7 · Ремзона Пн–Сб с 10:00';
  }

  var copyToast = document.getElementById('copyToast');
  var toastTimer = null;
  function showToast(msg) {
    if (!copyToast) return;
    copyToast.textContent = msg;
    copyToast.classList.add('is-visible');
    copyToast.setAttribute('aria-hidden', 'false');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      copyToast.classList.remove('is-visible');
      copyToast.setAttribute('aria-hidden', 'true');
    }, 2600);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-copy]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-copy') || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(function () {
          showToast('Скопировано: ' + val);
        }).catch(function () {
          showToast(val);
        });
      } else {
        showToast('Скопировано: ' + val);
      }
    });
  });

  /* ---------- 19. Footer Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
