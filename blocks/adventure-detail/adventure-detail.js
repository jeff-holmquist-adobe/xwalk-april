const AEM_PUBLISH_URL = 'https://publish-p82652-e1522149.adobeaemcloud.com';

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
      return null;
    }

    return data.data.adventureBySlug || data.data.adventureList?.items?.[0];
  } catch (error) {
    return null;
  }
}

function createAdventureDetail(adventure) {
  if (!adventure) return null;

  const detail = document.createElement('div');
  detail.className = 'adventure-detail';

  const header = document.createElement('div');
  header.className = 'adventure-header';

  const title = document.createElement('h1');
  title.textContent = adventure.title;
  header.appendChild(title);

  if (adventure.activity) {
    const activity = document.createElement('p');
    activity.className = 'activity';
    activity.textContent = adventure.activity;
    header.appendChild(activity);
  }

  detail.appendChild(header);

  if (adventure.primaryImage) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'adventure-image-container';

    const image = document.createElement('img');
    // The _dynamicUrl property comes from the AEM API
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
      info.appendChild(detailItem);
    }
  });

  content.appendChild(info);

  if (adventure.description?.html) {
    const description = document.createElement('div');
    description.className = 'adventure-description';
    description.innerHTML = adventure.description.html;
    content.appendChild(description);
  }

  if (adventure.itinerary?.html) {
    const itinerary = document.createElement('div');
    itinerary.className = 'adventure-itinerary';
    itinerary.innerHTML = adventure.itinerary.html;
    content.appendChild(itinerary);
  }

  detail.appendChild(content);

  return detail;
}

export default async function decorate(block) {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || urlParams.get('adventure') || urlParams.get('path');

  if (!slug) {
    return;
  }

  const adventure = await fetchAdventureBySlug(slug);
  if (!adventure) {
    return;
  }

  const detail = createAdventureDetail(adventure);
  if (detail) {
    block.innerHTML = '';
    block.appendChild(detail);
  }
}
