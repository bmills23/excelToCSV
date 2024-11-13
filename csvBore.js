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
    const wellId = /(^[A-Z]+-\d+)/i;
    
    // Adjusted pattern to capture coordinates                                                                                                                      // Match ND, Number, <Number, and J-flags
    const coordinatePattern = /()/gi;
                        
    let match;
    const results = [];

    while ((match = samplePattern.exec(text)) !== null) {

        console.log(match);

        const resultsSection = match[0];
        const sampleId = match[1];
        const sampleDate = match[3];
        const analysis = match[5];

        console.log(`Extracting results for Sample ID: ${sampleId}`); // Debug log
        console.log(`Results Section: ${analysis}`); // Debug log
        
        const resultMatch = [...resultsSection.matchAll(resultPattern)];

        console.log("Matched results", resultMatch);

        // Initialize default values
        let benzene = '';
        let toluene = '';
        let ethylbenzene = '';
        let xylenes = '';
        let tphGRO = '';
        let mtbe = ''; 
        let teph = '';

        resultMatch.forEach(([_, param, value, reportLimit]) => {
            let finalValue = value === 'ND' ? '<' + reportLimit : value;

            // Debug log for each parameter
            console.log(`Param: ${param}, Value: ${value}, Report Limit: ${reportLimit}`); 

            // Check for known parameters
            switch (param.toLowerCase()) {
                case 'benzene':
                    benzene = finalValue;
                    break;
                case 'toluene':
                    toluene = finalValue;
                    break;
                case 'ethylbenzene':
                    ethylbenzene = finalValue;
                    break;
                case 'xylene (total)':
                    xylenes = finalValue;
                    break;
                case 'gasoline range organics':
                case 'tph-gro':
                    tphGRO = finalValue;
                    break;
                case 'methyl-tert-butyl ether':
                case 'mtbe':
                    mtbe = finalValue;
                    break;
                case 'total petroleum hydrocarbons':
                    teph = finalValue; 
                    break;
            }
        });

        results.push({ sampleId, sampleDate, benzene, toluene, ethylbenzene, xylenes, mtbe, tphGRO, teph });
    }

    console.log(`Results Extracted:`, results); // Debug log for results
    displayResults(results);
}

function displayResults(results) {
    const tableBody = document.querySelector('#resultsTable');
    tableBody.innerHTML = ''; // Clear existing rows

    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.sampleId}</td>
            <td>${result.sampleDate}</td>
            <td class="constituent">${result.benzene}</td>
            <td class="constituent">${result.toluene}</td>
            <td class="constituent">${result.ethylbenzene}</td>
            <td class="constituent">${result.xylenes}</td>
            <td class="constituent">${result.mtbe || ''}</td> <!-- Empty if MTBE is not present -->
            <td class="constituent">${result.tphGRO}</td>
            <td class="constituent">${result.teph}</td> <!-- Empty if TEPH not present -->
        `;
        tableBody.appendChild(row);
    });
}
