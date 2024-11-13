// This file combines CSV file with Boring log data
import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.mjs';

// Handle file input
document.getElementById('boringLogs').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function() {
            const arrayBuffer = reader.result;
            processPDF(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
    }
});

async function processPDF(arrayBuffer) {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let textContent = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        textContent += content.items.map(item => item.str).join(' ') + ' ';
    }

    console.log(textContent);
    extractCoordinates(textContent);
}

function extractCoordinates(text) {
    // Regular expression to match a well ID, northing and easting
    const wellId = /([A-Z]+-\d{1,3}[A-Za-z]*[-\d]*)\s+(\d{7}(?:\.\d+)?)(?:\s+)(\d{6}(?:\.\d+)?)/gi;
                        
    let match;
    const results = [];

    while ((match = wellId.exec(text)) !== null) {

        console.log(match);

        const wellId = match[1];
        const northing = match[2];
        const easting = match[3];

        console.log(`Extracting data from Well: ${wellId}`); // Debug log

        results.push({ wellId, northing, easting });
    }

    mergeResults(results);
}

function mergeResults(results) {
    // Append Northing and Easting to each row where Well ID matches
    const lines = csvData.split('\n');

    // Loop through each result and add northing/easting if the well ID matches
    for (let i = 0; i < results.length; i++) {  
        const { wellId, northing, easting } = results[i];
        
        // Update lines by appending Northing and Easting to matching Well ID rows
        lines.forEach((line, index) => {
            if (line.startsWith(wellId)) {
                lines[index] = `${line},${northing},${easting}`;  // Add Northing and Easting columns
                console.log(`Updated Well ID ${wellId} with Northing: ${northing} and Easting: ${easting}`);
            }
        });
    }

    csvData = lines.join('\n');
    alert('Northing and Easting coordinates have been added to matching wells.');
}
