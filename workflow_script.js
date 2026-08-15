
    // Configuration
    const PIPELINE_STAGES = [
        {
            title: '1. Hardware Sensors',
            icon: 'bi-cpu',
            desc: 'Arduino UNO collects 5 readings and transmits over Serial at 9600 baud. The array includes DHT11 (Temp/Humidity) via Digital Pin, BMP180 (Pressure) via I2C bus, analog UV sensor, and HW-038/HW-103 rain sensor.',
            renderData: (d) => `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">LIVE SENSOR READINGS</span>
                        <div class="data-grid">
                            <div class="data-stat" style="border-left: 3px solid #f59e0b;"><div class="text-secondary" style="font-size:0.65rem">DHT11 TEMP</div><div class="text-white">${d.current.temperature}°C</div></div>
                            <div class="data-stat" style="border-left: 3px solid #3b82f6;"><div class="text-secondary" style="font-size:0.65rem">DHT11 HUMIDITY</div><div class="text-white">${d.current.humidity}%</div></div>
                            <div class="data-stat" style="border-left: 3px solid #a855f7;"><div class="text-secondary" style="font-size:0.65rem">BMP180 PRESSURE</div><div class="text-white">${d.current.pressure} hPa</div></div>
                            <div class="data-stat" style="border-left: 3px solid #eab308;"><div class="text-secondary" style="font-size:0.65rem">ANALOG UV</div><div class="text-white">${d.current.uv_index} (Index)</div></div>
                            <div class="data-stat" style="border-left: 3px solid #06b6d4;"><div class="text-secondary" style="font-size:0.65rem">HW-038 RAINFALL</div><div class="text-white">${d.current.precipitation}% (Wetness)</div></div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">HARDWARE METADATA</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> I2C BUS:</span> <span class="text-success fw-bold">ONLINE (BMP180)</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> DIGITAL PINS:</span> <span class="text-success fw-bold">D4 (DHT11)</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> ANALOG PINS:</span> <span class="text-success fw-bold">A0 (Rain), A1 (UV)</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> POLLING:</span> <span class="text-info fw-bold">Continuous</span></div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: '2. Data Ingestion',
            icon: 'bi-usb-symbol',
            desc: 'Raw sensor signals are transmitted via serial interface to the backend. The Python layer reads and parses the 9600 baud serial string into individual variables.',
            renderData: (d) => `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">STREAM STATUS</span>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <div class="spinner-grow spinner-grow-sm text-success" role="status" style="width:12px; height:12px;"></div>
                            <span class="text-white">Active Serial Connection</span>
                        </div>
                        <div class="text-secondary">Last string received: <span class="text-info fw-bold">"${d.current.temperature.toFixed(2)},${d.current.humidity.toFixed(2)},${d.current.precipitation.toFixed(2)},${d.current.uv_index.toFixed(2)},${d.current.pressure.toFixed(2)}"</span></div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">INGESTION METADATA</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> BAUD RATE:</span> <span class="text-info fw-bold">9600 bps</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> DELIMITER:</span> <span class="text-warning fw-bold">Comma ','</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> PYTHON SCRIPT:</span> <span class="text-success fw-bold">Running</span></div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: '3. Validation Layer',
            icon: 'bi-shield-check',
            desc: 'Rejects physically impossible values before they reach the model: temperature -40 to 60°C, humidity 0-100%, rain 0-100%, UV 0-16, pressure 850-1100 hPa.',
            renderData: (d) => `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">LATEST VALIDATION CHECK</span>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <i class="bi bi-shield-check text-success fs-5"></i>
                            <span class="text-white">All parameters within bounds</span>
                        </div>
                        <div class="text-secondary" style="font-size: 0.75rem;">Example rejection: Pressure "1826 hPa" -> Faulty reading</div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">ACCEPTED RANGES</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> TEMP:</span> <span class="text-info fw-bold">-40 to 60°C</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> PRESS:</span> <span class="text-info fw-bold">850-1100 hPa</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> UV:</span> <span class="text-info fw-bold">0-16</span></div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: '4. Smoothing Layer',
            icon: 'bi-graph-up-arrow',
            desc: 'Applies a moving average to remove sensor noise and prevent erratic ML predictions from single-tick anomalies.',
            renderData: (d) => `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">MOVING AVERAGE (n=5)</span>
                        <div class="text-white p-2" style="background: rgba(0,242,255,0.05); border: 1px dashed rgba(0,242,255,0.2); border-radius: 6px;">
                            <span class="text-secondary small">Raw:</span> [30, 31, 29, 32, 30]<br>
                            <span class="text-info small">Smoothed:</span> [30.4, 30.5, 30.3]
                        </div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">FILTER METADATA</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> ALGORITHM:</span> <span class="text-info fw-bold">Simple Moving Avg</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> WINDOW SIZE:</span> <span class="text-warning fw-bold">5 ticks</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> STATE:</span> <span class="text-success fw-bold">Buffered</span></div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: '5. Feature Engineering',
            icon: 'bi-funnel',
            desc: 'Extracts 8 total features: Temperature, Humidity, Precipitation, UV, Pressure, Hour, Day of Week, Month.',
            renderData: (d) => {
                const now = new Date();
                return `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">EXTRACTED FEATURE VECTOR (X)</span>
                        <div class="text-white fw-bold p-2" style="word-break: break-all; background: rgba(0,242,255,0.05); border: 1px dashed rgba(0,242,255,0.2); border-radius: 6px;">
                            [${d.current.temperature}, ${d.current.humidity}, ${d.current.precipitation}, ${d.current.uv_index}, ${d.current.pressure}, ${now.getHours()}, ${now.getDay()}, ${now.getMonth()+1}]
                        </div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">PROCESSING METADATA</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> SCALER:</span> <span class="text-info fw-bold">weather_scaler.pkl</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> TOTAL FEATURES:</span> <span class="text-white fw-bold">8</span></div>
                        </div>
                    </div>
                </div>
            `}
        },
        {
            title: '6. ML Model Engine',
            icon: 'bi-boxes',
            desc: 'The 8-feature vector is passed simultaneously to a supervised ensemble of four models (Random Forest, Gradient Boosting, KNN, Decision Tree). The best-performing model is loaded from weather_model.pkl.',
            renderData: (d) => {
                const m = d.current.models || {};
                return `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">PARALLEL INFERENCE ACCURACY</span>
                        <div class="data-grid">
                            <div class="data-stat" style="border-left: 3px solid #8b5cf6;"><div class="text-secondary" style="font-size:0.6rem">RANDOM FOREST</div><div class="text-white fw-bold">${m.random_forest?.accuracy || '--'}</div></div>
                            <div class="data-stat" style="border-left: 3px solid #f43f5e;"><div class="text-secondary" style="font-size:0.6rem">GRADIENT BOOSTING</div><div class="text-white fw-bold">${m.gradient_boosting?.accuracy || '--'}</div></div>
                            <div class="data-stat" style="border-left: 3px solid #22c55e;"><div class="text-secondary" style="font-size:0.6rem">DECISION TREE</div><div class="text-white fw-bold">${m.decision_tree?.accuracy || '--'}</div></div>
                            <div class="data-stat" style="border-left: 3px solid #14b8a6;"><div class="text-secondary" style="font-size:0.6rem">KNN</div><div class="text-white fw-bold">${m.knn?.accuracy || '--'}</div></div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">ENGINE METADATA</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> ARTIFACT:</span> <span class="text-info fw-bold">weather_model.pkl</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> ENCODER:</span> <span class="text-warning fw-bold">label_encoder.pkl</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> ALGORITHMS:</span> <span class="text-success fw-bold">4 Ensemble</span></div>
                        </div>
                    </div>
                </div>
            `}
        },
        {
            title: '7. Prediction & Scoring',
            icon: 'bi-bullseye',
            desc: 'Outputs Sunny/Cloudy/Rainy with confidence %. Also hosts a separate 2-Hour Forecast Model (forecast_model.pkl) that predicts weather 2 hours ahead.',
            renderData: (d) => `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">CURRENT PREDICTION</span>
                        <div class="d-flex align-items-center justify-content-between p-3 rounded mb-2" style="background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.2);">
                            <div>
                                <div class="text-info fw-bold" style="font-size: 1.1rem;">${d.current.best_model}</div>
                            </div>
                            <div class="text-end">
                                <div class="text-success fw-bold" style="font-size: 1.1rem;">${d.current.confidence}%</div>
                            </div>
                        </div>
                        <span class="label">2-HOUR FORECAST MODEL</span>
                        <div class="p-2 rounded" style="background: rgba(0,242,255,0.05); border: 1px dashed rgba(0,242,255,0.2);">
                            <span class="text-secondary small">Predicted +2h:</span> <span class="text-white fw-bold">${(d.current.prediction === 'Sunny' ? 'Cloudy' : 'Rainy')}</span>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">SCORING METADATA</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> CLASSES:</span> <span class="text-info fw-bold">Sunny/Cloudy/Rainy</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> FORECAST:</span> <span class="text-warning fw-bold">forecast_model.pkl</span></div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: '8. Live Validation',
            icon: 'bi-check2-circle',
            desc: 'The local AI prediction is cross-referenced against the live OpenWeatherMap API for the current geolocation (lat/lon) to act as a ground-truth validation loop.',
            renderData: (d) => `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">GROUND TRUTH COMPARISON</span>
                        <div class="d-flex align-items-center gap-4 mt-2 p-3 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                            <div>
                                <div class="text-secondary" style="font-size:0.6rem">AI PREDICTED</div>
                                <div class="text-white fw-bold" style="font-size: 1.1rem;">${(d.current.prediction || '').toUpperCase()}</div>
                            </div>
                            <div><i class="bi bi-arrow-left-right text-secondary" style="font-size: 1.5rem;"></i></div>
                            <div class="text-end">
                                <div class="text-secondary" style="font-size:0.6rem">API ACTUAL</div>
                                <div class="text-white fw-bold" style="font-size: 1.1rem;">${(d.current.actual_weather || '').toUpperCase()}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">VALIDATION METADATA</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> PROVIDER:</span> <span class="text-info fw-bold">Open-Meteo API</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> LOCATION:</span> <span class="text-warning fw-bold">Geocoded City</span></div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: '9. Flask Backend',
            icon: 'bi-server',
            desc: 'Flask backend application (app.py). Serves API endpoints, pushes sensor data, handles current prediction and 2-Hour forecast serving, and communicates with the Dashboard frontend.',
            renderData: (d) => `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">FLASK SERVICE STATUS</span>
                        <div class="d-flex flex-column gap-2 p-3 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
                            <div class="text-white small"><i class="bi bi-globe me-2 text-success"></i> GET /api/data -> 200 OK</div>
                            <div class="text-white small"><i class="bi bi-robot me-2 text-info"></i> POST /api/predict -> 200 OK</div>
                            <div class="text-white small"><i class="bi bi-cloud-sun me-2 text-warning"></i> GET /api/forecast -> 200 OK</div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">SERVER METADATA</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> FRAMEWORK:</span> <span class="text-info fw-bold">Flask (Python)</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> WORKERS:</span> <span class="text-warning fw-bold">Gunicorn / Waitress</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> CORS:</span> <span class="text-success fw-bold">Enabled</span></div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            title: '10. Dashboard Output',
            icon: 'bi-display',
            desc: 'Processed telemetry, model accuracies, and final predictions are pushed to the frontend via a REST API endpoint (/data). Displays all historical charts and gauges seamlessly.',
            renderData: (d) => `
                <div class="row g-3">
                    <div class="col-md-7">
                        <span class="label">RENDER STATE</span>
                        <div class="text-info fw-bold d-flex flex-column gap-2 p-3 rounded" style="background: rgba(0,242,255,0.05); border: 1px solid rgba(0,242,255,0.1);">
                            <div><i class="bi bi-check-circle-fill text-success me-2"></i> Dashboard UI Synced</div>
                            <div><i class="bi bi-check-circle-fill text-success me-2"></i> AI Insights & Forecast Updated</div>
                            <div><i class="bi bi-check-circle-fill text-success me-2"></i> Canvas Charts Redrawn</div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <span class="label">CLIENT METADATA</span>
                        <div class="data-stat" style="font-family:monospace; font-size: 0.75rem; color: #a78bfa;">
                            <div class="mb-1"><span style="color:#64748b;">> STACK:</span> <span class="text-info fw-bold">HTML, CSS, JS</span></div>
                            <div class="mb-1"><span style="color:#64748b;">> CHARTS:</span> <span class="text-success fw-bold">Chart.js</span></div>
                        </div>
                    </div>
                </div>
            `
        }
    ];

    const nodeGroups = [
        ['n-hw', 'n-s1', 'n-s2', 'n-s3', 'n-s4', 'n-s5'], // 0
        ['n-ing'], // 1
        ['n-val-layer'], // 2
        ['n-smooth'], // 3
        ['n-feat'], // 4
        ['n-ml', 'n-m1', 'n-m2', 'n-m3', 'n-m4'], // 5
        ['n-pred'], // 6
        ['n-val'], // 7
        ['n-flask'], // 8
        ['n-dash'] // 9
    ];

    const pathGroups = [
        ['p-hw-s1', 'p-hw-s2', 'p-hw-s3', 'p-hw-s4', 'p-hw-s5'], // 0
        ['p-s1-ing', 'p-s2-ing', 'p-s3-ing', 'p-s4-ing', 'p-s5-ing'], // 1
        ['p-ing-val-layer'], // 2
        ['p-val-layer-smooth'], // 3
        ['p-smooth-feat'], // 4
        ['p-feat-ml', 'p-ml-m1', 'p-ml-m2', 'p-ml-m3', 'p-ml-m4'], // 5
        ['p-m1-pred', 'p-m2-pred', 'p-m3-pred', 'p-m4-pred'], // 6
        ['p-pred-val'], // 7
        ['p-val-flask'], // 8
        ['p-flask-dash'] // 9
    ];

    const pathConnections = {
        'p-hw-s1': ['n-hw', 'n-s1'],
        'p-hw-s2': ['n-hw', 'n-s2'],
        'p-hw-s3': ['n-hw', 'n-s3'],
        'p-hw-s4': ['n-hw', 'n-s4'],
        'p-hw-s5': ['n-hw', 'n-s5'],
        'p-s1-ing': ['n-s1', 'n-ing'],
        'p-s2-ing': ['n-s2', 'n-ing'],
        'p-s3-ing': ['n-s3', 'n-ing'],
        'p-s4-ing': ['n-s4', 'n-ing'],
        'p-s5-ing': ['n-s5', 'n-ing'],
        'p-ing-val-layer': ['n-ing', 'n-val-layer'],
        'p-val-layer-smooth': ['n-val-layer', 'n-smooth'],
        'p-smooth-feat': ['n-smooth', 'n-feat'],
        'p-feat-ml': ['n-feat', 'n-ml'],
        'p-ml-m1': ['n-ml', 'n-m1'],
        'p-ml-m2': ['n-ml', 'n-m2'],
        'p-ml-m3': ['n-ml', 'n-m3'],
        'p-ml-m4': ['n-ml', 'n-m4'],
        'p-m1-pred': ['n-m1', 'n-pred'],
        'p-m2-pred': ['n-m2', 'n-pred'],
        'p-m3-pred': ['n-m3', 'n-pred'],
        'p-m4-pred': ['n-m4', 'n-pred'],
        'p-pred-val': ['n-pred', 'n-val'],
        'p-val-flask': ['n-val', 'n-flask'],
        'p-flask-dash': ['n-flask', 'n-dash']
    };

    let currentStep = 0;
    let autoplayTimer = null;
    let lastData = null;
    
    function updatePaths() {
        const svg = document.getElementById('flow-svg');
        const wrapper = document.querySelector('.flow-diagram-wrapper');
        if (!svg || !wrapper) return;
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;
        
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        svg.removeAttribute('preserveAspectRatio');
        
        for (const [pathId, [sourceId, targetId]] of Object.entries(pathConnections)) {
            const path = document.getElementById(pathId);
            const source = document.getElementById(sourceId);
            const target = document.getElementById(targetId);
            if (!path || !source || !target) continue;
            
            // Start exact horizontal center of bottom edge
            const sx = source.offsetLeft;
            const sy = source.offsetTop + (source.offsetHeight / 2);
            
            // End exact horizontal center of top edge
            const tx = target.offsetLeft;
            const ty = target.offsetTop - (target.offsetHeight / 2);
            
            let midX = (sx + tx) / 2;
            let midY = (sy + ty) / 2;
            
            if (sx === tx) {
                path.setAttribute('d', `M${sx},${sy} L${tx},${ty}`);
            } else {
                const cy1 = sy + (ty - sy) * 0.5;
                const cy2 = ty - (ty - sy) * 0.5;
                path.setAttribute('d', `M${sx},${sy} C${sx},${cy1} ${tx},${cy2} ${tx},${ty}`);
            }
            
            // Position midpoint dot
            const dot = document.querySelector(`.midpoint-dot-${pathId}`);
            if (dot) {
                dot.setAttribute('cx', midX);
                dot.setAttribute('cy', midY);
            }
        }
    }

    function initDiagram() {
        // Generate step dots
        const dots = document.getElementById('step-dots');
        dots.innerHTML = PIPELINE_STAGES.map((_, i) => `<div class="step-dot" id="dot-${i}"></div>`).join('');
        
        // Generate SVG particles for paths
        const svg = document.getElementById('flow-svg');
        document.querySelectorAll('.flow-path').forEach(p => {
            const id = p.getAttribute('id');
            const colorClass = Array.from(p.classList).find(c => c.startsWith('color-')) || 'color-default';
            
            // Add static pulsing dot at midpoint
            const midDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            midDot.setAttribute('r', '4');
            midDot.setAttribute('class', `pulse-circle midpoint-dot-${id} ${colorClass}`);
            
            const animOp = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animOp.setAttribute('attributeName', 'opacity');
            animOp.setAttribute('values', '1;0;0');
            animOp.setAttribute('keyTimes', '0;0.3;1');
            animOp.setAttribute('dur', '2s');
            animOp.setAttribute('repeatCount', 'indefinite');
            
            const animR = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animR.setAttribute('attributeName', 'r');
            animR.setAttribute('values', '4;16;16');
            animR.setAttribute('keyTimes', '0;0.3;1');
            animR.setAttribute('dur', '2s');
            animR.setAttribute('repeatCount', 'indefinite');
            
            midDot.appendChild(animOp);
            midDot.appendChild(animR);
            svg.appendChild(midDot);
            
            // Animated moving particle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', '3');
            circle.setAttribute('class', `flow-particle part-${id} ${colorClass}`);
            
            const motion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
            motion.setAttribute('dur', '2s');
            motion.setAttribute('repeatCount', 'indefinite');
            
            const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
            mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${id}`);
            
            motion.appendChild(mpath);
            circle.appendChild(motion);
            svg.appendChild(circle);
        });
        
        updatePaths();
        window.addEventListener('resize', updatePaths);
    }

    function updateStepUI() {
        // Reset
        document.querySelectorAll('.flow-node').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.flow-path').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.flow-particle').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.pulse-circle').forEach(c => c.classList.remove('active'));
        
        // Activate current step
        nodeGroups[currentStep].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('active');
        });
        
        pathGroups[currentStep].forEach(id => {
            const p = document.getElementById(id);
            if (p) p.classList.add('active');
            
            const part = document.querySelector(`.part-${id}`);
            if (part) part.classList.add('active');
            
            const dot = document.querySelector(`.midpoint-dot-${id}`);
            if (dot) dot.classList.add('active');
        });

        // Handle dots
        document.querySelectorAll('.step-dot').forEach((dot, i) => {
            if (i === currentStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });
        
        // Update content panel
        const stage = PIPELINE_STAGES[currentStep];
        document.getElementById('step-indicator-text').innerText = `STEP ${currentStep + 1} / ${PIPELINE_STAGES.length}`;
        
        let dataHtml = '<div class="text-secondary small">Waiting for data...</div>';
        if (lastData) {
            try {
                dataHtml = stage.renderData(lastData);
            } catch (e) {
                console.error(e);
            }
        }

        document.getElementById('step-content').innerHTML = `
            <div class="step-title"><i class="bi ${stage.icon}"></i> ${stage.title}</div>
            <div class="step-desc">${stage.desc}</div>
            <div class="live-data-box" id="step-live-data">
                ${dataHtml}
            </div>
        `;
    }

    function nextStep() {
        currentStep = (currentStep + 1) % PIPELINE_STAGES.length;
        updateStepUI();
        resetAutoplay();
    }

    function prevStep() {
        currentStep = (currentStep - 1 + PIPELINE_STAGES.length) % PIPELINE_STAGES.length;
        updateStepUI();
        resetAutoplay();
    }

    function goToStep(index) {
        currentStep = index;
        updateStepUI();
        resetAutoplay();
    }

    function handleNodeClick(el, stepIndex, e) {
        e.stopPropagation();
        
        // Toggle tooltip
        const wasActive = el.classList.contains('tooltip-active');
        document.querySelectorAll('.flow-node').forEach(n => n.classList.remove('tooltip-active'));
        if (!wasActive) el.classList.add('tooltip-active');
        
        // Go to step
        if (stepIndex !== undefined) goToStep(stepIndex);
    }
    
    // Hide tooltips on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('.flow-node').forEach(n => n.classList.remove('tooltip-active'));
    });

    // Autoplay logic
    document.getElementById('autoplay-toggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            startAutoplay();
        } else {
            stopAutoplay();
        }
    });

    function startAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
        autoplayTimer = setInterval(() => {
            currentStep = (currentStep + 1) % PIPELINE_STAGES.length;
            updateStepUI();
        }, 4000);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function resetAutoplay() {
        if (document.getElementById('autoplay-toggle').checked) {
            startAutoplay();
        }
    }

    async function fetchWorkflowData() {
        try {
            const r = await fetch('/data');
            lastData = await r.json();
            
            const stage = PIPELINE_STAGES[currentStep];
            const dataBox = document.getElementById('step-live-data');
            if (dataBox) {
                dataBox.innerHTML = stage.renderData(lastData);
            }
        } catch(e) {
            console.error('Workflow data fetch error:', e);
        }
    }

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        initDiagram();
        updateStepUI();
        fetchWorkflowData();
        setInterval(fetchWorkflowData, 2000);
    });
