let csvData = "";

// Function to handle file selection
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {

            // Declare unsigned 8-bit arr to contain raw data
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Parse GW Lab and Elev Table from CDLE Excel File
            const sheetName = "GW Lab and Elev Table";
            if (workbook.SheetNames.includes(sheetName)) {

                const sheet = workbook.Sheets[sheetName];

                // Convert sheet to csv in one miraculous line lol
                csvData = XLSX.utils.sheet_to_csv(sheet);

                // Split lines by newline characters
                const lines = csvData.split('\n');

                // Custom Header instead of parsing data from document
                const customHeader = "Well ID,Date,Benzene,Toluene,Ethyl-Benzene,Xylenes,MTBE,TVPH,TEPH,TOC,TOS,BOS,Well Diameter,Water Table Elevation, Depth to Water, Depth to LNAPL, LNAPL Thickness, GW Column above BOS, GW Above TOS, Well Status";

                // Regex pattern to identify the start of the desired data; e.g. mw-01, MW-02, HRP-01, Lw-08 will all work
                const dataStartPattern = /^(^[A-Z]+-\d+)/i;

                // Flag to start keeping lines after we hit the pattern
                let isDataSection = false;
                const filteredLines = [customHeader];  // Start with custom header

                // Process each line and capture the header and data separately
                for (const line of lines) {
                    if (dataStartPattern.test(line.trim()) && !isDataSection) {
                        isDataSection = true;  // Start keeping lines after we hit the header
                    } else if (isDataSection && line.trim()) {
                        filteredLines.push(line);  // Add data rows after header
                    }
                }

                // Convert filtered lines back to CSV format
                csvData = filteredLines.join('\n');

                // Implicit declaration allows for global variable name
                filename = prompt("Enter Desired File Name: ");

                alert("CSV data is ready. Click 'Download CSV' to save.");
            } else {
                alert("GW Table not found in workbook.");
            }
        };
        reader.readAsArrayBuffer(file);
    }
});

// Function to download the CSV
function downloadCSV() {
    if (!csvData) {
        alert("No CSV data to download. Please select an Excel file first.");
        return;
    }

    // Create a Blob from the CSV data
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to download the CSV file
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
