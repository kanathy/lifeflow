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

# Load Model 3 (Total Amount / Shortage Model)
model3 = None
for d in MODELS_DIRS:
    m3_path = os.path.join(d, 'model3_total_amount.pkl')
    if os.path.exists(m3_path):
        try:
            model3 = joblib.load(m3_path)
            print(f"[OK] model3_total_amount.pkl loaded successfully from {m3_path}")
            break
        except Exception as e:
            print(f"[WARN] Error loading model3 from {m3_path}: {e}")

DISTRICT_BASE_RAINFALL = {
    'Ampara': 95.0, 'Anuradhapura': 65.0, 'Badulla': 130.0, 'Batticaloa': 88.0,
    'Colombo': 125.0, 'Galle': 155.0, 'Gampaha': 120.0, 'Hambantota': 70.0,
    'Jaffna': 45.0, 'Kalutara': 165.0, 'Kandy': 140.0, 'Kegalle': 175.0,
    'Kilinochchi': 50.0, 'Kurunegala': 105.0, 'Mannar': 40.0, 'Matale': 115.0,
    'Matara': 145.0, 'Monaragala': 85.0, 'Mullaitivu': 55.0, 'Nuwara Eliya': 190.0,
    'Polonnaruwa': 75.0, 'Puttalam': 60.0, 'Ratnapura': 215.0, 'Trincomalee': 80.0,
    'Vavuniya': 58.0
}

MONTHLY_RAIN_FACTORS = {
    1: 0.85, 2: 0.70, 3: 0.90, 4: 1.20, 5: 1.35, 6: 1.15,
    7: 0.95, 8: 0.90, 9: 1.10, 10: 1.40, 11: 1.45, 12: 1.10
}

def get_prophet_rainfall_value(district, month, year):
    global prophet_models
    if prophet_models is None:
        for d in MODELS_DIRS:
            p_path = os.path.join(d, 'all_districts_prophet_models.pkl')
            if os.path.exists(p_path):
                try:
                    prophet_models = joblib.load(p_path)
                    break
                except Exception:
                    pass

    base_val = DISTRICT_BASE_RAINFALL.get(str(district).strip(), 114.0)
    month_val = MONTHLY_RAIN_FACTORS.get(int(month), 1.0)
    default_seasonal = round(base_val * month_val, 1)

    if not prophet_models:
        return default_seasonal

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
    key = mapping.get(str(district).lower().strip(), district)
    if key not in prophet_models:
        for k in prophet_models.keys():
            if k.lower() == str(district).lower().strip() or str(district).lower().strip() in k.lower():
                key = k
                break
        else:
            key = 'Colombo'

    try:
        model = prophet_models[key]
        ds_str = f"{year}-{int(month):02d}-15"
        future_df = pd.DataFrame({'ds': [pd.to_datetime(ds_str)]})
        forecast = model.predict(future_df)
        val = float(forecast['yhat'].values[0])
        val = round(val, 1)
        if val <= 10.0:
            val = default_seasonal
        return val
    except Exception:
        return default_seasonal


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
#    Using Model 3 (model3_total_amount.pkl) with inputs from
#    Accident Model and Disease Model for the selected Month & District
# ---------------------------------------------------------------
@app.route('/api/predict/shortage', methods=['POST'])
def predict_shortage():
    global accident_model, disease_model, model3
    data = request.get_json() or {}

    district = str(data.get('district', 'Colombo')).strip()
    month_num = int(data.get('monthNumber', data.get('month', 1)))
    month_str = str(data.get('months', MONTH_MAP.get(month_num, 'Jan')))
    year = int(data.get('year', 2026))
    selected_bg = data.get('bloodGroup', 'All')

    rainfall = float(data.get('rainfall', get_prophet_rainfall_value(district, month_num, year)))
    festival = int(data.get('festival', 1))

    if accident_model is None:
        accident_model = load_or_train_model('accident_model.pkl', 'accident_usage_dataset.csv', 'Accident_Usage')
    if disease_model is None:
        disease_model  = load_or_train_model('disease_model.pkl', 'disease_usage_dataset.csv', 'Disease_Usage')

    if model3 is None:
        for d in MODELS_DIRS:
            m3_path = os.path.join(d, 'model3_total_amount.pkl')
            if os.path.exists(m3_path):
                try:
                    model3 = joblib.load(m3_path)
                    print(f"[OK] model3_total_amount.pkl loaded from {m3_path}")
                    break
                except Exception as e:
                    print(f"[WARN] Error loading model3: {e}")

    ALL_BGS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']
    breakdown = []
    total_shortage_units = 0

    for bg in ALL_BGS:
        # Step 1: Accident prediction for this district & month & blood group
        in_acc = pd.DataFrame([{
            'Year': year,
            'Months': month_str,
            'Month_Number': month_num,
            'District': district,
            'blood_group': bg,
            'rainfall': rainfall,
            'festival': festival
        }])
        try:
            acc_val = max(0.0, float(accident_model.predict(in_acc)[0]))
        except Exception:
            acc_val = 35.0

        # Step 2: Disease prediction for this district & month & blood group
        in_dis = pd.DataFrame([{
            'Year': year,
            'Months': month_str,
            'Month_Number': month_num,
            'District': district,
            'blood_group': bg,
            'rainfall': rainfall,
            'festival': festival
        }])
        try:
            dis_val = max(0.0, float(disease_model.predict(in_dis)[0]))
        except Exception:
            dis_val = 60.0

        # Step 3: Model 3 (model3_total_amount.pkl) using outputs from Step 1 and Step 2!
        in_m3 = pd.DataFrame([{
            'Year': year,
            'Month_Number': month_num,
            'blood_group': bg,
            'Accident_Usage': acc_val,
            'Disease_Usage': dis_val,
            'rainfall': rainfall,
            'festival': festival
        }])

        try:
            m3_pred = float(model3.predict(in_m3)[0]) if model3 is not None else (acc_val + dis_val) * 0.45
            shortage_units = max(1, int(round(abs(m3_pred))))
        except Exception as e:
            shortage_units = max(1, int(round((acc_val + dis_val) * 0.45)))

        breakdown.append({
            'bg': bg,
            'units': shortage_units,
            'accidentDemand': round(acc_val, 1),
            'diseaseDemand': round(dis_val, 1)
        })
        total_shortage_units += shortage_units

    for item in breakdown:
        item['pct'] = round((item['units'] / max(1, total_shortage_units)) * 100, 1)

    breakdown.sort(key=lambda x: x['units'], reverse=True)

    # 7-month forecasting trend using Model 3 for consecutive months
    trend = []
    for i in range(7):
        t_month = ((month_num - 1 + i) % 12) + 1
        t_year = year + ((month_num - 1 + i) // 12)
        t_rain = get_prophet_rainfall_value(district, t_month, t_year)
        m_total = 0
        for bg in ['O+', 'A+', 'B+']:
            in_acc_t = pd.DataFrame([{
                'Year': t_year, 'Months': MONTH_MAP.get(t_month, 'Jan'), 'Month_Number': t_month,
                'District': district, 'blood_group': bg, 'rainfall': t_rain, 'festival': festival
            }])
            in_dis_t = pd.DataFrame([{
                'Year': t_year, 'Months': MONTH_MAP.get(t_month, 'Jan'), 'Month_Number': t_month,
                'District': district, 'blood_group': bg, 'rainfall': t_rain, 'festival': festival
            }])
            try:
                a_t = max(0.0, float(accident_model.predict(in_acc_t)[0]))
                d_t = max(0.0, float(disease_model.predict(in_dis_t)[0]))
                in_m3_t = pd.DataFrame([{
                    'Year': t_year, 'Month_Number': t_month, 'blood_group': bg,
                    'Accident_Usage': a_t, 'Disease_Usage': d_t, 'rainfall': t_rain, 'festival': festival
                }])
                m_total += abs(float(model3.predict(in_m3_t)[0])) if model3 is not None else (a_t + d_t) * 0.45
            except Exception:
                m_total += 50
        m_total_scaled = int(round(m_total * (8 / 3)))
        trend.append(m_total_scaled)

    risk_level = 'High Risk' if total_shortage_units > 250 else ('Medium Risk' if total_shortage_units >= 150 else 'Low Risk')
    shortage_risk_score = min(98, max(15, int((total_shortage_units / 500) * 100)))

    selected_item = next((b for b in breakdown if b['bg'] == selected_bg), None)
    display_units = selected_item['units'] if selected_item else total_shortage_units

    print(f"[SHORTAGE PREDICTION] {district} {year}-{month_num} -> Total Shortage: {total_shortage_units} Units ({risk_level})")

    return jsonify({
        'district': district,
        'month': month_num,
        'year': year,
        'shortageExpected': 'Yes' if total_shortage_units > 0 else 'No',
        'shortageRisk': shortage_risk_score,
        'riskLevel': risk_level,
        'estimatedUnits': display_units,
        'totalEstimatedUnits': total_shortage_units,
        'breakdown': breakdown,
        'trend': trend,
        'model': 'Model3_Total_Amount_XGBoost'
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

    base_val = DISTRICT_BASE_RAINFALL.get(district, 114.0)
    month_val = MONTHLY_RAIN_FACTORS.get(month, 1.0)
    default_seasonal = round(base_val * month_val, 1)

    try:
        model = prophet_models[key]
        ds_str = f"{year}-{month:02d}-15"
        future_df = pd.DataFrame({'ds': [pd.to_datetime(ds_str)]})
        forecast = model.predict(future_df)
        val = float(forecast['yhat'].values[0])
        val = round(val, 1)
        if val <= 10.0:
            val = default_seasonal

        print(f"[PROPHET RAINFALL] {district} ({key}) {year}-{month} -> {val} mm")
        return jsonify({
            'district': district,
            'month': month,
            'year': year,
            'rainfall': val,
            'model': 'Prophet'
        })
    except Exception as e:
        print(f"[ERROR] Prophet forecast failed, using seasonal baseline: {e}")
        return jsonify({
            'district': district,
            'month': month,
            'year': year,
            'rainfall': default_seasonal,
            'model': 'SeasonalBaseline'
        })


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
            'prophet':  prophet_models is not None,
            'model3':   model3 is not None
        }
    })


if __name__ == '__main__':
    print("[START] LifeFlow ML microservice starting on port 8000...")
    app.run(port=8000, debug=False, threaded=True)
