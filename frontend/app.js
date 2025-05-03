// MQTT Configuration
const MQTT_BROKER = 'ws://localhost:9001'; // WebSocket port for MQTT
const MQTT_TOPICS = {
    MOISTURE: 'plant/moisture',
    PUMP_STATUS: 'plant/pump/status',
    AI_SUGGESTION: 'plant/ai/suggestion',
    PUMP_CONTROL: 'plant/pump/control'
};

// DOM Elements
const moistureLevel = document.getElementById('moisture-level');
const pumpStatus = document.getElementById('pump-status');
const aiSuggestion = document.getElementById('ai-suggestion');
const togglePumpButton = document.getElementById('toggle-pump');

// MQTT Client
let client = null;

// Connect to MQTT Broker
function connectMQTT() {
    client = mqtt.connect(MQTT_BROKER);

    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        // Subscribe to topics
        Object.values(MQTT_TOPICS).forEach(topic => {
            client.subscribe(topic);
        });
    });

    client.on('message', (topic, message) => {
        const payload = message.toString();
        updateUI(topic, payload);
    });

    client.on('error', (error) => {
        console.error('MQTT Error:', error);
    });

    client.on('close', () => {
        console.log('MQTT connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectMQTT, 5000);
    });
}

// Update UI based on MQTT messages
function updateUI(topic, payload) {
    switch (topic) {
        case MQTT_TOPICS.MOISTURE:
            moistureLevel.textContent = `${payload}%`;
            break;
        case MQTT_TOPICS.PUMP_STATUS:
            pumpStatus.textContent = payload;
            updatePumpButton(payload === 'ON');
            break;
        case MQTT_TOPICS.AI_SUGGESTION:
            aiSuggestion.textContent = payload;
            updateSuggestionStyle(payload);
            break;
    }
}

// Update pump button state
function updatePumpButton(isOn) {
    togglePumpButton.textContent = isOn ? 'Turn Pump OFF' : 'Turn Pump ON';
    togglePumpButton.classList.toggle('active', isOn);
}

// Update suggestion style based on content
function updateSuggestionStyle(suggestion) {
    aiSuggestion.className = 'value';
    if (suggestion === 'WATER NOW') {
        aiSuggestion.classList.add('status-warning');
    } else if (suggestion === 'SKIP') {
        aiSuggestion.classList.add('status-success');
    }
}

// Toggle pump state
togglePumpButton.addEventListener('click', () => {
    if (!client) return;
    
    const newState = togglePumpButton.textContent.includes('ON') ? 'ON' : 'OFF';
    client.publish(MQTT_TOPICS.PUMP_CONTROL, newState);
});

// Initialize
connectMQTT(); 