// Inicialização do app
// js/app.js
console.log('📱 App IoT carregado com sucesso!');

// Funções auxiliares simples
function navigateTo(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

console.log('✅ App pronto para uso!');