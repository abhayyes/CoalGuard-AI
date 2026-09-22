// Quick test runner for CoalGuard AI Prediction API
import http from 'http';

async function runDemo() {
  const testPayloads = [
    {
      title: 'Test 1: Standard Compliant Pit Environment',
      data: { ch4: 0.35, co: 8.0, air_velocity: 1.8, temp: 28.5, slope: 2.1 }
    },
    {
      title: 'Test 2: Warning Threshold (Elevated Methane & Temperature)',
      data: { ch4: 0.85, co: 22.0, air_velocity: 1.2, temp: 34.0, slope: 6.5 }
    },
    {
      title: 'Test 3: Statutory Critical Breach (DGMS Evacuation Code 1)',
      data: { ch4: 1.45, co: 65.0, air_velocity: 0.35, temp: 38.0, slope: 14.2 }
    }
  ];

  console.log('=== CoalGuard AI Prediction Engine Demo ===\n');

  for (const test of testPayloads) {
    console.log(`▶ ${test.title}`);
    const res = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test.data)
    });

    const result = await res.json();
    console.log(`  • Risk Index:    ${result.predicted_risk_index} / 100`);
    console.log(`  • Risk Tier:     ${result.risk_tier}`);
    console.log(`  • Confidence:    ${result.confidence}`);
    console.log(`  • Breaches:      ${result.statutory_breaches.length ? result.statutory_breaches.join(', ') : 'None (Compliant)'}`);
    console.log(`  • Recommendation:${result.recommendation}`);
    console.log('');
  }
  console.log('✓ All prediction scenarios executed successfully!');
}

runDemo().catch(console.error);
