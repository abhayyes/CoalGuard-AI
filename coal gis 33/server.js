const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to catch telemetry from map.html
app.post('/api/telemetry', (req, res) => {
    const { sensorId, site, hazardTitle, hazardLevel, gasLevel, timestamp } = req.body;
    
    console.log(`\n========================================`);
    console.log(`🚨 INCOMING TELEMETRY ALERT`);
    console.log(`========================================`);
    console.log(`Time:     ${new Date(timestamp).toLocaleTimeString()}`);
    console.log(`Location: ${site} [${sensorId}]`);
    console.log(`Event:    ${hazardTitle}`);
    console.log(`Severity: ${hazardLevel}`);
    console.log(`CH4 Gas:  ${gasLevel}%`);
    
    if (hazardLevel === 'CRITICAL') {
        console.log(`>>> ACTION: Emergency protocols active`);
    }

    res.json({ success: true, message: "Logged locally" });
});

app.listen(5678, () => {
    console.log(`===================================================`);
    console.log(`🚀 Mine Telemetry Server Running on http://localhost:5678`);
    console.log(`===================================================`);
});