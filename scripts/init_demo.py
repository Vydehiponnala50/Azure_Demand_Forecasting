import os
import sys
import subprocess

def run_step(name, command):
    print(f"\n>>> Running Step: {name}")
    try:
        # Use sys.executable to ensure we use the same python that is running this script
        subprocess.run([sys.executable] + command.split(), check=True)
        print(f"--- {name} Complete ---")
    except subprocess.CalledProcessError as e:
        print(f"!!! Error in {name}: {e}")
        sys.exit(1)

def main():
    print("=== Azure Demand Forecasting System Initialization ===\n")
    
    # 1. Generate Data
    run_step("Data Generation", "scripts/generate_data.py")
    
    # 2. Train Model
    run_step("Model Training", "scripts/train.py")
    
    # 3. Initial Batch Prediction (Populate Dashboard)
    run_step("Initial Batch Prediction", "scripts/batch_predict.py")
    
    print("\n=== Initialization Successful ===")
    print("You can now start the FastAPI backend: uvicorn app.main:app --reload")

if __name__ == "__main__":
    main()
