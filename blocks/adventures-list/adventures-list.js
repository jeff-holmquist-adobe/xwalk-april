// eslint-disable-next-line no-console -- Debugging Universal Editor context
console.log('[adventures-list] window.location.href:', window.location.href);

import {
  isAuthor,
  AEM_PUBLISH_URL,
  AEM_AUTHOR_URL,
  createErrorState,
} from '../../utils/aem-content.js';

function getGraphqlUrl() {
  const url = isAuthor() ? AEM_AUTHOR_URL : AEM_PUBLISH_URL;
  // eslint-disable-next-line no-console -- Debugging GraphQL endpoint selection
  console.log('[adventures-list] Using GraphQL endpoint:', url);
  return url;
}

async function fetchAdventures() {
  try {
    const fetchUrl = `${getGraphqlUrl()}/graphql/execute.json/wknd-shared/adventures-all`;
    // eslint-disable-next-line no-console -- Debugging Universal Editor context
    console.log('[adventures-list] Fetching adventures from:', fetchUrl);
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // eslint-disable-next-line no-console -- Debugging Universal Editor context
    console.log('[adventures-list] Data received:', data);
    if (!data?.data?.adventureList?.items) {
      throw new Error('Invalid data format received');
    }
    // eslint-disable-next-line no-console -- Debugging Universal Editor context
    console.log('[adventures-list] First adventure:', data.data.adventureList.items[0]);
    return data.data.adventureList.items;
  } catch (error) {
    // eslint-disable-next-line no-console -- Debugging Universal Editor context
    console.error('[adventures-list] Error fetching adventures:', error);
    throw error; // Re-throw to handle in the decorate function
  }
}

function getAdventureDetailUrl(slug) {
  return isAuthor()
    ? `/content/xwalk-april/adventures/${slug}`
    : `/adventures/${slug}`;
}

function createAdventureCard(adventure) {
  // eslint-disable-next-line no-console -- Debugging Universal Editor context
  console.log('[adventures-list] Rendering card:', { title: adventure.title, slug: adventure.slug, primaryImage: adventure.primaryImage });

  let imageUrl = '';
  if (isAuthor() && adventure.primaryImage._authorUrl) {
    imageUrl = adventure.primaryImage._authorUrl;
  } else if (adventure.primaryImage._dynamicUrl) {
    imageUrl = `${AEM_PUBLISH_URL}${adventure.primaryImage._dynamicUrl}`;
  } else if (adventure.primaryImage._publishUrl) {
    imageUrl = adventure.primaryImage._publishUrl;
  }

  const link = document.createElement('a');
  const pathParts = adventure._path.split('/adventures/')[1].split('/');
  const slug = pathParts[0];
  link.href = getAdventureDetailUrl(slug);
  link.className = 'adventure-card-link';

  const card = document.createElement('div');
  card.className = 'adventure-card';
  // Add Universal Editor instrumentation
  card.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/jcr:content/data/master`);
  card.setAttribute('data-aue-type', 'reference');
  card.setAttribute('data-aue-filter', 'cf');
  card.setAttribute('data-aue-label', `Content Fragment ${adventure._path}`);

  const picture = document.createElement('picture');
  picture.setAttribute('data-aue-prop', 'primaryImage');
  picture.setAttribute('data-aue-type', 'media');
  picture.setAttribute('data-aue-label', 'Adventure Image');

  const sourceLarge = document.createElement('source');
  sourceLarge.media = '(min-width: 600px)';
  sourceLarge.srcset = imageUrl;

  const sourceSmall = document.createElement('source');
  sourceSmall.srcset = imageUrl;

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = adventure.title;
  img.src = imageUrl;

  picture.appendChild(sourceLarge);
  picture.appendChild(sourceSmall);
  picture.appendChild(img);

  const content = document.createElement('div');
  content.className = 'adventure-content';

  const title = document.createElement('h3');
  title.textContent = adventure.title;
  title.setAttribute('data-aue-prop', 'title');
  title.setAttribute('data-aue-type', 'text');
  title.setAttribute('data-aue-label', 'Adventure Title');

  content.appendChild(title);
  card.appendChild(picture);
  card.appendChild(content);

  link.appendChild(card);
  return link;
}

export default async function decorate(block) {
  try {
    const adventures = await fetchAdventures();
    const container = document.createElement('div');
    container.className = 'adventures-grid';

    adventures.forEach((adventure) => {
      const card = createAdventureCard(adventure);
      container.appendChild(card);
    });

    block.textContent = '';
    block.appendChild(container);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load adventures:', error);
    let errorMessage = 'We\'re having trouble connecting to our adventure database. ';
    if (error.message.includes('Failed to fetch')) {
      errorMessage += 'This might be because our servers are currently hibernating. Please try again in a few minutes.';
    } else {
      errorMessage += 'Please try again later.';
    }
    block.textContent = '';
    block.appendChild(createErrorState(errorMessage));
  }
}
