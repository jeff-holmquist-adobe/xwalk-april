// import { createOptimizedPicture } from '../../scripts/aem.js';

const AEM_PUBLISH_URL = 'https://publish-p82652-e1522149.adobeaemcloud.com';

async function fetchAdventures() {
  try {
    const response = await fetch(`${AEM_PUBLISH_URL}/graphql/execute.json/wknd-shared/adventures-all`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // eslint-disable-next-line no-console
    console.log('GraphQL Response:', data);
    return data.data.adventureList.items;
  } catch (error) {
    // Log error but don't break the UI
    // eslint-disable-next-line no-console
    console.error('Error fetching adventures:', error);
    return [];
  }
}

function createAdventureCard(adventure) {
  // Create the anchor element
  const link = document.createElement('a');
  link.href = `/content/xwalk-april/index/examples/adventure?data=${encodeURIComponent(JSON.stringify(adventure))}`;
  link.className = 'adventure-link';

  const card = document.createElement('div');
  card.className = 'adventure-card';

  // Use the dynamic URL for optimized images
  const imageUrl = adventure.primaryImage.dynamicUrl || adventure.primaryImage.path;
  const fullImageUrl = imageUrl.startsWith('http')
    ? imageUrl
    : `${AEM_PUBLISH_URL}${imageUrl}`;

  // Create picture element manually
  const picture = document.createElement('picture');

  // Create source elements for different breakpoints
  const sourceLarge = document.createElement('source');
  sourceLarge.setAttribute('media', '(min-width: 600px)');
  sourceLarge.setAttribute('srcset', `${fullImageUrl}?width=400&format=webply&optimize=medium`);
  sourceLarge.setAttribute('type', 'image/webp');

  const sourceSmall = document.createElement('source');
  sourceSmall.setAttribute('srcset', `${fullImageUrl}?width=200&format=webply&optimize=medium`);
  sourceSmall.setAttribute('type', 'image/webp');

  // Create fallback img element
  const img = document.createElement('img');
  img.setAttribute('loading', 'lazy');
  img.setAttribute('alt', adventure.title);
  img.setAttribute('src', `${fullImageUrl}?width=200&format=jpeg&optimize=medium`);

  picture.appendChild(sourceLarge);
  picture.appendChild(sourceSmall);
  picture.appendChild(img);

  const content = document.createElement('div');
  content.className = 'adventure-content';

  const title = document.createElement('h3');
  title.textContent = adventure.title;

  const description = document.createElement('p');
  description.textContent = adventure.description;

  content.appendChild(title);
  content.appendChild(description);
  card.appendChild(picture);
  card.appendChild(content);

  // Add the card to the link
  link.appendChild(card);

  return link;
}

export default async function decorate(block) {
  const adventures = await fetchAdventures();
  const container = document.createElement('div');
  container.className = 'adventures-container';

  adventures.forEach((adventure) => {
    const card = createAdventureCard(adventure);
    container.appendChild(card);
  });

  block.textContent = '';
  block.appendChild(container);
}
