// script.js - JavaScript moderno para a clínica veterinária

class VetCareApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDateRestrictions();
        this.setupSmoothScrolling();
        this.setupFormMasks();
    }

    // Configura todos os event listeners
    setupEventListeners() {
        // Formulário de agendamento
        const appointmentForm = document.getElementById('appointment-form');
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', (e) => this.handleAppointmentSubmit(e));
        }

        // Formulário de contato
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Modal de confirmação
        const closeModalBtn = document.getElementById('close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        const newAppointmentBtn = document.getElementById('new-appointment-btn');
        if (newAppointmentBtn) {
            newAppointmentBtn.addEventListener('click', () => this.newAppointment());
        }

        // Botão de agendamento no menu
        const agendarBtn = document.getElementById('agendar-btn');
        if (agendarBtn) {
            agendarBtn.addEventListener('click', (e) => this.scrollToAppointment(e));
        }

        // Fechar modal clicando fora
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('confirmation-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Animações de entrada para elementos
        this.setupScrollAnimations();

        // Menu hamburguer
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleMenu());
        }
    }

    // Configura restrições de data
    setupDateRestrictions() {
        const dateInput = document.getElementById('appointment-date');
        if (dateInput) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            dateInput.min = formattedDate;

            // Não permitir agendamentos aos domingos
            dateInput.addEventListener('change', (e) => {
                const selectedDate = new Date(e.target.value);
                if (selectedDate.getDay() === 0) { // Domingo
                    this.showMessage('Não realizamos atendimentos aos domingos. Por favor, escolha outra data.', 'warning');
                    e.target.value = '';
                }
            });
        }
    }

    // Configura máscaras para formulários
    setupFormMasks() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => this.maskPhone(e));
        });
    }

    // Máscara para telefone
    maskPhone(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
        
        event.target.value = value;
    }

    // Configura scroll suave
    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Configura animações de scroll
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observar elementos para animação
        const animatedElements = document.querySelectorAll('.feature-card, .contact-card, .form-container');
        animatedElements.forEach(el => observer.observe(el));
    }

    // Manipula envio do formulário de agendamento
    async handleAppointmentSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = this.getFormData(form);
        
        if (!this.validateAppointmentForm(formData)) {
            return;
        }

        // Mostrar loading
        form.classList.add('loading');

        try {
            // Simular envio para API
            await this.submitAppointment(formData);
            
            // Mostrar confirmação
            this.showAppointmentConfirmation(formData);
            form.reset();
            form.classList.remove('loading');
            
        } catch (error) {
            this.showMessage('Erro ao agendar consulta. Tente novamente.', 'error');
            form.classList.remove('loading');
        }
    }

    // Manipula envio do formulário de contato
    async handleContactSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = this.getFormData(form);
        
        if (!this.validateContactForm(formData)) {
            return;
        }

        form.classList.add('loading');

        try {
            // Simular envio para API
            await this.submitContact(formData);
            
            this.showMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            form.reset();
            form.classList.remove('loading');
            
        } catch (error) {
            this.showMessage('Erro ao enviar mensagem. Tente novamente.', 'error');
            form.classList.remove('loading');
        }
    }

    // Obtém dados do formulário
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    // Valida formulário de agendamento
    validateAppointmentForm(data) {
        const required = ['pet-name', 'pet-type', 'owner-name', 'phone', 'email', 'appointment-date', 'appointment-time', 'service'];
        
        for (let field of required) {
            if (!data[field] || data[field].trim() === '') {
                this.showMessage(`Por favor, preencha o campo ${field.replace('-', ' ')}.`, 'warning');
                return false;
            }
        }

        if (!this.isValidEmail(data.email)) {
            this.showMessage('Por favor, insira um email válido.', 'warning');
            return false;
        }

        return true;
    }

    // Valida formulário de contato
    validateContactForm(data) {
        const required = ['nomesobrenome', 'email', 'telefone', 'assunto', 'mensagem'];
        
        for (let field of required) {
            if (!data[field] || data[field].trim() === '') {
                this.showMessage(`Por favor, preencha o campo ${field}.`, 'warning');
                return false;
            }
        }

        if (!this.isValidEmail(data.email)) {
            this.showMessage('Por favor, insira um email válido.', 'warning');
            return false;
        }

        return true;
    }

    // Valida formato de email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Simula envio de agendamento
    async submitAppointment(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular sucesso (90% das vezes)
                if (Math.random() > 0.1) {
                    resolve({ success: true, id: Math.random().toString(36).substr(2, 9) });
                } else {
                    reject(new Error('Falha no servidor'));
                }
            }, 1000);
        });
    }

    // Simula envio de contato
    async submitContact(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Falha no servidor'));
                }
            }, 1000);
        });
    }

    // Mostra confirmação de agendamento
    showAppointmentConfirmation(data) {
        const modal = document.getElementById('confirmation-modal');
        const message = document.getElementById('confirmation-message');
        
        if (modal && message) {
            const dateObj = new Date(data['appointment-date']);
            const formattedDate = dateObj.toLocaleDateString('pt-BR');
            
            const serviceNames = {
                'consulta': 'Consulta Geral',
                'vacina': 'Vacinação',
                'cirurgia': 'Cirurgia',
                'exame': 'Exames',
                'banho': 'Banho e Tosa'
            };

            message.innerHTML = `
                <p>Olá <strong>${data['owner-name']}</strong>,</p>
                <p>A consulta do seu ${data['pet-type']} <strong>${data['pet-name']}</strong> foi agendada com sucesso!</p>
                <div style="text-align: left; margin: 20px 0;">
                    <p><strong>Data:</strong> ${formattedDate}</p>
                    <p><strong>Horário:</strong> ${data['appointment-time']}</p>
                    <p><strong>Serviço:</strong> ${serviceNames[data.service] || data.service}</p>
                </div>
                <p>Em breve entraremos em contato para confirmar o agendamento.</p>
            `;
            
            modal.style.display = 'flex';
        }
    }

    // Fecha modal
    closeModal() {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Novo agendamento
    newAppointment() {
        this.closeModal();
        this.scrollToElement('.appointment-section');
    }

    // Scroll para agendamento
    scrollToAppointment(event) {
        event.preventDefault();
        this.scrollToElement('.appointment-section');
    }

    // Scroll para elemento
    scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Mostra mensagens do sistema
    showMessage(text, type = 'info') {
        // Remove mensagens existentes
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Cria nova mensagem
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        message.style.display = 'block';

        // Adiciona ao DOM
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
            forms[0].parentNode.insertBefore(message, forms[0].nextSibling);
        } else {
            document.body.insertBefore(message, document.body.firstChild);
        }

        // Remove após 5 segundos
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    // Alterna a visibilidade do menu mobile
    toggleMenu() {
        const menuUl = document.querySelector('.menu ul');
        const menuToggleIcon = document.querySelector('.menu-toggle i');
        
        menuUl.style.display = (menuUl.style.display === 'flex') ? 'none' : 'flex';
        
        menuToggleIcon.classList.toggle('fa-bars');
        menuToggleIcon.classList.toggle('fa-times');
        }, 5000);
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new VetCareApp();
});

// Adiciona funcionalidades extras globais
document.addEventListener('DOMContentLoaded', () => {
    // Melhora a experiência de formulários
    const inputs = document.querySelectorAll('.form-control, .input-padrao');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Adiciona loading state para botões
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.type === 'submit') {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 2000);
            }
        });
    });
});