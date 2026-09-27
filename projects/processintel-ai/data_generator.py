"""
ProcessIntel AI - Event Log Generator
Module for synthesizing enterprise Order-to-Cash (O2C) event logs with realistic process variants, bottlenecks, and anomalies.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_event_logs(num_cases=1200, random_seed=42):
    np.random.seed(random_seed)
    random.seed(random_seed)
    
    activities_flow = [
        "Order Received",
        "Credit Check",
        "Inventory Check",
        "Manual Approval",
        "Order Confirmed",
        "Package & Dispatch",
        "Invoice Issued",
        "Payment Settled"
    ]
    
    records = []
    base_time = datetime(2026, 4, 1, 9, 0, 0)
    
    for case_id in range(1001, 1001 + num_cases):
        curr_time = base_time + timedelta(days=random.randint(0, 45), hours=random.randint(0, 8))
        case_val = round(np.random.exponential(scale=2500) + 100, 2)
        customer_tier = np.random.choice(["Tier-1", "Tier-2", "Tier-3"], p=[0.2, 0.5, 0.3])
        region = np.random.choice(["North", "South", "East", "West", "Central"], p=[0.25, 0.3, 0.15, 0.2, 0.1])
        
        # Determine if case will have anomaly/bottleneck
        is_high_risk = (case_val > 5000 or customer_tier == "Tier-3" or region in ["Central", "East"])
        bottleneck_prob = 0.65 if is_high_risk else 0.15
        has_bottleneck = (random.random() < bottleneck_prob)
        
        # Step 1: Order Received
        records.append({
            "CaseID": case_id, "Activity": "Order Received",
            "Timestamp": curr_time, "Resource": "Web_Portal_Bot",
            "Cost": 5.0, "OrderValue": case_val, "CustomerTier": customer_tier, "Region": region
        })
        
        # Step 2: Credit Check
        curr_time += timedelta(minutes=random.randint(15, 60))
        records.append({
            "CaseID": case_id, "Activity": "Credit Check",
            "Timestamp": curr_time, "Resource": "Risk_Auto_Engine",
            "Cost": 12.0, "OrderValue": case_val, "CustomerTier": customer_tier, "Region": region
        })
        
        # Step 3: Inventory Check
        curr_time += timedelta(minutes=random.randint(20, 90))
        records.append({
            "CaseID": case_id, "Activity": "Inventory Check",
            "Timestamp": curr_time, "Resource": "ERP_Inventory_Sys",
            "Cost": 8.0, "OrderValue": case_val, "CustomerTier": customer_tier, "Region": region
        })
        
        # Step 4: Manual Approval (Potential Bottleneck Step)
        if case_val > 3000 or customer_tier == "Tier-3":
            delay_hours = random.randint(12, 36) if has_bottleneck else random.randint(2, 6)
            curr_time += timedelta(hours=delay_hours)
            records.append({
                "CaseID": case_id, "Activity": "Manual Approval",
                "Timestamp": curr_time, "Resource": f"Senior_Analyst_{random.randint(1, 4)}",
                "Cost": 45.0, "OrderValue": case_val, "CustomerTier": customer_tier, "Region": region
            })
            
        # Step 5: Order Confirmed
        curr_time += timedelta(minutes=random.randint(10, 40))
        records.append({
            "CaseID": case_id, "Activity": "Order Confirmed",
            "Timestamp": curr_time, "Resource": "Sales_Ops_Rep",
            "Cost": 10.0, "OrderValue": case_val, "CustomerTier": customer_tier, "Region": region
        })
        
        # Step 6: Package & Dispatch
        dispatch_delay = random.randint(8, 24) if has_bottleneck else random.randint(2, 6)
        curr_time += timedelta(hours=dispatch_delay)
        records.append({
            "CaseID": case_id, "Activity": "Package & Dispatch",
            "Timestamp": curr_time, "Resource": "Warehouse_Hub_1",
            "Cost": 35.0, "OrderValue": case_val, "CustomerTier": customer_tier, "Region": region
        })
        
        # Step 7: Invoice Issued
        curr_time += timedelta(minutes=random.randint(15, 120))
        records.append({
            "CaseID": case_id, "Activity": "Invoice Issued",
            "Timestamp": curr_time, "Resource": "Finance_Billing_Bot",
            "Cost": 15.0, "OrderValue": case_val, "CustomerTier": customer_tier, "Region": region
        })
        
        # Step 8: Payment Settled
        pay_delay_days = random.randint(7, 21) if has_bottleneck else random.randint(1, 5)
        curr_time += timedelta(days=pay_delay_days)
        records.append({
            "CaseID": case_id, "Activity": "Payment Settled",
            "Timestamp": curr_time, "Resource": "Banking_Gateway",
            "Cost": 4.0, "OrderValue": case_val, "CustomerTier": customer_tier, "Region": region
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    df = generate_event_logs(1200)
    csv_file = "o2c_process_event_log.csv"
    df.to_csv(csv_file, index=False)
    print(f"Generated {len(df)} event logs across {df['CaseID'].nunique()} business cases -> {csv_file}")
