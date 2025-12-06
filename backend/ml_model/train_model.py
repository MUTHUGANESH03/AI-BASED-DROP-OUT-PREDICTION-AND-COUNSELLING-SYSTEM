# backend/ml_model/train_model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from joblib import dump
import os

# Define the path to save the model files
MODEL_DIR = 'backend/ml_model'
os.makedirs(MODEL_DIR, exist_ok=True)

def train_and_save_model():
    """
    Simulates training a classification model on dummy data 
    and saves the model and feature list.
    """
    print("Starting ML Model Training Simulation...")
    
    # 1. Simulate Historical Data (Features used for prediction)
    N = 1000
    data = {
        'gpa': np.random.uniform(1.8, 4.0, N),
        'attendance': np.random.uniform(50, 100, N),
        'backlogs': np.random.randint(0, 4, N),
        'financial_need': np.random.randint(0, 2, N), # 1 for need, 0 otherwise
    }
    df = pd.DataFrame(data)
    
    # 2. Simulate Target Variable (is_dropout: 1=Yes, 0=No)
    # Risk is higher for low GPA and low attendance
    df['is_dropout'] = np.where(
        (df['gpa'] < 2.5) | 
        (df['attendance'] < 70) | 
        (df['backlogs'] > 1) |
        (df['financial_need'] == 1) & (df['gpa'] < 3.0),
        1, 
        0
    )
    # Introduce some randomness to make it a non-perfect model
    df['is_dropout'] = df['is_dropout'].apply(lambda x: 1 - x if np.random.rand() < 0.15 else x)

    X = df[['gpa', 'attendance', 'backlogs', 'financial_need']]
    y = df['is_dropout']
    
    # 3. Train Model
    model = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42)
    model.fit(X, y)
    
    # 4. Save Model and Feature Names
    dump(model, os.path.join(MODEL_DIR, 'model.pkl'))
    dump(list(X.columns), os.path.join(MODEL_DIR, 'features.joblib'))
    
    print("ML Model training complete.")
    print(f"Accuracy (on training data): {model.score(X, y):.2f}")
    print(f"Files saved: model.pkl and features.joblib in {MODEL_DIR}")

if __name__ == '__main__':
    train_and_save_model()
    