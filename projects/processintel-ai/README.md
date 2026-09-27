# ProcessIntel AI: AI-Driven Business Process Intelligence & Bottleneck Prediction

An enterprise-grade AI-powered Process Mining and Intelligence platform developed for the **AI In Process Intelligence Virtual Internship** (Celonis / AICTE-EduSkills) by **Malladi Srinivas** (Roll No: `236N1A6158`), Department of Artificial Intelligence and Machine Learning, **Srinivasa Institute of Engineering and Technology (Autonomous)**.

---

## 🎯 Project Overview
ProcessIntel AI bridges enterprise operational data with Machine Learning to discover business process flows, calculate Celonis Process Query Language (PQL) throughput metrics, detect bottlenecks, and proactively forecast Service Level Agreement (SLA) violations.

### Key Highlights:
1. **Event Log Ingestion & ETL:** Normalizes multi-source Order-to-Cash (O2C) transactional event streams.
2. **Directly-Follows Graph (DFG) Discovery:** Reconstructs actual end-to-end execution paths and cycle times.
3. **Celonis PQL Analytics:** Computes throughput times, automation ratios, and rework frequencies.
4. **Predictive AI Engine:** Trains Random Forest models (0.79–0.96 ROC-AUC) to forecast SLA breaches before order dispatch.
5. **Action Flow Webhooks:** Triggers automated real-time alerts and remediation dispatches.

---

## 📂 Project Structure
```
processintel-ai/
├── data_generator.py                                        # Synthesizes O2C event logs
├── process_engine.py                                        # DFG extraction & PQL metrics
├── ml_predictor.py                                          # Random Forest SLA classifier
├── app.py                                                   # Main pipeline orchestrator
├── Malladi_Srinivas_Mini_Project_Report_AI_Process_Intelligence.docx  # Complete 26-Page Word Report
├── Malladi_Srinivas_Mini_Project_Report_AI_Process_Intelligence.pdf   # Complete 26-Page PDF Report
└── README.md                                                # Documentation
```

---

## 🚀 How to Run
```bash
python app.py
```
