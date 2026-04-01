import pandas as pd
import numpy as np
import joblib
import os
import sys
from datetime import timedelta

# Ensure module visibility
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.model.loader import ml_models

def run_batch_prediction(input_csv="data/raw_data.csv", output_csv="data/forecast_output.csv", model_dir="models"):
    print(f"Running batch predictions on {input_csv}...")
    
    # 1. Load ML assets
    try:
        model, columns, preprocessor = ml_models.load(model_dir=model_dir)
    except Exception as e:
        print(f"Failed to load model: {e}")
        return
        
    # 2. Load input data
    if not os.path.exists(input_csv):
        print(f"Input file not found at {input_csv}")
        return
    
    df = pd.read_csv(input_csv)
    
    # We want to forecast only the last 30 days to act as "new" predictions for the dashboard, 
    # but still use the history for lagged features.
    
    # Let's say we process the entire history to maintain the lag structures exactly
    # 3. Preprocess
    print("Preprocessing data...")
    df_transformed = preprocessor.transform(df)
    
    # Align columns
    for col in columns:
        if col not in df_transformed.columns:
            df_transformed[col] = 0
            
    # Keep only the trained columns
    X = df_transformed[columns]
    
    # 4. Predict
    print("Executing model predict...")
    predictions = model.predict(X)
    
    # 5. Format Output
    output_df = pd.DataFrame()
    output_df['date'] = df_transformed['date'] 
    output_df['region'] = df['region'] 
    output_df['service_type'] = df['service_type']
    
    if 'usage' in df.columns:
        output_df['actual_usage'] = df['usage']
    else:
        output_df['actual_usage'] = np.nan
        
    output_df['predicted_usage'] = [max(0, float(x)) for x in predictions]
    
    # 7. Scaling Feature: Anomaly Detection (3-Sigma Rule on Actual Usage vs Rolling Mean)
    output_df['is_anomaly'] = False
    
    if 'actual_usage' in output_df.columns:
        # Group by region and service type to compute statistical baselines
        for (region, service), group in output_df.groupby(['region', 'service_type']):
            # Need at least a few points to compute std
            if len(group) > 2:
                mean_val = group['actual_usage'].mean()
                std_val = group['actual_usage'].std()
                # 3 standard deviations threshold
                anomaly_mask = np.abs(group['actual_usage'] - mean_val) > (3 * std_val)
                output_df.loc[group.index, 'is_anomaly'] = anomaly_mask

    # Fallback Anomaly detection on predicted usage if actual is missing
    for (region, service), group in output_df.groupby(['region', 'service_type']):
        mean_pred = group['predicted_usage'].mean()
        std_pred = group['predicted_usage'].std()
        pred_anomaly_mask = np.abs(group['predicted_usage'] - mean_pred) > (3 * std_pred)
        # Apply where not already flagged
        output_df.loc[group.index[pred_anomaly_mask], 'is_anomaly'] = True
    
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    output_df.to_csv(output_csv, index=False)
    
    print(f"Batch prediction complete. Saved to {output_csv}")
    
if __name__ == "__main__":
    run_batch_prediction()
