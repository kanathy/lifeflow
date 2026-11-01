# Python ML Microservice for LifeFlow Predictions
# Packages required: flask pandas scikit-learn joblib

import sys
import io
import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

# Force UTF-8 stdout so Windows cp1252 doesn't crash on special chars
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIRS = [
    os.path.join(BASE_DIR, '..', 'models'),
    os.path.join(BASE_DIR, '..', '..', 'models'),
    os.path.join(BASE_DIR, 'models')
]

FEATURES = ['Year', 'Months', 'Month_Number', 'District', 'blood_group', 'rainfall', 'festival']
CATEGORICAL_FEATURES = ['Months', 'District', 'blood_group']

MONTH_MAP = {
    1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
    7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
}

def train_model_from_dataset(dataset_filename, target_col, output_filename):
    dataset_path = os.path.join(BASE_DIR, 'datasets', dataset_filename)
    target_dir = os.path.join(BASE_DIR, '..', 'models')
    os.makedirs(target_dir, exist_ok=True)
    save_path = os.path.join(target_dir, output_filename)

    if not os.path.exists(dataset_path):
        print(f"[ERROR] Dataset not found at {dataset_path}")
        return None

    print(f"[TRAIN] Training {output_filename} from {dataset_filename} ({target_col})...")
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

    model.fit(X, y)
    try:
        joblib.dump(model, save_path)
        print(f"[OK] Saved {output_filename} to {save_path}")
    except Exception as e:
        print(f"[WARN] Could not write {save_path}: {e}")
    return model

def load_or_train_model(filename, dataset_filename, target_col):
    for d in MODELS_DIRS:
        path = os.path.join(d, filename)
        if os.path.exists(path):
            try:
                model = joblib.load(path)
                print(f"[OK] {filename} loaded from {path}")
                return model
            except Exception as e:
                print(f"[WARN] Error loading {filename}: {e}, retraining...")
    return train_model_from_dataset(dataset_filename, target_col, filename)

# Load models at startup
accident_model = load_or_train_model('accident_model.pkl', 'accident_usage_dataset.csv', 'Accident_Usage')
disease_model  = load_or_train_model('disease_model.pkl', 'disease_usage_dataset.csv', 'Disease_Usage')

# Load all districts prophet rainfall models
prophet_models = None
for d in MODELS_DIRS:
    p_path = os.path.join(d, 'all_districts_prophet_models.pkl')
    if os.path.exists(p_path):
        try:
            prophet_models = joblib.load(p_path)
            print(f"[OK] all_districts_prophet_models.pkl loaded successfully ({len(prophet_models)} districts)")
            break
        except Exception as e:
            print(f"[WARN] Error loading prophet models from {p_path}: {e}")


# ---------------------------------------------------------------
# 1. Disease Usage Prediction  →  POST /api/predict/disease
# ---------------------------------------------------------------
@app.route('/api/predict/disease', methods=['POST'])
def predict_disease():
    global disease_model
    data = request.get_json() or {}

    month_num = int(data.get('monthNumber', data.get('month', 1)))
    month_str = str(data.get('months', MONTH_MAP.get(month_num, 'Jan')))
    
    input_df = pd.DataFrame([{
        'Year': int(data.get('year', 2026)),
        'Months': month_str,
        'Month_Number': month_num,
        'District': str(data.get('district', 'Colombo')),
        'blood_group': str(data.get('bloodGroup', 'A+')),
        'rainfall': float(data.get('rainfall', 0)),
        'festival': int(data.get('festival', 0))
    }])

    print(f"[DISEASE REQUEST] {input_df.to_dict(orient='records')[0]}")

    if disease_model is None:
        disease_model = load_or_train_model('disease_model.pkl', 'disease_usage_dataset.csv', 'Disease_Usage')

    try:
        predicted = int(round(float(disease_model.predict(input_df)[0])))
        predicted = max(0, predicted)
        trend = [max(0, int(predicted * f)) for f in [0.92, 0.96, 1.0, 1.04, 0.97, 1.02, 1.05]]
        print(f"[DISEASE RESULT] {predicted}")
        return jsonify({
            'predictedCases': predicted,
            'predictedUsage': predicted,
            'trend': trend
        })
    except Exception as e:
        print(f"[WARN] Retraining disease model due to mismatch: {e}")
        disease_model = train_model_from_dataset('disease_usage_dataset.csv', 'Disease_Usage', 'disease_model.pkl')
        if disease_model is not None:
            predicted = int(round(float(disease_model.predict(input_df)[0])))
            predicted = max(0, predicted)
            trend = [max(0, int(predicted * f)) for f in [0.92, 0.96, 1.0, 1.04, 0.97, 1.02, 1.05]]
            return jsonify({
                'predictedCases': predicted,
                'predictedUsage': predicted,
                'trend': trend
            })
        return jsonify({'message': f'Disease model prediction error: {str(e)}'}), 500


# ---------------------------------------------------------------
# 2. Accident Usage Prediction  →  POST /api/predict/accident
# ---------------------------------------------------------------
@app.route('/api/predict/accident', methods=['POST'])
def predict_accident():
    global accident_model
    data = request.get_json() or {}

    month_num = int(data.get('monthNumber', data.get('month', 1)))
    month_str = str(data.get('months', MONTH_MAP.get(month_num, 'Jan')))
    
    input_df = pd.DataFrame([{
        'Year': int(data.get('year', 2026)),
        'Months': month_str,
        'Month_Number': month_num,
        'District': str(data.get('district', 'Colombo')),
        'blood_group': str(data.get('bloodGroup', 'A+')),
        'rainfall': float(data.get('rainfall', 0)),
        'festival': int(data.get('festival', 0))
    }])

    print(f"[ACCIDENT REQUEST] {input_df.to_dict(orient='records')[0]}")

    if accident_model is None:
        accident_model = load_or_train_model('accident_model.pkl', 'accident_usage_dataset.csv', 'Accident_Usage')

    try:
        predicted = int(round(float(accident_model.predict(input_df)[0])))
        predicted = max(0, predicted)
        trend = [max(0, int(predicted * f)) for f in [0.92, 0.96, 1.0, 1.04, 0.97, 1.02, 1.05]]
        print(f"[ACCIDENT RESULT] {predicted}")
        return jsonify({
            'predictedAccidents': predicted,
            'predictedUsage': predicted,
            'trend': trend
        })
    except Exception as e:
        print(f"[WARN] Retraining accident model due to mismatch: {e}")
        accident_model = train_model_from_dataset('accident_usage_dataset.csv', 'Accident_Usage', 'accident_model.pkl')
        if accident_model is not None:
            predicted = int(round(float(accident_model.predict(input_df)[0])))
            predicted = max(0, predicted)
            trend = [max(0, int(predicted * f)) for f in [0.92, 0.96, 1.0, 1.04, 0.97, 1.02, 1.05]]
            return jsonify({
                'predictedAccidents': predicted,
                'predictedUsage': predicted,
                'trend': trend
            })
        return jsonify({'message': f'Accident model prediction error: {str(e)}'}), 500


# ---------------------------------------------------------------
# 3. Blood Shortage Prediction  →  POST /api/predict/shortage
# ---------------------------------------------------------------
@app.route('/api/predict/shortage', methods=['POST'])
def predict_shortage():
    data = request.get_json() or {}

    accident_rate_active    = data.get('accidentRate', True)
    outbreaks_active        = data.get('outbreaks', True)
    weather_active          = data.get('weather', True)
    public_events_active    = data.get('publicEvents', False)
    historical_usage_active = data.get('historicalUsage', True)

    base_risk = 20
    if accident_rate_active:        base_risk += 25
    if outbreaks_active:            base_risk += 20
    if weather_active:              base_risk += 15
    if public_events_active:        base_risk += 10
    if not historical_usage_active: base_risk -= 10

    shortage_risk = min(98, max(5, base_risk))
    risk_level = 'High Risk' if shortage_risk > 70 else ('Medium Risk' if shortage_risk >= 30 else 'Low Risk')
    trend = [min(98, max(5, shortage_risk + d)) for d in [-4, -2, 0, 2, 4, 1, 3]]

    return jsonify({
        'shortageRisk':   shortage_risk,
        'riskLevel':      risk_level,
        'trend':          trend,
        'estimatedUnits': int((shortage_risk / 100) * 500)
    })


# ---------------------------------------------------------------
# 4. Prophet Rainfall Prediction  →  POST /api/predict/rainfall
# ---------------------------------------------------------------
@app.route('/api/predict/rainfall', methods=['POST'])
def predict_rainfall():
    global prophet_models
    data = request.get_json() or {}

    district = str(data.get('district', 'Colombo')).strip()
    month = int(data.get('month', data.get('monthNumber', 1)))
    year = int(data.get('year', 2026))

    if prophet_models is None:
        for d in MODELS_DIRS:
            p_path = os.path.join(d, 'all_districts_prophet_models.pkl')
            if os.path.exists(p_path):
                try:
                    prophet_models = joblib.load(p_path)
                    break
                except Exception as e:
                    print(f"[WARN] Error loading prophet models from {p_path}: {e}")

    if not prophet_models:
        return jsonify({'message': 'Prophet models file not loaded'}), 500

    mapping = {
        'gampaha': 'DailyPPTGampaha',
        'nuwara eliya': 'NUwaraEliya',
        'nuwaraeliya': 'NUwaraEliya',
        'puttalam': 'Puttlam',
        'puttlam': 'Puttlam',
        'vavuniya': 'Vauniya',
        'vauniya': 'Vauniya',
        'monaragala': 'Monaragala',
        'moneragala': 'Monaragala'
    }
    key = mapping.get(district.lower(), district)
    if key not in prophet_models:
        for k in prophet_models.keys():
            if k.lower() == district.lower() or district.lower() in k.lower():
                key = k
                break
        else:
            key = 'Colombo'

    try:
        model = prophet_models[key]
        ds_str = f"{year}-{month:02d}-15"
        future_df = pd.DataFrame({'ds': [pd.to_datetime(ds_str)]})
        forecast = model.predict(future_df)
        val = float(forecast['yhat'].values[0])
        val = max(0.0, round(val, 1))

        print(f"[PROPHET RAINFALL] {district} ({key}) {year}-{month} -> {val} mm")
        return jsonify({
            'district': district,
            'month': month,
            'year': year,
            'rainfall': val,
            'model': 'Prophet'
        })
    except Exception as e:
        print(f"[ERROR] Prophet forecast failed: {e}")
        return jsonify({'message': str(e)}), 500


# ---------------------------------------------------------------
# Health check
# ---------------------------------------------------------------
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'online',
        'modelsLoaded': {
            'accident': accident_model is not None,
            'disease':  disease_model  is not None,
            'prophet':  prophet_models is not None
        }
    })


if __name__ == '__main__':
    print("[START] LifeFlow ML microservice starting on port 8000...")
    app.run(port=8000, debug=False)
