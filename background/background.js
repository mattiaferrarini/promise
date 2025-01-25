let currentListener = null;

const loadAndBlockWebsites = () => {
    browser.storage.local.get('groups').then((data) => {
        const groups = data.groups || [];
        const activeGroups = groups.filter(group => group.active);
        const websites = activeGroups.flatMap(group => group.websites);

        if (websites.length > 0) {
            const urlPatterns = websites.flatMap((site) => [
                `*://${site}/*`,
                `*://*.${site}/*`
            ]);

            if (currentListener) {
                browser.webRequest.onBeforeRequest.removeListener(currentListener);
            }

            currentListener = (details) => {
                return { redirectUrl: browser.runtime.getURL('pages/keep-your-promise.html') };
            };

            browser.webRequest.onBeforeRequest.addListener(
                currentListener,
                { urls: urlPatterns },
                ['blocking']
            );
        } else {
            console.log('No websites to block.');
            if (currentListener) {
                browser.webRequest.onBeforeRequest.removeListener(currentListener);
                currentListener = null;
            }
        }
    });
};

// Initial load
loadAndBlockWebsites();

// Listen for changes in storage
browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.groups) {
        loadAndBlockWebsites();
    }
});