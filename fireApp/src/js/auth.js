// Aguardar o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth.js carregado!");

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

    // Verificar se todos os elementos existem
    if (!loginForm || !emailInput || !passwordInput) {
        console.error("Elementos do formulário não encontrados!");
        return;
    }

    console.log("Todos os elementos DOM carregados corretamente");

    // Função para exibir mensagens
    function showMessage(message, type = 'info') {
        if (!messageDiv) {
            console.error("Elemento de mensagem não encontrado!");
            return;
        }

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
        if (messageDiv) {
            messageDiv.classList.add('hidden');
        }
    }

    function showLoading() {
        if (loadingDiv && loginButton) {
            loadingDiv.classList.remove('hidden');
            loginButton.disabled = true;
        }
    }

    function hideLoading() {
        if (loadingDiv && loginButton) {
            loadingDiv.classList.add('hidden');
            loginButton.disabled = false;
        }
    }

    function showScreen(screen) {
        // Esconder todas as telas
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });

        // Mostrar a tela especificada
        if (screen) {
            screen.classList.add('active');
        }
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

            console.log("Tentando login com:", email);

            // Fazer login com Firebase
            const userCredential = await auth.signInWithEmailAndPassword(email, password);

            // Login bem-sucedido
            console.log("Login bem-sucedido:", userCredential.user.email);
            showMessage('Login realizado com sucesso!', 'success');

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
                case 'auth/network-request-failed':
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                    break;
            }

            showMessage(errorMessage, 'error');
        } finally {
            hideLoading();
        }
    });

    // Recuperação de senha
    if (forgotPasswordButton) {
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
                console.log("Enviando email de recuperação para:", email);

                await auth.sendPasswordResetEmail(email);

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
                    case 'auth/network-request-failed':
                        errorMessage = 'Erro de conexão. Verifique sua internet.';
                        break;
                }

                showMessage(errorMessage, 'error');
            } finally {
                hideLoading();
            }
        });
    }

    // Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                console.log("Fazendo logout...");
                await auth.signOut();
                showMessage('Logout realizado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro no logout:', error);
                showMessage('Erro ao fazer logout', 'error');
            }
        });
    }

    // Listener para mudanças de autenticação
    auth.onAuthStateChanged((user) => {
        console.log("Estado de autenticação mudou:", user ? user.email : "Nenhum usuário");

        if (user) {
            // Usuário está logado
            if (userEmailSpan) userEmailSpan.textContent = user.email;
            showScreen(dashboardScreen);
            hideMessage();
        } else {
            // Usuário não está logado
            showScreen(loginScreen);

            // Limpar formulário
            if (loginForm) loginForm.reset();
        }
    });

    // Função auxiliar para validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});