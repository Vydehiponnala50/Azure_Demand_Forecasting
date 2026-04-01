import joblib
import os
import sys

# Ensure module visibility for preprocessing module to unpickle correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.columns = None
            cls._instance.preprocessor = None
        return cls._instance

    def load(self, model_dir="models"):
        if self.model is None or self.preprocessor is None:
            print("Loading machine learning model and preprocessor into Memory...")
            model_path = os.path.join(model_dir, "xgb_model.pkl")
            columns_path = os.path.join(model_dir, "columns.pkl")
            preprocessor_path = os.path.join(model_dir, "preprocessor.pkl")
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.columns = joblib.load(columns_path)
                self.preprocessor = joblib.load(preprocessor_path)
            else:
                raise FileNotFoundError(f"Missing model files at {model_dir}")
        return self.model, self.columns, self.preprocessor

# Initialize singleton
ml_models = ModelLoader()
