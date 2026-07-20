# Python ML Microservice for Blood Shortage Forecasting
# Install dependencies: pip install flask numpy scikit-learn

from flask import Flask, request, jsonify
import numpy as np
# import joblib  # Used to load trained model files (e.g., joblib.load('model.pkl'))

app = Flask(__name__)

@app.route('/api/predict', methods=['POST'])
def predict_shortage():
    """
    Expects JSON input:
    {
      "accidentRate": true,
      "outbreaks": true,
      "weather": true,
      "publicEvents": false,
      "historicalUsage": true
    }
    """
    data = request.get_json() or {}
    
    # 1. Extract active predictor flags from API request
    accident_rate_active = data.get('accidentRate', True)
    outbreaks_active = data.get('outbreaks', True)
    weather_active = data.get('weather', True)
    public_events_active = data.get('publicEvents', False)
    historical_usage_active = data.get('historicalUsage', True)

    # 2. Mock predictor logic mimicking an ML Regression model
    # In your real model, you would feed raw historical district data into a trained model:
    # X = np.array([[accident_rate_active, outbreaks_active, weather_active, public_events_active, historical_usage_active]])
    # shortage_percentage = trained_model.predict(X)[0]
    
    base_risk = 20
    if accident_rate_active:
        base_risk += 25  # High accidents raise risk
    if outbreaks_active:
        base_risk += 20  # Diseases (like Dengue) raise risk
    if weather_active:
        base_risk += 15  # Monsoons reduce donor mobilities
    if public_events_active:
        base_risk += 10  # Festivals increase usage
    if not historical_usage_active:
        base_risk -= 10  # Baseline corrections
        
    # Boundary check (5% to 98% risk)
    shortage_risk = min(98, max(5, base_risk))
    
    # Categorize Risk Level
    if shortage_risk > 70:
        risk_level = 'High Risk'
    elif shortage_risk >= 30:
        risk_level = 'Medium Risk'
    else:
        risk_level = 'Low Risk'
        
    # Generate 7-day future prediction trend (random fluctuations around risk factor)
    np.random.seed(42)  # For consistent mock trend offsets
    trend = []
    current_val = shortage_risk
    for i in range(7):
        current_val += int(np.random.choice([-4, -2, 0, 2, 4]))
        trend.append(min(98, max(5, current_val)))

    return jsonify({
        'shortageRisk': shortage_risk,
        'riskLevel': risk_level,
        'trend': trend
    })

if __name__ == '__main__':
    # Start ML Flask app on port 8000
    print("🚀 Python Blood Shortage ML predictor starting on port 8000...")
    app.run(port=8000, debug=True)
