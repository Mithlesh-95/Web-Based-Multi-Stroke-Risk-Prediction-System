
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load Models and Encoders
MODEL_DIR = "model"
models = {}
encoders = {}

def load_artifacts():
    global models, encoders
    try:
        models['ischemic'] = joblib.load(os.path.join(MODEL_DIR, "ischemic_model.pkl"))
        models['hemorrhagic'] = joblib.load(os.path.join(MODEL_DIR, "hemorrhagic_model.pkl"))
        models['recurrent'] = joblib.load(os.path.join(MODEL_DIR, "recurrent_model.pkl"))
        encoders = joblib.load(os.path.join(MODEL_DIR, "label_encoders.pkl"))
        print("Models and Encoders loaded successfully.")
    except Exception as e:
        print(f"Error loading artifacts: {e}")

load_artifacts()

# Feature order expected by the model
FEATURE_ORDER = [
    'gender', 'age', 'hypertension', 'heart_disease',
    'ever_married', 'work_type', 'Residence_type',
    'avg_glucose_level', 'bmi', 'smoking_status'
]

@app.route('/')
def index():
    return "NeuroCardia ML API is running."

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Create DataFrame from input
        # Ensure all features are present
        input_data = {}
        for feature in FEATURE_ORDER:
            val = data.get(feature)
            if val is None:
                return jsonify({"error": f"Missing feature: {feature}"}), 400
            input_data[feature] = [val]
            
        df = pd.DataFrame(input_data)
        
        # Preprocess / Encode
        # 1. Encode categorical variables
        for col, le in encoders.items():
            if col in df.columns:
                # Handle unseen labels carefully? Or just try/except
                try:
                    df[col] = le.transform(df[col])
                except ValueError as e:
                    return jsonify({"error": f"Invalid value for {col}: {df[col].iloc[0]}. Allowed: {list(le.classes_)}"}), 400

        # 2. Ensure numeric types for others
        # (Already handled if valid JSON numbers are sent, but good to cast)
        numeric_cols = ['age', 'hypertension', 'heart_disease', 'avg_glucose_level', 'bmi']
        numeric_cols = ['age', 'hypertension', 'heart_disease', 'avg_glucose_level', 'bmi']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col])

        # 3. Validate Ranges
        age_val = df['age'].iloc[0]
        glucose_val = df['avg_glucose_level'].iloc[0]
        bmi_val = df['bmi'].iloc[0]

        if not (0 <= age_val <= 120):
            return jsonify({"error": "Age must be between 0 and 120."}), 400
        if not (20 <= glucose_val <= 5000): # generous upper bound, but not 1M
             return jsonify({"error": "Avg Glucose Level must be between 20 and 5000."}), 400
        if not (10 <= bmi_val <= 200):
             return jsonify({"error": "BMI must be between 10 and 200."}), 400


        # Make Predictions
        predictions = {
            "ischemic_stroke_risk": int(models['ischemic'].predict(df)[0]),
            "hemorrhagic_stroke_risk": int(models['hemorrhagic'].predict(df)[0]),
            "recurrent_stroke_risk": int(models['recurrent'].predict(df)[0]),
            # We can also get probabilities if needed
            "ischemic_stroke_prob": float(models['ischemic'].predict_proba(df)[0][1]),
            "hemorrhagic_stroke_prob": float(models['hemorrhagic'].predict_proba(df)[0][1]),
            "recurrent_stroke_prob": float(models['recurrent'].predict_proba(df)[0][1]),
        }

        return jsonify(predictions)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
