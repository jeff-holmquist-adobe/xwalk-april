const AEM_PUBLISH_URL = 'https://publish-p82652-e710588.adobeaemcloud.com';

function createErrorState(message) {
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

async function fetchAdventureBySlug(slug) {
  try {
    const response = await fetch(`${AEM_PUBLISH_URL}/graphql/execute.json/wknd-shared/adventure-by-slug;slug=${slug}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data?.data) {
      throw new Error('Invalid data format received');
    }

    const adventure = data.data.adventureBySlug || data.data.adventureList?.items?.[0];
    if (!adventure) {
      throw new Error('Adventure not found');
    }

    return adventure;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching adventure:', error);
    throw error; // Re-throw to handle in the decorate function
  }
}

function createAdventureDetail(adventure) {
  if (!adventure) return null;

  const detail = document.createElement('div');
  detail.className = 'adventure-detail';
  // eslint-disable-next-line no-underscore-dangle
  detail.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/master`);
  detail.setAttribute('data-aue-type', 'reference');
  detail.setAttribute('data-aue-label', 'Adventure Detail');
  detail.setAttribute('data-aue-variation', 'master');

  const header = document.createElement('div');
  header.className = 'adventure-header';

  const title = document.createElement('h1');
  title.textContent = adventure.title;
  // eslint-disable-next-line no-underscore-dangle
  title.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/master`);
  title.setAttribute('data-aue-type', 'reference');
  title.setAttribute('data-aue-label', 'Adventure Title');
  title.setAttribute('data-aue-variation', 'master');
  header.appendChild(title);

  if (adventure.activity) {
    const activity = document.createElement('p');
    activity.className = 'activity';
    activity.textContent = adventure.activity;
    // eslint-disable-next-line no-underscore-dangle
    activity.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/master`);
    activity.setAttribute('data-aue-type', 'reference');
    activity.setAttribute('data-aue-label', 'Adventure Activity');
    activity.setAttribute('data-aue-variation', 'master');
    header.appendChild(activity);
  }

  detail.appendChild(header);

  if (adventure.primaryImage) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'adventure-image-container';
    // eslint-disable-next-line no-underscore-dangle
    imageContainer.setAttribute('data-aue-resource', `urn:aemconnection:${adventure.primaryImage._path}/master`);
    imageContainer.setAttribute('data-aue-type', 'reference');
    imageContainer.setAttribute('data-aue-label', 'Adventure Image');
    imageContainer.setAttribute('data-aue-variation', 'master');

    const image = document.createElement('img');
    // eslint-disable-next-line no-underscore-dangle
    const imageUrl = adventure.primaryImage._dynamicUrl || adventure.primaryImage.dynamicUrl;
    image.src = `${AEM_PUBLISH_URL}${imageUrl}`;
    image.alt = adventure.title;
    image.className = 'adventure-image';
    image.loading = 'eager';
    imageContainer.appendChild(image);
    detail.appendChild(imageContainer);
  }

  const content = document.createElement('div');
  content.className = 'adventure-content';

  const info = document.createElement('div');
  info.className = 'adventure-info';
  // eslint-disable-next-line no-underscore-dangle
  info.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/master`);
  info.setAttribute('data-aue-type', 'reference');
  info.setAttribute('data-aue-label', 'Adventure Info');
  info.setAttribute('data-aue-variation', 'master');

  const details = [
    { label: 'Price', value: `$${adventure.price}` },
    { label: 'Trip Length', value: adventure.tripLength },
    { label: 'Group Size', value: `${adventure.groupSize} people` },
    { label: 'Difficulty', value: adventure.difficulty },
  ];

  details.forEach(({ label, value }) => {
    if (value) {
      const detailItem = document.createElement('div');
      detailItem.className = 'detail-item';
      detailItem.innerHTML = `<strong>${label}:</strong> ${value}`;
      // eslint-disable-next-line no-underscore-dangle
      detailItem.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/master`);
      detailItem.setAttribute('data-aue-type', 'reference');
      detailItem.setAttribute('data-aue-label', `${label} Detail`);
      detailItem.setAttribute('data-aue-variation', 'master');
      info.appendChild(detailItem);
    }
  });

  content.appendChild(info);

  if (adventure.description?.html) {
    const description = document.createElement('div');
    description.className = 'adventure-description';
    description.innerHTML = adventure.description.html;
    // eslint-disable-next-line no-underscore-dangle
    description.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/master`);
    description.setAttribute('data-aue-type', 'reference');
    description.setAttribute('data-aue-label', 'Adventure Description');
    description.setAttribute('data-aue-variation', 'master');
    content.appendChild(description);
  }

  if (adventure.itinerary?.html) {
    const itinerary = document.createElement('div');
    itinerary.className = 'adventure-itinerary';
    itinerary.innerHTML = adventure.itinerary.html;
    // eslint-disable-next-line no-underscore-dangle
    itinerary.setAttribute('data-aue-resource', `urn:aemconnection:${adventure._path}/master`);
    itinerary.setAttribute('data-aue-type', 'reference');
    itinerary.setAttribute('data-aue-label', 'Adventure Itinerary');
    itinerary.setAttribute('data-aue-variation', 'master');
    content.appendChild(itinerary);
  }

  detail.appendChild(content);

  return detail;
}

export default async function decorate(block) {
  try {
    const slug = window.location.pathname.split('/adventures/')[1];
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
    // eslint-disable-next-line no-console
    console.error('Failed to load adventure:', error);
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
