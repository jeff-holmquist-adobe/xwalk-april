export default function decorate(block) {
  // Get the adventure data from the URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const adventureData = JSON.parse(decodeURIComponent(urlParams.get('data')));

  // Create the adventure detail container
  const container = document.createElement('div');
  container.className = 'adventure-detail';

  // Create the header section
  const header = document.createElement('div');
  header.className = 'adventure-header';

  const title = document.createElement('h1');
  title.textContent = adventureData.title;

  const activityType = document.createElement('p');
  activityType.className = 'activity-type';
  activityType.textContent = adventureData.activityType;

  header.appendChild(title);
  header.appendChild(activityType);

  // Create the image section
  const imageSection = document.createElement('div');
  imageSection.className = 'adventure-image';

  const imageUrl = adventureData.primaryImage.dynamicUrl || adventureData.primaryImage.path;
  const fullImageUrl = imageUrl.startsWith('http')
    ? imageUrl
    : `https://publish-p82652-e1522149.adobeaemcloud.com${imageUrl}`;

  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.setAttribute('src', `${fullImageUrl}?width=1200&format=jpeg&optimize=medium`);
  img.setAttribute('alt', adventureData.title);
  picture.appendChild(img);
  imageSection.appendChild(picture);

  // Create the content section
  const content = document.createElement('div');
  content.className = 'adventure-content';

  const description = document.createElement('div');
  description.className = 'description';
  description.innerHTML = adventureData.description;

  const tripLength = document.createElement('p');
  tripLength.className = 'trip-length';
  tripLength.textContent = `Trip Length: ${adventureData.tripLength}`;

  const difficulty = document.createElement('p');
  difficulty.className = 'difficulty';
  difficulty.textContent = `Difficulty: ${adventureData.difficulty}`;

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = `Price: $${adventureData.price}`;

  content.appendChild(description);
  content.appendChild(tripLength);
  content.appendChild(difficulty);
  content.appendChild(price);

  // Assemble the page
  container.appendChild(header);
  container.appendChild(imageSection);
  container.appendChild(content);

  // Clear the block and add our content
  block.textContent = '';
  block.appendChild(container);
}
