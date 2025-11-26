// js/mqtt.js - VERSÃO CORRIGIDA
class MQTTClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.config = {
            // Broker que funciona com WebSocket
            host: 'broker.emqx.io',
            port: 8084, // WebSocket seguro
            clientId: 'iot_dashboard_' + Math.random().toString(16).substring(2, 8),
            useSSL: true
        };

        this.topics = {
            ledControl: 'fatec/iot/led',
            temperature: 'fatec/iot/sensor/temperature',
            humidity: 'fatec/iot/sensor/humidity'
        };

        this.init();
    }

    init() {
        console.log('🔌 Inicializando MQTT Client...');
        this.setupEventListeners();
        this.updateUI();
    }

    connect() {
        if (this.isConnected) {
            console.log('⚠️ Já conectado ao broker');
            return;
        }

        console.log('🔄 Conectando ao broker:', this.config.host, this.config.port);

        try {
            // Criar cliente MQTT
            this.client = new Paho.MQTT.Client(
                this.config.host,
                Number(this.config.port),
                this.config.clientId
            );

            // Configurar callbacks
            this.client.onConnectionLost = (response) => {
                console.log('🔌 Conexão perdida:', response.errorMessage);
                this.isConnected = false;
                this.addLog('Conexão MQTT perdida: ' + response.errorMessage, 'error');
                this.updateUI();
            };

            this.client.onMessageArrived = (message) => {
                console.log('📨 Mensagem recebida:', {
                    tópico: message.destinationName,
                    mensagem: message.payloadString
                });
                this.processMessage(message.destinationName, message.payloadString);
            };

            // Opções de conexão CORRETAS
            const connectOptions = {
                onSuccess: () => {
                    console.log('✅ Conectado com sucesso ao broker!');
                    this.isConnected = true;
                    this.addLog('Conectado ao broker MQTT', 'success');
                    this.subscribeToTopics();
                    this.updateUI();
                },
                onFailure: (error) => {
                    console.error('❌ Falha na conexão:', error);
                    this.isConnected = false;
                    this.addLog('Falha na conexão MQTT: ' + error.errorMessage, 'error');
                    this.updateUI();

                    // Tentar broker alternativo após falha
                    setTimeout(() => this.tryAlternativeBroker(), 3000);
                },
                useSSL: this.config.useSSL,
                timeout: 10,
                keepAliveInterval: 30,
                cleanSession: true
                // REMOVIDO: reconnect - não é uma propriedade válida
            };

            console.log('🔗 Iniciando conexão WebSocket...');
            this.client.connect(connectOptions);
            this.addLog('Conectando ao broker...', 'info');

        } catch (error) {
            console.error('💥 Erro na conexão:', error);
            this.addLog('Erro na conexão: ' + error.message, 'error');
        }
    }

    tryAlternativeBroker() {
        console.log('🔄 Tentando broker alternativo...');

        // Lista de brokers alternativos
        const brokers = [
            { host: 'broker.emqx.io', port: 8084, useSSL: true },
            { host: 'test.mosquitto.org', port: 8081, useSSL: false },
            { host: 'broker.hivemq.com', port: 8000, useSSL: false }
        ];

        // Encontrar broker atual e pegar o próximo
        const currentIndex = brokers.findIndex(b => b.host === this.config.host);
        const nextIndex = (currentIndex + 1) % brokers.length;
        const nextBroker = brokers[nextIndex];

        this.config = { ...this.config, ...nextBroker };
        console.log('🔄 Broker alternativo:', this.config.host, this.config.port);
        this.addLog(`Tentando broker: ${this.config.host}:${this.config.port}`, 'info');

        // Tentar reconectar
        this.connect();
    }

    subscribeToTopics() {
        console.log('📝 Inscrevendo nos tópicos...');

        Object.entries(this.topics).forEach(([key, topic]) => {
            console.log(`📋 Inscrevendo em: ${topic}`);

            this.client.subscribe(topic, {
                onSuccess: () => {
                    console.log(`✅ Inscrito com sucesso em: ${topic}`);
                    this.addLog(`Inscrito em: ${topic}`, 'success');
                },
                onFailure: (error) => {
                    console.error(`❌ Falha na inscrição em ${topic}:`, error);
                    this.addLog(`Falha na inscrição: ${topic}`, 'error');
                }
            });
        });
    }

    processMessage(topic, payload) {
        console.log('🔄 Processando mensagem:', topic, payload);

        const timestamp = new Date().toLocaleTimeString();

        switch (topic) {
            case this.topics.temperature:
                this.updateSensor('temperature', payload, timestamp);
                break;

            case this.topics.humidity:
                this.updateSensor('humidity', payload, timestamp);
                break;

            case this.topics.ledControl:
                this.updateDeviceStatus('led', payload);
                break;

            default:
                this.addLog(`[${topic}]: ${payload}`, 'incoming');
        }
    }

    updateSensor(sensor, value, timestamp) {
        console.log(`📊 Atualizando ${sensor}: ${value}`);

        const elements = {
            temperature: {
                value: 'temperature-value',
                time: 'temp-time'
            },
            humidity: {
                value: 'humidity-value',
                time: 'humidity-time'
            }
        };

        if (elements[sensor]) {
            const valueElement = document.getElementById(elements[sensor].value);
            const timeElement = document.getElementById(elements[sensor].time);

            if (valueElement) {
                valueElement.textContent = value;
                console.log(`✅ ${sensor} atualizado para: ${value}`);
            }
            if (timeElement) {
                timeElement.textContent = timestamp;
            }
        }

        this.addLog(`${sensor}: ${value}`, 'incoming');
    }

    updateDeviceStatus(device, state) {
        console.log(`⚡ Status ${device}: ${state}`);

        const statusElement = document.getElementById(`${device}-status`);
        if (statusElement) {
            statusElement.textContent = state;
            statusElement.className = `status-value ${state.toLowerCase()}`;
        }

        this.addLog(`${device} ${state}`, 'incoming');
    }

    publish(topic, message) {
        if (!this.isConnected || !this.client) {
            console.log('❌ Não conectado para publicar');
            this.addLog('Não conectado ao broker', 'error');
            return false;
        }

        try {
            console.log(`🚀 Publicando em [${topic}]: ${message}`);

            const messageObj = new Paho.MQTT.Message(message);
            messageObj.destinationName = topic;
            messageObj.qos = 0;

            this.client.send(messageObj);

            console.log('✅ Mensagem publicada com sucesso');
            this.addLog(`[${topic}]: ${message}`, 'outgoing');
            return true;

        } catch (error) {
            console.error('❌ Erro ao publicar:', error);
            this.addLog('Erro ao publicar: ' + error.message, 'error');
            return false;
        }
    }

    controlLED(state) {
        console.log(`🎛️ Controlando LED: ${state}`);
        const command = state.toUpperCase();
        const success = this.publish(this.topics.ledControl, command);

        if (success) {
            console.log(`✅ Comando LED ${command} enviado`);
        } else {
            console.log(`❌ Falha ao enviar comando LED ${command}`);
        }

        return success;
    }

    disconnect() {
        if (this.client && this.isConnected) {
            console.log('🔌 Desconectando do broker...');
            this.client.disconnect();
            this.isConnected = false;
            this.addLog('Desconectado do broker', 'info');
            this.updateUI();
        }
    }

    updateUI() {
        const statusElement = document.getElementById('mqtt-status');
        const connectBtn = document.getElementById('connect-mqtt');
        const disconnectBtn = document.getElementById('disconnect-mqtt');

        if (statusElement) {
            statusElement.textContent = this.isConnected ? 'Conectado' : 'Desconectado';
            statusElement.className = `status-badge ${this.isConnected ? 'connected' : 'disconnected'}`;
        }

        if (connectBtn) connectBtn.disabled = this.isConnected;
        if (disconnectBtn) disconnectBtn.disabled = !this.isConnected;
    }

    addLog(message, type = 'info') {
        const logContainer = document.getElementById('mqtt-log');
        if (!logContainer) {
            console.log('❌ Container de log não encontrado');
            return;
        }

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
        console.log('⚙️ Configurando event listeners...');

        // Botões de conexão
        const connectBtn = document.getElementById('connect-mqtt');
        const disconnectBtn = document.getElementById('disconnect-mqtt');

        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                console.log('🖱️ Botão Conectar clicado');
                this.connect();
            });
        }

        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => {
                console.log('🖱️ Botão Desconectar clicado');
                this.disconnect();
            });
        }

        // Controles de LED
        document.querySelectorAll('.led-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const state = e.target.getAttribute('data-state');
                console.log('🖱️ Botão LED clicado:', state);
                this.controlLED(state);
            });
        });

        console.log('✅ Event listeners configurados');
    }
}

// Inicializar quando o DOM estiver pronto
let mqttClient;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 DOM carregado - Iniciando MQTT Client');
    mqttClient = new MQTTClient();
});

// Expor para debugging
window.mqttClient = mqttClient;