import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import root_mean_squared_error as rmse
import joblib
import os
import sys

# Ensure module visibility
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.preprocessing.pipeline import AzureDemandPreprocessor
from app.model.loader import ml_models

def execute_retraining(data_path="data/raw_data.csv", model_dir="models/"):
    print("Initializing retraining pipeline...")
    os.makedirs(model_dir, exist_ok=True)
    
    # 1. Load Data
    try:
        df = pd.read_csv(data_path)
    except FileNotFoundError:
        print(f"Data file missing: {data_path}")
        return
        
    print("Applying new preprocessor...")
    new_preprocessor = AzureDemandPreprocessor()
    new_preprocessor.fit(df)
    
    encoded_df = new_preprocessor.transform(df).dropna().reset_index(drop=True)
    
    target = 'usage'
    features = [col for col in encoded_df.columns if col not in [target, 'date']]
    X = encoded_df[features]
    y = encoded_df[target]
    
    # Temporal Split
    split_index = int(len(encoded_df) * 0.8)
    X_train, X_test = X.iloc[:split_index], X.iloc[split_index:]
    y_train, y_test = y.iloc[:split_index], y.iloc[split_index:]
    
    # 2. Train New Model Candidate
    print("Training new XGBoost Regressor candidate...")
    new_model = xgb.XGBRegressor(
        n_estimators=250, # Maybe we tune this, let's keep it similar
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        objective='reg:squarederror'
    )
    
    new_model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    
    new_preds = new_model.predict(X_test)
    new_rmse = rmse(y_test, new_preds)
    
    print(f"Candidate Model Validation RMSE: {new_rmse:.2f}")
    
    # 3. Compare with Existing Model
    old_model, old_columns, _ = ml_models.load(model_dir=model_dir)
    
    if old_model is not None:
        try:
            # Prepare X_test for old model (columns might differ if categorical features changed)
            X_test_old = X_test.copy()
            for col in old_columns:
                if col not in X_test_old.columns:
                    X_test_old[col] = 0
            
            old_preds = old_model.predict(X_test_old[old_columns])
            old_rmse_current_data = rmse(y_test, old_preds)
            print(f"Current Production Model RMSE on new data: {old_rmse_current_data:.2f}")
            
            if new_rmse < old_rmse_current_data:
                print("Candidate model is superior. Promoting to production...")
                save_new_model(new_model, new_preprocessor, features, model_dir)
            else:
                print("Candidate model did not improve baseline. Keeping existing model.")
        except Exception as e:
            print(f"Error evaluating old model: {e}. Force-promoting candidate.")
            save_new_model(new_model, new_preprocessor, features, model_dir)
    else:
        print("No existing model found. Promoting candidate to production...")
        save_new_model(new_model, new_preprocessor, features, model_dir)

def save_new_model(model, preprocessor, columns, model_dir):
    # For a real pipeline, we'd add versioning here (v2, v3, etc.)
    # We will just overwrite in this mock scenario
    os.makedirs(model_dir, exist_ok=True)
    model.save_model(os.path.join(model_dir, "xgb_model.json"))
    joblib.dump(model, os.path.join(model_dir, "xgb_model.pkl"))
    joblib.dump(columns, os.path.join(model_dir, "columns.pkl"))
    preprocessor.save(os.path.join(model_dir, "preprocessor.pkl"))
    print("Production Model Updated.")
    
if __name__ == "__main__":
    execute_retraining()
