/**
 * CoalGuard AI - Prediction API Client
 * Provides strictly-typed interface to the predictive hazard & compliance engine.
 */

export interface PredictionInput {
  ch4?: number;
  methane?: number;
  co?: number;
  carbon_monoxide?: number;
  o2?: number;
  oxygen?: number;
  air_velocity?: number;
  velocity?: number;
  temp?: number;
  temperature?: number;
  slope?: number;
  slope_displacement?: number;
  open_defects?: number;
  overdue_compliance?: number;
  mine_id?: string;
  zone?: string;
  [key: string]: any;
}

export interface PredictionResponse {
  status: string;
  ai_engine: string;
  timestamp: string;
  predicted_risk_index: number;
  risk_tier: string;
  confidence: string;
  statutory_breaches: string[];
  contributing_factors: Record<string, string>;
  recommendation: string;
  input_evaluated: Record<string, any>;
}

const PREDICT_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}/predict`
  : 'http://127.0.0.1:8000/predict';

export async function makePrediction(
  inputData: PredictionInput = {}
): Promise<PredictionResponse> {
  const response = await fetch(PREDICT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputData),
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }

  return await response.json();
}
