// ============================================================================
// AUTHENTICATION & HEADERS
// ============================================================================

import { captureError } from './logger.js';
import { getCookie } from './utils.js';
import { CONFIG } from './config.js';

export const getAuthToken = () => {
  const token = getCookie('luat');
  if (!token) {
    const error = new Error('Token d\'authentification non trouvé');
    captureError(error, { action: 'getAuthToken' });
    throw error;
  }
  return token;
};

export const buildExperimentHeader = () => {
  const cnfdVisitorId = getCookie('cnfdVisitorId');
  const experimentData = {
    version: 1,
    rollout_visitor_id: cnfdVisitorId || ''
  };
  return btoa(JSON.stringify(experimentData));
};

export const buildHeaders = (authToken, experimentHeader, referer) => ({
  accept: CONFIG.headers.accept,
  'accept-language': CONFIG.headers.acceptLanguage,
  authorization: `Bearer ${authToken}`,
  'content-type': CONFIG.headers.contentType,
  origin: CONFIG.headers.origin,
  referer,
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'x-lbc-experiment': experimentHeader
});

