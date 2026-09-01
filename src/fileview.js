// gitunzip file preview
// Renders a single file's contents (text, image, or a fallback download link)
// when a file row is clicked in the zip browser.

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const TEXT_EXTENSIONS = ['.txt', '.md', '.js', '.json', '.xml', '.css', '.html', '.yml', '.yaml'];

/**
 * Figures out how we should preview a file, based on its name.
 * Returns one of: 'image', 'text', 'binary'
 */
function categorizeFile(name) {

    name = name.toLowerCase();
    if (IMAGE_EXTENSIONS.some(ext => name.endsWith(ext))) return 'image';
    else if (TEXT_EXTENSIONS.some(ext => name.endsWith(ext))) return 'text';
    else return 'binary';

}

/**
 * Now we need to actually render the files inside the folders.
 * Github cannot do it by itself because technically the files are still in the zipped folder
 * Renders one file's contents into `container`.
 * node: { name, isFolder, children } — isFolder will be false here
 * bytes: Uint8Array of the file's raw contents (from the unzip() result)
 * onBack: callback to go back to the folder listing
 */
function renderFileView(node, bytes, onBack, container) {
    const category = categorizeFile(node.name);

    // now we build a back element and wire its click to call onBack()
    const backLink = document.createElement('a');
    backLink.textContent = '← Go Back';
    backLink.href = '#';
    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        onBack();
    });

    //Now we actually need to display the file content based on its category from earlier

    let fileContent;

    if (category === 'text') {
        const text = new TextDecoder().decode(bytes);
        fileContent = document.createElement('pre'); //using pre to display raw
        fileContent.textContent = text;
    } else if (category == 'image') {
        const blob = new Blob([bytes]);
        const url = URL.createObjectURL(blob);
        fileContent = document.createElement('img'); //create an image with the bytes
        fileContent.src = url;
    } else {
        //binary cannot be viewed so user just has to download raw like usual on Github

        const message = document.createElement('div');
        message.textContent = 'Cannot preview this file type';

        const blob = new Blob([bytes]);
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = node.name;
        downloadLink.textContent = 'View raw';

        fileContent = document.createElement('div');
        fileContent.append(message, downloadLink);
    }

    //Same as before replace the content on screen with the new file content

    container.replaceChildren(backLink, fileContent);


}
