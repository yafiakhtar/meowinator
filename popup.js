// Get references to elements
const toggleSwitch = document.getElementById('toggleSwitch');
const statusText = document.getElementById('status');

// Load the current state when popup opens
chrome.storage.sync.get(['meowEnabled'], function(result) {
    const isEnabled = result.meowEnabled !== false; // Default to true
    toggleSwitch.checked = isEnabled;
    updateStatus(isEnabled);
});

// Listen for toggle changes
toggleSwitch.addEventListener('change', function() {
    const isEnabled = toggleSwitch.checked;
    
    // Save the state
    chrome.storage.sync.set({ meowEnabled: isEnabled }, function() {
        updateStatus(isEnabled);
        
        // Send message to all YouTube tabs to update their state
        chrome.tabs.query({ url: 'https://www.youtube.com/*' }, function(tabs) {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { 
                    action: 'toggleMeow', 
                    enabled: isEnabled 
                }).catch(() => {
                    // Ignore errors for tabs that haven't loaded the content script yet
                });
            });
        });
    });
});

// Update the status text
function updateStatus(isEnabled) {
    if (isEnabled) {
        statusText.textContent = 'Enabled';
    } else {
        statusText.textContent = 'Disabled';
    }
}

