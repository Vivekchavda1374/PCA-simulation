# PCA Simulation

## Overview

This project provides a **Principal Component Analysis (PCA)** simulation that allows you to visualize and explore 3D data points. The simulation lets users upload datasets, normalize data, and perform PCA for dimensionality reduction. It includes interactive features such as hover tooltips displaying point labels and a 3D scatter plot for visualizing the data.

The project also supports the classification of data points into different categories (classes) and displays the results on a 3D plot, where each class is color-coded. Additionally, the dataset can be provided in either CSV or Excel format.

## Features

- **Data Upload**: Upload your data in CSV or Excel format with three numerical features (`X`, `Y`, `Z`) and an optional label column for class information.
- **Data Normalization**: Normalize your data using Min-Max scaling or Z-score (standardization).
- **PCA Visualization**: Use PCA to reduce the dimensions of your dataset, enabling a 3D visualization of the data.
- **Interactive 3D Plot**: Hover over data points to view their labels and click on them to see detailed information.
- **Data Table**: A table displays the original and normalized data along with the class labels.

## Requirements

- **HTML/CSS/JavaScript**: The front-end web framework for displaying and interacting with the PCA data.
- **Plotly**: For creating interactive 3D plots.
- **PapaParse**: For parsing CSV files.
- **XLSX.js**: For parsing Excel files.

## Getting Started

To get started, you need to clone the repository and set it up on your local machine.

### Prerequisites

- A modern web browser (Google Chrome, Mozilla Firefox, etc.).
- No additional installations are required beyond having a working browser.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Vivekchavda1374/pca-simulation.git
