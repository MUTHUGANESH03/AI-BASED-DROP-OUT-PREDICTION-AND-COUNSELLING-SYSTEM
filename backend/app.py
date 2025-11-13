# backend/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from joblib import load
import pandas as pd
import numpy as np
import os
from bson.json_util import dumps
from utils.db_connection import get_student_collection, get_interventions_collection, get_quizzes_collection

app = Flask(__name__)
# Allow requests from your frontend (assuming it runs on http://127.0.0.1:5500 or similar)
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

# --- ML Model Loading ---
MODEL_PATH = 'ml_model/model.pkl'
FEATURES_PATH = 'ml_model/features.joblib'
ML_MODEL = None
ML_FEATURES = []

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(FEATURES_PATH):
        ML_MODEL = load(MODEL_PATH)
        ML_FEATURES = load(FEATURES_PATH)
        print("ML Model loaded successfully.")
    else:
        print("WARNING: ML Model files not found. Run train_model.py first.")
except Exception as e:
    print(f"Error loading ML model: {e}")

# --- Helper Functions ---

def get_risk_factors_and_impact(input_data, features):
    """
    Simulates feature importance/SHAP to provide factor attribution based on input data.
    In a real system, this uses model explainability, but here we use rule-based logic.
    """
    factors = []
    
    # 1. Low Attendance (High Impact)
    if input_data.get('attendance', 100) < 70:
        factors.append({"name": "Low Attendance", "impact": 25, "severity": "high"})
    
    # 2. Poor GPA (Medium Impact)
    if input_data.get('gpa', 4.0) < 2.5:
        factors.append({"name": "Below Average GPA", "impact": 20, "severity": "medium"})

    # 3. Backlogs (Medium-High Impact)
    if input_data.get('backlogs', 0) >= 1:
        factors.append({"name": "One or More Backlogs", "impact": 15, "severity": "medium"})

    # 4. Financial Need (Low Impact - Socioeconomic)
    if input_data.get('financial_need', 0) == 1:
        factors.append({"name": "Reported Financial Constraint", "impact": 10, "severity": "low"})

    return factors

# --- API Endpoints ---

@app.route('/api/predict/risk', methods=['POST'])
def predict_risk():
    """Endpoint for the frontend to submit student data and get a risk prediction."""
    data = request.json
    
    if ML_MODEL is None:
        return jsonify({"error": "ML model is not loaded. Please train it first."}), 500

    # Ensure all features required by the model are present, using 0 as a default fallback
    try:
        input_vector = [data.get(f, 0) for f in ML_FEATURES]
        df_input = pd.DataFrame([input_vector], columns=ML_FEATURES)
        
    except Exception as e:
        return jsonify({"error": f"Invalid data format received: {e}"}), 400

    # Predict probability of dropout (P(Dropout=1))
    probability = ML_MODEL.predict_proba(df_input)[0][1]
    risk_score = int(probability * 100) # Scale to 0-100

    # Determine risk level
    risk_level = "high" if risk_score >= 70 else ("medium" if risk_score >= 40 else "low")

    # Get factors (using helper function)
    factors = get_risk_factors_and_impact(data, ML_FEATURES)

    return jsonify({
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "factors": factors
    })

@app.route('/api/students', methods=['GET'])
def get_all_students():
    """Fetch all student profiles for the counselor dashboard."""
    students_collection = get_student_collection()
    if not students_collection:
        return jsonify({"error": "Database connection failed"}), 500

    # Fetch data and use dumps to correctly handle MongoDB's ObjectId and ISODate
    students_data = list(students_collection.find({}))
    
    # Return JSON string handled by dumps, then loaded by jsonify for Flask
    return app.response_class(
        response=dumps(students_data),
        status=200,
        mimetype='application/json'
    )

@app.route('/api/intervention/log', methods=['POST'])
def log_intervention():
    """Log a counselor intervention and update a student's record (optional)."""
    log_data = request.json
    
    interventions_collection = get_interventions_collection()
    if not interventions_collection:
        return jsonify({"error": "Database connection failed"}), 500

    # 1. Log the intervention
    result = interventions_collection.insert_one(log_data)
    
    # 2. Update the student's 'lastContact' field (Example of data modification)
    # student_id = log_data.get('student_id')
    # get_student_collection().update_one(
    #     {"student_id": student_id},
    #     {"$set": {"last_contact_date": datetime.datetime.now()}}
    # )

    return jsonify({"message": "Intervention logged successfully", "log_id": str(result.inserted_id)}), 201

# --- Run Application ---
if __name__ == '__main__':
    # Use 5000 for the backend API to avoid conflicts with common frontend servers (like 3000 or 8080)
    app.run(debug=True, port=5000)
         

