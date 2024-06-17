document.addEventListener('DOMContentLoaded', function(){
    const saveUrlBtn = document.getElementById('save-url');
    const pasteTextBtn = document.getElementById('paste-text');
    const viewLinks = document.getElementById('view-links');
    const viewNotes = document.getElementById('view-texts');
    const status = document.getElementById('status');
    const savedContents = document.getElementById('saved-contents');
    const copyAllButton = document.getElementById('copyallitem');
    const deleteAllButton = document.getElementById('deleteallitem');
    const urlCount = document.getElementById('url-count');
    const textCount = document.getElementById('text-count');

    saveUrlBtn.addEventListener('click', function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];
            const url = activeTab.url;
            saveItem('URL', url);
        });
    });

    pasteTextBtn.addEventListener('click', function(){
        navigator.clipboard.readText().then(text => {
            saveItem('Text', text);
        }).catch(err => {
            status.textContent = 'Failed to read clipboard contents: ' + err;
            setStatusTimeout();
        });
    });
    
    copyAllButton.addEventListener('click', function() {
        copyAllItems();
    });

    deleteAllButton.addEventListener('click', function() {
        deleteAllItems();
    });

    viewLinks.addEventListener('click', function() {
        displaySavedItems('URL');
    });

    viewNotes.addEventListener('click', function() {
        displaySavedItems('Text');
    });

    function copyAllItems() {
        const savedItems = Array.from(savedContents.querySelectorAll('li'));
        const textToCopy = savedItems.map(item => item.textContent).join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            status.textContent = 'All items copied successfully!';
            setStatusTimeout();
        }).catch(err => {
            status.textContent = 'Failed to copy all items: ' + err;
            setStatusTimeout();
        });
    }

    function deleteAllItems() {
        savedContents.innerHTML = '';
        status.textContent = 'All items deleted successfully!';
        chrome.storage.local.remove('savedItems', function() {
            console.log('All items removed from storage');
            setStatusTimeout();
        });
    }

    function saveItem(type, value) {
        const item = {type, value, timestamp: new Date().toISOString()};
        chrome.storage.local.get({savedItems: []}, function(result) {
            const savedItems = result.savedItems;
            savedItems.push(item);
            chrome.storage.local.set({savedItems}, function() {
                status.textContent = `${type} saved successfully`;
                setStatusTimeout();
                displaySavedItems();
            });
        });
    }

    function displaySavedItems(filterType) {
        chrome.storage.local.get({savedItems: []}, function(result) {
            const savedItems = result.savedItems;
            savedContents.innerHTML = '';
            savedItems.forEach(item => {
                if (!filterType || item.type === filterType) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<h1>${item.type}</h1> </br> ${item.value}`; 
                    savedContents.appendChild(listItem);
                }
            });
            updateCounts();
        });
    }
    function updateCounts(){
        chrome.storage.local.get({savedItems: []}, function(result){
            const savedItems = result.savedItems;
            const urlCountNum = savedItems.filter(item => item.type === 'URL').length;
            const textCountNum = savedItems.filter(item => item.type === 'Text').length;
            urlCount.textContent = urlCountNum; 
            textCount.textContent = textCountNum;
        });
    }

    function setStatusTimeout() {
        setTimeout(function(){
            status.textContent = '';
        }, 2000); 
    }

    
    displaySavedItems();
});
