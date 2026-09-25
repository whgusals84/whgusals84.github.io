(() => {
  const measurementId = 'G-V2QQ024NEN';
  const consentKey = 'pixn-analytics-consent';

  const readConsent = () => {
    try {
      return localStorage.getItem(consentKey);
    } catch {
      return null;
    }
  };

  const writeConsent = (value) => {
    try {
      localStorage.setItem(consentKey, value);
    } catch {
      // The notice remains available when storage is disabled.
    }
  };

  const revokeCookies = () => {
    const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (name === '_ga' || name.startsWith('_ga_')) document.cookie = `${name}=; ${expiry}`;
    }
  };

  const updateConsent = (value) => {
    window.gtag?.('consent', 'update', {
      analytics_storage: value,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  };

  const loadAnalytics = () => {
    if (document.querySelector('[data-site-analytics]')) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(...args) {
      window.dataLayer.push(args);
    };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true });

    const tag = document.createElement('script');
    tag.async = true;
    tag.dataset.siteAnalytics = 'true';
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(tag);
  };

  const removeNotice = () => document.querySelector('[data-analytics-consent]')?.remove();

  const showNotice = (force = false) => {
    if (document.querySelector('[data-analytics-consent]')) return;

    const consent = readConsent();
    if (!force && consent === 'granted') {
      loadAnalytics();
      return;
    }
    if (!force && consent === 'denied') return;

    const notice = document.createElement('section');
    notice.className = 'analytics-consent';
    notice.dataset.analyticsConsent = 'true';
    notice.setAttribute('role', 'region');
    notice.setAttribute('aria-label', 'Analytics cookie choice');
    notice.innerHTML = `
      <p>This site uses optional analytics cookies to understand traffic. <a href="./privacy.html">Learn more</a></p>
      <div class="analytics-consent-actions">
        <button type="button" data-analytics-reject>Reject</button>
        <button type="button" data-analytics-accept>Accept analytics</button>
      </div>`;

    notice.querySelector('[data-analytics-reject]').addEventListener('click', () => {
      writeConsent('denied');
      updateConsent('denied');
      revokeCookies();
      removeNotice();
    });
    notice.querySelector('[data-analytics-accept]').addEventListener('click', () => {
      writeConsent('granted');
      loadAnalytics();
      removeNotice();
    });
    document.body.append(notice);
  };

  const utility = document.createElement('div');
  utility.className = 'analytics-utility';
  utility.innerHTML = `<a href="./privacy.html">Privacy</a><button type="button" data-analytics-preferences>Analytics preferences</button>`;
  document.body.append(utility);

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-analytics-preferences]')) return;
    event.preventDefault();
    showNotice(true);
  });

  showNotice();
})();
