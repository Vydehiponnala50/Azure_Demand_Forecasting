import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
import joblib
import os

class AzureDemandPreprocessor(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.mean_usage_per_group = {}
        self.feature_columns = []
        
    def fit(self, X, y=None):
        X = X.copy()
        X['date'] = pd.to_datetime(X['date'])
        
        # Calculate mean usage per region and service type for filling NaNs robustly
        if 'usage' in X.columns:
            self.mean_usage_per_group = X.groupby(['region', 'service_type'])['usage'].mean().to_dict()
            
        # Store expected categorical columns
        temp_df = pd.get_dummies(X, columns=['region', 'service_type'])
        self.feature_columns = [c for c in temp_df.columns if c != 'usage' and c != 'date']
            
        return self

    def transform(self, X):
        df = X.copy()
        
        # 1. Type conversions & cleaning
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values(by=['region', 'service_type', 'date']).reset_index(drop=True)
        
        # 2. Missing value handling (if target 'usage' is provided, we fill it for historical context)
        if 'usage' in df.columns:
            # First try forward fill per group
            df['usage'] = df.groupby(['region', 'service_type'])['usage'].ffill()
            
            # Then fallback to categorical means if still missing
            for (r, s), group_mean in self.mean_usage_per_group.items():
                mask = (df['region'] == r) & (df['service_type'] == s) & df['usage'].isna()
                df.loc[mask, 'usage'] = group_mean
                
            # Final fallback
            df['usage'] = df['usage'].fillna(df['usage'].mean())

        # 3. Time-based features
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['weekday'] = df['date'].dt.weekday
        df['is_weekend'] = (df['weekday'] >= 5).astype(int)
        df['seasonality_flag'] = np.sin(2 * np.pi * df['date'].dt.dayofyear / 365.0)
        
        # 4. Feature Engineering (Lags and Rolling)
        if 'usage' in df.columns:
            # We group by region & service to calculate time series features
            grouped = df.groupby(['region', 'service_type'])
            
            df['usage_lag_1'] = grouped['usage'].shift(1)
            df['usage_lag_7'] = grouped['usage'].shift(7)
            df['usage_lag_30'] = grouped['usage'].shift(30)
            
            df['rolling_mean_7'] = grouped['usage'].transform(lambda x: x.shift(1).rolling(window=7, min_periods=1).mean())
            df['rolling_mean_14'] = grouped['usage'].transform(lambda x: x.shift(1).rolling(window=14, min_periods=1).mean())
        else:
            # If 'usage' is not in the DataFrame (e.g. single row prediction without history),
            # this would be handled differently. Typically we pass the historical data along 
            # with the new data to be predicted to the pipeline.
            pass
            
        # 5. Categorical Encoding (One-Hot)
        df = pd.get_dummies(df, columns=['region', 'service_type'])
        
        # Ensure all columns from training are present
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        # Ensure only expected columns are returned (reordering and dropping extras)
        # Note: 'date' and 'usage' may still be present for context if needed, but we often want consistent feature set
        # For simplicity in this demo, we'll return all, but main.py filters it.
        
        return df
        
    def save(self, filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath):
        return joblib.load(filepath)
