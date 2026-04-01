import schedule
import time
import subprocess
import logging
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up logging
logging.basicConfig(
    filename='logs/scheduler.log', 
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
os.makedirs('logs', exist_ok=True)

def run_batch_job():
    logging.info("Starting Daily Batch Prediction Job...")
    print("Starting Daily Batch Prediction Job...")
    try:
        # Run batch predict
        subprocess.run(["python", "scripts/batch_predict.py"], check=True)
        # Run monitoring
        subprocess.run(["python", "scripts/monitor.py"], check=True)
        logging.info("Batch prediction finished successfully.")
        print("Batch prediction finished successfully.")
    except Exception as e:
        logging.error(f"Batch prediction failure: {e}")
        print(f"Batch prediction failure: {e}")

# This meets the prompt: "Run daily at 06:00"
schedule.every().day.at("06:00").do(run_batch_job)

if __name__ == "__main__":
    print("Scheduler initiated. Waiting for 06:00...")
    logging.info("Scheduler started.")
    
    # For testing, we also run it once immediately if test arg provided
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print("Running one-time batch job for testing...")
        run_batch_job()
    
    while True:
        schedule.run_pending()
        time.sleep(60)
