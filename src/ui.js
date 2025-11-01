// ============================================================================
// UI & DOM MANAGEMENT
// ============================================================================

import { captureError, captureMessage, LEVELS } from './logger.js';
import { debounce, extractListId } from './utils.js';
import { NotificationManager } from './notifications.js';
import { fetchAdData, deleteAd, createAdViaAPI } from './api.js';
import { CONFIG } from './config.js';

// ============================================================================
// USER INTERACTION
// ============================================================================

const promptForNewPrice = (currentPrice) => {
  const pricePrompt = `Prix actuel: ${currentPrice} €\n\nEntrez le nouveau prix (en euros) ou laissez vide pour garder le prix actuel:`;
  const input = prompt(pricePrompt, currentPrice);

  if (input === null) {
    return null;
  }

  if (input.trim() === '') {
    return currentPrice;
  }

  const newPrice = parseFloat(input.trim());

  if (isNaN(newPrice) || newPrice <= 0) {
    throw new Error('Prix invalide. Veuillez entrer un nombre positif.');
  }

  return newPrice;
};

const confirmRepublish = (adData) => confirm(
  '✅ Prêt à republier:\n\n' +
    `📋 ${adData.subject}\n` +
    `💰 ${adData.price} €\n` +
    `📁 ${adData.category_name}\n\n` +
    'Lancer la republication automatique?'
);

// ============================================================================
// REPUBLISH WORKFLOW
// ============================================================================

const handleRepublishClick = async (listId) => {
  console.log(`Republication de l'annonce ${listId}...`);
  captureMessage(`Starting republish process`, LEVELS.info);

  const loadingNotif = NotificationManager.show(NotificationManager.loading('Chargement des données...'));

  try {
    const adData = await fetchAdData(listId);
    loadingNotif.remove();

    const newPrice = promptForNewPrice(adData.price);
    if (newPrice === null) {
      captureMessage(`Republish cancelled by user`, LEVELS.info);
      return;
    }

    const updatedAdData = { ...adData, price: newPrice };

    if (!confirmRepublish(updatedAdData)) {
      console.log('Republication annulée');
      captureMessage(`Republish cancelled by user confirmation`, LEVELS.info);
      return;
    }

    const publishingNotif = NotificationManager.show(NotificationManager.publishing());
    const adId = await createAdViaAPI(updatedAdData);
    publishingNotif.remove();

    const deletingNotif = NotificationManager.show(NotificationManager.deleting());
    await deleteAd(listId);
    deletingNotif.remove();

    const successNotif = NotificationManager.show(NotificationManager.success(adId));
    NotificationManager.fadeOut(successNotif, CONFIG.delays.notificationFade);

    captureMessage(`Republish completed successfully`, LEVELS.info);

    setTimeout(() => {
      console.log('Rechargement de la page...');
      window.location.reload();
    }, CONFIG.delays.pageReload);

  } catch (error) {
    console.error('Erreur de republication:', error);
    captureError(error, {
      action: 'handleRepublishClick',
      step: 'republish_process'
    });

    NotificationManager.removeMultiple('lbc-loading', 'lbc-deleting', 'lbc-publishing');

    const errorNotif = NotificationManager.show(NotificationManager.error(error.message));
    setTimeout(() => errorNotif.remove(), CONFIG.delays.notificationError);
  }
};

// ============================================================================
// BUTTON INJECTION
// ============================================================================

const createRepublishButton = (listId) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'shrink-0 grow-0 md:basis-auto basis-[calc(50%-1rem)]';
  wrapper.innerHTML = `
    <button
      data-lbc-republish-btn="${listId}"
      data-spark-component="button"
      type="button"
      class="u-shadow-border-transition box-border inline-flex items-center justify-center gap-md whitespace-nowrap default:px-lg text-body-1 font-bold focus-visible:u-outline min-w-sz-44 h-sz-44 rounded-lg cursor-pointer w-full"
      style="background: linear-gradient(135deg, #ff8a4a 0%, #ec5a13 100%); color: white;"
      onmouseover="this.style.transform='scale(1.02)'"
      onmouseout="this.style.transform='scale(1)'"
      aria-busy="false"
      aria-live="off"
      title="Republier cette annonce">✨ Republier</button>
    `;

  const button = wrapper.querySelector('button');
  button.addEventListener('click', () => handleRepublishClick(listId));
  return wrapper;
};

const shouldInjectButton = (adItem) => {
  if (adItem.querySelector(CONFIG.selectors.republishButton)) {
    return false;
  }

  const adLink = adItem.querySelector(CONFIG.selectors.adLink);
  if (!adLink) return false;

  const listId = extractListId(adLink.getAttribute('href'));
  if (!listId) return false;

  const buttonContainer = adItem.querySelector(CONFIG.selectors.buttonContainer);
  if (!buttonContainer) return false;

  return { listId, buttonContainer };
};

export const injectRepublishButtons = () => {
  console.log('Injection des boutons de republication...');

  try {
    const adItems = document.querySelectorAll(CONFIG.selectors.adContainer);
    let injectedCount = 0;

    adItems.forEach(adItem => {
      const result = shouldInjectButton(adItem);
      if (result) {
        const { listId, buttonContainer } = result;
        const republishButton = createRepublishButton(listId);
        buttonContainer.appendChild(republishButton);
        injectedCount++;
      }
    });

    console.log(`✓ ${injectedCount} boutons injectés sur ${adItems.length} annonces`);
    if (injectedCount > 0) {
      captureMessage(`Injected buttons`, LEVELS.info, { count: injectedCount, total: adItems.length });
    }
  } catch (error) {
    captureError(error, { action: 'injectRepublishButtons' });
    console.error('Erreur lors de l\'injection des boutons:', error);
  }
};

// ============================================================================
// DOM OBSERVER
// ============================================================================

const debouncedInject = debounce(injectRepublishButtons, CONFIG.delays.buttonInjection);

const hasAdContainerChanges = (mutations) => {
  return mutations.some(mutation =>
    Array.from(mutation.addedNodes).some(node => {
      if (node.nodeType !== 1) return false;
      return node.matches?.(CONFIG.selectors.adContainer) ||
             node.querySelector?.(CONFIG.selectors.adContainer);
    })
  );
};

export const observeAdChanges = () => {
  const observer = new MutationObserver((mutations) => {
    if (hasAdContainerChanges(mutations)) {
      console.log('Annonces modifiées, ré-injection des boutons...');
      debouncedInject();
    }
  });

  // Watch the ad list container specifically, fallback to body if not found
  const adListContainer = document.querySelector(CONFIG.selectors.adListContainer);
  const targetElement = adListContainer || document.body;

  observer.observe(targetElement, {
    childList: true,
    subtree: true
  });

  console.log(`Observer attaché à: ${adListContainer ? 'ad-list-container' : 'document.body'}`);
};

export const scheduleRetries = () => {
  CONFIG.delays.retryAttempts.forEach(delay => {
    setTimeout(injectRepublishButtons, delay);
  });
};

