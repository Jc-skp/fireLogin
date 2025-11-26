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
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que o Ionic inicialize corretamente
    if (typeof Ionic !== 'undefined') {
        Ionic.config.set('scrollAssist', true);
        Ionic.config.set('inputBlurring', true);
    }

    // Forçar redimensionamento na rotação da tela
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            window.dispatchEvent(new Event('resize'));
        }, 300);
    });
});
console.log('✅ App pronto para uso!');