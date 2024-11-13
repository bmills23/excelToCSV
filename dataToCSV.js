function addData() {
// Function to add Northing and Easting to the CSV
    const wellId = document.getElementById('wellId').value;
    const northing = document.getElementById('northing').value;
    const easting = document.getElementById('easting').value;

    if (!wellId || !northing || !easting) {
        alert("Please enter Well ID, Northing, and Easting values.");
        return;
    }

    const lines = csvData.split('\n');

    const updatedLines = lines.map((line) => {
        if (line.startsWith(wellId)) {
            return `${line},${northing},${easting}`;  // Add Northing and Easting columns to the row
        }
        return line;
    });

    csvData = updatedLines.join('\n');

    alert(`Added Northing and Easting for Well ID ${wellId}.`);
} 
    