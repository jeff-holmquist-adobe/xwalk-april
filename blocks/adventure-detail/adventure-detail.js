const AEM_PUBLISH_URL = 'https://publish-p82652-e1522149.adobeaemcloud.com';

async function fetchAdventureBySlug(slug) {
  try {
    const query = `{
      adventureBySlug(_path: "/content/dam/wknd-shared/en/adventures/${slug}") {
        item {
          _path
          title
          activity
          adventureType
          price
          tripLength
          groupSize
          difficulty
          primaryImage {
            ... on ImageRef {
              _path
              _dynamicUrl
            }
          }
          description {
            json
          }
          itinerary {
            json
          }
        }
      }
    }`;

    const response = await fetch(`${AEM_PUBLISH_URL}/graphql/execute.json/wknd-shared/adventure-by-slug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // eslint-disable-next-line no-console
    console.log('Adventure data:', data);
    return data.data.adventureBySlug.item;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching adventure:', error);
    return null;
  }
}

function createAdventureDetail(adventure) {
  const container = document.createElement('div');
  container.className = 'adventure-detail-container';

  // Create header section with title and activity
  const header = document.createElement('header');
  header.className = 'adventure-header';

  const title = document.createElement('h1');
  title.textContent = adventure.title;

  const activity = document.createElement('p');
  activity.className = 'activity-type';
  activity.textContent = adventure.activity;

  header.appendChild(title);
  header.appendChild(activity);

  // Create main image section
  const imageContainer = document.createElement('div');
  imageContainer.className = 'adventure-image';

  const img = document.createElement('img');
  // eslint-disable-next-line no-underscore-dangle
  img.src = `${AEM_PUBLISH_URL}${adventure.primaryImage._dynamicUrl}`;
  img.alt = adventure.title;
  img.loading = 'eager'; // Load immediately as it's the main content
  imageContainer.appendChild(img);

  // Create info section
  const info = document.createElement('div');
  info.className = 'adventure-info';

  const details = document.createElement('div');
  details.className = 'adventure-details';

  const tripLength = document.createElement('p');
  tripLength.innerHTML = `<strong>Duration:</strong> ${adventure.tripLength}`;

  const difficulty = document.createElement('p');
  difficulty.innerHTML = `<strong>Difficulty:</strong> ${adventure.difficulty}`;

  const price = document.createElement('p');
  price.innerHTML = `<strong>Price:</strong> $${adventure.price}`;

  const groupSize = document.createElement('p');
  groupSize.innerHTML = `<strong>Group Size:</strong> ${adventure.groupSize}`;

  details.appendChild(tripLength);
  details.appendChild(difficulty);
  details.appendChild(price);
  details.appendChild(groupSize);

  // Create description section
  const description = document.createElement('div');
  description.className = 'adventure-description';
  description.innerHTML = adventure.description.json;

  // Create itinerary section if available
  let itinerary;
  if (adventure.itinerary?.json) {
    itinerary = document.createElement('div');
    itinerary.className = 'adventure-itinerary';
    const itineraryTitle = document.createElement('h2');
    itineraryTitle.textContent = 'Itinerary';
    itinerary.appendChild(itineraryTitle);
    itinerary.innerHTML += adventure.itinerary.json;
  }

  // Assemble all sections
  container.appendChild(header);
  container.appendChild(imageContainer);
  container.appendChild(info);
  info.appendChild(details);
  container.appendChild(description);
  if (itinerary) {
    container.appendChild(itinerary);
  }

  return container;
}

export default async function decorate(block) {
  // Get the adventure slug from the URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('adventure');

  if (!slug) {
    // eslint-disable-next-line no-console
    console.error('Adventure slug not provided in URL');
    return;
  }

  const adventure = await fetchAdventureBySlug(slug);
  if (!adventure) {
    // eslint-disable-next-line no-console
    console.error(`Adventure not found for slug: ${slug}`);
    return;
  }

  const adventureDetail = createAdventureDetail(adventure);
  block.textContent = '';
  block.appendChild(adventureDetail);
}
