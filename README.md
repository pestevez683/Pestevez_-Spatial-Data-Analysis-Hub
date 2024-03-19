# Sentinel-2 and TRMM Analysis
This script utilizes Google Earth Engine to analyze seasonal changes in vegetation (NDVI) and precipitation using Sentinel-2 satellite imagery and TRMM precipitation data. It filters images by dates, removes clouds, calculates NDVI, and generates time series charts for different points of interest. Additionally, it creates compositions of NDVI for the dry and wet seasons, as well as RGB composite images for visualization.
Broadly, the code performs the following actions:
Filters a Sentinel-2 image collection for a specific area of interest and time period. 
Applies a cloud filter to the Sentinel-2 images to remove cloud-affected pixels. 
Calculates the Normalized Difference Vegetation Index (NDVI) for each cloud-free image. 
Generates NDVI time series for specific points of interest. 
Imports TRMM precipitation data and calculates monthly precipitation for the area of interest. 
Generates a precipitation time series. 
Performs NDVI compositions for the dry and wet seasons. 
Create composite RGB and NIR-SWIR-RED images for both dry and wet seasons and visualize them. 
Combine wet dataset images into a single ImageCollection, clip them to the area of interest. 

## Usage
1. Ensure you have access to Google Earth Engine and are authenticated.
2. Copy and paste the script into the Google Earth Engine Code Editor.
3. Modify the script parameters as needed, such as the region of interest and date range.
4. Run the script to visualize the seasonal changes in vegetation and precipitation

## Contribution guidelines

Issues and Suggestions: If you find a bug or have an idea for improvement, you can open an issue on GitHub. Please provide clear details, and if possible, include examples or screenshots.

Pull Requests (PR): If you'd like to contribute code, you can submit a pull request. Here's how:
1. Fork the repository.
2. Make your changes in a new branch.
3. Submit the pull request to the main branch of the repository.

Feedback and Comments:If you have any comments about the script or suggestions on how to improve the contribution process, feel free to share them in the issues.

## Assets
[![Sentinel-2-with-Cloud-Filtering.png](https://i.postimg.cc/bw0c99n1/Sentinel-2-with-Cloud-Filtering.png)](https://postimg.cc/NK0zgTp0)
[![NDVI-during-Wet-Season.png](https://i.postimg.cc/XNhbjJ3B/NDVI-during-Wet-Season.png)](https://postimg.cc/Yj1V8tvt)
[![NDVI-Time-Series.png](https://i.postimg.cc/NfHw5cfJ/NDVI-Time-Series.png)](https://postimg.cc/MvqLFgBV)
[![Time-Series-of-Precipitation.png](https://i.postimg.cc/g2bbhTxY/Time-Series-of-Precipitation.png)](https://postimg.cc/LnDWKvk7)
