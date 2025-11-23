// Inicialização do app
document.addEventListener('DOMContentLoaded', function() {
    console.log('App IoT carregado com sucesso!');

    // Verificar se o Firebase está carregado
    if (typeof firebase === 'undefined') {
        console.error('Firebase não carregado!');
        return;
    }

    console.log('Firebase carregado corretamente');

    setTimeout(() => {
        console.log('📱 App pronto para uso!');
    }, 1000);
});