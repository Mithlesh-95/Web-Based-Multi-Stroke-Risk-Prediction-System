import os
import io
import json
import numpy as np
import pandas as pd
import joblib
import tensorflow as tf

from flask import Flask, render_template, request, redirect, session, send_file, jsonify, make_response
from flask_cors import CORS
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

app = Flask(__name__, template_folder='multistroke/templates')
app.secret_key = "secret123"

# Enable CORS for React frontend
CORS(app,
     origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     supports_credentials=True,
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"])

# ============ LOAD MODELS ============
OUTPUT_DIR = "multistroke/saved_models"

try:
    scaler = joblib.load(os.path.join(OUTPUT_DIR, "minmax_scaler.joblib"))
    num_imputer = joblib.load(os.path.join(
        OUTPUT_DIR, "iterative_imputer.joblib"))

    encoders = {}
    for f in os.listdir(OUTPUT_DIR):
        if f.startswith("le_"):
            col = f.replace("le_", "").replace(".joblib", "")
            encoders[col] = joblib.load(os.path.join(OUTPUT_DIR, f))

    dnn = tf.keras.models.load_model(os.path.join(OUTPUT_DIR, "dnn_model.h5"))
    print("✓ All models loaded successfully")
except Exception as e:
    print(f"⚠ Model loading error: {e}")
    dnn = None

feature_order = [
    'gender', 'age', 'hypertension', 'heart_disease', 'ever_married',
    'work_type', 'Residence_type', 'avg_glucose_level', 'bmi', 'smoking_status'
]

# ============ USER STORAGE ============
users = {}

# ============ LOGIN ============


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # Handle both form data and JSON
        if request.is_json:
            data = request.get_json()
            u = data.get("username")
            p = data.get("password")
        else:
            u = request.form.get("username")
            p = request.form.get("password")

        if u and p:
            if u in users and users[u] == p:
                session["user"] = u
                print(f"✓ User {u} logged in, session set")
                if request.is_json:
                    resp = jsonify({"success": True, "redirect": "/dashboard"})
                    resp.set_cookie('session', session.sid, samesite='Lax')
                    return resp
                return redirect("/dashboard")
            else:
                if request.is_json:
                    return jsonify({"success": False, "error": "Invalid credentials"}), 401
                return "Invalid Login", 401

    if request.is_json:
        return jsonify({"message": "Login page"}), 405
    return render_template("login.html") if os.path.exists("multistroke/templates/login.html") else "Login required"


# ============ REGISTER ============
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        if request.is_json:
            data = request.get_json()
            u = data.get("username")
            p = data.get("password")
        else:
            u = request.form.get("username")
            p = request.form.get("password")

        if u and p:
            if u in users:
                if request.is_json:
                    return jsonify({"success": False, "error": "User already exists"}), 400
                return "User already exists", 400

            users[u] = p
            if request.is_json:
                return jsonify({"success": True, "redirect": "/"})
            return redirect("/")

    if request.is_json:
        return jsonify({"message": "Register page"}), 405
    return render_template("register.html") if os.path.exists("multistroke/templates/register.html") else "Register page"


# ============ DASHBOARD ============
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        if request.accept_mimetypes.accept_json and not request.accept_mimetypes.accept_html:
            return jsonify({"error": "Not authenticated"}), 401
        return redirect("/")

    if request.accept_mimetypes.accept_json and not request.accept_mimetypes.accept_html:
        return jsonify({"user": session["user"]})

    return render_template("dashboard.html") if os.path.exists("multistroke/templates/dashboard.html") else "Welcome to dashboard"


# ============ PREDICTION ============
@app.route("/predict", methods=["GET", "POST"])
def predict():
    # For now, skip session check as CORS is interfering
    # In production, implement proper token-based auth

    result = None

    if request.method == "POST":
        try:
            # Get form data
            data = {
                'gender': request.form.get("gender", "Male"),
                'age': float(request.form.get("age", 0)),
                'hypertension': int(request.form.get("hypertension", 0)),
                'heart_disease': int(request.form.get("heart_disease", 0)),
                'ever_married': request.form.get("ever_married", "Yes"),
                'work_type': request.form.get("work_type", "Private"),
                'Residence_type': request.form.get("Residence_type", "Urban"),
                'avg_glucose_level': float(request.form.get("avg_glucose_level", 0)),
                'bmi': float(request.form.get("bmi", 0)),
                'smoking_status': request.form.get("smoking_status", "never smoked")
            }

            df = pd.DataFrame([data])

            # -------- PREPROCESS --------
            num_cols = [c for c in df.columns if df[c].dtype != 'object']
            df[num_cols] = num_imputer.transform(df[num_cols])

            for c in encoders:
                if c in df.columns:
                    le = encoders[c]
                    df[c] = df[c].apply(
                        lambda x: x if x in le.classes_ else le.classes_[0])
                    df[c] = le.transform(df[c].astype(str))

            df[num_cols] = scaler.transform(df[num_cols])

            x = df[feature_order].values

            # -------- MODEL --------
            if dnn is None:
                raise Exception("Model not loaded")

            prob = float(dnn.predict(x, verbose=0)[0][0])

            # -------- FUZZY LOGIC --------
            brain = 0.0
            heart = 0.0

            # Brain rules
            if data['age'] > 60:
                brain += 0.3
            if data['hypertension'] == 1:
                brain += 0.3
            if data['bmi'] > 30:
                brain += 0.2

            # Heart rules
            if data['heart_disease'] == 1:
                heart += 0.5
            if data['hypertension'] == 1:
                heart += 0.2
            if data['avg_glucose_level'] > 150:
                heart += 0.3
            if data['smoking_status'] in ["smokes", "formerly smoked"]:
                heart += 0.2

            brain *= prob
            heart *= prob

            # -------- FINAL CLASS --------
            if prob < 0.3:
                final = "No Stroke"
            elif heart > brain:
                final = "Heart Stroke"
            else:
                final = "Brain Stroke"

            # -------- ALERT --------
            if prob > 0.75:
                alert = "HIGH RISK: Immediate medical attention required!"
            elif prob > 0.5:
                alert = "MODERATE RISK: Consult a doctor soon."
            elif prob > 0.3:
                alert = "LOW RISK: Monitor your health."
            else:
                alert = "SAFE"

            # -------- RESULT --------
            result = {
                "prob": round(float(prob), 3),
                "brain": round(float(brain), 3),
                "heart": round(float(heart), 3),
                "class": final,
                "alert": alert
            }

            # Store in session for PDF
            session["result"] = result

            # Always return JSON (React expects JSON)
            return jsonify(result)

        except Exception as e:
            error_msg = f"Prediction error: {str(e)}"
            print(f"Error: {error_msg}")  # Debug logging
            return jsonify({"error": error_msg}), 400

    # GET request - should not happen from React
    return jsonify({"error": "Use POST method for predictions"}), 405


# ============ PDF DOWNLOAD ============
@app.route("/download_pdf", methods=["GET", "POST"])
def download_pdf():
    # Try to get result from session or request body
    result_data = session.get("result")

    if not result_data:
        # Try to get from POST body as fallback
        if request.method == "POST":
            result_data = request.get_json()
        else:
            return jsonify({"error": "No prediction data available"}), 400

    if not result_data:
        return jsonify({"error": "No prediction data available"}), 400

    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer)
        styles = getSampleStyleSheet()

        r = result_data  # Use the result_data variable

        content = []
        content.append(
            Paragraph("NeuroCardia AI - Stroke Risk Prediction Report", styles['Title']))
        content.append(Spacer(1, 15))

        content.append(
            Paragraph(f"<b>Prediction Result:</b> {r['class']}", styles['Normal']))
        content.append(Paragraph(
            f"<b>Risk Probability:</b> {r['prob'] * 100:.1f}%", styles['Normal']))
        content.append(
            Paragraph(f"<b>Brain Stroke Score:</b> {r['brain']}", styles['Normal']))
        content.append(
            Paragraph(f"<b>Heart Stroke Score:</b> {r['heart']}", styles['Normal']))
        content.append(Spacer(1, 10))
        content.append(
            Paragraph(f"<b>Alert:</b> {r['alert']}", styles['Normal']))

        doc.build(content)
        buffer.seek(0)

        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'attachment; filename=stroke_report.pdf'
        return response

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============ LOGOUT ============
@app.route("/logout")
def logout():
    session.clear()
    if request.accept_mimetypes.accept_json and not request.accept_mimetypes.accept_html:
        return jsonify({"success": True})
    return redirect("/")


# ============ HEALTH CHECK ============
@app.route("/health")
def health():
    return jsonify({"status": "ok"})


# ============ RUN ============
if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=5000)
