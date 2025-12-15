// Edits: add theme select, persist theme using chrome.storage (or localStorage fallback)

// Saves options to chrome.storage
const saveOptions = () => {
    const lunchChecked = document.getElementById('lunsj').checked;
    const theme = document.getElementById('theme-select').value;

    const toStore = { lunchChecked: lunchChecked };
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ lunchChecked: lunchChecked, themePreference: theme }, () => {
                const status = document.getElementById('status');
                status.textContent = 'Innstillinger lagret';
                setTimeout(() => {
                    status.textContent = '';
                }, 750);
            });
            return;
        }
    } catch (e) {
        // ignore and fall back to localStorage
    }

    // fallback
    localStorage.setItem('themePreference', theme);
    localStorage.setItem('lunchChecked', lunchChecked ? '1' : '0');
    const status = document.getElementById('status');
    status.textContent = 'Innstillinger lagret';
    setTimeout(() => {
        status.textContent = '';
    }, 750);
};

const restoreOptions = () => {
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get({ lunchChecked: true, themePreference: 'system' }, (items) => {
                document.getElementById('lunsj').checked = items.lunchChecked;
                document.getElementById('theme-select').value = items.themePreference || 'system';
            });
            return;
        }
    } catch (e) {
        // ignore and fall back
    }

    // fallback
    const lunch = localStorage.getItem('lunchChecked');
    document.getElementById('lunsj').checked = lunch === null ? true : lunch === '1';
    const theme = localStorage.getItem('themePreference') || 'system';
    document.getElementById('theme-select').value = theme;
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);