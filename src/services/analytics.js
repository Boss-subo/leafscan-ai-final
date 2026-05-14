import posthog from 'posthog-js';
import { state } from '../core/state.js';

// Initialize PostHog (Sovereign Analytics Suite)
export function initAnalytics() {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY || 'phc_YourPlaceholderKeyIfNotFound';
  
  posthog.init(posthogKey, {
    api_host: 'https://app.posthog.com',
    autocapture: true, // Captures clicks and pageviews automatically
    capture_pageview: true,
    persistence: 'localStorage'
  });

  console.log("Sovereign Analytics Engine: ACTIVE");
}

/**
 * Captures a successful diagnostic scan
 * @param {Object} data - The diagnostic result data
 */
export function captureScan(data) {
  posthog.capture('scan_completed', {
    crop: data.crop || state.selectedCrop,
    disease: data.diseaseName || data.label,
    confidence: data.confidence,
    status: data.status,
    vms_stress: data.vms?.stress,
    region: state.location?.latitude ? `${state.location.latitude}, ${state.location.longitude}` : 'Unknown'
  });
}

/**
 * Captures user authentication events
 */
export function captureAuth(method, userId, isGuest = false) {
  if (!isGuest) posthog.identify(userId);
  posthog.capture('user_authenticated', { method, is_guest: isGuest });
}

/**
 * Captures AI Pathologist consultations
 */
export function captureConsultation(query) {
  posthog.capture('ai_consultation', { query_length: query.length });
}
