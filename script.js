/* script.js - funcionalidades modernas para o site FelixPets
   - Menu hamburger responsivo e acessível
   - Destaque do menu ativo
   - Modal acessível para confirmação de agendamento (com focus trap)
   - Validação básica e armazenamento de agendamentos em localStorage
   - Interceptor de formulário de contato (com toast)
   - Animações ao scroll via IntersectionObserver
   - Máscara simples para campo de telefone
   - Toggle de tema (persistido)
*/

(() => {
	'use strict';

	// Helpers
	const qs = (sel, ctx = document) => ctx.querySelector(sel);
	const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
	const on = (el, ev, fn) => el && el.addEventListener(ev, fn);
	const debounce = (fn, wait = 150) => {
		let t;
		return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
	};

	// ------- Menu responsivo e acessível -------
	function initMenu() {
		const btn = qs('.hamburger-menu');
		const menu = qs('.menu');
		if (!btn || !menu) return;

		btn.setAttribute('aria-expanded', 'false');
		btn.setAttribute('aria-controls', 'main-nav');
		btn.setAttribute('aria-label', 'Abrir menu');
		btn.type = 'button';

		// set menu accessible attributes
		if (!menu.id) menu.id = 'main-nav';
		menu.setAttribute('role', 'navigation');
		menu.setAttribute('aria-hidden', 'true');

		// Ensure menu has an id for aria-controls fallback
		if (!menu.id) menu.id = 'main-nav';

		// Backdrop element to dim background on mobile when menu open
		let backdrop = qs('#vc-menu-backdrop');
		if (!backdrop) {
			backdrop = document.createElement('div');
			backdrop.id = 'vc-menu-backdrop';
			backdrop.style.position = 'fixed';
			backdrop.style.inset = '0';
			backdrop.style.background = 'rgba(0,0,0,0.4)';
			backdrop.style.opacity = '0';
			backdrop.style.transition = 'opacity 220ms ease';
			backdrop.style.zIndex = '999';
			backdrop.style.pointerEvents = 'none';
			document.body.appendChild(backdrop);
		}

		function openMenu() {
			btn.setAttribute('aria-expanded', 'true');
			btn.classList.add('open');
			menu.classList.add('open');
			menu.setAttribute('aria-hidden', 'false');
			backdrop.style.pointerEvents = 'auto';
			backdrop.style.opacity = '1';
			btn.setAttribute('aria-label', 'Fechar menu');
			// switch icon if using fontawesome
			const icon = btn.querySelector('i');
			if (icon) { icon.classList.remove('fa-bars'); icon.classList.add('fa-times'); }
			// focus first link for accessibility
			const firstLink = menu.querySelector('a');
			if (firstLink) firstLink.focus();
		}

		function closeMenu() {
			btn.setAttribute('aria-expanded', 'false');
			btn.classList.remove('open');
			menu.classList.remove('open');
			menu.setAttribute('aria-hidden', 'true');
			backdrop.style.pointerEvents = 'none';
			backdrop.style.opacity = '0';
			btn.setAttribute('aria-label', 'Abrir menu');
			const icon = btn.querySelector('i');
			if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
			// return focus to button
			btn.focus();
		}

		btn.addEventListener('click', () => {
			const expanded = btn.getAttribute('aria-expanded') === 'true';
			if (expanded) closeMenu(); else openMenu();
		});

		// Keyboard: support Enter and Space to toggle
		btn.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				const expanded = btn.getAttribute('aria-expanded') === 'true';
				if (expanded) closeMenu(); else openMenu();
			}
		});

		// Click backdrop to close
		backdrop.addEventListener('click', closeMenu);

		// Close menu when a link is clicked (mobile)
		qsa('.menu a').forEach(a => a.addEventListener('click', () => {
			closeMenu();
		}));

		// Close on resize to large screens
		window.addEventListener('resize', debounce(() => {
			if (window.innerWidth > 900) {
				// ensure menu visible state is reset for desktop
				menu.classList.remove('open');
				btn.setAttribute('aria-expanded', 'false');
				btn.classList.remove('open');
				menu.setAttribute('aria-hidden', 'false');
				backdrop.style.opacity = '0';
				backdrop.style.pointerEvents = 'none';
				const icon = btn.querySelector('i');
				if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
			}
		}, 200));
	}

	// ------- Destacar página ativa no menu -------
	function setActiveNav() {
		const path = location.pathname.split('/').pop() || 'index.html';
		qsa('.menu a').forEach(a => {
			const href = a.getAttribute('href');
			if (!href) return;
			if (href === path || (href.endsWith('index.html') && path === '')) {
				a.classList.add('active');
			} else {
				a.classList.remove('active');
			}
		});
	}

	// ------- Toasts simples -------
	function showToast(message, type = 'info', timeout = 3500) {
		let container = qs('#vc-toast-container');
		if (!container) {
			container = document.createElement('div');
			container.id = 'vc-toast-container';
			container.style.position = 'fixed';
			container.style.right = '20px';
			container.style.bottom = '20px';
			container.style.zIndex = '9999';
			document.body.appendChild(container);
		}

		const el = document.createElement('div');
		el.className = `vc-toast vc-toast-${type}`;
		el.style.marginTop = '8px';
		el.style.padding = '12px 16px';
		el.style.borderRadius = '8px';
		el.style.color = '#fff';
		el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
		if (type === 'error') el.style.background = '#e74c3c';
		else if (type === 'success') el.style.background = '#2ecc71';
		else el.style.background = '#333';
		el.textContent = message;

		container.appendChild(el);
		setTimeout(() => el.classList.add('vc-toast--hide'), timeout - 300);
		setTimeout(() => el.remove(), timeout);
	}

	// ------- Validação simples de formulário -------
	function isEmail(val) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
	}

	// ------- Máscara simples para telefone -------
	function initPhoneMask() {
		qsa('input[type="tel"]').forEach(input => {
			on(input, 'input', (e) => {
				const v = e.target.value.replace(/\D/g, '');
				if (v.length <= 2) e.target.value = v;
				else if (v.length <= 6) e.target.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
				else if (v.length <= 10) e.target.value = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
				else e.target.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7,11)}`;
			});
		});
	}

	// ------- Modal de confirmação e foco/Trap -------
	function initAppointmentModal() {
		const form = qs('#appointment-form');
		const modal = qs('#confirmation-modal');
		const closeBtn = qs('#close-modal');
		const newBtn = qs('#new-appointment-btn');
		const msgContainer = qs('#confirmation-message');
		if (!form || !modal) return;

		// Utility: trap focus inside modal
		function trapFocus(modalEl) {
			const focusable = qsa('a[href], button, textarea, input, select', modalEl)
				.filter(el => !el.hasAttribute('disabled'));
			if (!focusable.length) return () => {};
			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			function keyHandler(e) {
				if (e.key === 'Tab') {
					if (e.shiftKey && document.activeElement === first) {
						e.preventDefault(); last.focus();
					} else if (!e.shiftKey && document.activeElement === last) {
						e.preventDefault(); first.focus();
					}
				} else if (e.key === 'Escape') {
					closeModal();
				}
			}

			document.addEventListener('keydown', keyHandler);
			return () => document.removeEventListener('keydown', keyHandler);
		}

		function openModal() {
			modal.classList.add('open');
			modal.setAttribute('aria-hidden', 'false');
			const restore = trapFocus(modal);
			// focus first focusable
			setTimeout(() => {
				const focusable = qsa('a[href], button, textarea, input, select', modal)
					.filter(el => !el.hasAttribute('disabled'));
				if (focusable.length) focusable[0].focus();
			}, 50);
			return restore;
		}

		function closeModal() {
			modal.classList.remove('open');
			modal.setAttribute('aria-hidden', 'true');
			// return focus to the form submit
			const submit = qs('#appointment-form button[type="submit"]');
			if (submit) submit.focus();
		}

		// Click handlers
		on(closeBtn, 'click', closeModal);
		on(newBtn, 'click', () => {
			form.reset();
			closeModal();
		});

		modal.addEventListener('click', (ev) => {
			if (ev.target === modal) closeModal();
		});

		// ESC key to close modal globally
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
		});

		// Submit handler: validate, persist, show modal
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const data = new FormData(form);
			const obj = Object.fromEntries(data.entries());

			// Basic validation
			const required = ['pet-name','pet-type','owner-name','phone','email','appointment-date','appointment-time','service'];
			for (const key of required) {
				if (!obj[key] || obj[key].trim() === '') {
					showToast('Por favor preencha todos os campos obrigatórios.', 'error');
					return;
				}
			}
			if (!isEmail(obj.email)) { showToast('E-mail inválido.', 'error'); return; }

			// Persist em localStorage
			try {
				const list = JSON.parse(localStorage.getItem('vc_appointments') || '[]');
				list.push({ ...obj, createdAt: new Date().toISOString() });
				localStorage.setItem('vc_appointments', JSON.stringify(list));
			} catch (err) {
				console.warn('Erro salvando agendamento:', err);
			}

			// Build confirmation message
			if (msgContainer) {
				msgContainer.innerHTML = `
					<p><strong>Pet:</strong> ${obj['pet-name']}</p>
					<p><strong>Tutor:</strong> ${obj['owner-name']}</p>
					<p><strong>Data:</strong> ${obj['appointment-date']} às ${obj['appointment-time']}</p>
					<p><strong>Serviço:</strong> ${obj['service']}</p>
				`;
			}

			openModal();
			showToast('Consulta agendada com sucesso!', 'success');
		});
	}

	// ------- Formulário de contato -------
	function initContactForm() {
		const form = qs('#contact-form');
		if (!form) return;
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const data = new FormData(form);
			const obj = Object.fromEntries(data.entries());
			if (!obj.nomesobrenome || !obj.email || !obj.telefone || !obj.mensagem) {
				showToast('Preencha todos os campos do formulário de contato.', 'error');
				return;
			}
			if (!isEmail(obj.email)) { showToast('E-mail inválido.', 'error'); return; }

			// Simular envio: salvar no localStorage temporariamente
			try {
				const list = JSON.parse(localStorage.getItem('vc_contacts') || '[]');
				list.push({ ...obj, createdAt: new Date().toISOString() });
				localStorage.setItem('vc_contacts', JSON.stringify(list));
			} catch (err) {
				console.warn('Erro salvando contato:', err);
			}

			showToast('Mensagem enviada com sucesso! Em breve entraremos em contato.', 'success');
			form.reset();
		});
	}

	// ------- Animações on-scroll -------
	function initScrollAnimations() {
		const els = qsa('.animate-on-scroll');
		if (!els.length) return;
		const obs = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
				}
			});
		}, { threshold: 0.15 });
		els.forEach(el => obs.observe(el));
	}

	// ------- Smooth scroll for internal anchors -------
	function initSmoothScroll() {
		qsa('a[href^="#"]').forEach(a => {
			a.addEventListener('click', (e) => {
				const href = a.getAttribute('href');
				if (href === '#') return;
				const target = qs(href);
				if (target) {
					e.preventDefault();
					target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			});
		});
	}

	// ------- Tema (dark toggle) -------
	function initThemeToggle() {
		// Inserir o toggle como um item do menu, ao lado de 'Agendar Consulta'
		const menuList = qs('.menu ul');
		if (!menuList) return;

		// criar botão com icone (FontAwesome)
		const btn = document.createElement('button');
		btn.className = 'theme-toggle';
		btn.type = 'button';
		btn.setAttribute('aria-label', 'Alternar tema');
		btn.title = 'Alternar tema';
		btn.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>';

		// wrapper <li> para posicionar no menu
		const li = document.createElement('li');
		li.className = 'theme-toggle-item';
		li.appendChild(btn);

		// tentar inserir logo após o link de agendamento
		const agLink = Array.from(menuList.querySelectorAll('a')).find(a => {
			const href = a.getAttribute('href') || '';
			return href.includes('agendamento');
		});
		if (agLink && agLink.parentElement) agLink.parentElement.insertAdjacentElement('afterend', li);
		else menuList.appendChild(li);

		// definir estado inicial
		const current = localStorage.getItem('vc_theme') || 'light';
		const icon = btn.querySelector('i');
		if (current === 'dark') {
			document.body.classList.add('theme-dark');
			if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
		} else {
			if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
		}

		on(btn, 'click', () => {
			const isDark = document.body.classList.toggle('theme-dark');
			const active = isDark ? 'dark' : 'light';
			localStorage.setItem('vc_theme', active);
			if (icon) {
				icon.classList.toggle('fa-sun', !isDark);
				icon.classList.toggle('fa-moon', isDark);
			}
			showToast(`Tema ${active} ativado`, 'info');
		});
	}

	// ------- Inicialização -------
	function init() {
		initMenu();
		setActiveNav();
		initPhoneMask();
		initAppointmentModal();
		initContactForm();
		initScrollAnimations();
		initSmoothScroll();
		initThemeToggle();
		initWhatsAppButton();
	}

	// ------- WhatsApp flutuante -------
	function initWhatsAppButton() {
		if (qs('#vc-wa-button')) return; // já existe
		// número no formato internacional sem sinais: BR country code + phone
		const phone = '5511999998888'; // altere aqui se precisar
		const defaultMsg = encodeURIComponent('Olá, gostaria de atendimento/mais informações sobre a FelixPets.');
		const a = document.createElement('a');
		a.id = 'vc-wa-button';
		a.className = 'vc-wa-button';
		a.href = `https://wa.me/${phone}?text=${defaultMsg}`;
		a.target = '_blank';
		a.rel = 'noopener noreferrer';
		a.title = 'Fale conosco pelo WhatsApp';

		a.innerHTML = `
			<span class="vc-wa-badge" aria-hidden="true"> </span>
			<i class="fab fa-whatsapp" aria-hidden="true"></i>
			<span class="vc-wa-label">WhatsApp</span>
		`;

		document.body.appendChild(a);
	}

	// auto init quando DOM pronto
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

})();

