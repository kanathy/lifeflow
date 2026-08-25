import os
import pandas as pd
import joblib
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# Ensure models directory exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

FEATURES = ['Year', 'Months', 'Month_Number', 'District', 'blood_group', 'rainfall', 'festival']
CATEGORICAL_FEATURES = ['Months', 'District', 'blood_group']

def train_and_save(dataset_file, target_col, output_pkl):
    dataset_path = os.path.join(BASE_DIR, 'datasets', dataset_file)
    print(f"Loading {dataset_path}...")
    df = pd.read_csv(dataset_path)
    
    X = df[FEATURES]
    y = df[target_col]
    
    preprocessor = ColumnTransformer([
        ('categorical', OneHotEncoder(handle_unknown='ignore'), CATEGORICAL_FEATURES)
    ], remainder='passthrough')
    
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1))
    ])
    
    print(f"Training model for {target_col}...")
    model.fit(X, y)
    
    save_path = os.path.join(MODELS_DIR, output_pkl)
    joblib.dump(model, save_path)
    print(f"Saved {output_pkl} to {save_path}")
    return model

# 1. Train Accident Model
print("[1/2] Training Accident Model from accident_usage_dataset.csv...")
train_and_save('accident_usage_dataset.csv', 'Accident_Usage', 'accident_model.pkl')

# 2. Train Disease Model
print("[2/2] Training Disease Model from disease_usage_dataset.csv...")
train_and_save('disease_usage_dataset.csv', 'Disease_Usage', 'disease_model.pkl')

print("\nAll models trained and saved successfully from actual datasets!")
