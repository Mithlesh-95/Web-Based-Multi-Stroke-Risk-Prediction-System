import os
import io
import numpy as np
import pandas as pd
import joblib
import tensorflow as tf

from flask import Flask, render_template, request, redirect, session, send_file
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

app = Flask(__name__)
app.secret_key = "secret123"

# ---------------- LOAD MODELS ----------------
OUTPUT_DIR = "saved_models"

scaler = joblib.load(os.path.join(OUTPUT_DIR, "minmax_scaler.joblib"))
num_imputer = joblib.load(os.path.join(OUTPUT_DIR, "iterative_imputer.joblib"))

encoders = {}
for f in os.listdir(OUTPUT_DIR):
    if f.startswith("le_"):
        col = f.replace("le_", "").replace(".joblib", "")
        encoders[col] = joblib.load(os.path.join(OUTPUT_DIR, f))

dnn = tf.keras.models.load_model(os.path.join(OUTPUT_DIR, "dnn_model.h5"))

feature_order = [
    'gender', 'age', 'hypertension', 'heart_disease', 'ever_married',
    'work_type', 'Residence_type', 'avg_glucose_level', 'bmi', 'smoking_status'
]

# ---------------- SIMPLE USER STORAGE ----------------
users = {}

# ---------------- LOGIN ----------------
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        u = request.form["username"]
        p = request.form["password"]

        if u in users and users[u] == p:
            session["user"] = u
            return redirect("/dashboard")
        else:
            return "Invalid Login"

    return render_template("login.html")


# ---------------- REGISTER ----------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        u = request.form["username"]
        p = request.form["password"]

        users[u] = p
        return redirect("/")

    return render_template("register.html")


# ---------------- DASHBOARD ----------------
@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect("/")
    return render_template("dashboard.html")


# ---------------- PREDICTION ----------------
@app.route("/predict", methods=["GET", "POST"])
def predict():
    if "user" not in session:
        return redirect("/")

    result = None

    if request.method == "POST":

        data = {
            'gender': request.form["gender"],
            'age': float(request.form["age"]),
            'hypertension': int(request.form["hypertension"]),
            'heart_disease': int(request.form["heart_disease"]),
            'ever_married': request.form["ever_married"],
            'work_type': request.form["work_type"],
            'Residence_type': request.form["Residence_type"],
            'avg_glucose_level': float(request.form["avg_glucose_level"]),
            'bmi': float(request.form["bmi"]),
            'smoking_status': request.form["smoking_status"]
        }

        df = pd.DataFrame([data])

        # -------- PREPROCESS --------
        num_cols = [c for c in df.columns if df[c].dtype != 'object']
        df[num_cols] = num_imputer.transform(df[num_cols])

        for c in encoders:
            if c in df.columns:
                le = encoders[c]
                df[c] = df[c].apply(lambda x: x if x in le.classes_ else le.classes_[0])
                df[c] = le.transform(df[c].astype(str))

        df[num_cols] = scaler.transform(df[num_cols])

        x = df[feature_order].values

        # -------- MODEL --------
        prob = dnn.predict(x)[0][0]

        # -------- FUZZY LOGIC --------
        brain = 0
        heart = 0

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
            "brain": round(brain, 3),
            "heart": round(heart, 3),
            "class": final,
            "alert": alert
        }

        # ✅ STORE IN SESSION FOR PDF
        session["result"] = result

    return render_template("prediction.html", result=result)


# ---------------- PDF DOWNLOAD ----------------
@app.route("/download_pdf")
def download_pdf():
    if "result" not in session:
        return "No data available"

    buffer = io.BytesIO()

    doc = SimpleDocTemplate(buffer)
    styles = getSampleStyleSheet()

    r = session["result"]

    content = []
    content.append(Paragraph("Stroke Prediction Report", styles['Title']))
    content.append(Spacer(1, 10))

    content.append(Paragraph(f"Prediction: {r['class']}", styles['Normal']))
    content.append(Paragraph(f"Probability: {r['prob']}", styles['Normal']))
    content.append(Paragraph(f"Brain Score: {r['brain']}", styles['Normal']))
    content.append(Paragraph(f"Heart Score: {r['heart']}", styles['Normal']))
    content.append(Paragraph(f"Alert: {r['alert']}", styles['Normal']))

    doc.build(content)

    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="stroke_report.pdf",
        mimetype="application/pdf"
    )


# ---------------- LOGOUT ----------------
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)