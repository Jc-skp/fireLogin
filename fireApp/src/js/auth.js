// Elementos DOM
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const forgotPasswordButton = document.getElementById('forgot-password-button');
const logoutButton = document.getElementById('logout-button');
const messageDiv = document.getElementById('message');
const loadingDiv = document.getElementById('loading');
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const userEmailSpan = document.getElementById('user-email');

// Função para exibir mensagens
function showMessage(message, type = 'info') {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');

    // Auto-esconder mensagens de sucesso/info após 5 segundos
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

function hideMessage() {
    messageDiv.classList.add('hidden');
}

// Função para mostrar/ocultar loading
function showLoading() {
    loadingDiv.classList.remove('hidden');
    loginButton.disabled = true;
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
    loginButton.disabled = false;
}

// Função para alternar entre telas
function showScreen(screen) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });

    // Mostrar a tela especificada
    screen.classList.add('active');
}

// Login com email e senha
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validação básica
    if (!email || !password) {
        showMessage('Por favor, preencha todos os campos', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Por favor, insira um email válido', 'error');
        return;
    }

    try {
        showLoading();
        hideMessage();

        // Fazer login com Firebase
        const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(
            window.auth,
            email,
            password
        );

        // Login bem-sucedido
        showMessage('Login realizado com sucesso!', 'success');

        // A tela será alterada automaticamente pelo listener onAuthStateChanged

    } catch (error) {
        console.error('Erro no login:', error);

        // Tratamento de erros específicos do Firebase
        let errorMessage = 'Erro ao fazer login. Tente novamente.';

        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Email inválido.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Esta conta foi desativada.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'Usuário não encontrado.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Senha incorreta.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Muitas tentativas falhas. Tente novamente mais tarde.';
                break;
        }

        showMessage(errorMessage, 'error');
    } finally {
        hideLoading();
    }
});

// Recuperação de senha
forgotPasswordButton.addEventListener('click', async () => {
    const email = emailInput.value.trim();

    if (!email) {
        showMessage('Por favor, insira seu email para recuperar a senha', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Por favor, insira um email válido', 'error');
        return;
    }

    try {
        showLoading();

        await window.firebaseAuth.sendPasswordResetEmail(window.auth, email);

        showMessage('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');

    } catch (error) {
        console.error('Erro ao enviar email de recuperação:', error);

        let errorMessage = 'Erro ao enviar email de recuperação.';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Nenhum usuário encontrado com este email.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email inválido.';
                break;
        }

        showMessage(errorMessage, 'error');
    } finally {
        hideLoading();
    }
});

// Logout
logoutButton.addEventListener('click', async () => {
    try {
        await window.firebaseAuth.signOut(window.auth);
        showMessage('Logout realizado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro no logout:', error);
        showMessage('Erro ao fazer logout', 'error');
    }
});

// Listener para mudanças de autenticação
window.firebaseAuth.onAuthStateChanged(window.auth, (user) => {
    if (user) {
        // Usuário está logado
        userEmailSpan.textContent = user.email;
        showScreen(dashboardScreen);
        hideMessage();
    } else {
        // Usuário não está logado
        showScreen(loginScreen);

        // Limpar formulário
        loginForm.reset();
    }
});

// Função auxiliar para validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}