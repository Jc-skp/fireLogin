// Configuração do Firebase
console.log('🔥 Carregando configuração do Firebase...');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAEtLpNWrcdRel5y394NVpq1sY560Nwftg",
    authDomain: "firelogin-4c37e.firebaseapp.com",
    projectId: "firelogin-4c37e",
    storageBucket: "firelogin-4c37e.firebasestorage.app",
    messagingSenderId: "1014893701023",
    appId: "1:1014893701023:web:e8f6d0a395367984187faa"
};
function initializeFirebase() {
    try {
        // Verificar se o Firebase está disponível
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase não está disponível');
            return false;
        }

        // Tentar inicializar o Firebase
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase inicializado com sucesso!');

        // Verificar se a inicialização foi bem-sucedida
        const app = firebase.app();
        console.log('📱 App Firebase:', app.name);

        return true;

    } catch (error) {
        console.error('❌ Erro ao inicializar Firebase:', error);

        // Verificar se já existe uma app (em caso de recarregamento)
        try {
            const existingApp = firebase.app();
            console.log('ℹ️  Usando app Firebase existente:', existingApp.name);
            return true;
        } catch (e) {
            console.error('💥 Nenhuma app Firebase disponível');
            return false;
        }
    }
}

// Inicializar imediatamente quando o script carregar
window.firebaseInitialized = initializeFirebase();

// Expor a configuração globalmente para debugging
window.firebaseConfig = firebaseConfig;