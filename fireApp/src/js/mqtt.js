// js/mqtt.js
class MQTTClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.config = {
            broker: 'broker.emqx.io', // Broker público gratuito
            port: 8083, // WebSocket port
            clientId: 'iot_dashboard_' + Math.random().toString(16).substring(2, 8),
            username: '', // Opcional
            password: '' // Opcional
        };

        // Tópicos MQTT
        this.topics = {
            ledControl: 'fatec/iot/led',
            motorControl: 'fatec/iot/motor',
            rgbControl: 'fatec/iot/rgb',
            temperature: 'fatec/iot/sensor/temperature',
            luminosity: 'fatec/iot/sensor/luminosity',
            humidity: 'fatec/iot/sensor/humidity',
            pressure: 'fatec/iot/sensor/pressure'
        };

        this.init();
    }

    init() {
        console.log('🔌 Inicializando cliente MQTT...');
        this.setupEventListeners();
        this.updateUI();
    }

    connect() {
        if (this.isConnected) {
            this.addLog('⚠️ Já conectado ao broker', 'warning');
            return;
        }

        try {
            this.client = new Paho.MQTT.Client(
                this.config.broker,
                this.config.port,
                this.config.clientId
            );

            // Configurar callbacks
            this.client.onConnectionLost = this.onConnectionLost.bind(this);
            this.client.onMessageArrived = this.onMessageArrived.bind(this);

            // Opções de conexão
            const connectOptions = {
                onSuccess: this.onConnectSuccess.bind(this),
                onFailure: this.onConnectFailure.bind(this),
                useSSL: false,
                timeout: 3,
                keepAliveInterval: 60,
                cleanSession: true
            };

            // Adicionar credenciais se fornecidas
            if (this.config.username) {
                connectOptions.userName = this.config.username;
                connectOptions.password = this.config.password;
            }

            this.client.connect(connectOptions);
            this.addLog('🔄 Conectando ao broker...', 'info');

        } catch (error) {
            console.error('❌ Erro ao conectar MQTT:', error);
            this.addLog('❌ Erro na conexão: ' + error.message, 'error');
        }
    }

    onConnectSuccess() {
        this.isConnected = true;
        console.log('✅ Conectado ao broker MQTT');
        this.addLog('✅ Conectado ao broker MQTT', 'success');

        // Inscrever nos tópicos
        this.subscribeToTopics();
        this.updateUI();
    }

    onConnectFailure(error) {
        this.isConnected = false;
        console.error('❌ Falha na conexão MQTT:', error);
        this.addLog('❌ Falha na conexão: ' + error.errorMessage, 'error');
        this.updateUI();
    }

    onConnectionLost(response) {
        this.isConnected = false;
        console.log('🔌 Conexão MQTT perdida:', response.errorMessage);
        this.addLog('🔌 Conexão perdida: ' + response.errorMessage, 'warning');
        this.updateUI();
    }

    onMessageArrived(message) {
        console.log('📨 Mensagem recebida:', message.destinationName, message.payloadString);
        this.processMessage(message.destinationName, message.payloadString);
    }

    subscribeToTopics() {
        // Inscrever em todos os tópicos de sensores
        Object.values(this.topics).forEach(topic => {
            this.client.subscribe(topic);
            console.log('📝 Inscrito no tópico:', topic);
            this.addLog(`📝 Inscrito em: ${topic}`, 'info');
        });
    }

    processMessage(topic, payload) {
        const timestamp = new Date().toLocaleTimeString();

        switch (topic) {
            case this.topics.temperature:
                this.updateSensor('temperature', payload, timestamp);
                break;

            case this.topics.luminosity:
                this.updateSensor('luminosity', payload, timestamp);
                break;

            case this.topics.humidity:
                this.updateSensor('humidity', payload, timestamp);
                break;

            case this.topics.pressure:
                this.updateSensor('pressure', payload, timestamp);
                break;

            case this.topics.ledControl:
                this.updateDeviceStatus('led', payload);
                break;

            case this.topics.motorControl:
                this.updateDeviceStatus('motor', payload);
                break;

            default:
                this.addLog(`📨 [${topic}]: ${payload}`, 'incoming');
        }
    }

    updateSensor(sensor, value, timestamp) {
        const elements = {
            temperature: { value: 'temperature-value', time: 'temp-time' },
            luminosity: { value: 'luminosity-value', time: 'luminosity-time' },
            humidity: { value: 'humidity-value', time: 'humidity-time' },
            pressure: { value: 'pressure-value', time: 'pressure-time' }
        };

        if (elements[sensor]) {
            const valueElement = document.getElementById(elements[sensor].value);
            const timeElement = document.getElementById(elements[sensor].time);

            if (valueElement) valueElement.textContent = value;
            if (timeElement) timeElement.textContent = timestamp;
        }

        this.addLog(`📊 ${sensor}: ${value}`, 'incoming');
    }

    updateDeviceStatus(device, state) {
        const statusElement = document.getElementById(`${device}-status`);
        if (statusElement) {
            statusElement.textContent = state;
            statusElement.className = `status-value ${state.toLowerCase()}`;
        }
        this.addLog(`⚡ ${device} ${state}`, 'incoming');
    }

    publish(topic, message) {
        if (!this.isConnected || !this.client) {
            this.addLog('❌ Não conectado ao broker', 'error');
            return false;
        }

        try {
            const messageObj = new Paho.MQTT.Message(message);
            messageObj.destinationName = topic;
            this.client.send(messageObj);

            console.log('📤 Mensagem publicada:', topic, message);
            this.addLog(`📤 [${topic}]: ${message}`, 'outgoing');
            return true;

        } catch (error) {
            console.error('❌ Erro ao publicar mensagem:', error);
            this.addLog('❌ Erro ao publicar: ' + error.message, 'error');
            return false;
        }
    }

    // Controles dos dispositivos
    controlLED(state) {
        return this.publish(this.topics.ledControl, state);
    }

    controlMotor(state) {
        return this.publish(this.topics.motorControl, state);
    }

    controlRGB(color) {
        // Converter cor hexadecimal para RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const message = `${r},${g},${b}`;
        return this.publish(this.topics.rgbControl, message);
    }

    disconnect() {
        if (this.client && this.isConnected) {
            this.client.disconnect();
            this.isConnected = false;
            this.addLog('🔌 Desconectado do broker', 'info');
            this.updateUI();
        }
    }

    // UI Helpers
    updateUI() {
        const statusElement = document.getElementById('mqtt-status');
        const connectBtn = document.getElementById('connect-mqtt');
        const disconnectBtn = document.getElementById('disconnect-mqtt');

        if (statusElement) {
            statusElement.textContent = this.isConnected ? 'Conectado' : 'Desconectado';
            statusElement.className = `status-badge ${this.isConnected ? 'connected' : 'disconnected'}`;
        }

        if (connectBtn) {
            connectBtn.disabled = this.isConnected;
        }

        if (disconnectBtn) {
            disconnectBtn.disabled = !this.isConnected;
        }
    }

    addLog(message, type = 'info') {
        const logContainer = document.getElementById('mqtt-log');
        if (!logContainer) return;

        const logEntry = document.createElement('div');
        logEntry.className = `log-message ${type}`;
        logEntry.innerHTML = `
            <span class="log-time">[${new Date().toLocaleTimeString()}]</span>
            <span class="log-content">${message}</span>
        `;

        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    setupEventListeners() {
        // Botões de conexão
        document.getElementById('connect-mqtt')?.addEventListener('click', () => this.connect());
        document.getElementById('disconnect-mqtt')?.addEventListener('click', () => this.disconnect());
        document.getElementById('clear-log')?.addEventListener('click', () => {
            const logContainer = document.getElementById('mqtt-log');
            if (logContainer) logContainer.innerHTML = '';
        });

        // Controles de LED
        document.querySelectorAll('.led-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const state = e.target.getAttribute('data-state');
                this.controlLED(state);
            });
        });

        // Controles de Motor
        document.querySelectorAll('.motor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const state = e.target.getAttribute('data-state');
                this.controlMotor(state);
            });
        });

        // Controle de Cor RGB
        document.getElementById('set-color')?.addEventListener('click', () => {
            const colorPicker = document.getElementById('rgb-color');
            if (colorPicker) {
                const color = colorPicker.value;
                this.controlRGB(color);

                // Atualizar status da cor
                const colorStatus = document.getElementById('color-status');
                if (colorStatus) {
                    colorStatus.textContent = color.toUpperCase();
                }
            }
        });
    }
}

// Inicializar MQTT quando o DOM estiver pronto
let mqttClient;

document.addEventListener('DOMContentLoaded', function() {
    mqttClient = new MQTTClient();
});

// Expor globalmente para debugging
window.mqttClient = mqttClient;