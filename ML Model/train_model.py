import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Load dataset
df = pd.read_csv("data/stroke-data.csv")

print("Initial shape:", df.shape)

# -----------------------------
# STEP 1: Drop ID column
# -----------------------------
df.drop(columns=['id'], inplace=True)

# -----------------------------
# STEP 2: Handle missing BMI
# -----------------------------
df['bmi'].fillna(df['bmi'].mean(), inplace=True)

# -----------------------------
# STEP 3: Encode categorical columns
# -----------------------------
categorical_columns = [
    'gender',
    'ever_married',
    'work_type',
    'Residence_type',
    'smoking_status'
]


encoders = {}
for col in categorical_columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le
    print(f"Unique values for {col}:", le.classes_)


# -----------------------------
# Verification
# -----------------------------
print("\nAfter preprocessing:")
print(df.head())
print("\nData types:")
print(df.dtypes)
print("\nMissing values:")
print(df.isnull().sum())

# ----------------------------------
# STEP 4: Create Multi-Stroke Labels
# ----------------------------------

# Ischemic stroke (heart-related)
df['ischemic_stroke'] = ((df['stroke'] == 1) & (df['heart_disease'] == 1)).astype(int)

# Hemorrhagic stroke (BP-related)
df['hemorrhagic_stroke'] = ((df['stroke'] == 1) & (df['hypertension'] == 1)).astype(int)

# Recurrent stroke risk (age-based)
df['recurrent_stroke'] = ((df['stroke'] == 1) & (df['age'] > 55)).astype(int)

# Verify counts
print("\nMulti-stroke label counts:")
print(df[['ischemic_stroke', 'hemorrhagic_stroke', 'recurrent_stroke']].sum())

from sklearn.model_selection import train_test_split
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.metrics import accuracy_score
import joblib

# Features (exclude targets)
features = [
    'gender', 'age', 'hypertension', 'heart_disease',
    'ever_married', 'work_type', 'Residence_type',
    'avg_glucose_level', 'bmi', 'smoking_status'
]

X = df[features]

def train_and_save_model(target, filename):
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = ExtraTreesClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"{target} Accuracy: {acc:.4f}")

    joblib.dump(model, f"model/{filename}")

train_and_save_model('ischemic_stroke', 'ischemic_model.pkl')
train_and_save_model('hemorrhagic_stroke', 'hemorrhagic_model.pkl')
train_and_save_model('recurrent_stroke', 'recurrent_model.pkl')

joblib.dump(encoders, "model/label_encoders.pkl")
print("Encoders saved to model/label_encoders.pkl")


