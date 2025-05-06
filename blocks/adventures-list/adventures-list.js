const AEM_PUBLISH_URL = 'https://publish-p82652-e710588.adobeaemcloud.com';

function createErrorState(message) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'adventures-error';

  const icon = document.createElement('div');
  icon.className = 'adventures-error-icon';
  icon.innerHTML = '⚠️';

  const text = document.createElement('div');
  text.className = 'adventures-error-text';
  text.innerHTML = `<h3>Unable to Load Adventures</h3><p>${message}</p>`;

  errorContainer.appendChild(icon);
  errorContainer.appendChild(text);
  return errorContainer;
}

async function fetchAdventures() {
  try {
    const response = await fetch(`${AEM_PUBLISH_URL}/graphql/execute.json/wknd-shared/adventures-all`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data?.data?.adventureList?.items) {
      throw new Error('Invalid data format received');
    }
    // eslint-disable-next-line no-console
    console.log('First adventure properties:', Object.keys(data.data.adventureList.items[0]));
    // eslint-disable-next-line no-console
    console.log('First adventure:', JSON.stringify(data.data.adventureList.items[0], null, 2));
    return data.data.adventureList.items;
  } catch (error) {
    console.error('Error fetching adventures:', error);
    throw error; // Re-throw to handle in the decorate function
  }
}

function createAdventureCard(adventure) {
  const link = document.createElement('a');
  // eslint-disable-next-line no-underscore-dangle
  const pathParts = adventure._path.split('/adventures/')[1].split('/');
  const slug = pathParts[0];
  link.href = `/adventures/${slug}`;
  link.className = 'adventure-card-link';

  const card = document.createElement('div');
  card.className = 'adventure-card';
  // Add Universal Editor instrumentation
  // eslint-disable-next-line no-underscore-dangle
  card.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/jcr:content/data/master`);
  card.setAttribute('data-aue-type', 'container');
  card.setAttribute('data-aue-label', 'Adventure Card');

  // eslint-disable-next-line no-underscore-dangle
  const fullImageUrl = `${AEM_PUBLISH_URL}${adventure.primaryImage._dynamicUrl}`;

  const picture = document.createElement('picture');
  // eslint-disable-next-line no-underscore-dangle
  picture.setAttribute('data-aue-resource', `urn:aemconnection:${adventure.primaryImage._path}`);
  picture.setAttribute('data-aue-type', 'media');
  picture.setAttribute('data-aue-prop', 'primaryImage');
  picture.setAttribute('data-aue-label', 'Adventure Image');

  const sourceLarge = document.createElement('source');
  sourceLarge.media = '(min-width: 600px)';
  sourceLarge.srcset = `${fullImageUrl}&width=400`;

  const sourceSmall = document.createElement('source');
  sourceSmall.srcset = `${fullImageUrl}&width=200`;

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.alt = adventure.title;
  img.src = `${fullImageUrl}&width=400`;

  picture.appendChild(sourceLarge);
  picture.appendChild(sourceSmall);
  picture.appendChild(img);

  const content = document.createElement('div');
  content.className = 'adventure-content';

  const title = document.createElement('h3');
  title.textContent = adventure.title;
  // eslint-disable-next-line no-underscore-dangle
  title.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}`);
  title.setAttribute('data-aue-type', 'text');
  title.setAttribute('data-aue-prop', 'title');
  title.setAttribute('data-aue-label', 'Adventure Title');

  const description = document.createElement('p');
  description.textContent = adventure.description;
  // eslint-disable-next-line no-underscore-dangle
  description.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}`);
  description.setAttribute('data-aue-type', 'richtext');
  description.setAttribute('data-aue-prop', 'description');
  description.setAttribute('data-aue-label', 'Adventure Description');

  content.appendChild(title);
  content.appendChild(description);
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
