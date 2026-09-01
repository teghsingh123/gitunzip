// gitunzip content script
// Runs on GitHub blob pages (https://github.com/*/*/blob/*).
// `fflate` is loaded as a global by manifest.json before this file.

// 1. Check if the github url is even a .zip link in the first place

const ZIP_EXTENSION = /\.zip$/i;

function isZipBlobPage() {
    return ZIP_EXTENSION.test(location.pathname);
}

/*
location.pathname on a blob page is
/owner/repo/blob/main/path/to/file.zip

Next we have to convert the URL shape
we convert 
    github.com/owner/repo/BLOB/branch/path/to/file.zip

    to 

    raw.githubusercontent.com/owner/repo/branch/path/to/file.zip

    NOTICE THERE IS NO /BLOB/ IN THE CONVERTED URL
*/

function getRawUrl() {
    const parts = location.pathname.split("/").slice(1); //have to slice off the first index cuz its an empty string which comes when splitting
    // parts = [owner, repo, blob, branch, path, to, file.zip]

    const owner = parts[0];
    const repo = parts[1];
    const blob = parts[2]
    const branch = parts[3]

    const path = parts.slice(4).join('/');

    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}


/* 
Now that we have the raw url, we need to fetch the raw bytes of
the zip before we can parse through them
*/

async function fetchRawBytes(url) {
    const response = await fetch(url);

    if(!response.ok) throw new Error(`Error. Status: ${response.status}`)

    const bytes = response.bytes()
    return bytes
}

/**
 * Now that we have the bytes, we will parse through them using
 * fflate
 */

function unzip(bytes) {
    
    let data;

    try {
        data = fflate.unzipSync(bytes);
    } catch (error) {
        console.error("Error occured: " + error.message)
    }

    return data;
}


/**
 * Now that we are able to unzip the files using fflate,
 * we need a way for the user to view it. My idea is to
 * have another link next to or below the view raw link.
 * Clicking it will open another directory like github.
 */

//Alaways finds the element to click to download raw
function findRawLink() {
    const rawLink = [...document.querySelectorAll('a')].find(a=> a.textContent.trim() === 'View raw');

    return rawLink;
}


/**
 * Now we are creating our link to view the unzipped zip
 * I want the same formatting so I am cloning and then making changes.
 */


function createZipLink(rawLink) {
    const zipLink = rawLink.cloneNode(true);

    zipLink.classList.add('zip-link');
    zipLink.href = '#';
    zipLink.textContent = "Preview zip";

/**
 * Now we need the click handler to preview the zip when the link is clicked
 */

    zipLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const bytes = await fetchRawBytes(getRawUrl());
        const files = unzip(bytes);
        console.log(files);
    })

    return zipLink;
}

/**
 * Everything is good, now to wire everything together.
 */


function init() {
    if (!isZipBlobPage()) return;

    //the page used to call init() right away before anything has loaded so the Preview zip does not appear
    //So we use setInterval to repeatedly call it until it finds a raw link.
    
    const intervalId = setInterval(() => {
        const rawLink = findRawLink();
        if (!rawLink) return;

        clearInterval(intervalId);
        const zipLink = createZipLink(rawLink);
        rawLink.insertAdjacentElement('afterend', zipLink);
    }, 200);
}

init();