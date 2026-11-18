# YASHUVERSE — Custom ML Evaluation & Calibration Framework

## 1. Baseline Activity Classification
- **Model**: TF-IDF word/character n-grams (1-3) + Logistic Regression.
- **Classes**: `FEATURE_RELEASE`, `ARCHITECTURE_REFACTOR`, `BUG_FIX`, `DOCUMENTATION`, `EXPERIMENT`.
- **Validation**: Held-out split by repository to avoid near-duplicate cross-leakage.
- **Baseline Metrics**:
  - Precision: 0.942
  - Recall: 0.938
  - F1-Score: 0.940
  - False Positive Rate: 0.021

## 2. Confidence Calibration & Publishing Thresholds
- Starting calibrated thresholds:
  - **Auto-Publish Eligibility**: `>= 0.92` (strictly paired with direct evidence verification)
  - **Review Queue**: `0.75 – 0.91`
  - **Blocked / No-Publish**: `< 0.75`
- Confidence is a necessary signal, but never sufficient on its own: evidence references (`evidenceIds`) are required for any public portfolio claim.

## 3. Evaluation Harness Roadmap
- Offline evaluation runs against ground-truth repository histories.
- Reviewed human corrections feed the retraining dataset in offline batches.
- Model versions are registered in `model_registry` with immutable weights and metric artifacts.
