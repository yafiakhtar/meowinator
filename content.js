let catPics = [
  "https://cataas.com/cat",
  "https://cataas.com/cat/cute",
  "https://cataas.com/cat/funny",
  "https://cataas.com/cat/gif",
  "https://cataas.com/cat/cute/says/hello",
  "https://cataas.com/cat/says/Meow",
  "https://cataas.com/cat?type=square",
  "https://cataas.com/cat?filter=mono",
  "https://cataas.com/cat/orange",
  "https://cataas.com/cat/cute?type=square"
]

// Function to get a random cat URL with unique timestamp to prevent caching
function getRandomCat() {
    const index = Math.floor(Math.random() * catPics.length);
    const timestamp = new Date().getTime();
    return catPics[index] + (catPics[index].includes('?') ? '&' : '?') + 't=' + timestamp;
}

// Function to replace an image with a cat
function replaceWithCat(image) {
    if (!image.dataset.meowified) {
        image.dataset.meowified = 'true';
        const catUrl = getRandomCat();
        
        // Replace src and srcset to override lazy loading
        image.src = catUrl;
        image.srcset = catUrl;
        
        // Also override any data attributes YouTube uses for lazy loading
        if (image.dataset.thumb) image.dataset.thumb = catUrl;
        if (image.dataset.src) image.dataset.src = catUrl;
    }
}

// Replace all existing images
function replaceAllImages() {
    const imgs = document.getElementsByTagName("img");
    for (let image of imgs) {
        replaceWithCat(image);
    }
}

// Initial replacement
replaceAllImages();

// Throttle function to limit how often we process mutations
let timeout;
function throttledReplace() {
    if (timeout) return;
    timeout = setTimeout(() => {
        replaceAllImages();
        timeout = null;
    }, 100);
}

// Watch for new images being added (YouTube loads content dynamically)
const observer = new MutationObserver(() => {
    throttledReplace();
});

// Start observing the document for changes
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset']
});

// Also replace images periodically to catch any we missed
setInterval(replaceAllImages, 1000);