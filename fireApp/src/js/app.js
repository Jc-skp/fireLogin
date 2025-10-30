// Inicialização do app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App Ionic carregado com sucesso!');

    // Verificar se o Firebase está carregado
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase não carregado!');
        showMessage('Erro: Firebase não carregado. Verifique a conexão.', 'error');
        return;
    }

    console.log('✅ Firebase carregado corretamente');

    // Mostrar mensagem de boas-vindas
    setTimeout(() => {
        const messageDiv = document.getElementById('message');
        if (messageDiv && messageDiv.classList.contains('hidden')) {
            showMessage('App carregado com sucesso!', 'info');
        }
    }, 1000);
});

// Função auxiliar para mostrar mensagens (caso auth.js não tenha carregado)
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');
    }
}