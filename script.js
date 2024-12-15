let dataPoints = [];

        // Handle file upload
        document.getElementById('fileInput').addEventListener('change', handleFileUpload);

        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const fileType = file.name.split('.').pop();
            if (fileType === 'csv') {
                Papa.parse(file, {
                    complete: function(results) {
                        dataPoints = results.data.map(row => ({
                            x: parseFloat(row[0]),
                            y: parseFloat(row[1]),
                            z: parseFloat(row[2]),
                            label: row[3] || 'N/A'
                        })).filter(row => !isNaN(row.x));
                        renderPCA();
                        populateTable();
                    }
                });
            } else if (fileType === 'xlsx') {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(sheet);
                    dataPoints = json.map(row => ({
                        x: parseFloat(row.X),
                        y: parseFloat(row.Y),
                        z: parseFloat(row.Z),
                        label: row.Label || 'N/A'
                    }));
                    renderPCA();
                    populateTable();
                };
                reader.readAsArrayBuffer(file);
            }
        }

        // Render PCA Visualization
        // Render PCA Visualization with multiple colors based on labels
function renderPCA() {
    if (dataPoints.length === 0) return;

    // Generate a unique color for each label
    const labels = [...new Set(dataPoints.map(d => d.label))]; // Extract unique labels
    const colors = labels.map((label, index) => {
        return `hsl(${(index * 360 / labels.length)} , 100%, 50%)`; // Assign a distinct color to each label
    });

    const colorMap = {};
    labels.forEach((label, index) => {
        colorMap[label] = colors[index];
    });

    const trace = {
        x: dataPoints.map(d => d.x),
        y: dataPoints.map(d => d.y),
        z: dataPoints.map(d => d.z),
        mode: 'markers+text',
        type: 'scatter3d',
        marker: {
            size: 5,
            color: dataPoints.map(d => colorMap[d.label]), // Use label-based colors
            opacity: 0.8
        },
        text: dataPoints.map(d => d.label),
        hoverinfo: 'text'
    };

    // Optional: Draw vectors connecting the points (like star connections)
    const vectors = dataPoints.map((point, index) => ({
        x: [0, point.x],
        y: [0, point.y],
        z: [0, point.z],
        mode: 'lines',
        type: 'scatter3d',
        line: {
            color: 'rgba(0, 0, 0, 0.5)', // Vector color
            width: 2
        },
        showlegend: false
    }));

    const layout = {
        title: '3D PCA Visualization',
        scene: {
            xaxis: { title: 'X' },
            yaxis: { title: 'Y' },
            zaxis: { title: 'Z' }
        }
    };

    Plotly.newPlot('pcaPlot', [trace, ...vectors], layout);
}


        // Populate data table
        function populateTable() {
            const tableBody = document.querySelector('#dataTable tbody');
            tableBody.innerHTML = ''; // Clear any existing rows

            dataPoints.forEach(point => {
                const row = `
                    <tr>
                        <td>${point.x}</td>
                        <td>${point.y}</td>
                        <td>${point.z}</td>
                        <td>${point.label}</td>
                        <td>Unclassified</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        }

        // Function to add a new row to the table
        function addRow() {
            const newX = parseFloat(document.getElementById('newX').value);
            const newY = parseFloat(document.getElementById('newY').value);
            const newZ = parseFloat(document.getElementById('newZ').value);
            const newLabel = document.getElementById('newLabel').value;

            if (isNaN(newX) || isNaN(newY) || isNaN(newZ)) {
                alert('Please enter valid numbers for X, Y, and Z');
                return;
            }

            const newDataPoint = { x: newX, y: newY, z: newZ, label: newLabel, cluster: 'Unclassified' };
            dataPoints.push(newDataPoint);

            // Add row to the table dynamically
            const table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
            const newRow = table.insertRow();
            newRow.insertCell(0).textContent = newX;
            newRow.insertCell(1).textContent = newY;
            newRow.insertCell(2).textContent = newZ;
            newRow.insertCell(3).textContent = newLabel;
            newRow.insertCell(4).textContent = 'Unclassified';

            // Optionally, update PCA plot
            renderPCA();

            // Reset input fields
            document.getElementById('newX').value = '';
            document.getElementById('newY').value = '';
            document.getElementById('newZ').value = '';
            document.getElementById('newLabel').value = '';
        }
