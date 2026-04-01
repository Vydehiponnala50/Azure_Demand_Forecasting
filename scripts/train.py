import pandas as pd
import numpy as np
import xgboost as xgb
import sys
import os
import joblib
import json
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import root_mean_squared_error as rmse, mean_absolute_error as mae, r2_score

# Add parent dir to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.preprocessing.pipeline import AzureDemandPreprocessor

def train_model(data_path="data/raw_data.csv", model_dir="models/"):
    print(f"Loading data from {data_path}...")
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"File not found: {data_path}. Generate data first.")
        return

    print("Preprocessing data...")
    preprocessor = AzureDemandPreprocessor()
    preprocessor.fit(df)
    
    encoded_df = preprocessor.transform(df)
    
    # Drop rows with NaNs introduced by rolling/lag features (the first 30 days)
    encoded_df = encoded_df.dropna().reset_index(drop=True)
    
    # We want to predict 'usage', so we drop it, along with 'date'
    target = 'usage'
    features = [col for col in encoded_df.columns if col not in [target, 'date']]
    
    X = encoded_df[features]
    y = encoded_df[target]
    
    # Train-test split (Temporal)
    # E.g., Use last 20% by time for validation
    split_index = int(len(encoded_df) * 0.8)
    X_train, X_test = X.iloc[:split_index], X.iloc[split_index:]
    y_train, y_test = y.iloc[:split_index], y.iloc[split_index:]
    
    print(f"Training XGBoost Regressor on {len(X_train)} rows...")
    model = xgb.XGBRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective='reg:squarederror'
    )
    
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    
    print("Evaluating model with TimeSeriesSplit...")
    tscv = TimeSeriesSplit(n_splits=5)
    cv_scores = []
    
    for train_idx, val_idx in tscv.split(X):
        # Local CV split
        X_cv_train, X_cv_val = X.iloc[train_idx], X.iloc[val_idx]
        y_cv_train, y_cv_val = y.iloc[train_idx], y.iloc[val_idx]
        
        # Simple fit on CV fold
        cv_model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, objective='reg:squarederror')
        cv_model.fit(X_cv_train, y_cv_train)
        cv_pred = cv_model.predict(X_cv_val)
        cv_scores.append(rmse(y_cv_val, cv_pred))
        
    print(f"Mean CV RMSE: {np.mean(cv_scores):.2f}")
    
    y_pred = model.predict(X_test)
    error_rmse = rmse(y_test, y_pred)
    error_mae = mae(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"Validation RMSE: {error_rmse:.2f}")
    print(f"Validation MAE: {error_mae:.2f}")
    print(f"Validation R2 Score: {r2:.4f}")
    
    # Extract Feature Importance
    importance = model.feature_importances_
    importance_map = sorted(zip(features, importance.tolist()), key=lambda x: x[1], reverse=True)
    importance_dict = {f: imp for f, imp in importance_map[:10]} # Top 10

    
    # Save Model, Columns, and Preprocessor
    os.makedirs(model_dir, exist_ok=True)
    
    model.save_model(os.path.join(model_dir, "xgb_model.json"))
    joblib.dump(model, os.path.join(model_dir, "xgb_model.pkl"))
    joblib.dump(features, os.path.join(model_dir, "columns.pkl"))
    preprocessor.save(os.path.join(model_dir, "preprocessor.pkl"))
    
    # Save Feature Importance & Metrics as JSON
    with open(os.path.join(model_dir, "feature_importance.json"), "w") as f:
        json.dump(importance_dict, f)
        
    metrics = {
        "rmse": float(error_rmse),
        "mae": float(error_mae),
        "r2": float(r2),
        "cv_rmse_mean": float(np.mean(cv_scores))
    }
    with open(os.path.join(model_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f)
        
    # Also save the current date for batch simulation later
    with open(os.path.join(model_dir, "last_date.txt"), "w") as f:
        f.write(str(encoded_df['date'].max()))
        
    print("Model, columns, and preprocessor saved successfully.")
    
if __name__ == "__main__":
    train_model()
