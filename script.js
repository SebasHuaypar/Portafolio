document.addEventListener('DOMContentLoaded', function() {
    // Modo oscuro/claro
    const toggleTheme = document.getElementById('theme-toggle');
    const icon = toggleTheme.querySelector('i');

    // Improved localStorage handling
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.remove('dark-mode');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.body.classList.add('dark-mode');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    } catch (error) {
        console.error('Error accessing localStorage:', error);
    }

    // Función para cambiar el tema
    toggleTheme.addEventListener('click', function() {
        if (document.body.classList.contains('dark-mode')) {
            // Cambiar a modo claro
            document.body.classList.remove('dark-mode');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            try {
                localStorage.setItem('theme', 'light');
            } catch (error) {
                console.error('Error accessing localStorage:', error);
            }
        } else {
            // Cambiar a modo oscuro
            document.body.classList.add('dark-mode');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            try {
                localStorage.setItem('theme', 'dark');
            } catch (error) {
                console.error('Error accessing localStorage:', error);
            }
        }
    });

    // Navegación suave
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

    // Animación de entrada para elementos
    const animateElements = document.querySelectorAll('[data-aos]');
    
    // Debounce function for better scroll performance
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Optimized scroll event for animations
    const checkIfInView = () => {
        animateElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect();
            if (
                elementPosition.top < window.innerHeight * 0.9 &&
                elementPosition.bottom >= window.innerHeight * 0.1
            ) {
                element.classList.add('aos-animate');
            } else {
                element.classList.remove('aos-animate'); // Permitir reanimación al hacer scroll up
            }
        });
    };
    window.addEventListener('scroll', debounce(checkIfInView, 100));
    checkIfInView();

    // Modal para demos interactivas
    const modal = document.getElementById('project-modal');
    const modalContainer = document.getElementById('modal-container');
    const closeModal = document.querySelector('.close-modal');
    const demoButtons = document.querySelectorAll('.project-demo');

    // Abrir modal y cargar contenido
    demoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const projectId = this.getAttribute('data-project');
            
            // Carga el contenido según el tipo de proyecto
            if (projectId === 'interactive-chart') {
                loadInteractiveChart();
            }
            
            // Muestra el modal
            modal.style.display = 'flex';
        });
    });

    // Cerrar modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Modal accessibility improvements
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

    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            trapFocus(event);
        } else if (event.key === 'Escape') {
            modal.style.display = 'none';
        }
    });

    // Función para cargar un gráfico D3.js interactivo (ejemplo)
    function loadInteractiveChart() {
        modalContainer.innerHTML = '<h2>Visualización de Tendencias</h2><div id="chart-container"></div>';
        
        // Ejemplo simple de datos para la visualización
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
        const chartWidth = container.clientWidth || 600; // Valor por defecto si no se puede calcular
        const chartHeight = 400;

        // Crear el elemento SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', chartWidth);
        svg.setAttribute('height', chartHeight);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // Estilos para el SVG
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            .bar { fill: #2196f3; transition: fill 0.3s; }
            .bar:hover { fill: #0d47a1; }
            .axis { font: 14px sans-serif; }
            .axis path, .axis line { stroke: #ccc; }
        `;
        svg.appendChild(style);

        // Crear las barras y etiquetas
        const barWidth = (chartWidth / data.length) * 0.8;
        data.forEach((d, i) => {
            const barHeight = (d.value / 100) * (chartHeight - 100);
            const x = i * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
            const y = chartHeight - barHeight - 40;

            // Crear la barra
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('class', 'bar');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            svg.appendChild(rect);

            // Etiqueta del mes
            const monthLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            monthLabel.setAttribute('x', x + barWidth / 2);
            monthLabel.setAttribute('y', chartHeight - 20);
            monthLabel.setAttribute('text-anchor', 'middle');
            monthLabel.textContent = d.month;
            svg.appendChild(monthLabel);

            // Etiqueta del valor
            const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueLabel.setAttribute('x', x + barWidth / 2);
            valueLabel.setAttribute('y', y - 5);
            valueLabel.setAttribute('text-anchor', 'middle');
            valueLabel.textContent = d.value;
            svg.appendChild(valueLabel);
        });

        // Agregar el SVG al contenedor
        container.appendChild(svg);
    }

    // Responsive chart resizing
    window.addEventListener('resize', () => {
        const container = document.getElementById('chart-container');
        if (container) {
            container.innerHTML = ''; // Clear existing chart
            loadInteractiveChart(); // Reload chart with new dimensions
        }
    });

    // Formulario de contacto
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulación de envío de formulario
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;
            
            // Simular delay de red
            setTimeout(() => {
                alert('¡Mensaje enviado correctamente! Te responderé a la brevedad.');
                
                // Restaurar el botón y limpiar el formulario
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                contactForm.reset();
            }, 1500);
        });
    }

    // Efecto de desvanecimiento para el texto destacado en la sección hero
    const heroTitle = document.querySelector('.hero-content h2 .highlight');
    if (heroTitle) {
        const words = ['Decisiones', 'Insights', 'Estrategias', 'Valor'];
        let wordIndex = 0;

        const changeWord = () => {
            heroTitle.classList.remove('show'); // Ocultar subrayado
            heroTitle.style.opacity = 0; // Iniciar desvanecimiento
            setTimeout(() => {
                wordIndex = (wordIndex + 1) % words.length; // Cambiar a la siguiente palabra
                heroTitle.textContent = words[wordIndex];
                heroTitle.style.opacity = 1; // Mostrar la nueva palabra
                heroTitle.classList.add('show'); // Mostrar subrayado
            }, 700); // Duración del desvanecimiento
        };

        setInterval(changeWord, 3000); // Cambiar palabra cada 3 segundos
    }

    // Animar gráficos circulares en la sección de habilidades
    const skillCircles = document.querySelectorAll('.skill-circle');

    const animateSkillCircles = (circle) => {
        const skillValue = circle.getAttribute('data-skill');
        const progressCircle = circle.querySelector('.progress');
        const offset = 314 - (314 * skillValue) / 100; // Calcular el offset basado en el porcentaje
        progressCircle.style.strokeDashoffset = offset; // Aplicar animación
    };

    // Detectar cuando cada círculo entra en el viewport
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillCircles(entry.target);
            } else {
                // Reiniciar la animación al salir del viewport
                const progressCircle = entry.target.querySelector('.progress');
                progressCircle.style.strokeDashoffset = 314; // Valor inicial
            }
        });
    }, { threshold: 0.5 });

    skillCircles.forEach(circle => observer.observe(circle));

    // Configuración de particles.js
    const updateParticlesAndHeroEffect = () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        const particlesColor = isDarkMode ? '#ffffff' : '#000000';
        const heroShadowColor = isDarkMode ? 'rgba(100, 181, 246, 0.3)' : 'rgba(33, 150, 243, 0.3)';

        // Actualizar configuración de partículas
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: particlesColor },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: particlesColor, opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out' }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' }
                },
                modes: {
                    repulse: { distance: 100 },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });

        // Actualizar sombra del hero
        const heroHighlight = document.querySelector('.hero-content .highlight');
        if (heroHighlight) {
            heroHighlight.style.setProperty('--hero-shadow-color', heroShadowColor);
        }
    };

    // Llamar a la función al cargar y al cambiar el tema
    updateParticlesAndHeroEffect();
    toggleTheme.addEventListener('click', updateParticlesAndHeroEffect);

    // Microinteracciones en las tarjetas de proyectos
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });
});