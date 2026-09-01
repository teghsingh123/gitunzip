//Now that we have all the unzipped content available, we have to incorporate it
//into github's ui

/**
 * Right now unzip gives me a flat object where keys are full paths.
 * I want to return a nested tree. 
 * An array of top level nodes with children.
 * 
 * Plan:
 * For each path I split into segments at the /'s. 
 * Go through the segments one at a time.
 * Check if a node with this segment name already exists.
 *  yes -> go in it
 *  no -> create it, add to level, and go into it
 * 
 * Go through all segments except for last which is the file. Add it as a leaf.
 */

function buildFileTree(files) {
    const root = []; //top level nodes

    for (const path of Object.keys(files)) {
        const segments = path.split('/');

        let currentLevel = root; //start at the top

        for (let i = 0; i < segments.length; i++) {
            const name = segments[i];
            const isLastSegment = (i === segments.length - 1);

            let node = currentLevel.find(n => n.name === name);

            if (!node) {
                node = {name, isFolder: !isLastSegment, children: []};
                currentLevel.push(node);
            }

            currentLevel = node.children;
        }
    }

    return root;
}

//now we have to turn the trees into the <li> DOM structure

//svg paths from source code
const FOLDER_ICON_PATH = "M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z";
const FILE_ICON_PATH = "M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z";

function renderTreeItem(node) {
    const iconPath = node.isFolder ? FOLDER_ICON_PATH : FILE_ICON_PATH;
    const iconClass = node.isFolder ? "octicon-file-directory-fill" : "octicon-file color-fg-muted";

    const tr = document.createElement('tr');
    tr.className = 'react-directory-row';

    const filenameColumn = `
        <div class="react-directory-filename-column">
            <svg class="octicon ${iconClass}" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="${iconPath}"></path></svg>
            <div class="overflow-hidden">
                <div class="react-directory-filename-cell">
                    <div class="react-directory-truncate">
                        <a class="Link--primary">${node.name}</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    tr.innerHTML = `
        <td class="react-directory-row-name-cell-small-screen" colspan="2">${filenameColumn}</td>
        <td class="react-directory-row-name-cell-large-screen" colspan="1">${filenameColumn}</td>
    `;

    return tr;
}

//now we actually render it on the screen

function renderZipBrowser(nodes, container) {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    for (const node of nodes) {
        tbody.appendChild(renderTreeItem(node));
    }

    table.appendChild(tbody);
    container.replaceChildren(table);
}

