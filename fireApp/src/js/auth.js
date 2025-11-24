// js/auth.js
console.log('🔐 Sistema de autenticação carregado');

// Estado da aplicação
let currentUser = null;

// =============================================
// VERIFICAÇÃO DO FIREBASE
// =============================================

function isFirebaseReady() {
    try {
        if (typeof firebase === 'undefined') {
            console.log('❌ Firebase não carregado');
            return false;
        }

        const app = firebase.app();
        console.log('✅ Firebase pronto:', app.name);
        return true;

    } catch (error) {
        console.log('❌ Firebase não inicializado:', error.message);
        return false;
    }
}

// =============================================
// FUNÇÕES BÁSICAS
// =============================================

function showMessage(message, type = 'error') {
    let messageElement;

    // Determinar qual elemento de mensagem usar
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen.id === 'register-screen') {
        messageElement = document.getElementById('register-message');
    } else {
        messageElement = document.getElementById('message');
    }

    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type} active`;

        setTimeout(() => {
            messageElement.classList.remove('active');
        }, 5000);
    }
}

function toggleLoading(show, screen = 'login') {
    const loadingId = screen === 'register' ? 'register-loading' : 'login-loading';
    const loadingElement = document.getElementById(loadingId);

    if (loadingElement) {
        if (show) {
            loadingElement.classList.add('active');
        } else {
            loadingElement.classList.remove('active');
        }
    }
}

function showScreen(screenId) {
    // Esconder todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Mostrar tela desejada
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('🔄 Tela:', screenId);
    }
}

function updateUserInfo(user) {
    const nameElement = document.getElementById('user-display-name');
    const emailElement = document.getElementById('user-email');

    if (nameElement) nameElement.textContent = user.displayName || user.email || 'Usuário';
    if (emailElement) emailElement.textContent = user.email || 'Não informado';

    currentUser = user;
}

// =============================================
// AUTENTICAÇÃO
// =============================================

// Login com Email/Senha
function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isFirebaseReady()) {
            showMessage('Sistema não configurado. Recarregue a página.', 'error');
            return;
        }

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showMessage('Preencha todos os campos', 'error');
            return;
        }

        toggleLoading(true, 'login');

        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            showMessage(`Bem-vindo, ${user.email}!`, 'success');
        } catch (error) {
            console.error('Erro login:', error);
            let message = 'Erro ao fazer login';

            switch (error.code) {
                case 'auth/user-not-found': message = 'Usuário não encontrado'; break;
                case 'auth/wrong-password': message = 'Senha incorreta'; break;
                case 'auth/invalid-email': message = 'Email inválido'; break;
                case 'auth/too-many-requests': message = 'Muitas tentativas. Tente mais tarde'; break;
            }

            showMessage(message, 'error');
        } finally {
            toggleLoading(false, 'login');
        }
    });
}

// Cadastro com Email/Senha
function setupRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isFirebaseReady()) {
            showMessage('Sistema não configurado. Recarregue a página.', 'error');
            return;
        }

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Validações
        if (!name || !email || !password || !confirmPassword) {
            showMessage('Preencha todos os campos', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('As senhas não coincidem', 'error');
            return;
        }

        toggleLoading(true, 'register');

        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Atualizar nome do usuário
            await user.updateProfile({ displayName: name });

            showMessage('Conta criada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro cadastro:', error);
            let message = 'Erro ao criar conta';

            switch (error.code) {
                case 'auth/email-already-in-use': message = 'Email já está em uso'; break;
                case 'auth/invalid-email': message = 'Email inválido'; break;
                case 'auth/weak-password': message = 'Senha muito fraca'; break;
            }

            showMessage(message, 'error');
        } finally {
            toggleLoading(false, 'register');
        }
    });
}

// Login com Google
function setupGoogleAuth() {
    const loginBtn = document.getElementById('google-login-button');
    const registerBtn = document.getElementById('google-register-button');

    const handleGoogleAuth = async () => {
        if (!isFirebaseReady()) {
            showMessage('Sistema não configurado. Recarregue a página.', 'error');
            return;
        }

        const currentScreen = document.querySelector('.screen.active').id;
        toggleLoading(true, currentScreen === 'register-screen' ? 'register' : 'login');

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const result = await firebase.auth().signInWithPopup(provider);
            const user = result.user;

            showMessage(`Bem-vindo, ${user.displayName}!`, 'success');
        } catch (error) {
            console.error('Erro Google Auth:', error);
            let message = 'Erro ao fazer login com Google';

            switch (error.code) {
                case 'auth/popup-closed-by-user': message = 'Login cancelado'; break;
                case 'auth/popup-blocked': message = 'Popup bloqueado. Permita popups para este site'; break;
                case 'auth/unauthorized-domain': message = 'Domínio não autorizado no Firebase Console'; break;
            }

            showMessage(message, 'error');
        } finally {
            toggleLoading(false, currentScreen === 'register-screen' ? 'register' : 'login');
        }
    };

    if (loginBtn) loginBtn.addEventListener('click', handleGoogleAuth);
    if (registerBtn) registerBtn.addEventListener('click', handleGoogleAuth);
}

// Recuperação de Senha
function setupPasswordReset() {
    const btn = document.getElementById('forgot-password-button');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        let email = document.getElementById('login-email').value;

        if (!email) {
            email = prompt('Digite seu email para redefinir a senha:');
            if (!email) return;
        }

        if (!isFirebaseReady()) {
            showMessage('Sistema não configurado. Recarregue a página.', 'error');
            return;
        }

        toggleLoading(true, 'login');

        try {
            await firebase.auth().sendPasswordResetEmail(email);
            showMessage('Email de redefinição enviado! Verifique sua caixa de entrada.', 'success');
        } catch (error) {
            console.error('Erro reset password:', error);
            let message = 'Erro ao enviar email de redefinição';

            switch (error.code) {
                case 'auth/user-not-found': message = 'Não existe conta com este email'; break;
                case 'auth/invalid-email': message = 'Email inválido'; break;
            }

            showMessage(message, 'error');
        } finally {
            toggleLoading(false, 'login');
        }
    });
}

// Logout
function setupLogout() {
    const btn = document.getElementById('logout-button');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (isFirebaseReady()) {
            firebase.auth().signOut();
        }
    });
}

// Navegação
function setupNavigation() {
    const toRegister = document.getElementById('show-register-button');
    const toLogin = document.getElementById('show-login-button');

    if (toRegister) {
        toRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('register-screen');
        });
    }

    if (toLogin) {
        toLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('login-screen');
        });
    }
}

// =============================================
// OBSERVADOR DE AUTENTICAÇÃO
// =============================================

function setupAuthObserver() {
    if (!isFirebaseReady()) {
        // Tentar novamente em 1 segundo
        setTimeout(setupAuthObserver, 1000);
        return;
    }

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('✅ Usuário logado:', user.email);
            currentUser = user;
            updateUserInfo(user);
            showScreen('dashboard-screen');
        } else {
            console.log('🚪 Usuário deslogado');
            currentUser = null;
            showScreen('login-screen');
        }
    });
}

// =============================================
// INICIALIZAÇÃO
// =============================================

function init() {
    console.log('🚀 Inicializando aplicação...');

    // Configurar event listeners
    setupLoginForm();
    setupRegisterForm();
    setupGoogleAuth();
    setupPasswordReset();
    setupLogout();
    setupNavigation();

    // Configurar observador de auth
    setupAuthObserver();

    console.log('✅ Aplicação inicializada');
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}