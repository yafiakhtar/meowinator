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

// Store original image sources
let originalImages = new Map();
let meowEnabled = true;
let intervalId = null;
let observer = null;

// Function to get a random cat URL with unique timestamp to prevent caching
function getRandomCat() {
    const index = Math.floor(Math.random() * catPics.length);
    const timestamp = new Date().getTime();
    return catPics[index] + (catPics[index].includes('?') ? '&' : '?') + 't=' + timestamp;
}

// Function to replace an image with a cat
function replaceWithCat(image) {
    if (!meowEnabled) return;
    
    if (!image.dataset.meowified) {
        // Store original src
        originalImages.set(image, {
            src: image.src,
            srcset: image.srcset
        });
        
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

// Function to restore original images
function restoreImages() {
    const imgs = document.getElementsByTagName("img");
    for (let image of imgs) {
        if (image.dataset.meowified) {
            const original = originalImages.get(image);
            if (original) {
                image.src = original.src;
                if (original.srcset) {
                    image.srcset = original.srcset;
                }
            }
            delete image.dataset.meowified;
        }
    }
}

// Replace all existing images
function replaceAllImages() {
    if (!meowEnabled) return;
    
    const imgs = document.getElementsByTagName("img");
    for (let image of imgs) {
        replaceWithCat(image);
    }
}

// Throttle function to limit how often we process mutations
let timeout;
function throttledReplace() {
    if (!meowEnabled) return;
    if (timeout) return;
    timeout = setTimeout(() => {
        replaceAllImages();
        timeout = null;
    }, 100);
}

// Start the meowinator
function startMeow() {
    meowEnabled = true;
    
    // Replace all current images
    replaceAllImages();
    
    // Watch for new images being added (YouTube loads content dynamically)
    if (!observer) {
        observer = new MutationObserver(() => {
            throttledReplace();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'srcset']
        });
    }
    
    // Also replace images periodically to catch any we missed
    if (!intervalId) {
        intervalId = setInterval(replaceAllImages, 1000);
    }
}

// Stop the meowinator
function stopMeow() {
    meowEnabled = false;
    
    // Clear interval
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    
    // Disconnect observer
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    
    // Restore original images
    restoreImages();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleMeow') {
        if (request.enabled) {
            startMeow();
        } else {
            stopMeow();
        }
    }
});

// Initialize: Check if meow is enabled
chrome.storage.sync.get(['meowEnabled'], function(result) {
    meowEnabled = result.meowEnabled !== false; // Default to true
    
    if (meowEnabled) {
        startMeow();
    }
});