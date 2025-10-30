// Configuração do Firebase - SUBSTITUA COM SUAS CONFIGURAÇÕES
console.log("Inicializando Firebase...");

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAEtLpNWrcdRel5y394NVpq1sY560Nwftg",
    authDomain: "firelogin-4c37e.firebaseapp.com",
    projectId: "firelogin-4c37e",
    storageBucket: "firelogin-4c37e.firebasestorage.app",
    messagingSenderId: "1014893701023",
    appId: "1:1014893701023:web:e8f6d0a395367984187faa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase inicializado com sucesso!");
} catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
}

const auth = firebase.auth();
console.log("Auth inicializado:", auth ? "Sim" : "Não");