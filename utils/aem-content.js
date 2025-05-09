export const AEM_PUBLISH_URL = 'https://publish-p82652-e710588.adobeaemcloud.com';
export const AEM_AUTHOR_URL = 'https://author-p82652-e710588.adobeaemcloud.com';

export function isAuthor() {
  return window.location.hostname.includes('author-') && window.location.hostname.includes('adobeaemcloud.com');
}

export function getAdventureDetailSlug() {
  const match = window.location.pathname.match(/\/adventures\/([^/.]+)/);
  return match ? match[1] : null;
}

export async function fetchAdventureBySlug(slug) {
  const baseUrl = isAuthor() ? AEM_AUTHOR_URL : AEM_PUBLISH_URL;
  const response = await fetch(`${baseUrl}/graphql/execute.json/wknd-shared/adventure-by-slug;slug=${slug}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    mode: 'cors',
    credentials: 'include',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (!data?.data) throw new Error('Invalid data format received');
  const adventure = data.data.adventureBySlug || data.data.adventureList?.items?.[0];
  if (!adventure) throw new Error('Adventure not found');
  return adventure;
}

export function createErrorState(message) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'adventure-error';

  const icon = document.createElement('div');
  icon.className = 'adventure-error-icon';
  icon.innerHTML = '⚠️';

  const text = document.createElement('div');
  text.className = 'adventure-error-text';
  text.innerHTML = `<h2>Unable to Load Adventure</h2><p>${message}</p>`;

  errorContainer.appendChild(icon);
  errorContainer.appendChild(text);
  return errorContainer;
} 