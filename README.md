🚀 Azure Demand Forecasting
📌 Project Overview

This project focuses on forecasting Azure Compute and Storage demand using Machine Learning techniques.
The objective is to analyze Azure resource usage patterns and build predictive models for demand forecasting using historical data.
This repository currently contains Milestone 1 & Milestone 2 combined in a single notebook file (milestone.ipynb).

🗂️ Project Structure
Azure-Demand-Forecasting/
│
├── azure_usage.csv
├── milestone.ipynb
└── README.md
📊 Dataset Used
📁 azure_usage.csv

The dataset contains:
-timestamp
-Azure Region
-CPU Usage
-Storage Usage
-Active Users

This dataset is used for time-series forecasting of Azure demand.

🧼 Data Preparation (Milestone 1)
Converted date column to datetime format
Checked and handled missing values
Verified data types
Cleaned column names
Sorted dataset based on date for time-series consistency

✅ Cleaned dataset prepared for modeling

🤖 Feature Engineering & Model Development (Milestone 2)
🔹 Feature Engineering

Created lag features for CPU and Storage usage
Generated rolling statistics (mean, standard deviation)
Extracted time-based features (month, day, quarter)
Performed time-based train-test split

🔹 Model Building

Applied regression models for demand forecasting

Trained model on historical Azure usage data

📈 Key Insights

CPU usage trends vary across regions
Storage demand shows steady growth patterns
Active users significantly influence resource usage
Time-based features improve forecasting performance

🛠️ Tech Stack

Python
pandas
numpy
matplotlib
seaborn
scikit-learn
Jupyter Notebook

📌 Current Status

✅ Data Cleaning Completed
✅ Feature Engineering Completed
