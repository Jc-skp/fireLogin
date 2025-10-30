// Configuração do Firebase
console.log("Inicializando Firebase...");

// SUAS CONFIGURAÇÕES - COLE AQUI AS REAIS DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAEtLpNWrcdRel5y394NVpq1sY560Nwftg",
    authDomain: "firelogin-4c37e.firebaseapp.com",
    projectId: "firelogin-4c37e",
    storageBucket: "firelogin-4c37e.firebasestorage.app",
    messagingSenderId: "1014893701023",
    appId: "1:1014893701023:web:e8f6d0a395367984187faa"
};

// Inicializar Firebase
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase inicializado com sucesso!");

        // Tornar auth GLOBAL
        window.auth = firebase.auth();
        console.log("Auth definido como window.auth");
    } else {
        console.error("Firebase não está disponível");
    }
} catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
}