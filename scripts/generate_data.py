import numpy as np
import pandas as pd
import os
from datetime import timedelta

def generate_azure_demand_data(
    start_date="2022-01-01",
    end_date="2024-01-01",
    output_path="../data/raw_data.csv"
):
    print("Generating Azure synthetic demand data...")
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    regions = ["East US", "West Europe", "South India", "Southeast Asia"]
    service_types = ["compute", "storage", "network"]
    
    records = []
    
    for region in regions:
        # Base multiplier per region
        region_base = {
            "East US": 1.5,
            "West Europe": 1.2,
            "South India": 0.8,
            "Southeast Asia": 1.0
        }[region]
        
        for service in service_types:
            base_usage = 1000 * region_base
            
            for i, d in enumerate(dates):
                # Day of week effect: Weekends drop for compute/network
                is_weekend = d.weekday() >= 5
                dow_effect = 1.0
                if is_weekend and service != "storage":
                    dow_effect = 0.7
                    
                # Seasonal effect: Summer peaks and holiday peaks
                season_effect = 1.0 + 0.1 * np.sin(2 * np.pi * d.dayofyear / 365)
                
                # Trend effect: General linear growth over time
                trend = 1.0 + (i / len(dates)) * 0.5
                
                # specific service growth
                if service == "storage":
                    trend += (i / len(dates)) * 0.3 # storage grows faster
                
                noise = np.random.normal(0, 50 * region_base)
                
                usage = base_usage * dow_effect * season_effect * trend + noise
                
                # Inject missing values arbitrarily (2% chance)
                if np.random.rand() < 0.02:
                    usage = np.nan
                else:
                    usage = max(0, int(usage)) # ensure non-negative
                
                records.append({
                    "date": d,
                    "region": region,
                    "service_type": service,
                    "usage": usage
                })
                
    df = pd.DataFrame(records)
    
    # Shuffle slightly to mimic real disorganized data logs
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Data saved to {output_path} with {len(df)} rows.")

if __name__ == "__main__":
    generate_azure_demand_data(output_path="data/raw_data.csv")
