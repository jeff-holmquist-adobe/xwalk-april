const AEM_PUBLISH_URL = 'https://publish-p82652-e1522149.adobeaemcloud.com';

async function fetchAdventures() {
  try {
    const response = await fetch(`${AEM_PUBLISH_URL}/graphql/execute.json/wknd-shared/adventures-all`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // eslint-disable-next-line no-console
    console.log('First adventure properties:', Object.keys(data.data.adventureList.items[0]));
    // eslint-disable-next-line no-console
    console.log('First adventure:', JSON.stringify(data.data.adventureList.items[0], null, 2));
    return data.data.adventureList.items;
  } catch (error) {
    // Log error but don't break the UI
    // eslint-disable-next-line no-console
    console.error('Error fetching adventures:', error);
    return [];
  }
}

function createAdventureCard(adventure) {
  // Create the link wrapper
  const link = document.createElement('a');
  // Extract just the slug from the full path
  // eslint-disable-next-line no-underscore-dangle
  const pathParts = adventure._path.split('/adventures/')[1].split('/');
  const slug = pathParts[0];
  link.href = `/content/xwalk-april/examples/adventure?adventure=${slug}`;
  link.className = 'adventure-card-link';

  const card = document.createElement('div');
  card.className = 'adventure-card';

  // Create a full URL using the dynamic URL from AEM
  // eslint-disable-next-line no-underscore-dangle
  const fullImageUrl = `${AEM_PUBLISH_URL}${adventure.primaryImage._dynamicUrl}`;

  // Create the picture element manually since createOptimizedPicture is causing issues
  const picture = document.createElement('picture');

  // Create source elements for different breakpoints
  const sourceLarge = document.createElement('source');
  sourceLarge.media = '(min-width: 600px)';
  sourceLarge.srcset = `${fullImageUrl}&width=400`;

  const sourceSmall = document.createElement('source');
  sourceSmall.srcset = `${fullImageUrl}&width=200`;

  // Create the img element
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = adventure.title;
  img.src = `${fullImageUrl}&width=400`;

  // Assemble the picture element
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

  // Wrap the card in the link
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
