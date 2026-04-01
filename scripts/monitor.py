import pandas as pd
import numpy as np
import logging
from sklearn.metrics import root_mean_squared_error as rmse, mean_absolute_error as mae

# Setup simple logging
logging.basicConfig(
    filename='logs/monitoring.log', 
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)
import os
os.makedirs('logs', exist_ok=True)

def monitor_performance(forecast_csv="data/forecast_output.csv", threshold_increase=1.25):
    print("Initiating performance monitoring...")
    
    try:
        df = pd.read_csv(forecast_csv)
    except FileNotFoundError:
        message = "Forecast CSV not found. Run batch_predict first."
        print(message)
        logging.error(message)
        return
        
    # We only care about rows where 'actual_usage' is known
    eval_df = df.dropna(subset=['actual_usage', 'predicted_usage'])
    
    if len(eval_df) < 100:
        logging.info("Not enough overlap data to compute reliable drift metrics.")
        return
        
    current_rmse = rmse(eval_df['actual_usage'], eval_df['predicted_usage'])
    current_mae = mae(eval_df['actual_usage'], eval_df['predicted_usage'])
    
    log_msg = f"Current RMSE: {current_rmse:.2f} | MAE: {current_mae:.2f}"
    print(log_msg)
    logging.info(log_msg)
    
    # Ideally, we compare to the original model training RMSE 
    # Let's say baseline was 50 for this fake example (we'd store this in model artifact)
    baseline_rmse = 50.0 
    
    if current_rmse > (baseline_rmse * threshold_increase):
        alert_msg = f"ALERT: Model performance has degraded. Current RMSE ({current_rmse:.2f}) is > 25% higher than Baseline ({baseline_rmse}). Consider Retraining."
        print(alert_msg)
        logging.warning(alert_msg)
        
if __name__ == "__main__":
    monitor_performance()
