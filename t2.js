// t2.js - externalized logic for t2.html
// No inline handlers; attach behavior from here to comply with strict CSP

(function () {
  'use strict';

  /**
   * Centralized Initialization Logic
   * Verifies all required DOM elements and attaches listeners only if they exist.
   */
  function initializeBot() {
    // 1. Query all necessary elements
    const ui = {
      botContainer: document.getElementById('bot-container'),
      currencyBox: document.getElementById('currency-trigger'),
      currencyList: document.getElementById('currency-list'),
      currentPairText: document.getElementById('current-pair'),
      gaugeText: document.getElementById('gauge-text') || document.querySelector('.gauge-label'),
      currencyOptions: Array.from(document.querySelectorAll('.currency-option')),
      gaugeSwitch: document.getElementById('gauge-switch'),
      powerBtn: document.getElementById('power-btn'),
      statusDot: document.querySelector('.status-dot'),
      radar: document.getElementById('radar'),
      percentVal: document.getElementById('percent-val'),
      logoImg: document.querySelector('.logo-area img'),
      gaugeImg: document.querySelector('.gauge-img'),
    };

    // 2. Strict Null Checking & Logging
    const requiredKeys = Object.keys(ui);
    const missingElements = requiredKeys.filter(key => {
      const val = ui[key];
      return Array.isArray(val) ? val.length === 0 : !val;
    });

    if (missingElements.length > 0) {
      console.warn('[FXVision] Initialization Warning: Missing DOM elements detected.', {
        missing: missingElements,
        message: 'The script will attempt to run, but some features may be disabled.'
      });
    }

    // 3. Setup Components (only if elements exist)
    setupImageFallbacks(ui);
    setupCurrencyDropdown(ui);
    setupModeToggle(ui);
    setupPowerLogic(ui);
    setupVisibilityHandling(ui);

    // 4. Debug API
    if (ui.botContainer) {
      ui.botContainer._fxVision = {
        ui,
        status: () => ui.statusDot?.classList.contains('active') ? 'RUNNING' : 'IDLE'
      };
    }
  }

  /**
   * --- Helper Functions for Component Logic ---
   */

  function setupImageFallbacks(ui) {
    const addFallback = (img, fallbackUrl, hideOnFail) => {
      if (!img) return;
      img.addEventListener('error', function onError() {
        img.removeEventListener('error', onError);
        if (fallbackUrl) {
          try { img.src = fallbackUrl; } catch (e) { if (hideOnFail) img.style.display = 'none'; }
        } else if (hideOnFail) {
          img.style.display = 'none';
        }
      });
    };

    addFallback(ui.logoImg, 'https://cdn-icons-png.flaticon.com/512/616/616490.png', false);
    addFallback(ui.gaugeImg, null, true);
  }

  function setupCurrencyDropdown(ui) {
    if (!ui.currencyBox || !ui.currencyList) return;

    const toggle = () => ui.currencyList.classList.toggle('open');

    ui.currencyBox.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    ui.currencyBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape') {
        ui.currencyList.classList.remove('open');
      }
    });

    // Handle Options
    ui.currencyOptions.forEach(option => {
      option.setAttribute('tabindex', '0');
      option.setAttribute('role', 'option');

      const selectOption = () => {
        const val = option.textContent.trim();
        if (ui.currentPairText) ui.currentPairText.textContent = val;
        if (ui.gaugeText) ui.gaugeText.textContent = val;
        ui.currencyList.classList.remove('open');
      };

      option.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOption();
      });

      option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectOption();
        }
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!ui.currencyBox.contains(e.target)) {
        ui.currencyList.classList.remove('open');
      }
    });
  }

  function setupModeToggle(ui) {
    if (!ui.gaugeSwitch || !ui.botContainer) return;

    ui.gaugeSwitch.addEventListener('click', () => {
      ui.botContainer.classList.toggle('mode-sell');
      const isSell = ui.botContainer.classList.contains('mode-sell');
      console.log(`[FXVision] Mode Switched: ${isSell ? 'SELLER' : 'BUYER'}`);
    });
  }

    function setupPowerLogic(ui) {
    if (!ui.powerBtn || !ui.statusDot) return;

    let simulationInterval = null;

    const runStep = () => {
      if (!ui.percentVal) return;
      const randomPercent = (Math.random() * (99 - 85) + 85).toFixed(1);
      ui.percentVal.textContent = randomPercent + '%';
    };

    const start = () => {
      // PREVENT STACKING: Strictly clear before starting
      if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
      }
      
      if (ui.radar) ui.radar.classList.add('active');
      runStep();
      simulationInterval = setInterval(runStep, 1000);
    };

    const stop = (reset = true) => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
      }
      if (ui.radar) ui.radar.classList.remove('active');
      if (reset && ui.percentVal) ui.percentVal.textContent = '0.0%';
    };

    ui.powerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = ui.statusDot.classList.toggle('active');
      ui.powerBtn.classList.toggle('on', isActive);

      if (isActive) {
        start();
        ui.powerBtn.textContent = 'RUNNING...';
      } else {
        // BIND TO POWER STATE: Stop and reset percent immediately
        stop(true);
        ui.powerBtn.textContent = 'TURN ON';
      }
    });

    // Attach simulation control to ui for visibility handler
    ui._simulation = { start, stop };
  }

  function setupVisibilityHandling(ui) {
    document.addEventListener('visibilitychange', () => {
      if (!ui._simulation) return;

      // PAUSE ON HIDDEN: Save CPU/Memory
      if (document.hidden) {
        ui._simulation.stop(false); // Stop interval but keep current text displayed
      } else {
        // RESUME ON VISIBLE: Only if power button is 'ON'
        const isPowerOn = ui.statusDot && ui.statusDot.classList.contains('active');
        if (isPowerOn) {
          ui._simulation.start();
        }
      }
    });
  }

  // Execute initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBot);
  } else {
    initializeBot();
  }

})();

