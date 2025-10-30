// Inicialização do app
document.addEventListener('DOMContentLoaded', function() {
    console.log('App Ionic carregado!');

    // Verificar estado de autenticação
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log('Usuário logado:', user.email);
            showScreen(document.getElementById('dashboard-screen'));
            document.getElementById('user-email').textContent = user.email;
        } else {
            console.log('Nenhum usuário logado');
            showScreen(document.getElementById('login-screen'));
        }
    });
});

// Função para alternar entre telas
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    screen.classList.add('active');
}