'use client';

import { api } from '@/apis/axios';
import APIConfig from '@/apis/config';
import { USER_INFO } from '@/config/constants';

// Generate session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Get user ID from localStorage
const getUserId = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userInfo = localStorage.getItem(USER_INFO);
    if (userInfo) {
      const user = JSON.parse(userInfo);
      return user._id || user.id || null;
    }
  } catch (error) {
    console.error('Error parsing user info:', error);
  }
  
  return null;
};

// Track a single event
export const trackEvent = async (eventData) => {
  try {
    const userId = getUserId();
    const sessionId = getSessionId();

    // Only track if user is logged in (userId available)
    if (!userId) {
      return;
    }

    const event = {
      userId,
      eventType: eventData.eventType,
      entityType: eventData.entityType,
      entityId: eventData.entityId || null,
      metadata: {
        ...eventData.metadata,
        url: typeof window !== 'undefined' ? window.location.href : null,
        referrer: typeof window !== 'undefined' ? document.referrer : null,
        timestamp: new Date().toISOString()
      },
      sessionId
    };

    // Send to API (non-blocking)
    api.post(`${APIConfig.base}/behavior/track`, event).catch(err => {
      console.error('Error tracking event:', err);
    });
  } catch (error) {
    console.error('Error in trackEvent:', error);
  }
};

// Track product view
export const trackProductView = (productId, metadata = {}) => {
  return trackEvent({
    eventType: 'view',
    entityType: 'product',
    entityId: productId,
    metadata
  });
};

// Track click
export const trackClick = (entityType, entityId, metadata = {}) => {
  return trackEvent({
    eventType: 'click',
    entityType,
    entityId,
    metadata
  });
};

// Track search
export const trackSearch = (query, resultsCount = 0) => {
  return trackEvent({
    eventType: 'search',
    entityType: 'search',
    entityId: query,
    metadata: {
      query,
      resultsCount
    }
  });
};

// Track scroll
export const trackScroll = (scrollDepth, url) => {
  return trackEvent({
    eventType: 'scroll',
    entityType: 'page',
    entityId: url,
    metadata: {
      scrollDepth
    }
  });
};

// Track time on page
export const trackTimeOnPage = (timeOnPage, url) => {
  return trackEvent({
    eventType: 'view',
    entityType: 'page',
    entityId: url,
    metadata: {
      timeOnPage
    }
  });
};

// Track navigation
export const trackNavigation = (fromUrl, toUrl) => {
  return trackEvent({
    eventType: 'navigation',
    entityType: 'page',
    entityId: toUrl,
    metadata: {
      fromUrl,
      toUrl
    }
  });
};

// Track add to cart
export const trackAddToCart = (productId, quantity = 1, metadata = {}) => {
  return trackEvent({
    eventType: 'add_to_cart',
    entityType: 'product',
    entityId: productId,
    metadata: {
      quantity,
      ...metadata
    }
  });
};

// Track remove from cart
export const trackRemoveFromCart = (productId, quantity = 1, reason = null, metadata = {}) => {
  return trackEvent({
    eventType: 'remove_from_cart',
    entityType: 'product',
    entityId: productId,
    metadata: {
      quantity,
      reason: reason || 'user_action',
      ...metadata
    }
  });
};

// Track checkout start
export const trackCheckoutStart = (metadata = {}) => {
  return trackEvent({
    eventType: 'checkout_start',
    entityType: 'page',
    entityId: typeof window !== 'undefined' ? window.location.href : null,
    metadata
  });
};

// Track purchase
export const trackPurchase = (orderId, total, items = [], metadata = {}) => {
  return trackEvent({
    eventType: 'purchase',
    entityType: 'page',
    entityId: orderId,
    metadata: {
      orderId,
      total,
      itemsCount: items.length,
      ...metadata
    }
  });
};

