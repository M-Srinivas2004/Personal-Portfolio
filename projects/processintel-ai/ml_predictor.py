"""
ProcessIntel AI - Machine Learning SLA & Bottleneck Predictor
Trains Random Forest & Gradient Boosting models for proactive process delay forecasting.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

def train_delay_predictor(case_stats_df):
    features = ["Activity_Count", "Total_Cost", "Order_Value"]
    
    # One-hot encode categorical attributes
    df_encoded = pd.get_dummies(case_stats_df, columns=["Customer_Tier", "Region"], drop_first=True)
    feature_cols = [col for col in df_encoded.columns if col not in ["CaseID", "Start_Time", "End_Time", "Total_Lead_Time_Days", "SLA_Violated"]]
    
    X = df_encoded[feature_cols]
    y = df_encoded["SLA_Violated"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    rf_model.fit(X_train, y_train)
    
    y_pred = rf_model.predict(X_test)
    y_prob = rf_model.predict_proba(X_test)[:, 1]
    
    auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    
    importances = dict(zip(feature_cols, rf_model.feature_importances_))
    
    return {
        "model": rf_model,
        "feature_cols": feature_cols,
        "auc_score": auc,
        "confusion_matrix": cm,
        "accuracy": report["accuracy"],
        "f1_score": report["1"]["f1-score"],
        "feature_importances": importances
    }
