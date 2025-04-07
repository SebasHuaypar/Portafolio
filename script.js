document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM principales que usaremos frecuentemente
    const body = document.body;
    const toggleTheme = document.getElementById('theme-toggle');
    const icon = toggleTheme.querySelector('i');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const modal = document.getElementById('project-modal');
    const modalContainer = document.getElementById('modal-container');
    const closeModal = document.querySelector('.close-modal');
    
    // ========== FUNCIONES UTILITARIAS ==========
    
    /**
     * Función debounce para mejorar el rendimiento en eventos frecuentes
     * @param {Function} func - La función a ejecutar
     * @param {Number} wait - Tiempo de espera en ms
     * @return {Function} - Función con debounce aplicado
     */
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
    
    /**
     * Maneja errores de localStorage de forma segura
     * @param {Function} operation - Operación a realizar con localStorage
     */
    const safeStorage = (operation) => {
        try {
            return operation();
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            return null;
        }
    };
    
    // ========== MANEJO DE TEMA OSCURO/CLARO ==========
    
    // Cargar tema guardado
    const initTheme = () => {
        const savedTheme = safeStorage(() => localStorage.getItem('theme'));
        
        if (savedTheme === 'light') {
            body.classList.remove('dark-mode');
            icon.className = 'fas fa-moon';
        } else {
            body.classList.add('dark-mode');
            icon.className = 'fas fa-sun';
        }
        
        // Actualizar partículas según el tema inicial
        updateParticlesAndHeroEffect();
    };
    
    // Función para cambiar el tema
    const switchTheme = () => {
        const isDarkMode = body.classList.contains('dark-mode');
        
        if (isDarkMode) {
            // Cambiar a modo claro
            body.classList.remove('dark-mode');
            icon.className = 'fas fa-moon';
            safeStorage(() => localStorage.setItem('theme', 'light'));
        } else {
            // Cambiar a modo oscuro
            body.classList.add('dark-mode');
            icon.className = 'fas fa-sun';
            safeStorage(() => localStorage.setItem('theme', 'dark'));
        }
        
        // Actualizar partículas cuando cambia el tema
        updateParticlesAndHeroEffect();
    };
    
    // ========== NAVEGACIÓN Y EFECTOS DE SCROLL ==========
    
    /**
     * Configura la navegación suave para los enlaces internos
     */
    const setupSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };
    
    /**
     * Gestiona las animaciones de entrada al hacer scroll
     */
    const setupScrollAnimations = () => {
        const animateElements = document.querySelectorAll('[data-aos]');
        
        const checkIfInView = () => {
            const viewportHeight = window.innerHeight;
            
            animateElements.forEach(element => {
                const elementPosition = element.getBoundingClientRect();
                const isVisible = 
                    elementPosition.top < viewportHeight * 0.9 &&
                    elementPosition.bottom >= viewportHeight * 0.1;
                
                // Añadir o quitar clase para animar
                element.classList.toggle('aos-animate', isVisible);
            });
        };
        
        // Aplicar debounce al evento scroll
        window.addEventListener('scroll', debounce(checkIfInView, 100));
        
        // Ejecutar al cargar la página
        checkIfInView();
    };
    
    // ========== MODAL PARA DEMOS ==========
    
    /**
     * Configura el comportamiento del modal
     */
    const setupModal = () => {
        const demoButtons = document.querySelectorAll('.project-demo');
        
        // Abrir modal y cargar contenido
        demoButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const projectId = this.getAttribute('data-project');
                
                if (projectId === 'interactive-chart') {
                    loadInteractiveChart();
                }
                
                // Mostrar modal y mejorar accesibilidad
                modal.style.display = 'flex';
                modal.setAttribute('aria-hidden', 'false');
                
                // Mover el foco al modal
                closeModal.focus();
                
                // Anunciar para lectores de pantalla
                const announcer = document.getElementById('screen-reader-announcer');
                if (announcer) {
                    announcer.textContent = 'Demo interactiva abierta. Presiona Escape para cerrar.';
                }
            });
        });
        
        // Cerrar modal cuando se hace clic en X
        closeModal.addEventListener('click', closeModalHandler);
        
        // Cerrar modal al hacer clic fuera del contenido
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalHandler();
            }
        });
        
        // Mejorar la accesibilidad del modal con teclado
        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                trapFocus(event);
            } else if (event.key === 'Escape') {
                closeModalHandler();
            }
        });
    };
    
    /**
     * Cierra el modal y anuncia para lectores de pantalla
     */
    const closeModalHandler = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        // Anunciar para lectores de pantalla
        const announcer = document.getElementById('screen-reader-announcer');
        if (announcer) {
            announcer.textContent = 'Demo interactiva cerrada.';
        }
        
        // Devolver el foco al botón que abrió el modal
        document.querySelector('.project-demo[data-project="interactive-chart"]')?.focus();
    };
    
    /**
     * Gestiona el ciclo de foco para el modal
     * @param {Event} event - Evento de teclado
     */
    const trapFocus = (event) => {
        const focusableElements = modal.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
        }
    };
    
    /**
     * Carga y renderiza el gráfico D3.js interactivo
     */
    const loadInteractiveChart = () => {
        modalContainer.innerHTML = '<h2 id="modal-title">Visualización de Tendencias</h2><div id="chart-container"></div>';
        
        // Datos para la visualización
        const data = [
            { month: 'Ene', value: 30 },
            { month: 'Feb', value: 45 },
            { month: 'Mar', value: 38 },
            { month: 'Abr', value: 52 },
            { month: 'May', value: 65 },
            { month: 'Jun', value: 58 },
            { month: 'Jul', value: 70 },
            { month: 'Ago', value: 75 },
            { month: 'Sep', value: 68 },
            { month: 'Oct', value: 80 },
            { month: 'Nov', value: 95 },
            { month: 'Dic', value: 88 }
        ];
        
        const container = document.getElementById('chart-container');
        const chartWidth = container.clientWidth || 600;
        const chartHeight = 400;
        
        // Crear SVG con el namespace correcto
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', chartWidth);
        svg.setAttribute('height', chartHeight);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-labelledby', 'chart-title chart-desc');
        
        // Añadir título y descripción accesibles
        const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        titleElement.setAttribute('id', 'chart-title');
        titleElement.textContent = 'Tendencias mensuales de ventas';
        svg.appendChild(titleElement);
        
        const descElement = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
        descElement.setAttribute('id', 'chart-desc');
        descElement.textContent = 'Gráfico de barras mostrando la evolución mensual de ventas a lo largo del año.';
        svg.appendChild(descElement);
        
        // Estilos para el SVG
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            .bar { fill: #2196f3; transition: fill 0.3s; }
            .bar:hover { fill: #0d47a1; }
            .axis { font: 14px sans-serif; }
            .axis path, .axis line { stroke: #ccc; }
            text { fill: var(--text-color, #333); }
        `;
        svg.appendChild(style);
        
        // Determinar la escala Y dinámica basada en los valores máximos
        const maxValue = Math.max(...data.map(d => d.value));
        const yScale = value => (value / maxValue) * (chartHeight - 100);
        
        // Crear las barras y etiquetas
        const barWidth = (chartWidth / data.length) * 0.8;
        data.forEach((d, i) => {
            const barHeight = yScale(d.value);
            const x = i * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
            const y = chartHeight - barHeight - 40;
            
            // Crear grupo para los elementos relacionados
            const barGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            barGroup.setAttribute('aria-label', `${d.month}: ${d.value}`);
            
            // Crear la barra
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('class', 'bar');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('aria-hidden', 'true');
            barGroup.appendChild(rect);
            
            // Etiqueta del mes
            const monthLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            monthLabel.setAttribute('x', x + barWidth / 2);
            monthLabel.setAttribute('y', chartHeight - 20);
            monthLabel.setAttribute('text-anchor', 'middle');
            monthLabel.setAttribute('aria-hidden', 'true');
            monthLabel.textContent = d.month;
            barGroup.appendChild(monthLabel);
            
            // Etiqueta del valor
            const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueLabel.setAttribute('x', x + barWidth / 2);
            valueLabel.setAttribute('y', y - 5);
            valueLabel.setAttribute('text-anchor', 'middle');
            valueLabel.setAttribute('aria-hidden', 'true');
            valueLabel.textContent = d.value;
            barGroup.appendChild(valueLabel);
            
            svg.appendChild(barGroup);
        });
        
        // Agregar el SVG al contenedor
        container.appendChild(svg);
    };
    
    // ========== FORMULARIO DE CONTACTO ==========
    
    /**
     * Configura la validación y el envío del formulario de contacto
     */
    const setupContactForm = () => {
        const contactForm = document.getElementById('contact-form');
        
        if (!contactForm) return;
        
        // Agregar validación a los campos
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const feedbackElement = document.getElementById('submit-feedback');
        
        // Función para validar email
        const isValidEmail = (email) => {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        };
        
        // Validación del formulario al enviarlo
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let isValid = true;
            
            // Validar nombre
            if (!nameInput.value.trim()) {
                document.getElementById('name-error').textContent = 'Por favor, ingresa tu nombre';
                nameInput.setAttribute('aria-invalid', 'true');
                isValid = false;
            } else {
                document.getElementById('name-error').textContent = '';
                nameInput.setAttribute('aria-invalid', 'false');
            }
            
            // Validar email
            if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                document.getElementById('email-error').textContent = 'Por favor, ingresa un email válido';
                emailInput.setAttribute('aria-invalid', 'true');
                isValid = false;
            } else {
                document.getElementById('email-error').textContent = '';
                emailInput.setAttribute('aria-invalid', 'false');
            }
            
            // Validar mensaje
            if (!messageInput.value.trim()) {
                document.getElementById('message-error').textContent = 'Por favor, escribe un mensaje';
                messageInput.setAttribute('aria-invalid', 'true');
                isValid = false;
            } else {
                document.getElementById('message-error').textContent = '';
                messageInput.setAttribute('aria-invalid', 'false');
            }
            
            // Si todo es válido, "enviar" el formulario
            if (isValid) {
                // Simular envío (en producción se reemplazaría por fetch/ajax)
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Enviando...';
                submitButton.disabled = true;
                
                // Cambiar a feedback positivo
                feedbackElement.textContent = 'Enviando mensaje...';
                feedbackElement.className = 'submit-feedback sending';
                
                // Simular delay de red
                setTimeout(() => {
                    // Mostrar mensaje de éxito
                    feedbackElement.textContent = '¡Mensaje enviado correctamente! Te responderé a la brevedad.';
                    feedbackElement.className = 'submit-feedback success';
                    
                    // Restaurar el botón y limpiar el formulario
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    contactForm.reset();
                    
                    // Limpiar el mensaje después de un tiempo
                    setTimeout(() => {
                        feedbackElement.textContent = '';
                        feedbackElement.className = 'submit-feedback';
                    }, 5000);
                }, 1500);
            }
        });
        
        // Validación en tiempo real para mejorar UX
        [nameInput, emailInput, messageInput].forEach(input => {
            input.addEventListener('blur', function() {
                const errorElement = document.getElementById(`${this.id}-error`);
                
                if (!this.value.trim()) {
                    errorElement.textContent = 'Este campo es obligatorio';
                    this.setAttribute('aria-invalid', 'true');
                } else if (this.id === 'email' && !isValidEmail(this.value)) {
                    errorElement.textContent = 'Por favor, ingresa un email válido';
                    this.setAttribute('aria-invalid', 'true');
                } else {
                    errorElement.textContent = '';
                    this.setAttribute('aria-invalid', 'false');
                }
            });
        });
    };
    
    // ========== EFECTOS VISUALES ==========
    
    /**
     * Configura el efecto de cambio de palabras en el título
     */
    const setupHeroTextEffect = () => {
        const heroTitle = document.querySelector('.hero-content h2 .highlight');
        if (!heroTitle) return;
        
        const words = ['Decisiones', 'Insights', 'Estrategias', 'Valor'];
        let wordIndex = 0;
        
        const changeWord = () => {
            heroTitle.classList.remove('show');
            heroTitle.style.opacity = 0;
            
            setTimeout(() => {
                wordIndex = (wordIndex + 1) % words.length;
                heroTitle.textContent = words[wordIndex];
                heroTitle.style.opacity = 1;
                heroTitle.classList.add('show');
            }, 700);
        };
        
        // Iniciar animación cíclica
        setInterval(changeWord, 3000);
    };
    
    /**
     * Anima los círculos de habilidades cuando están visibles
     */
    const setupSkillCircles = () => {
        const skillCircles = document.querySelectorAll('.skill-circle');
        if (!skillCircles.length) return;
        
        // Usar IntersectionObserver para animar solo cuando son visibles
        const animateSkillCircle = (circle) => {
            const skillValue = circle.getAttribute('data-skill');
            const progressCircle = circle.querySelector('.progress');
            // El valor 314 aproximadamente corresponde a 2πr donde r=50
            const circumference = 2 * Math.PI * 40;
            const offset = circumference - (circumference * skillValue) / 100;
            
            // Animar con CSS en lugar de manipular directamente
            progressCircle.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
            progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            progressCircle.style.strokeDashoffset = offset;
        };
        
        // Usar IntersectionObserver para mejor rendimiento
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillCircle(entry.target);
                } else {
                    // Reiniciar para permitir nueva animación
                    const progressCircle = entry.target.querySelector('.progress');
                    progressCircle.style.transition = 'none';
                    progressCircle.style.strokeDashoffset = 2 * Math.PI * 40;
                }
            });
        }, { threshold: 0.2 });
        
        skillCircles.forEach(circle => observer.observe(circle));
    };
    
    /**
     * Actualiza la configuración de particles.js según el tema
     */
    const updateParticlesAndHeroEffect = () => {
        const isDarkMode = body.classList.contains('dark-mode');
        const particlesColor = isDarkMode ? '#ffffff' : '#000000';
        const heroShadowColor = isDarkMode ? 'rgba(100, 181, 246, 0.3)' : 'rgba(33, 150, 243, 0.3)';
        
        // Actualizar particles.js si está disponible
        if (window.particlesJS) {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 60, density: { enable: true, value_area: 1000 } },
                    color: { value: particlesColor },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5, random: false },
                    size: { value: 3, random: true },
                    line_linked: { 
                        enable: true, 
                        distance: 150, 
                        color: particlesColor, 
                        opacity: 0.4, 
                        width: 1 
                    },
                    move: { 
                        enable: true, 
                        speed: 2, 
                        direction: 'none', 
                        random: false, 
                        straight: false, 
                        out_mode: 'out' 
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'repulse' },
                        onclick: { enable: true, mode: 'push' }
                    },
                    modes: {
                        repulse: { distance: 100, duration: 0.4 },
                        push: { particles_nb: 4 }
                    }
                },
                retina_detect: true
            });
        }
        
        // Actualizar sombra del hero
        const heroHighlight = document.querySelector('.hero-content .highlight');
        if (heroHighlight) {
            heroHighlight.style.setProperty('--hero-shadow-color', heroShadowColor);
        }
    };
    
    /**
     * Configura microinteracciones para tarjetas de proyectos
     */
    const setupProjectCardEffects = () => {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            // Usar CSS transitions en lugar de cambiar el estilo directamente
            card.addEventListener('mouseenter', () => {
                card.classList.add('card-hover');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('card-hover');
            });
            
            // Añadir soporte para navegación por teclado
            card.addEventListener('focusin', () => {
                card.classList.add('card-hover');
            });
            
            card.addEventListener('focusout', () => {
                card.classList.remove('card-hover');
            });
        });
    };
    
    // ========== MENÚ MÓVIL ==========
    
    /**
     * Configura la funcionalidad del menú móvil
     */
    const setupMobileMenu = () => {
        // Toggle para abrir/cerrar menú móvil
        menuToggle.addEventListener('click', function() {
            const isOpen = mobileMenu.classList.contains('open');
            
            // Actualizar estado del menú
            mobileMenu.classList.toggle('open');
            
            // Actualizar atributos ARIA para accesibilidad
            this.setAttribute('aria-expanded', !isOpen);
            mobileMenu.setAttribute('aria-hidden', isOpen);
            
            // Cambiar ícono según estado
            const icon = this.querySelector('i');
            if (isOpen) {
                icon.className = 'fas fa-bars';
            } else {
                icon.className = 'fas fa-times';
            }
            
            // Anunciar para lectores de pantalla
            const announcer = document.getElementById('screen-reader-announcer');
            if (announcer) {
                announcer.textContent = isOpen ? 'Menú móvil cerrado' : 'Menú móvil abierto';
            }
        });
        
        // Cerrar el menú al hacer clic en un enlace
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            });
        });
        
        // Cerrar menú con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
                menuToggle.querySelector('i').className = 'fas fa-bars';
                menuToggle.focus(); // Devolver el foco al botón
            }
        });
    };
    
    // ========== INICIALIZACIÓN DE FUNCIONES ==========
    // Inicializar tema
    initTheme();
    
    // Configurar cambio de tema
    toggleTheme.addEventListener('click', switchTheme);
    
    // Inicializar navegación y animaciones
    setupSmoothScrolling();
    setupScrollAnimations();
    
    // Inicializar modal
    setupModal();
    
    // Inicializar formulario
    setupContactForm();
    
    // Inicializar efectos visuales
    setupHeroTextEffect();
    setupSkillCircles();
    setupProjectCardEffects();
    
    // Inicializar menú móvil
    setupMobileMenu();
    
    // Gestionar resize para elementos responsivos
    window.addEventListener('resize', debounce(() => {
        const chartContainer = document.getElementById('chart-container');
        if (chartContainer && chartContainer.childNodes.length > 0) {
            chartContainer.innerHTML = '';
            loadInteractiveChart();
        }
    }, 250));
});