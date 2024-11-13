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
    // Regular expression to match a well ID
    const wellId = /([A-Z]+-\d+)\s+(\d{7}(?:\.\d+)?)(?:\s+)(\d{6}(?:\.\d+)?)/gi;
                        
    let match;
    const results = [];

    while ((match = wellId.exec(text)) !== null) {

        console.log(match);

        const borelog = match[0];
        const wellId = match[1];
        const northing = match[2];
        const easting = match[3];

        console.log(`Extracting data from Well: ${wellId}`); // Debug log
        console.log(`Borelog: ${borelog}`); 

        results.push({ wellId, northing, easting });
    }

    mergeResults(results);
}

function mergeResults(results) {
    // Append Northing and Easting to each row where Well ID matches
    const lines = csvData.split('\n');

    for (let i = 0; i < results.lenght; i++) {
        const wellId = results[i].wellId;
        const northing = results[i].northing;
        const easting = results[i].easting;

        const updatedLines = lines.map((line) => {
            if (line.startsWith(wellId)) {
                return `${line},${northing},${easting}`;  // Add Northing and Easting columns to the row
            }
            return line;
        });
    
        csvData = updatedLines.join('\n');
    
        // Update the textarea display
        document.getElementById('csvEditor').value = csvData;
        alert(`Added Northing and Easting for Well ID ${wellId}.`);
    }
}
