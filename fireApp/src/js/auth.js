// Função para aguardar o auth ficar disponível
function waitForAuth(callback) {
    const maxAttempts = 50;
    let attempts = 0;

    function checkAuth() {
        attempts++;
        if (window.auth) {
            console.log("✅ Auth encontrado após", attempts, "tentativas");
            callback(window.auth);
        } else if (attempts < maxAttempts) {
            setTimeout(checkAuth, 100);
        } else {
            console.error("❌ Timeout: Auth não ficou disponível");
            showMessage('Erro: Serviço de autenticação não carregou. Recarregue a página.', 'error', 'message');
        }
    }

    checkAuth();
}

// Aguardar o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth.js carregado! Procurando auth...");

    waitForAuth(function(auth) {
        console.log("✅ Iniciando configuração do auth...");
        initializeAuth(auth);
    });
});

function initializeAuth(auth) {
    console.log("✅ Auth recebido:", auth ? "Sim" : "Não");

    // DECLARAR TODAS AS VARIÁVEIS PRIMEIRO
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const registerName = document.getElementById('register-name');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerConfirmPassword = document.getElementById('register-confirm-password');
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const googleLoginButton = document.getElementById('google-login-button');
    const googleRegisterButton = document.getElementById('google-register-button');
    const forgotPasswordButton = document.getElementById('forgot-password-button');
    const logoutButton = document.getElementById('logout-button');
    const showRegisterButton = document.getElementById('show-register-button');
    const showLoginButton = document.getElementById('show-login-button');
    const loginMessage = document.getElementById('message');
    const registerMessage = document.getElementById('register-message');
    const loginLoading = document.getElementById('login-loading');
    const registerLoading = document.getElementById('register-loading');
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const userDisplayName = document.getElementById('user-display-name');
    const userEmail = document.getElementById('user-email');

    // Verificar se todos os elementos existem
    if (!loginForm || !registerForm) {
        console.error("Elementos do formulário não encontrados!");
        return;
    }

    console.log("Todos os elementos DOM carregados corretamente");

    // Função para exibir mensagens
    function showMessage(message, type = 'info', elementId = 'message') {
        const messageDiv = document.getElementById(elementId);
        if (!messageDiv) {
            console.error("Elemento de mensagem não encontrado!");
            return;
        }

        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
    }

    function hideMessage(elementId = 'message') {
        const messageDiv = document.getElementById(elementId);
        if (messageDiv) {
            messageDiv.className = 'message';
            messageDiv.style.display = 'none';
        }
    }

    function showLoading(loadingId) {
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) {
            loadingDiv.style.display = 'block';
        }
    }

    function hideLoading(loadingId) {
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
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
            console.log("🔄 Tela ativada:", screen.id);
        }
    }

    // Alternar entre telas de login/cadastro
    if (showRegisterButton) {
        showRegisterButton.addEventListener('click', () => {
            showScreen(registerScreen);
            hideMessage('message');
            hideMessage('register-message');
        });
    }

    if (showLoginButton) {
        showLoginButton.addEventListener('click', () => {
            showScreen(loginScreen);
            hideMessage('message');
            hideMessage('register-message');
        });
    }

    // Login com email e senha
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        // Validação básica
        if (!email || !password) {
            showMessage('Por favor, preencha todos os campos', 'error', 'message');
            return;
        }

        if (!validateEmail(email)) {
            showMessage('Por favor, insira um email válido', 'error', 'message');
            return;
        }

        try {
            showLoading('login-loading');
            loginButton.disabled = true;
            hideMessage('message');

            console.log("Tentando login com:", email);

            // Fazer login com Firebase
            const userCredential = await auth.signInWithEmailAndPassword(email, password);

            // Login bem-sucedido
            console.log("Login bem-sucedido:", userCredential.user.email);
            showMessage('Login realizado com sucesso!', 'success', 'message');

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

            showMessage(errorMessage, 'error', 'message');
        } finally {
            hideLoading('login-loading');
            loginButton.disabled = false;
        }
    });

    // Cadastro com email e senha
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value;
        const confirmPassword = registerConfirmPassword.value;

        // Validações
        if (!name || !email || !password || !confirmPassword) {
            showMessage('Por favor, preencha todos os campos', 'error', 'register-message');
            return;
        }

        if (!validateEmail(email)) {
            showMessage('Por favor, insira um email válido', 'error', 'register-message');
            return;
        }

        if (password.length < 6) {
            showMessage('A senha deve ter no mínimo 6 caracteres', 'error', 'register-message');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('As senhas não coincidem', 'error', 'register-message');
            return;
        }

        try {
            showLoading('register-loading');
            registerButton.disabled = true;
            hideMessage('register-message');

            console.log("Tentando cadastro para:", email);

            // Criar usuário no Firebase
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);

            // Atualizar perfil com o nome
            await userCredential.user.updateProfile({
                displayName: name
            });

            // Salvar informações adicionais no Firestore (opcional)
            if (window.firestore) {
                await firestore.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    createdAt: new Date(),
                    role: 'user'
                });
            }

            console.log("Cadastro bem-sucedido:", userCredential.user.email);
            showMessage('Conta criada com sucesso!', 'success', 'register-message');

        } catch (error) {
            console.error('Erro no cadastro:', error);

            // Tratamento de erros específicos do Firebase
            let errorMessage = 'Erro ao criar conta. Tente novamente.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este email já está em uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Operação não permitida. Contate o suporte.';
                    break;
            }

            showMessage(errorMessage, 'error', 'register-message');
        } finally {
            hideLoading('register-loading');
            registerButton.disabled = false;
        }
    });

    // Autenticação com Google
    function setupGoogleAuth() {
        const googleLogin = document.getElementById('google-login-button');
        const googleRegister = document.getElementById('google-register-button');

        if (googleLogin) {
            googleLogin.addEventListener('click', signInWithGoogle);
        }

        if (googleRegister) {
            googleRegister.addEventListener('click', signInWithGoogle);
        }
    }

    async function signInWithGoogle() {
        try {
            // VERIFICAÇÃO DE SEGURANÇA
            if (!window.auth) {
                throw new Error('Firebase Auth não está disponível');
            }

            console.log("🔄 Iniciando autenticação com Google...");

            // Criar provider do Google - FORMA CORRETA
            const provider = new firebase.auth.GoogleAuthProvider();

            // Adicionar escopos opcionais
            provider.addScope('profile');
            provider.addScope('email');

            // Mostrar loading
            showLoading('login-loading');

            // Fazer login com popup
            const result = await auth.signInWithPopup(provider);

            console.log("✅ Login Google bem-sucedido:", result.user.displayName);

            // Se for um novo usuário, salvar no Firestore
            if (result.additionalUserInfo?.isNewUser && window.firestore) {
                try {
                    await firestore.collection('users').doc(result.user.uid).set({
                        name: result.user.displayName,
                        email: result.user.email,
                        createdAt: new Date(),
                        role: 'user',
                        provider: 'google',
                        photoURL: result.user.photoURL
                    });
                    console.log("✅ Dados do usuário salvos no Firestore");
                } catch (firestoreError) {
                    console.warn("⚠️ Não foi possível salvar no Firestore:", firestoreError);
                }
            }

            showMessage('Login com Google realizado com sucesso!', 'success', 'message');

        } catch (error) {
            console.error('❌ Erro no login com Google:', error);

            let errorMessage = 'Erro ao fazer login com Google.';

            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = 'Login cancelado. A janela foi fechada.';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = 'Popup bloqueado. Permita popups para este site.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Erro de conexão. Verifique sua internet.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Login com Google não está habilitado. Contate o administrador.';
                    break;
                case 'auth/unauthorized-domain':
                    errorMessage = 'Domínio não autorizado. Verifique as configurações do Firebase.';
                    break;
            }

            showMessage(errorMessage, 'error', 'message');
        } finally {
            hideLoading('login-loading');
        }
    }

    // Recuperação de senha
    if (forgotPasswordButton) {
        forgotPasswordButton.addEventListener('click', async () => {
            const email = loginEmail.value.trim() || registerEmail.value.trim();

            if (!email) {
                showMessage('Por favor, insira seu email para recuperar a senha', 'error', 'message');
                return;
            }

            if (!validateEmail(email)) {
                showMessage('Por favor, insira um email válido', 'error', 'message');
                return;
            }

            try {
                showLoading('login-loading');
                console.log("Enviando email de recuperação para:", email);

                await auth.sendPasswordResetEmail(email);

                showMessage('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success', 'message');

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

                showMessage(errorMessage, 'error', 'message');
            } finally {
                hideLoading('login-loading');
            }
        });
    }

    // Configurar logout
    function setupLogout() {
        if (!logoutButton) {
            console.error("❌ Botão de logout não encontrado!");
            return;
        }

        console.log("✅ Botão de logout encontrado, configurando evento...");

        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("🔄 Iniciando logout...");

            try {
                await auth.signOut();
                console.log("✅ Logout realizado com sucesso");
                showMessage('Logout realizado com sucesso!', 'success', 'message');

            } catch (error) {
                console.error('❌ Erro no logout:', error);
                showMessage('Erro ao fazer logout: ' + error.message, 'error', 'message');
            }
        });

        console.log("✅ Evento de logout configurado com sucesso");
    }

    // Listener para mudanças de autenticação
    auth.onAuthStateChanged((user) => {
        console.log("Estado de autenticação mudou:", user ? user.displayName : "Nenhum usuário");

        if (user) {
            // Usuário está logado
            if (userDisplayName) userDisplayName.textContent = user.displayName || 'Usuário';
            if (userEmail) userEmail.textContent = user.email;

            showScreen(dashboardScreen);
            hideMessage('message');
            hideMessage('register-message');

            // CONFIGURAR LOGOUT QUANDO USUÁRIO ESTÁ LOGADO
            setTimeout(() => {
                setupLogout();
            }, 100);

        } else {
            // Usuário não está logado
            showScreen(loginScreen);

            // Limpar formulários
            if (loginForm) loginForm.reset();
            if (registerForm) registerForm.reset();
        }
    });

    // Configurar autenticação do Google
    setupGoogleAuth();

    // Função auxiliar para validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}