/**
 * Asynchronously saves the current groups to the browser's local storage.
 * 
 * @async
 * @function saveGroups
 * @returns {Promise<void>} A promise that resolves when the groups have been saved.
 */
const saveGroups = async () => {
    await browser.storage.local.set({ 'groups': groups });
}

/**
 * Asynchronously loads groups from the browser's local storage.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of groups. 
 * If no groups are found, it returns an empty array.
 */
const loadGroups = async () => {
    const data = await browser.storage.local.get('groups');
    if (data != undefined) {
        return data.groups || [];
    }
}

/**
 * Adds a new group with the title provided in the input field. It then displays it and saves the groups.
 * If the group already exists, it shows a message indicating so.
 * 
 * @async
 * @function addGroup
 * @returns {Promise<void>}
 */
const addGroup = async () => {
    const title = document.getElementById('newGroupTitle').value.trim();
    document.getElementById('newGroupTitle').value = '';

    if (title) {
        const groupExists = groups.some(group => group.title === title);
        if (!groupExists) {
            groups.push({ title, websites: [], active: true, expanded: true });
            displayGroup(groups[groups.length - 1]);
            await saveGroups();
        } else {
            showMessage('Group already exists', false);
        }
    }
}

/**
 * Removes a group by its title, updates the groups array, 
 * removes the corresponding DOM element, and saves the updated groups.
 *
 * @param {string} groupTitle - The title of the group to be removed.
 * @returns {Promise<void>} A promise that resolves when the groups have been saved.
 */
const removeGroup = async (groupTitle) => {
    const groupIndex = groups.findIndex(group => group.title === groupTitle);
    groups.splice(groupIndex, 1);
    groupsContainer.removeChild(groupsContainer.children[groupIndex]);
    await saveGroups();
}

/**
 * Adds a website to a specified group and updates the UI and storage.
 *
 * @param {string} website - The URL of the website to add.
 * @param {string} groupTitle - The title of the group to add the website to.
 * @param {HTMLElement} groupDiv - The DOM element representing the group.
 * @returns {Promise<void>} A promise that resolves when the group is saved.
 */
const addWebsiteToGroup = async (website, groupTitle, groupDiv) => {
    const groupIndex = groups.findIndex(group => group.title === groupTitle);
    if (!groups[groupIndex].websites.includes(website)) {
        groups[groupIndex].websites.push(website);
        const websiteContainer = groupDiv.querySelector('.websites');
        appendWebsiteToList(website, groupTitle, websiteContainer);
        await saveGroups();
    } else {
        console.log('Website already exists in the group');
    }
}

/**
 * Removes a website from a specified group and updates the UI and storage.
 *
 * @param {string} groupTitle - The title of the group from which the website will be removed.
 * @param {string} website - The website to be removed from the group.
 * @returns {Promise<void>} A promise that resolves when the groups have been saved.
 */
const removeWebsiteFromGroup = async (groupTitle, wesbite) => {
    const groupIndex = groups.findIndex(group => group.title === groupTitle);
    const websiteIndex = groups[groupIndex].websites.indexOf(wesbite);
    groups[groupIndex].websites.splice(websiteIndex, 1);
    groupsContainer.children[groupIndex].querySelector('.websites').removeChild(groupsContainer.children[groupIndex].querySelector('.websites').children[websiteIndex]);
    await saveGroups();
}

/**
 * Toggles the active state of a group based on its title.
 *
 * @param {string} groupTitle - The title of the group to toggle.
 * @returns {Promise<void>} A promise that resolves when the group's active state has been toggled and saved.
 */
const toggleGroupActivity = async (groupTitle) => {
    const groupIndex = groups.findIndex(group => group.title === groupTitle);
    groups[groupIndex].active = !groups[groupIndex].active;
    await saveGroups();
}

/**
 * Toggles the expansion state of a group and updates the DOM accordingly.
 *
 * @param {string} groupTitle - The title of the group to toggle.
 * @param {HTMLElement} groupDiv - The DOM element representing the group.
 * @returns {Promise<void>} A promise that resolves when the group state has been saved.
 */
const toggleGroupExpansion = async (groupTitle, groupDiv) => {
    const groupIndex = groups.findIndex(group => group.title === groupTitle);
    groups[groupIndex].expanded = !groups[groupIndex].expanded;

    if (groups[groupIndex].expanded) {
        groupDiv.querySelector('.expand-button').src = '../icons/chevron-down.svg';
        createHr(groupDiv);
        createWebsiteList(groups[groupIndex], groupDiv);
        createBottomRow(groups[groupIndex], groupDiv);
    } else {
        groupDiv.querySelector('.expand-button').src = '../icons/chevron-right.svg';
        groupDiv.removeChild(groupDiv.querySelector('hr'));
        groupDiv.removeChild(groupDiv.querySelector('.websites'));
        groupDiv.removeChild(groupDiv.querySelector('.add-website'));
    }

    await saveGroups();
}

/**
 * Displays all groups by clearing the groups container and then displaying each group.
 *
 * @param {Array} groups - An array of group objects to be displayed.
 */
const displayAllGroups = (groups) => {
    groupsContainer.innerHTML = '';

    groups.forEach(group => {
        displayGroup(group);
    });
}

/**
 * Displays a group in the UI by creating and appending a styled div element.
 * If the group is expanded, it also creates and appends additional elements
 * such as a horizontal rule, a list of websites, and an input for adding new websites.
 *
 * @param {Object} group - The group object to display.
 * @param {boolean} group.expanded - Indicates if the group is expanded.
 * @param {string} group.name - The name of the group.
 */
const displayGroup = (group) => {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('p-2', 'rounded', 'shadow-sm', 'mt-1');
    groupDiv.style.backgroundColor = 'rgb(245, 245, 245)';
    groupDiv.style.border = '2px solid rgb(209, 209, 209)';

    createHeader(group, groupDiv);

    if (group.expanded) {
        createHr(groupDiv);
        createWebsiteList(group, groupDiv);
        createBottomRow(group, groupDiv);
    }

    groupsContainer.appendChild(groupDiv);
}

/**
 * Creates an <hr> element, adds a class to it, and appends it to the specified groupDiv.
 *
 * @param {HTMLElement} groupDiv - The parent element to which the <hr> element will be appended.
 */
const createHr = (groupDiv) => {
    const hr = document.createElement('hr');
    hr.classList.add('my-1');
    groupDiv.appendChild(hr);
}

/**
 * Creates a header for a group and appends it to the provided groupDiv.
 * 
 * @param {Object} group - The group object containing information about the group.
 * @param {string} group.title - The title of the group.
 * @param {boolean} group.expanded - Indicates whether the group is expanded or collapsed.
 * @param {boolean} group.active - Indicates whether the group is active or not.
 * @param {HTMLElement} groupDiv - The div element to which the header will be appended.
 */
const createHeader = (group, groupDiv) => {
    const groupHeader = document.createElement('div');
    groupHeader.classList.add('d-flex', 'flex-row', 'align-items-center', 'justify-content-between');

    /* Left Block */
    const expandButton = document.createElement('button');
    expandButton.classList.add('border-0', 'bg-transparent', 'p-0', 'm-0', 'pb-1', 'z-3', 'd-flex', 'flex-row', 'align-items-center');
    const iconPath = group.expanded ? '../icons/chevron-down.svg' : '../icons/chevron-right.svg';
    expandButton.innerHTML += `<img src="${iconPath}" alt="Expand/Collapse Icon" width="16" height="16" class="expand-button"/>`;
    expandButton.addEventListener('click', async () => {
        toggleGroupExpansion(group.title, groupDiv);
    });

    const groupTitle = document.createElement('h6');
    groupTitle.classList.add('m-0')
    groupTitle.textContent = group.title;

    const leftBlock = document.createElement('div');
    leftBlock.classList.add('d-flex', 'flex-row', 'align-items-center', 'gap-1', 'justify-content-between');
    leftBlock.appendChild(expandButton);
    leftBlock.appendChild(groupTitle);

    /* Right Block */
    const switchDiv = document.createElement('div');
    switchDiv.classList.add('form-check', 'form-switch');
    switchDiv.innerHTML = `
        <input class="form-check-input" type="checkbox" role="switch" ${group.active ? 'checked' : ''}>`;

    const switchInput = switchDiv.querySelector('input');
    switchInput.addEventListener('change', async () => {
        toggleGroupActivity(group.title);
    });

    const rightBlock = document.createElement('div');
    rightBlock.classList.add('d-flex', 'flex-row', 'align-items-center', 'gap-2', 'justify-content-between');
    rightBlock.appendChild(switchDiv);

    /* Append Blocks */
    groupHeader.appendChild(leftBlock);
    groupHeader.appendChild(rightBlock);

    groupDiv.appendChild(groupHeader);
}

/**
 * Creates a list of websites and appends it to the specified groupDiv element.
 *
 * @param {Object} group - The group object containing the websites and title.
 * @param {Array} group.websites - An array of website objects to be listed.
 * @param {string} group.title - The title of the group.
 * @param {HTMLElement} groupDiv - The HTML element to which the website list will be appended.
 */
const createWebsiteList = (group, groupDiv) => {
    const container = document.createElement('div');
    container.classList.add('d-flex', 'flex-row', 'flex-wrap', 'align-items-center', 'justify-content-center', 'gap-1', 'websites');
    container.style.color = 'rgb(75, 75, 75)';

    container.classList.add('my-3', 'pl-2');

    group.websites.forEach(website => {
        appendWebsiteToList(website, group.title, container);
    });
    groupDiv.appendChild(container);
}

/**
 * Appends a website to a list within a specified container element.
 *
 * @param {string} website - The website URL or name to be added to the list.
 * @param {string} groupTitle - The title of the group to which the website belongs.
 * @param {HTMLElement} container - The container element where the list item will be appended.
 */
const appendWebsiteToList = (website, groupTitle, container) => {
    /* List item */
    const element = document.createElement('li');
    element.style.fontSize = '0.7em';
    element.classList.add('d-flex', 'flex-row', 'align-items-center', 'rounded-pill', 'shadow-sm');
    element.style.padding = '0.15rem';
    element.style.backgroundColor = 'rgb(255, 255, 255)';

    element.addEventListener('mouseover', () => {
        element.style.backgroundColor = 'rgb(225, 225, 225)';
    });

    element.addEventListener('mouseout', () => {
        element.style.backgroundColor = 'rgb(255, 255, 255)';
    });

    /* Website span */
    const websiteSpan = document.createElement('span');
    websiteSpan.classList.add('text-truncate');
    websiteSpan.style.marginTop = '0.125rem';
    websiteSpan.style.paddingLeft = '0.25rem';
    websiteSpan.textContent = website;

    /* Remove button */
    const removeButton = document.createElement('button');
    removeButton.classList.add('border-0', 'bg-transparent', 'ml-2');
    removeButton.innerHTML = `<img src="../icons/x-circle.svg" alt="Remove Icon" width="12" height="12" class="lighter-icon"/>`;

    removeButton.addEventListener('click', async () => {
        removeWebsiteFromGroup(groupTitle, website);
    });

    /* Append elements */
    element.appendChild(websiteSpan);
    element.appendChild(removeButton);
    container.appendChild(element);
}

/**
 * Creates a bottom row UI component for a group, which includes an input field for adding websites
 * and a button for removing the group.
 * 
 * @param {Object} group - The group object containing group details.
 * @param {HTMLElement} groupDiv - The HTML element where the bottom row will be appended.
 * 
 * @returns {Promise<void>} A promise that resolves when the bottom row is created and appended.
 */
const createBottomRow = async (group, groupDiv) => {
    function addWebsiteToThisGroup() {
        const website = websiteInput.value.trim();
        if (website) {
            if (isValidUrl(website)) {
                const baseUrl = getBaseUrl(website);
                addWebsiteToGroup(baseUrl, group.title, groupDiv);
            }
            else {
                showMessage('Invalid URL');
            }
        }
        websiteInput.value = '';
    }

    /* Input container */
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('d-flex', 'flex-row', 'align-items-center', 'flex-grow-1', 'px-1', 'rounded', 'shadow-sm');
    inputContainer.style.backgroundColor = 'rgb(255, 255, 255)';

    /* Website input element */
    const websiteInput = document.createElement('input');
    websiteInput.type = 'text';
    websiteInput.placeholder = 'Enter website URL';
    websiteInput.classList.add('flex-grow-1', 'border-0', 'rounded', 'mr-4', 'bg-transparent', 'mt-1');
    websiteInput.style.fontSize = '0.8em';
    websiteInput.style.color = 'rgb(75, 75, 75)';

    websiteInput.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter') {
            addWebsiteToThisGroup();
        }
    });

    /* Add button */
    const addButton = document.createElement('button');
    addButton.classList.add('border-0', 'bg-transparent');
    addButton.innerHTML = `<img src="../icons/plus-circle.svg" alt="Add Icon" width="13" height="13" class="lighter-icon"/>`;

    addButton.addEventListener('click', async () => {
        addWebsiteToThisGroup();
    });

    inputContainer.appendChild(websiteInput);
    inputContainer.appendChild(addButton);

    /* Remove button */
    const removeButton = document.createElement('button');
    removeButton.classList.add('border-0', 'rounded', 'm-0', 'd-flex', 'flex-row', 'align-items-center', 'shadow-sm');
    removeButton.style.backgroundColor = 'rgb(215, 215, 215)';
    removeButton.style.padding = '0 0.75rem';
    removeButton.addEventListener('mouseover', () => {
        removeButton.style.backgroundColor = 'rgb(195, 195, 195)';
    });

    removeButton.addEventListener('mouseout', () => {
        removeButton.style.backgroundColor = 'rgb(215, 215, 215)';
    });
    removeButton.innerHTML += `<img src="../icons/trash-fill.svg" alt="Delete Icon" width="14" height="14" class="trash-icon"/>`;

    removeButton.addEventListener('click', async () => {
        removeGroup(group.title);
    });

    /* Full bottom row */
    const div = document.createElement('div');
    div.classList.add('d-flex', 'felx-row', 'align-items-stretch', 'w-100', 'gap-1', 'add-website');
    div.appendChild(inputContainer);
    div.appendChild(removeButton);

    groupDiv.appendChild(div);
}

/**
 * Checks if a given URL is valid.
 *
 * @param {string} url - The URL to validate.
 * @returns {boolean} - Returns true if the URL is valid, otherwise false.
 */
const isValidUrl = (url) => {
    try {
        const parsedUrl = new URL(url.includes('://') ? url : `http://${url}`);
        const hostname = parsedUrl.hostname;
        const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,11}$/;
        return domainPattern.test(hostname);
    } catch (e) {
        return false;
    }
}

/**
 * Extracts the base URL from a given URL string.
 *
 * @param {string} url - The URL string to extract the base URL from. If the URL does not include a protocol, 'http://' is assumed.
 * @returns {string} The base URL, consisting of the last two parts of the hostname.
 */
const getBaseUrl = (url) => {
    const parsedUrl = new URL(url.includes('://') ? url : `http://${url}`);
    const hostnameParts = parsedUrl.hostname.split('.');
    const baseUrl = hostnameParts.slice(-2).join('.');
    return baseUrl;
}

/**
 * Displays a message in a popup element with a specific background color based on the error state.
 *
 * @param {string} message - The message to be displayed.
 * @param {boolean} [isError=true] - Determines the background color of the message. If true, the background color will be red, otherwise it will be orange.
 */
const showMessage = (message, isError = true) => {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;

    if (isError) {
        errorMessage.style.backgroundColor = 'rgb(200, 0, 0, 0.7)';
    }
    else {
        errorMessage.style.backgroundColor = 'rgb(203, 132, 0, 0.7)';
    }

    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 2000);
}


const groupsContainer = document.getElementById('groupsContainer');
let groups = [];

document.addEventListener('DOMContentLoaded', async () => {

    const newGroupTitleInput = document.getElementById('newGroupTitle');
    const addGroupButton = document.getElementById('addGroupButton');

    newGroupTitleInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addGroup();
        }
    });
    addGroupButton.addEventListener('click', addGroup);

    groups = await loadGroups();
    displayAllGroups(groups);
});