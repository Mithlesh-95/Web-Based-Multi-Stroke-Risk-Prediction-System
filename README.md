# 🧠 NeuroCardia AI - Multi-Stroke Risk Prediction System (v2.0 - INTEGRATED)

**Predict. The Unseen.** | Web-Based Multi-Stroke Risk Prediction System

## 📖 About The Project

**NeuroCardia AI** is an advanced, web-based platform designed to assess and predict the risk of multiple types of strokes using AI-powered deep neural networks. This integrated version combines a modern React frontend with a Flask backend featuring:

### ✨ Key Features

- **AI-Powered Deep Neural Network**: 88% accurate DNN model trained on stroke prediction data
- **User Authentication**: Secure login/registration system
- **Interactive 3D Visualizations**: Immersive Brain and Heart models with Spline & Three.js
- **Risk Assessment Dashboard**: Real-time multi-stroke risk analysis
- **Fuzzy Logic Scoring**: Brain & Heart stroke probability scoring
- **PDF Report Generation**: Download detailed prediction reports
- **Multi-stroke Classification**: No Stroke, Brain Stroke, Heart Stroke
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Built With

**Frontend:**
- [React 19](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite 7](https://vitejs.dev/) - Build tool
- [Three.js](https://threejs.org/) & [Spline](https://spline.design/) - 3D visualizations

**Backend:**
- [Flask 2.3](https://flask.palletsprojects.com/) - Web framework
- [TensorFlow/Keras](https://www.tensorflow.org/) - Deep learning model
- [Pandas/NumPy](https://pandas.pydata.org/) - Data processing
- [ReportLab](https://www.reportlab.com/) - PDF generation

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ 
- Node.js 16+
- pip & npm/yarn

### Installation & Setup

1. **Clone & Navigate:**
   ```bash
   cd d:\Projects\mini-demo
   ```

2. **Backend Setup:**
   ```bash
   # Create virtual environment (optional)
   python -m venv venv
   venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   npm install
   ```

4. **Run the Application:**

   **Terminal 1 - Start Flask Backend:**
   ```bash
   python app.py
   ```
   Backend runs at: `http://127.0.0.1:5000`

   **Terminal 2 - Start React Frontend:**
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

## 📁 Project Structure

```
mini-demo/
├── app.py                          # ⭐ MAIN INTEGRATED FLASK BACKEND
├── requirements.txt                # Python dependencies
├── package.json                    # Node dependencies  
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
│
├── src/
│   ├── App.tsx                     # ⭐ Main app with routing
│   ├── App.css                     
│   ├── main.tsx                    
│   └── components/
│       ├── Login.tsx              # ⭐ Login form
│       ├── Register.tsx           # ⭐ Registration form
│       ├── Dashboard.tsx          # ⭐ User dashboard
│       ├── Prediction.tsx         # ⭐ Prediction form & results
│       ├── RiskAssessment.tsx     # Landing page demo
│       ├── ProblemStatement.tsx   # Info section
│       ├── Auth.css               # Auth component styles
│       ├── Dashboard.css          # Dashboard styles
│       └── Prediction.css         # Prediction styles
│
├── multistroke/
│   ├── saved_models/              # ⭐ PRE-TRAINED MODELS
│   │   ├── dnn_model.h5          # Deep Neural Network
│   │   ├── minmax_scaler.joblib  # Feature scaling
│   │   ├── iterative_imputer.joblib # Data imputation
│   │   └── le_*.joblib           # Label encoders
│   └── templates/                 # HTML templates (legacy)
│
└── index.html                      # HTML entry point
```

## 🤖 AI Model Details

### Architecture
- **Type**: Sequential Deep Neural Network
- **Framework**: TensorFlow/Keras
- **Input Features**: 10 clinical parameters
- **Output**: Stroke probability (0-1)
- **Accuracy**: ~88% on validation set

### Clinical Parameters Analyzed

1. **Gender** - Male/Female
2. **Age** - 0-120 years
3. **Hypertension** - Yes/No
4. **Heart Disease** - Yes/No
5. **Marital Status** - Yes/No
6. **Work Type** - 5 categories
7. **Residence Type** - Urban/Rural
8. **Average Glucose Level** - 20-5000 mg/dL
9. **BMI** - 10-200 kg/m²
10. **Smoking Status** - 3 categories

### Prediction Logic

**Neural Network Output** → **Fuzzy Logic Analysis**

**Brain Stroke Scoring:**
- Age > 60: +0.3
- Hypertension: +0.3
- BMI > 30: +0.2

**Heart Stroke Scoring:**
- Heart Disease: +0.5
- Hypertension: +0.2
- Glucose > 150: +0.3
- Smoking Status: +0.2

**Final Classification:**
- Probability < 30% → No Stroke
- Heart Score > Brain Score → Heart Stroke
- Brain Score ≥ Heart Score → Brain Stroke

## 🔐 Features & Authentication

### User System
- Create account with username/password
- Session-based authentication
- Secure logout
- In-memory storage (upgrade to DB for production)

### Risk Assessment
- 10-parameter health form
- Real-time neural network prediction
- Risk level indicators (Safe/Low/Moderate/High)
- Instant brain & heart stroke scores

### Report Generation
- PDF download with prediction results
- Includes all scores and recommendations
- Timestamp and session data

## 📊 API Endpoints
   cd Web-Based-Multi-Stroke-Risk-Prediction-System
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and visit `http://localhost:5173` to view the application.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

**Mithlesh-95**
- GitHub: [@Mithlesh-95](https://github.com/Mithlesh-95)
