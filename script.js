let dataPoints = [];
let pcaModel = null;

document.getElementById('fileInput').addEventListener('change', handleFileUpload);

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
    if (document.getElementById('normalizationSelect').value === 'minMax') {
        normalizeMinMax(); // Apply Min-Max normalization
    } else if (document.getElementById('normalizationSelect').value === 'zScore') {
        normalizeZScore(); // Apply Z-Score normalization
    }

    const table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.insertCell(0).textContent = newX.toFixed(4);
    newRow.insertCell(1).textContent = newY.toFixed(4);
    newRow.insertCell(2).textContent = newZ.toFixed(4);
    newRow.insertCell(3).textContent = newLabel;

    renderPCA();

    document.getElementById('newX').value = '';
    document.getElementById('newY').value = '';
    document.getElementById('newZ').value = '';
    document.getElementById('newLabel').value = '';
}

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
document.getElementById('normalizeButton').addEventListener('click', function() {
    const normalizationMethod = document.getElementById('normalizationSelect').value;
    if (normalizationMethod === 'minMax') {
        normalizeMinMax();
    } else if (normalizationMethod === 'zScore') {
        normalizeZScore();
    }
    renderPCA();
    populateTable();
});

function normalizeMinMax() {
    const xValues = dataPoints.map(d => d.x);
    const yValues = dataPoints.map(d => d.y);
    const zValues = dataPoints.map(d => d.z);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    const minZ = Math.min(...zValues);
    const maxZ = Math.max(...zValues);

    dataPoints.forEach(d => {
        d.x = (d.x - minX) / (maxX - minX);
        d.y = (d.y - minY) / (maxY - minY);
        d.z = (d.z - minZ) / (maxZ - minZ);
    });
}
function normalizeZScore() {
    const xValues = dataPoints.map(d => d.x);
    const yValues = dataPoints.map(d => d.y);
    const zValues = dataPoints.map(d => d.z);

    const meanX = mean(xValues);
    const stdDevX = standardDeviation(xValues);
    const meanY = mean(yValues);
    const stdDevY = standardDeviation(yValues);
    const meanZ = mean(zValues);
    const stdDevZ = standardDeviation(zValues);
    dataPoints.forEach(d => {
        d.x = (d.x - meanX) / stdDevX;
        d.y = (d.y - meanY) / stdDevY;
        d.z = (d.z - meanZ) / stdDevZ;
    });
}
function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function standardDeviation(arr) {
    const meanValue = mean(arr);
    return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - meanValue, 2), 0) / arr.length);
}

function populateTable() {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = ''; 
    dataPoints.forEach(point => {
        const row = `
            <tr>
                <td>${point.x.toFixed(4)}</td>
                <td>${point.y.toFixed(4)}</td>
                <td>${point.z.toFixed(4)}</td>
                <td>${point.label}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function renderPCA() {
    if (dataPoints.length === 0) return;
    const labels = [...new Set(dataPoints.map(d => d.label))]; 
    const colors = labels.map((label, index) => {
        return `hsl(${(index * 360 / labels.length)} , 100%, 50%)`; 
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
