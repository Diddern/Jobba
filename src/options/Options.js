// Saves options to chrome.storage
const saveOptions = () => {
    const lunchChecked = document.getElementById('lunsj').checked;

    chrome.storage.sync.set(
        { lunchChecked: lunchChecked },
        () => {
            const status = document.getElementById('status');
            status.textContent = 'Innstillinger lagret';
            setTimeout(() => {
                status.textContent = '';
            }, 750);
        }
    );
};

const restoreOptions = () => {
    chrome.storage.sync.get(
        { lunchChecked: true }, // Default to true if value not found
        (items) => {
            document.getElementById('lunsj').checked = items.lunchChecked;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);