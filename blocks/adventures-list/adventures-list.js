import { createOptimizedPicture } from '../../scripts/aem.js';

async function fetchAdventures() {
  try {
    const response = await fetch('https://author-p82652-e1522149.adobeaemcloud.com/graphql/execute.json/wknd-shared/adventures-all');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data.adventureList.items;
  } catch (error) {
    console.error('Error fetching adventures:', error);
    return [];
  }
}

function createAdventureCard(adventure) {
  const card = document.createElement('div');
  card.className = 'adventure-card';

  const picture = createOptimizedPicture(adventure.primaryImage._path, adventure.title, false, [
    { media: '(min-width: 600px)', width: '400' },
    { width: '200' },
  ]);

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

  return card;
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