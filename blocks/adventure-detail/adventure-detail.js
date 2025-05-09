import {
  isAuthor,
  getAdventureDetailSlug,
  fetchAdventureBySlug,
  createErrorState,
  AEM_PUBLISH_URL,
} from '../../utils/aem-content.js';

function createAdventureDetail(adventure) {
  if (!adventure) return null;
  const detail = document.createElement('div');
  detail.className = 'adventure-detail';
  detail.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/jcr:content/data/master`);
  detail.setAttribute('data-aue-type', 'reference');
  detail.setAttribute('data-aue-filter', 'cf');
  detail.setAttribute('data-aue-label', `Content Fragment ${adventure._path}`);

  // Title
  const title = document.createElement('h1');
  title.textContent = adventure.title;
  title.setAttribute('data-aue-prop', 'title');
  title.setAttribute('data-aue-type', 'text');
  title.setAttribute('data-aue-label', 'Adventure Title');

  // Create header for title and activity
  const header = document.createElement('div');
  header.className = 'adventure-header';
  header.appendChild(title);
  if (adventure.activity) {
    const activity = document.createElement('p');
    activity.className = 'activity';
    activity.textContent = adventure.activity;
    activity.setAttribute('data-aue-prop', 'activity');
    activity.setAttribute('data-aue-type', 'text');
    activity.setAttribute('data-aue-label', 'Adventure Activity');
    header.appendChild(activity);
  }

  // Create image container if present
  let imageContainer = null;
  if (adventure.primaryImage) {
    imageContainer = document.createElement('div');
    imageContainer.className = 'adventure-image-container';
    imageContainer.setAttribute('data-aue-prop', 'primaryImage');
    imageContainer.setAttribute('data-aue-type', 'media');
    imageContainer.setAttribute('data-aue-label', 'Adventure Image');
    let imageUrl = '';
    if (isAuthor() && adventure.primaryImage._authorUrl) {
      imageUrl = adventure.primaryImage._authorUrl;
    } else if (adventure.primaryImage._publishUrl) {
      imageUrl = adventure.primaryImage._publishUrl;
    } else if (adventure.primaryImage._dynamicUrl) {
      imageUrl = `${AEM_PUBLISH_URL}${adventure.primaryImage._dynamicUrl}`;
    }
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = adventure.title;
    image.className = 'adventure-image';
    image.loading = 'eager';
    imageContainer.appendChild(image);
  }

  // Create hero container and append image and header
  const hero = document.createElement('div');
  hero.className = 'adventure-hero';
  if (imageContainer) hero.appendChild(imageContainer);
  hero.appendChild(header);
  detail.appendChild(hero);

  const price = document.createElement('div');
  price.className = 'detail-item';
  price.innerHTML = `<strong>Price:</strong> $${adventure.price}`;

  const tripLength = document.createElement('div');
  tripLength.className = 'detail-item';
  tripLength.innerHTML = '<strong>Trip Length:</strong> <span class=\'detail-value\'></span>';
  const tripLengthValue = tripLength.querySelector('.detail-value');
  tripLengthValue.textContent = adventure.tripLength;
  tripLengthValue.setAttribute('data-aue-prop', 'tripLength');
  tripLengthValue.setAttribute('data-aue-type', 'text');
  tripLengthValue.setAttribute('data-aue-label', 'Trip Length Detail');

  const groupSize = document.createElement('div');
  groupSize.className = 'detail-item';
  groupSize.innerHTML = `<strong>Group Size:</strong> ${adventure.groupSize} people`;

  const difficulty = document.createElement('div');
  difficulty.className = 'detail-item';
  difficulty.innerHTML = `<strong>Difficulty:</strong> ${adventure.difficulty}`;

  const detailsRow = document.createElement('div');
  detailsRow.className = 'adventure-details-row';
  detailsRow.appendChild(price);
  detailsRow.appendChild(tripLength);
  detailsRow.appendChild(groupSize);
  detailsRow.appendChild(difficulty);
  detail.appendChild(detailsRow);

  if (adventure.description?.html) {
    const description = document.createElement('div');
    description.className = 'adventure-description';
    description.innerHTML = adventure.description.html;
    description.setAttribute('data-aue-prop', 'description');
    description.setAttribute('data-aue-type', 'richtext');
    description.setAttribute('data-aue-label', 'Adventure Description');
    detail.appendChild(description);
  }

  if (adventure.itinerary?.html) {
    const itinerary = document.createElement('div');
    itinerary.className = 'adventure-itinerary';
    itinerary.innerHTML = adventure.itinerary.html;
    itinerary.setAttribute('data-aue-prop', 'itinerary');
    itinerary.setAttribute('data-aue-type', 'richtext');
    itinerary.setAttribute('data-aue-label', 'Adventure Itinerary');
    detail.appendChild(itinerary);
  }

  return detail;
}

export default async function decorate(block) {
  try {
    const slug = getAdventureDetailSlug();
    if (!slug) {
      throw new Error('Invalid adventure URL');
    }
    const adventure = await fetchAdventureBySlug(slug);
    const detail = createAdventureDetail(adventure);
    if (detail) {
      block.textContent = '';
      block.appendChild(detail);
    }
  } catch (error) {
    let errorMessage = 'We\'re having trouble loading this adventure. ';
    if (error.message.includes('Failed to fetch')) {
      errorMessage += 'This might be because our servers are currently hibernating. Please try again in a few minutes.';
    } else if (error.message.includes('not found')) {
      errorMessage += 'The adventure you\'re looking for doesn\'t exist or has been removed.';
    } else {
      errorMessage += 'Please try again later.';
    }
    block.textContent = '';
    block.appendChild(createErrorState(errorMessage));
  }
}
