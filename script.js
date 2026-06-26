/**
 * IMPERARE - Script Principal
 * Versão: 5.0 - CORRIGIDO
 * Funcionalidades: Preloader, Hero Carrossel, Menu Mobile (Sidebar), Tema, 
 * Contadores Animados, Scroll Reveal, Scroll Spy, Newsletter, Modal, 
 * Tradução, Gestão de Equipa (Backend), Gestão de Imóveis com Carrossel
 */

(function() {
    'use strict';

    // ============================================================
    // 1. PRELOADER
    // ============================================================
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        window.addEventListener('load', function() {
            setTimeout(function() {
                preloader.classList.add('hidden');
            }, 1200);
        });
    }

    // ============================================================
    // 2. HERO CARROSSEL (CROSSFADE)
    // ============================================================
    function initHeroCarousel() {
        const slides = document.querySelectorAll('.hero-slide');
        const controls = document.querySelectorAll('.hero-control-btn');
        let currentSlide = 0;
        let slideInterval;
        const intervalTime = 6000;

        if (!slides.length) return;

        function goToSlide(index) {
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === index);
            });
            controls.forEach(function(btn, i) {
                btn.classList.toggle('active', i === index);
                btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
            });
            currentSlide = index;
        }

        function nextSlide() {
            var next = (currentSlide + 1) % slides.length;
            goToSlide(next);
        }

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, intervalTime);
        }

        controls.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var index = parseInt(this.getAttribute('data-slide'), 10);
                if (!isNaN(index) && index !== currentSlide) {
                    goToSlide(index);
                    resetInterval();
                }
            });
        });

        var touchStartX = 0;
        var touchEndX = 0;
        var hero = document.querySelector('.hero');

        if (hero) {
            hero.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            hero.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                var diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        nextSlide();
                        resetInterval();
                    } else {
                        var prev = (currentSlide - 1 + slides.length) % slides.length;
                        goToSlide(prev);
                        resetInterval();
                    }
                }
            }, { passive: true });
        }

        goToSlide(0);
        slideInterval = setInterval(nextSlide, intervalTime);
    }

    // ============================================================
    // 3. SCROLL REVEAL (FADE-IN UP)
    // ============================================================
    function initScrollReveal() {
        var revealElements = document.querySelectorAll('.pillar-item, .testimonial-card, .counter-item, .team-member-card, .process-item, .invest-card-new');

        if (!revealElements.length) return;

        var revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        });

        revealElements.forEach(function(el) {
            revealObserver.observe(el);
        });
    }

    // ============================================================
    // 4. CONTADORES ANIMADOS
    // ============================================================
    function initCounters() {
        var counters = document.querySelectorAll('.counter-item .number');
        var countersAnimated = false;

        if (!counters.length) return;

        var counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !countersAnimated) {
                    countersAnimated = true;
                    counters.forEach(function(counter) {
                        var target = parseInt(counter.getAttribute('data-target'), 10);
                        if (isNaN(target)) return;
                        var current = 0;
                        var increment = Math.ceil(target / 60);
                        var timer = setInterval(function() {
                            current += increment;
                            if (current >= target) {
                                counter.textContent = target + (target === 98 ? '%' : '+');
                                clearInterval(timer);
                            } else {
                                counter.textContent = current + (target === 98 ? '%' : '+');
                            }
                        }, 25);
                    });
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.counters').forEach(function(el) {
            counterObserver.observe(el);
        });
    }

    // ============================================================
    // 5. HEADER SCROLL EFFECT
    // ============================================================
    function initHeaderScroll() {
        var header = document.getElementById('mainHeader');
        if (!header) return;

        window.addEventListener('scroll', function() {
            var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            if (currentScroll > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // ============================================================
    // 6. SIDEBAR / MENU MOBILE - CORRIGIDO
    // ============================================================
    function initSidebar() {
        var sidebar = document.getElementById('sidebar');
        var overlay = document.getElementById('sidebarOverlay');
        var toggleBtn = document.getElementById('sidebarToggle');
        var closeBtn = document.getElementById('sidebarClose');
        var navLinks = sidebar ? sidebar.querySelectorAll('.sidebar-nav a') : [];

        console.log('🔍 Inicializando Sidebar...');
        console.log('📌 sidebar:', sidebar);
        console.log('📌 toggleBtn:', toggleBtn);

        if (!sidebar || !toggleBtn) {
            console.warn('⚠️ Sidebar ou botão toggle não encontrados');
            return;
        }

        function openSidebar() {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('📖 Sidebar aberta');
        }

        function closeSidebar() {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
            console.log('📕 Sidebar fechada');
        }

        function toggleSidebar() {
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }

        // Evento do botão toggle
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });

        // Fechar com botão X
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }

        // Fechar ao clicar no overlay
        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }

        // Fechar ao clicar num link da sidebar
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Remove active de todos
                navLinks.forEach(function(l) { l.classList.remove('active'); });
                // Adiciona active ao clicado
                this.classList.add('active');
                closeSidebar();
            });
        });

        // Fechar com tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });

        // Scroll spy para sidebar
        var sections = document.querySelectorAll('section[id]');
        if (sections.length && navLinks.length) {
            window.addEventListener('scroll', function() {
                var current = '';
                sections.forEach(function(section) {
                    var sectionTop = section.offsetTop - 200;
                    if (window.pageYOffset >= sectionTop) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                    var href = link.getAttribute('href');
                    if (href === '#' + current) {
                        link.classList.add('active');
                    }
                });
            }, { passive: true });
        }

        console.log('✅ Sidebar inicializada com sucesso!');
    }

    // ============================================================
    // 7. TEMA CLARO/ESCURO
    // ============================================================
    function initThemeToggle() {
        var themeToggle = document.getElementById('themeToggle');
        var themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

        if (!themeToggle || !themeIcon) return;

        function setThemeBasedOnTime() {
            var now = new Date();
            var hours = now.getHours();
            var isDaytime = hours >= 6 && hours < 18;

            var userTheme = localStorage.getItem('imperare-theme');
            if (userTheme) return;

            if (isDaytime) {
                document.body.classList.add('light-theme');
                themeIcon.className = 'fas fa-sun';
            } else {
                document.body.classList.remove('light-theme');
                themeIcon.className = 'fas fa-moon';
            }
        }

        var savedTheme = localStorage.getItem('imperare-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeIcon.className = 'fas fa-sun';
        } else if (savedTheme === 'dark') {
            document.body.classList.remove('light-theme');
            themeIcon.className = 'fas fa-moon';
        } else {
            setThemeBasedOnTime();
        }

        themeToggle.addEventListener('click', function() {
            var isLight = document.body.classList.toggle('light-theme');
            themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('imperare-theme', isLight ? 'light' : 'dark');
            console.log('🌓 Tema alterado para:', isLight ? 'Claro' : 'Escuro');
        });

        setInterval(function() {
            if (!localStorage.getItem('imperare-theme')) {
                setThemeBasedOnTime();
            }
        }, 60000);

        console.log('🌓 Tema inicializado com sucesso!');
    }

    // ============================================================
    // 8. NEWSLETTER
    // ============================================================
    function initNewsletter() {
        var newsletterForm = document.querySelector('.news-form');
        if (!newsletterForm) return;

        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var input = this.querySelector('input[type="email"]');
            if (input && input.value.trim()) {
                alert('Obrigado pela sua subscrição!');
                input.value = '';
            } else {
                alert('Por favor, insira um e-mail válido.');
            }
        });
    }

    // ============================================================
    // 9. SCROLL SPY (para o header, caso exista)
    // ============================================================
    function initScrollSpy() {
        var sections = document.querySelectorAll('section[id]');
        var navLinks = document.querySelectorAll('.nav-link');

        if (!sections.length || !navLinks.length) return;

        window.addEventListener('scroll', function() {
            var current = '';
            sections.forEach(function(section) {
                var sectionTop = section.offsetTop - 150;
                if (window.pageYOffset >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(function(link) {
                link.classList.remove('active');
                var href = link.getAttribute('href');
                if (href === '#' + current) {
                    link.classList.add('active');
                }
            });
        }, { passive: true });
    }

    // ============================================================
    // 10. SISTEMA DE TRADUÇÃO
    // ============================================================
    function initTranslations() {
        var translations = {
            pt: {
                'nav.home': 'Início',
                'nav.servicos': 'Serviços',
                'nav.sobre': 'Sobre',
                'nav.equipa': 'Equipa',
                'nav.depoimentos': 'Depoimentos',
                'nav.contacto': 'Contacto',
                'hero.badge': 'Excelência em construção',
                'hero.title1': 'Construir é',
                'hero.title2': 'imperar',
                'hero.title3': 'com excelência.',
                'hero.desc': 'Há mais de 20 anos a criar residências de alto padrão em Portugal. Cada projeto é uma assinatura de luxo, minimalismo e funcionalidade.',
                'hero.btn': 'Ver projetos',
                'hero.scroll': 'Scroll',
                'hero.badge2': 'Arquitetura de autor',
                'hero.title4': 'Design',
                'hero.title5': 'atemporal',
                'hero.title6': 'para a vida moderna.',
                'hero.desc2': 'Espaços que combinam estética, funcionalidade e inovação. Projetos assinados por arquitetos renomados.',
                'hero.badge3': 'Luxo e sofisticação',
                'hero.title7': 'Onde o',
                'hero.title8': 'luxo',
                'hero.title9': 'encontra a natureza.',
                'hero.desc3': 'Refúgios exclusivos que harmonizam arquitetura e paisagem. Experiências únicas em Portugal.',
                'stats.years': '20+',
                'stats.projects': '80+',
                'stats.satisfaction': '98%',
                'servicos.title': 'Excelência em <span>cada detalhe</span>',
                'servicos.subtitle': 'Soluções integradas que transformam sonhos em realidade, com a qualidade e sofisticação que a IMPERARE oferece.',
                'servicos.item1.title': 'Construção & Incorporação',
                'servicos.item1.desc': 'Da concepção à entrega, gerimos todas as fases com materiais nobres e tecnologia de ponta. Entregamos empreendimentos que são referência em Lisboa e no Algarve.',
                'servicos.item2.title': 'Consultoria Executiva',
                'servicos.item2.desc': 'Acompanhamento estratégico personalizado: escolha de terreno, viabilidade, projeto e execução. Decisões seguras para resultados superiores.',
                'servicos.item3.title': 'Arquitetura & Interiores',
                'servicos.item3.desc': 'Espaços que combinam estética atemporal e funcionalidade. Em parceria com arquitetos de renome, criamos ambientes que contam histórias e emocionam.',
                'sobre.title': 'Mais que construir: <span>criamos tendências</span> de alto padrão.',
                'sobre.p1': 'Com mais de 20 anos de experiência no mercado de alto padrão, a IMPERARE é especializada em criar construções atemporais, que combinam arquitetura autoral, materiais nobres e soluções sob medida. Cada projeto é cuidadosamente planejado para proporcionar bem-estar, funcionalidade e conforto, com um design que harmoniza estética e precisão.',
                'sobre.p2': 'Nosso compromisso com a excelência se reflete em um processo único: mais do que empreendimentos, a IMPERARE transforma sonhos em experiências excepcionais e personalizadas.',
                'counters.label1': 'Anos de carreira',
                'counters.label2': 'Projetos concluídos',
                'counters.label3': '% Satisfação',
                'depoimentos.title': 'O que os <span>nossos clientes</span> dizem',
                'depoimentos.quote1': 'A IMPERARE transformou o nosso sonho numa casa que respira luz e sofisticação. Cada detalhe foi pensado com uma sensibilidade rara. O processo foi tão fluido quanto o resultado final.',
                'depoimentos.author1': '— M. Loureiro',
                'depoimentos.role1': 'CFO Grupo Atlântico',
                'depoimentos.quote2': 'Contratámos a IMPERARE para a reforma da nossa casa de família e o resultado superou todas as expectativas. Profissionalismo, pontualidade e um design impecável. Recomendamos sem reservas.',
                'depoimentos.author2': '— A. Rossato',
                'depoimentos.role2': 'CEO Deloitte Portugal',
                'depoimentos.quote3': 'Uma equipa que entende a alma de uma casa. A IMPERARE não construiu apenas uma residência, criou um refúgio que nos acolhe e inspira todos os dias. Gratidão eterna.',
                'depoimentos.author3': '— L. Rodrigues',
                'depoimentos.role3': 'Cliente particular',
                'depoimentos.quote4': 'Desde o primeiro esboço até à entrega das chaves, a IMPERARE demonstrou uma atenção aos detalhes que raramente se vê. Um parceiro de confiança para projetos de alto padrão.',
                'depoimentos.author4': '— F. Mendes',
                'depoimentos.role4': 'Arquiteto parceiro',
                'newsletter.title': 'Receba <span>novidades</span> da IMPERARE',
                'newsletter.desc': 'Arquitetura, lançamentos e tendências de luxo diretamente no seu e-mail.',
                'newsletter.placeholder': 'O seu melhor e-mail',
                'newsletter.btn': 'Subscrever',
                'footer.brand.desc': 'Construção e incorporação de alto padrão em Portugal. Transformamos espaços em experiências de luxo e funcionalidade.',
                'footer.links.title': 'Navegação',
                'footer.links.home': 'Início',
                'footer.links.servicos': 'Serviços',
                'footer.links.sobre': 'Sobre',
                'footer.links.equipa': 'Equipa',
                'footer.links.depoimentos': 'Depoimentos',
                'footer.links.contacto': 'Contacto',
                'footer.contacts.title': 'Contactos',
                'footer.contacts.instagram': '@imperareconstrutora',
                'footer.contacts.email': 'imperareconstrutora@gmail.com',
                'footer.contacts.address': 'São Domingos de Rana, Lisboa',
                'footer.contacts.phone': '+351 927 663 721',
                'footer.contacts.whatsapp': 'WhatsApp',
                'footer.copy': '© 2026 IMPERARE · Construção e Incorporação, Lda. Todos os direitos reservados.',
                'footer.privacy': 'Política de Privacidade',
                'footer.terms': 'Termos de Uso'
            },
            es: {
                'nav.home': 'Inicio',
                'nav.servicos': 'Servicios',
                'nav.sobre': 'Sobre',
                'nav.equipa': 'Equipo',
                'nav.depoimentos': 'Testimonios',
                'nav.contacto': 'Contacto',
                'hero.badge': 'Excelencia en construcción',
                'hero.title1': 'Construir es',
                'hero.title2': 'imperar',
                'hero.title3': 'con excelencia.',
                'hero.desc': 'Más de 20 años creando residencias de alto estándar en Portugal. Cada proyecto es una firma de lujo, minimalismo y funcionalidad.',
                'hero.btn': 'Ver proyectos',
                'hero.scroll': 'Desplazar',
                'hero.badge2': 'Arquitectura de autor',
                'hero.title4': 'Diseño',
                'hero.title5': 'atemporal',
                'hero.title6': 'para la vida moderna.',
                'hero.desc2': 'Espacios que combinan estética, funcionalidad e innovación. Proyectos firmados por arquitectos renombrados.',
                'hero.badge3': 'Lujo y sofisticación',
                'hero.title7': 'Donde el',
                'hero.title8': 'lujo',
                'hero.title9': 'encuentra la naturaleza.',
                'hero.desc3': 'Refugios exclusivos que armonizan arquitectura y paisaje. Experiencias únicas en Portugal.',
                'stats.years': '20+',
                'stats.projects': '80+',
                'stats.satisfaction': '98%',
                'servicos.title': 'Excelencia en <span>cada detalle</span>',
                'servicos.subtitle': 'Soluciones integradas que transforman sueños en realidad, con la calidad y sofisticación que IMPERARE ofrece.',
                'servicos.item1.title': 'Construcción e Incorporación',
                'servicos.item1.desc': 'Desde la concepción hasta la entrega, gestionamos todas las fases con materiales nobles y tecnología de punta. Entregamos proyectos que son referencia en Lisboa y el Algarve.',
                'servicos.item2.title': 'Consultoría Ejecutiva',
                'servicos.item2.desc': 'Acompañamiento estratégico personalizado: elección de terreno, viabilidad, proyecto y ejecución. Decisiones seguras para resultados superiores.',
                'servicos.item3.title': 'Arquitectura e Interiores',
                'servicos.item3.desc': 'Espacios que combinan estética atemporal y funcionalidad. En colaboración con arquitectos de renombre, creamos ambientes que cuentan historias y emocionan.',
                'sobre.title': 'Más que construir: <span>creamos tendencias</span> de alto estándar.',
                'sobre.p1': 'Con más de 20 años de experiencia en el mercado de alto estándar, IMPERARE se especializa en crear construcciones atemporales, que combinan arquitectura autoral, materiales nobles y soluciones a medida. Cada proyecto está cuidadosamente planificado para proporcionar bienestar, funcionalidad y confort, con un diseño que armoniza estética y precisión.',
                'sobre.p2': 'Nuestro compromiso con la excelencia se refleja en un proceso único: más que emprendimientos, IMPERARE transforma sueños en experiencias excepcionales y personalizadas.',
                'counters.label1': 'Años de carrera',
                'counters.label2': 'Proyectos completados',
                'counters.label3': '% Satisfacción',
                'depoimentos.title': 'Lo que <span>nuestros clientes</span> dicen',
                'depoimentos.quote1': 'IMPERARE transformó nuestro sueño en una casa que respira luz y sofisticación. Cada detalle fue pensado con una sensibilidad rara. El proceso fue tan fluido como el resultado final.',
                'depoimentos.author1': '— M. Loureiro',
                'depoimentos.role1': 'CFO Grupo Atlántico',
                'depoimentos.quote2': 'Contratamos a IMPERARE para la reforma de nuestra casa familiar y el resultado superó todas las expectativas. Profesionalismo, puntualidad y un diseño impecable. Recomendamos sin reservas.',
                'depoimentos.author2': '— A. Rossato',
                'depoimentos.role2': 'CEO Deloitte Portugal',
                'depoimentos.quote3': 'Un equipo que entiende el alma de una casa. IMPERARE no solo construyó una residencia, creó un refugio que nos acoge e inspira cada día. Gratitud eterna.',
                'depoimentos.author3': '— L. Rodrigues',
                'depoimentos.role3': 'Cliente particular',
                'depoimentos.quote4': 'Desde el primer boceto hasta la entrega de llaves, IMPERARE demostró una atención al detalle que raramente se ve. Un socio de confianza para proyectos de alto estándar.',
                'depoimentos.author4': '— F. Mendes',
                'depoimentos.role4': 'Arquitecto socio',
                'newsletter.title': 'Reciba <span>novedades</span> de IMPERARE',
                'newsletter.desc': 'Arquitectura, lanzamientos y tendencias de lujo directamente en su correo.',
                'newsletter.placeholder': 'Su mejor correo',
                'newsletter.btn': 'Suscribirse',
                'footer.brand.desc': 'Construcción e incorporación de alto estándar en Portugal. Transformamos espacios en experiencias de lujo y funcionalidad.',
                'footer.links.title': 'Navegación',
                'footer.links.home': 'Inicio',
                'footer.links.servicos': 'Servicios',
                'footer.links.sobre': 'Sobre',
                'footer.links.equipa': 'Equipo',
                'footer.links.depoimentos': 'Testimonios',
                'footer.links.contacto': 'Contacto',
                'footer.contacts.title': 'Contactos',
                'footer.contacts.instagram': '@imperareconstrutora',
                'footer.contacts.email': 'imperareconstrutora@gmail.com',
                'footer.contacts.address': 'São Domingos de Rana, Lisboa',
                'footer.contacts.phone': '+351 927 663 721',
                'footer.contacts.whatsapp': 'WhatsApp',
                'footer.copy': '© 2026 IMPERARE · Construcción e Incorporación, Lda. Todos los derechos reservados.',
                'footer.privacy': 'Política de Privacidad',
                'footer.terms': 'Términos de Uso'
            },
            en: {
                'nav.home': 'Home',
                'nav.servicos': 'Services',
                'nav.sobre': 'About',
                'nav.equipa': 'Team',
                'nav.depoimentos': 'Testimonials',
                'nav.contacto': 'Contact',
                'hero.badge': 'Excellence in construction',
                'hero.title1': 'Building is',
                'hero.title2': 'to reign',
                'hero.title3': 'with excellence.',
                'hero.desc': 'For over 20 years creating high-end residences in Portugal. Each project is a signature of luxury, minimalism, and functionality.',
                'hero.btn': 'View projects',
                'hero.scroll': 'Scroll',
                'hero.badge2': 'Author architecture',
                'hero.title4': 'Timeless',
                'hero.title5': 'design',
                'hero.title6': 'for modern living.',
                'hero.desc2': 'Spaces that combine aesthetics, functionality and innovation. Projects signed by renowned architects.',
                'hero.badge3': 'Luxury and sophistication',
                'hero.title7': 'Where',
                'hero.title8': 'luxury',
                'hero.title9': 'meets nature.',
                'hero.desc3': 'Exclusive retreats that harmonize architecture and landscape. Unique experiences in Portugal.',
                'stats.years': '20+',
                'stats.projects': '80+',
                'stats.satisfaction': '98%',
                'servicos.title': 'Excellence in <span>every detail</span>',
                'servicos.subtitle': 'Integrated solutions that turn dreams into reality, with the quality and sophistication that IMPERARE offers.',
                'servicos.item1.title': 'Construction & Development',
                'servicos.item1.desc': 'From conception to delivery, we manage all phases with premium materials and cutting-edge technology. We deliver projects that are references in Lisbon and the Algarve.',
                'servicos.item2.title': 'Executive Consulting',
                'servicos.item2.desc': 'Personalized strategic guidance: land selection, feasibility, design, and execution. Secure decisions for superior results.',
                'servicos.item3.title': 'Architecture & Interiors',
                'servicos.item3.desc': 'Spaces that combine timeless aesthetics and functionality. In partnership with renowned architects, we create environments that tell stories and inspire.',
                'sobre.title': 'More than building: <span>creating trends</span> in high-end.',
                'sobre.p1': 'With over 20 years of experience in the high-end market, IMPERARE specializes in creating timeless constructions, combining author architecture, noble materials, and custom solutions. Each project is carefully planned to provide well-being, functionality, and comfort, with a design that harmonizes aesthetics and precision.',
                'sobre.p2': 'Our commitment to excellence is reflected in a unique process: more than developments, IMPERARE transforms dreams into exceptional and personalized experiences.',
                'counters.label1': 'Years of career',
                'counters.label2': 'Projects completed',
                'counters.label3': '% Satisfaction',
                'depoimentos.title': 'What <span>our clients</span> say',
                'depoimentos.quote1': 'IMPERARE transformed our dream into a house that breathes light and sophistication. Every detail was thought through with rare sensitivity. The process was as fluid as the final result.',
                'depoimentos.author1': '— M. Loureiro',
                'depoimentos.role1': 'CFO Atlântico Group',
                'depoimentos.quote2': 'We hired IMPERARE to renovate our family home and the results exceeded all expectations. Professionalism, punctuality, and impeccable design. Highly recommended.',
                'depoimentos.author2': '— A. Rossato',
                'depoimentos.role2': 'CEO Deloitte Portugal',
                'depoimentos.quote3': 'A team that understands the soul of a home. IMPERARE didn\'t just build a residence; they created a refuge that welcomes and inspires us every day. Eternal gratitude.',
                'depoimentos.author3': '— L. Rodrigues',
                'depoimentos.role3': 'Private client',
                'depoimentos.quote4': 'From the first sketch to the key handover, IMPERARE showed an attention to detail that is rarely seen. A trusted partner for high-end projects.',
                'depoimentos.author4': '— F. Mendes',
                'depoimentos.role4': 'Partner architect',
                'newsletter.title': 'Receive <span>news</span> from IMPERARE',
                'newsletter.desc': 'Architecture, launches, and luxury trends straight to your inbox.',
                'newsletter.placeholder': 'Your best email',
                'newsletter.btn': 'Subscribe',
                'footer.brand.desc': 'High-end construction and development in Portugal. Transforming spaces into luxury and functional experiences.',
                'footer.links.title': 'Navigation',
                'footer.links.home': 'Home',
                'footer.links.servicos': 'Services',
                'footer.links.sobre': 'About',
                'footer.links.equipa': 'Team',
                'footer.links.depoimentos': 'Testimonials',
                'footer.links.contacto': 'Contact',
                'footer.contacts.title': 'Contacts',
                'footer.contacts.instagram': '@imperareconstrutora',
                'footer.contacts.email': 'imperareconstrutora@gmail.com',
                'footer.contacts.address': 'São Domingos de Rana, Lisbon',
                'footer.contacts.phone': '+351 927 663 721',
                'footer.contacts.whatsapp': 'WhatsApp',
                'footer.copy': '© 2026 IMPERARE · Construction & Development, Lda. All rights reserved.',
                'footer.privacy': 'Privacy Policy',
                'footer.terms': 'Terms of Use'
            },
            fr: {
                'nav.home': 'Accueil',
                'nav.servicos': 'Services',
                'nav.sobre': 'À propos',
                'nav.equipa': 'Équipe',
                'nav.depoimentos': 'Témoignages',
                'nav.contacto': 'Contact',
                'hero.badge': 'Excellence en construction',
                'hero.title1': 'Construire, c\'est',
                'hero.title2': 'régner',
                'hero.title3': 'avec excellence.',
                'hero.desc': 'Depuis plus de 20 ans, nous créons des résidences haut de gamme au Portugal. Chaque projet est une signature de luxe, de minimalisme et de fonctionnalité.',
                'hero.btn': 'Voir les projets',
                'hero.scroll': 'Défiler',
                'hero.badge2': 'Architecture d\'auteur',
                'hero.title4': 'Design',
                'hero.title5': 'intemporel',
                'hero.title6': 'pour la vie moderne.',
                'hero.desc2': 'Des espaces qui allient esthétique, fonctionnalité et innovation. Des projets signés par des architectes renommés.',
                'hero.badge3': 'Luxe et sophistication',
                'hero.title7': 'Où le',
                'hero.title8': 'luxe',
                'hero.title9': 'rencontre la nature.',
                'hero.desc3': 'Des refuges exclusifs qui harmonisent architecture et paysage. Des expériences uniques au Portugal.',
                'stats.years': '20+',
                'stats.projects': '80+',
                'stats.satisfaction': '98%',
                'servicos.title': 'Excellence dans <span>chaque détail</span>',
                'servicos.subtitle': 'Des solutions intégrées qui transforment les rêves en réalité, avec la qualité et la sophistication qu\'IMPERARE offre.',
                'servicos.item1.title': 'Construction & Promotion',
                'servicos.item1.desc': 'De la conception à la livraison, nous gérons toutes les phases avec des matériaux nobles et une technologie de pointe. Nous livrons des projets qui font référence à Lisbonne et en Algarve.',
                'servicos.item2.title': 'Consulting Exécutif',
                'servicos.item2.desc': 'Accompagnement stratégique personnalisé : choix du terrain, faisabilité, projet et exécution. Des décisions sûres pour des résultats supérieurs.',
                'servicos.item3.title': 'Architecture & Intérieurs',
                'servicos.item3.desc': 'Des espaces qui allient esthétique intemporelle et fonctionnalité. En partenariat avec des architectes de renom, nous créons des ambiances qui racontent des histoires et inspirent.',
                'sobre.title': 'Plus que construire : <span>nous créons des tendances</span> haut de gamme.',
                'sobre.p1': 'Avec plus de 20 ans d\'expérience sur le marché haut de gamme, IMPERARE se spécialise dans la création de constructions intemporelles, alliant architecture d\'auteur, matériaux nobles et solutions sur mesure. Chaque projet est soigneusement planifié pour offrir bien-être, fonctionnalité et confort, avec un design qui harmonise esthétique et précision.',
                'sobre.p2': 'Notre engagement envers l\'excellence se reflète dans un processus unique : plus que des projets, IMPERARE transforme les rêves en expériences exceptionnelles et personnalisées.',
                'counters.label1': 'Années de carrière',
                'counters.label2': 'Projets réalisés',
                'counters.label3': '% Satisfaction',
                'depoimentos.title': 'Ce que <span>nos clients</span> disent',
                'depoimentos.quote1': 'IMPERARE a transformé notre rêve en une maison qui respire la lumière et la sophistication. Chaque détail a été pensé avec une sensibilité rare. Le processus a été aussi fluide que le résultat final.',
                'depoimentos.author1': '— M. Loureiro',
                'depoimentos.role1': 'CFO Groupe Atlântico',
                'depoimentos.quote2': 'Nous avons fait appel à IMPERARE pour rénover notre maison de famille et le résultat a dépassé toutes nos attentes. Professionnalisme, ponctualité et un design irréprochable. Nous recommandons sans réserve.',
                'depoimentos.author2': '— A. Rossato',
                'depoimentos.role2': 'CEO Deloitte Portugal',
                'depoimentos.quote3': 'Une équipe qui comprend l\'âme d\'une maison. IMPERARE n\'a pas seulement construit une résidence, elle a créé un refuge qui nous accueille et nous inspire chaque jour. Gratitude éternelle.',
                'depoimentos.author3': '— L. Rodrigues',
                'depoimentos.role3': 'Client particulier',
                'depoimentos.quote4': 'Du premier croquis à la remise des clés, IMPERARE a démontré une attention aux détails que l\'on voit rarement. Un partenaire de confiance pour des projets haut de gamme.',
                'depoimentos.author4': '— F. Mendes',
                'depoimentos.role4': 'Architecte partenaire',
                'newsletter.title': 'Recevez les <span>actualités</span> d\'IMPERARE',
                'newsletter.desc': 'Architecture, lancements et tendances du luxe directement dans votre boîte mail.',
                'newsletter.placeholder': 'Votre meilleur e-mail',
                'newsletter.btn': 'S\'abonner',
                'footer.brand.desc': 'Construction et promotion haut de gamme au Portugal. Nous transformons les espaces en expériences de luxe et de fonctionnalité.',
                'footer.links.title': 'Navigation',
                'footer.links.home': 'Accueil',
                'footer.links.servicos': 'Services',
                'footer.links.sobre': 'À propos',
                'footer.links.equipa': 'Équipe',
                'footer.links.depoimentos': 'Témoignages',
                'footer.links.contacto': 'Contact',
                'footer.contacts.title': 'Contacts',
                'footer.contacts.instagram': '@imperareconstrutora',
                'footer.contacts.email': 'imperareconstrutora@gmail.com',
                'footer.contacts.address': 'São Domingos de Rana, Lisbonne',
                'footer.contacts.phone': '+351 927 663 721',
                'footer.contacts.whatsapp': 'WhatsApp',
                'footer.copy': '© 2026 IMPERARE · Construction & Promotion, Lda. Tous droits réservés.',
                'footer.privacy': 'Politique de confidentialité',
                'footer.terms': 'Conditions d\'utilisation'
            }
        };

        var currentLang = 'pt';
        var langLinks = document.querySelectorAll('#langSwitch .lang-link');
        var translatableElements = document.querySelectorAll('[data-i18n]');
        var placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');

        if (!langLinks.length) return;

        function translatePage(lang) {
            var dict = translations[lang];
            if (!dict) return;

            translatableElements.forEach(function(el) {
                var key = el.getAttribute('data-i18n');
                if (dict[key] !== undefined) {
                    if (dict[key].includes('<span>') || dict[key].includes('<strong>') || dict[key].includes('<em>')) {
                        el.innerHTML = dict[key];
                    } else {
                        el.textContent = dict[key];
                    }
                }
            });

            placeholderElements.forEach(function(el) {
                var key = el.getAttribute('data-i18n-placeholder');
                if (dict[key] !== undefined) {
                    el.placeholder = dict[key];
                }
            });

            langLinks.forEach(function(link) {
                var isActive = link.getAttribute('data-lang') === lang;
                link.classList.toggle('active', isActive);
            });

            var langMap = {
                'pt': 'pt-PT',
                'es': 'es-ES',
                'en': 'en-GB',
                'fr': 'fr-FR'
            };
            document.documentElement.lang = langMap[lang] || 'pt-PT';

            currentLang = lang;
        }

        langLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var lang = this.getAttribute('data-lang');
                if (lang && lang !== currentLang) {
                    translatePage(lang);
                }
            });
        });

        translatePage('pt');
    }

    // ============================================================
    // 11. MODAL (genérico para futura utilização)
    // ============================================================
    function initModal() {
        var modal = document.getElementById('genericModal');
        if (!modal) return;

        var closeButtons = modal.querySelectorAll('[data-modal-close]');

        function openModal() {
            modal.classList.add('open');
            modal.removeAttribute('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('open');
            modal.setAttribute('hidden', '');
            document.body.style.overflow = '';
        }

        closeButtons.forEach(function(btn) {
            btn.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });

        window.IMPERARE = window.IMPERARE || {};
        window.IMPERARE.openModal = openModal;
        window.IMPERARE.closeModal = closeModal;
    }

    // ============================================================
    // 12. ANIMAÇÃO DE ENTRADA (fade-in body)
    // ============================================================
    function initBodyAnimation() {
        document.body.style.opacity = '0';
        document.body.style.animation = 'fadeInBody 0.8s ease forwards';
    }

    // ============================================================
    // 13. CARREGAR EQUIPA DO BACKEND
    // ============================================================
    function initTeam() {
        var teamGrid = document.getElementById('teamGrid');
        if (!teamGrid) return;

        var API_URL = 'http://localhost:3000/api/team';

        function renderTeam(members) {
            teamGrid.innerHTML = '';
            if (!members || members.length === 0) {
                teamGrid.innerHTML = '<p style="color:#b4aea4;text-align:center;width:100%;padding:2rem;">Nenhum membro da equipa cadastrado ainda.</p>';
                return;
            }

            members.forEach(function(member) {
                var card = document.createElement('article');
                card.className = 'team-member-card';
                card.innerHTML = `
                    <div class="team-member-photo">
                        <img src="${member.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.name) + '&background=c9a96e&color=fff&size=128'}" alt="${member.name}" loading="lazy">
                    </div>
                    <h3>${member.name}</h3>
                    <p>${member.role}</p>
                    ${member.bio ? '<small style="color:#7a756e;display:block;margin-top:0.5rem;font-size:0.8rem;">' + member.bio + '</small>' : ''}
                `;
                teamGrid.appendChild(card);
            });
        }

        fetch(API_URL)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Erro ao carregar equipa');
                }
                return response.json();
            })
            .then(function(data) {
                renderTeam(data);
            })
            .catch(function(error) {
                console.error('Erro ao carregar equipa:', error);
                var fallbackData = [
                    {
                        id: 1,
                        name: 'Thiago Silva',
                        role: 'Fundador & CEO',
                        photo: 'https://ui-avatars.com/api/?name=Thiago+Silva&background=c9a96e&color=fff&size=128',
                        bio: 'Fundador da IMPERARE com mais de 20 anos de experiência no mercado de alto padrão.'
                    },
                    {
                        id: 2,
                        name: 'Diogo Costa',
                        role: 'Sócio & Diretor Comercial',
                        photo: 'https://ui-avatars.com/api/?name=Diogo+Costa&background=c9a96e&color=fff&size=128',
                        bio: 'Sócio e diretor de projetos, especialista em arquitetura e design de interiores.'
                    },
                    {
                        id: 3,
                        name: 'Ana Ferreira',
                        role: 'Arquiteta Sénior',
                        photo: 'https://ui-avatars.com/api/?name=Ana+Ferreira&background=c9a96e&color=fff&size=128',
                        bio: 'Arquiteta especializada em projetos residenciais de alto padrão.'
                    }
                ];
                renderTeam(fallbackData);
            });
    }

    // ============================================================
    // 14. CARREGAR IMÓVEIS COM CARROSSEL
    // ============================================================
    function initPropertiesCarousel() {
        var track = document.getElementById('carouselTrack');
        var indicators = document.getElementById('carouselIndicators');
        var prevBtn = document.getElementById('carouselPrev');
        var nextBtn = document.getElementById('carouselNext');

        if (!track) {
            console.warn('⚠️ Carrossel não encontrado');
            return;
        }

        var API_URL = 'http://localhost:3000/api/properties';
        var allProperties = [];
        var currentSlide = 0;
        var slidesPerView = 3;
        var autoSlideInterval = null;

        function getSlidesPerView() {
            if (window.innerWidth < 600) return 1;
            if (window.innerWidth < 900) return 2;
            return 3;
        }

        function createPropertyCard(property) {
            var card = document.createElement('div');
            card.className = 'invest-card-new';

            var firstPhoto = property.photos && property.photos.length > 0 ? property.photos[0] : null;

            var iconsMap = { 'Lisboa': 'fa-city', 'Algarve': 'fa-umbrella-beach', 'Porto': 'fa-landmark' };
            var icon = iconsMap[property.location] || 'fa-building';

            var statusBadgeMap = { 'disponivel': 'Projetos disponíveis', 'em_lancamento': 'Em lançamento' };
            var statusLabel = statusBadgeMap[property.status] || property.status;

            var finishMap = { 'basico': 'Básico', 'medio': 'Médio', 'luxo': 'Luxo', 'premium': 'Premium' };
            var finishLabel = finishMap[property.finish] || property.finish;

            var regionMap = { 'Lisboa': 'Capital', 'Algarve': 'Costa Sul', 'Porto': 'Norte' };
            var region = regionMap[property.location] || property.location;

            var statsHtml = '';
            if (property.appreciation && property.appreciation !== 'N/A') {
                statsHtml += '<div class="i-stat"><strong>' + property.appreciation + '</strong><span>Val. anual</span></div>';
            }
            if (property.pricePerSqm && property.pricePerSqm !== 'N/A') {
                statsHtml += '<div class="i-stat"><strong>' + property.pricePerSqm + '</strong><span>Preço/m²</span></div>';
            }
            if (property.bedrooms) {
                statsHtml += '<div class="i-stat"><strong>T' + property.bedrooms + '–T' + (property.bedrooms + 1) + '</strong><span>Tipologias</span></div>';
            } else {
                statsHtml += '<div class="i-stat"><strong>' + property.type + '</strong><span>Tipologia</span></div>';
            }

            var photoHtml = firstPhoto ?
                '<div style="width:100%;height:140px;border-radius:8px;overflow:hidden;margin-bottom:0.5rem;background:#0d0d0d;border:1px solid rgba(201,169,110,0.1);">' +
                '<img src="' + firstPhoto + '" alt="' + property.title + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\'">' +
                '</div>' : '';

            card.innerHTML =
                photoHtml +
                '<div class="invest-card-icon-w"><i class="fas ' + icon + '"></i></div>' +
                '<p class="invest-region-tag">' + region + '</p>' +
                '<h3>' + property.location + '</h3>' +
                '<p class="invest-card-desc">' + (property.description ? property.description.substring(0, 100) + (property.description.length > 100 ? '...' : '') : 'Empreendimento exclusivo com acabamentos de excelência.') + '</p>' +
                '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin:0.2rem 0 0.4rem;">' +
                '<span style="font-size:0.7rem;background:rgba(201,169,110,0.08);color:#c9a96e;padding:0.1rem 0.5rem;border-radius:12px;border:1px solid rgba(201,169,110,0.1);">' + finishLabel + '</span>' +
                '<span style="font-size:0.7rem;background:rgba(201,169,110,0.08);color:#c9a96e;padding:0.1rem 0.5rem;border-radius:12px;border:1px solid rgba(201,169,110,0.1);">' + property.area + 'm²</span>' +
                '</div>' +
                '<div style="font-size:1.3rem;font-weight:600;color:#c9a96e;margin-bottom:0.3rem;">' + (property.priceFormatted || '€' + Number(property.price).toLocaleString('pt-PT')) + '</div>' +
                '<div class="invest-stats-row">' + statsHtml + '</div>' +
                '<span class="invest-badge"><span class="invest-badge-dot"></span>' + statusLabel + '</span>';

            return card;
        }

        function renderCarousel(properties) {
            track.innerHTML = '';
            indicators.innerHTML = '';

            if (!properties || properties.length === 0) {
                track.innerHTML = '<div style="width:100%;text-align:center;padding:2rem;color:#7a756e;"><i class="fas fa-building" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.3;"></i>Nenhum imóvel disponível no momento.</div>';
                return;
            }

            var available = properties.filter(function(p) {
                return p.status === 'disponivel' || p.status === 'em_lancamento';
            });

            if (available.length === 0) {
                track.innerHTML = '<div style="width:100%;text-align:center;padding:2rem;color:#7a756e;"><i class="fas fa-building" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.3;"></i>Nenhum imóvel disponível no momento.</div>';
                return;
            }

            slidesPerView = getSlidesPerView();

            available.forEach(function(property) {
                var card = createPropertyCard(property);
                var cardWidth = 100 / slidesPerView;
                var gap = 1.5;
                card.style.flex = '0 0 calc(' + cardWidth + '% - ' + ((gap * (slidesPerView - 1)) / slidesPerView) + 'rem)';
                card.style.minWidth = '200px';
                track.appendChild(card);
            });

            var totalSlides = Math.ceil(available.length / slidesPerView);
            for (var i = 0; i < totalSlides; i++) {
                var dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.dataset.index = i;
                dot.addEventListener('click', function() {
                    goToSlide(parseInt(this.dataset.index));
                });
                indicators.appendChild(dot);
            }

            currentSlide = 0;
            updateSlidePosition();
            startAutoPlay();
        }

        function updateSlidePosition() {
            var slideWidth = track.children[0]?.offsetWidth || 0;
            var gap = 24;
            var offset = currentSlide * (slideWidth + gap);
            track.style.transform = 'translateX(-' + offset + 'px)';

            var dots = indicators.querySelectorAll('.carousel-dot');
            dots.forEach(function(dot, index) {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        function nextSlide() {
            var totalSlides = Math.ceil(track.children.length / slidesPerView);
            if (totalSlides <= 1) return;
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlidePosition();
            resetAutoPlay();
        }

        function prevSlide() {
            var totalSlides = Math.ceil(track.children.length / slidesPerView);
            if (totalSlides <= 1) return;
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlidePosition();
            resetAutoPlay();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateSlidePosition();
            resetAutoPlay();
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoSlideInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoPlay() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        function loadProperties() {
            fetch(API_URL)
                .then(function(response) {
                    if (!response.ok) throw new Error('Erro HTTP: ' + response.status);
                    return response.json();
                })
                .then(function(data) {
                    var properties = data.data || data;
                    allProperties = properties;
                    renderCarousel(properties);
                })
                .catch(function(error) {
                    console.error('❌ Erro ao carregar imóveis:', error);
                    track.innerHTML = '<div style="width:100%;text-align:center;padding:2rem;color:#e74c3c;"><i class="fas fa-exclamation-triangle" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Erro ao carregar imóveis.<br><small style="color:#7a756e;">' + error.message + '</small></div>';
                });
        }

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        window.addEventListener('resize', function() {
            var newSlides = getSlidesPerView();
            if (newSlides !== slidesPerView && allProperties.length > 0) {
                slidesPerView = newSlides;
                renderCarousel(allProperties);
            }
        });

        setTimeout(loadProperties, 500);
    }

    // ============================================================
    // 15. SIMULADOR DE ORÇAMENTO
    // ============================================================
    function initQuotationForm() {
        var form = document.getElementById('quotation-form');
        var resultDiv = document.getElementById('quotation-result');
        if (!form || !resultDiv) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            var workType = document.getElementById('workType');
            var area = document.getElementById('area');
            var finish = document.getElementById('finish');

            if (!workType || !area || !finish) return;

            var workTypeValue = workType.value;
            var areaValue = parseFloat(area.value);
            var finishValue = finish.value;

            if (!workTypeValue || !areaValue || !finishValue) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = '<p style="color:#e74c3c;">Por favor, preencha todos os campos corretamente.</p>';
                return;
            }

            var basePrices = {
                'construcao': 1800,
                'reforma': 1200,
                'ampliacao': 1400,
                'interiores': 800
            };

            var finishMultipliers = {
                'basico': 1.0,
                'medio': 1.3,
                'luxo': 1.8,
                'premium': 2.5
            };

            var basePrice = basePrices[workTypeValue] || 1500;
            var multiplier = finishMultipliers[finishValue] || 1.0;

            var estimatedCost = basePrice * areaValue * multiplier;
            var formattedCost = estimatedCost.toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });

            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="background:var(--bg-card,#1a1816);padding:2rem;border-radius:8px;border:1px solid var(--border-color,#2a2825);text-align:center;">
                    <h3 style="color:var(--gold,#c9a96e);margin-bottom:0.5rem;">Orçamento Estimado</h3>
                    <p style="font-size:2.5rem;font-weight:600;color:var(--text-primary,#f2efe9);">${formattedCost}</p>
                    <p style="color:var(--text-secondary,#b4aea4);margin-top:0.5rem;">
                        Baseado em ${areaValue}m² · ${finish.options[finish.selectedIndex].text} · ${workType.options[workType.selectedIndex].text}
                    </p>
                    <p style="color:var(--text-dim,#7a756e);font-size:0.8rem;margin-top:1rem;">
                        Este é um valor estimado. Entre em contacto para um orçamento detalhado.
                    </p>
                    <a href="#contacto" class="btn btn-gold" style="margin-top:1rem;">Solicitar Orçamento Detalhado</a>
                </div>
            `;

            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // ============================================================
    // 16. FORMULÁRIO DE CONTACTO
    // ============================================================
    function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            var inputs = form.querySelectorAll('input, textarea');
            var allFilled = true;
            inputs.forEach(function(input) {
                if (input.hasAttribute('required') && !input.value.trim()) {
                    allFilled = false;
                    input.style.borderColor = '#e74c3c';
                } else {
                    input.style.borderColor = '';
                }
            });

            if (!allFilled) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            alert('Mensagem enviada com sucesso! Entraremos em contacto brevemente.');
            form.reset();
        });
    }

    // ============================================================
    // 17. BACK TO TOP BUTTON
    // ============================================================
    function initBackToTop() {
        var button = document.getElementById('back-to-top-button');
        if (!button) return;

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 400) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        }, { passive: true });

        button.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================================
    // 18. LOGIN MODAL (Área Cliente)
    // ============================================================
    function initLoginModal() {
        var loginModal = document.getElementById('clientLoginModal');
        var loginForm = document.getElementById('loginForm');

        if (!loginModal || !loginForm) return;

        var loginTrigger = document.querySelector('[data-login-trigger]');
        if (loginTrigger) {
            loginTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                loginModal.classList.add('open');
                loginModal.removeAttribute('hidden');
                document.body.style.overflow = 'hidden';
            });
        }

        var closeButtons = loginModal.querySelectorAll('[data-modal-close]');
        closeButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                loginModal.classList.remove('open');
                loginModal.setAttribute('hidden', '');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && loginModal.classList.contains('open')) {
                loginModal.classList.remove('open');
                loginModal.setAttribute('hidden', '');
                document.body.style.overflow = '';
            }
        });

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = this.querySelector('input[type="email"]');
            var password = this.querySelector('input[type="password"]');

            if (email && password && email.value.trim() && password.value.trim()) {
                alert('Login efetuado com sucesso! (Área em desenvolvimento)');
                loginModal.classList.remove('open');
                loginModal.setAttribute('hidden', '');
                document.body.style.overflow = '';
                this.reset();
            } else {
                alert('Por favor, preencha todos os campos.');
            }
        });
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 IMPERARE - Inicializando site...');
        
        initBodyAnimation();
        initPreloader();
        initHeaderScroll();
        initHeroCarousel();
        initScrollReveal();
        initCounters();
        initSidebar(); // <-- SIDEBAR INICIALIZADA CORRETAMENTE
        initThemeToggle();
        initNewsletter();
        initScrollSpy();
        initTranslations();
        initModal();
        initTeam();
        initQuotationForm();
        initContactForm();
        initBackToTop();
        initLoginModal();
        
        // Inicializar carrossel de imóveis com um pequeno atraso
        setTimeout(function() {
            initPropertiesCarousel();
        }, 500);

        console.log('🚀 IMPERARE - Site carregado com sucesso!');
        console.log('📋 Versão: 5.0 - Com sidebar corrigida');
    });

})();