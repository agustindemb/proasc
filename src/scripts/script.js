/**
 * proasc (Automation System Company)
 * Main Interactive Script - Spanish Version
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Mobile Menu Navigation ---
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('navigation-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon.classList.contains('fa-bars')) {
        icon.classList.replace('fa-bars', 'fa-xmark');
      } else {
        icon.classList.replace('fa-xmark', 'fa-bars');
      }
    });

    // Close menu when link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.replace('fa-xmark', 'fa-bars');
      });
    });
  }


  // --- 2. Hero Neural Canvas Particle System ---
  const canvas = document.getElementById('neural-particles');
  if (canvas) {
    // Disable canvas system on mobile screens (< 768px) to optimize CPU/Battery
    if (window.innerWidth < 768) {
      canvas.style.display = 'none';
      return;
    }
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse
    let mouse = {
      x: null,
      y: null,
      radius: 150
    };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        // Speeds
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
      }

      update() {
        // Drift movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce on boundaries
        if (this.x < 0 || this.x > width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > height) this.speedY = -this.speedY;

        // Mouse interaction (gentle attraction)
        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= dx * force * 0.03;
            this.y -= dy * force * 0.03;
          }
        }
      }

      draw() {
        ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Initialize particle array
    function initParticles() {
      particlesArray = [];
      const numberOfParticles = Math.floor((width * height) / 11000);
      for (let i = 0; i < numberOfParticles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particlesArray.push(new Particle(x, y));
      }
    }

    // Draw connection lines
    function connectParticles() {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            opacityValue = 1 - distance / 110;
            ctx.strokeStyle = `rgba(155, 81, 224, ${opacityValue * 0.15})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // Main animation loop
    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      connectParticles();
      requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
  }


  // --- 3. WhatsApp Chatbot Simulator Logic ---
  const chatBox = document.getElementById('wa-chat-box');
  const presetsBox = document.getElementById('wa-presets-box');
  const typingBubble = document.getElementById('wa-typing-bubble');

  // Spanish Bot replies
  const botAnswers = {
    help: "Así es como **ASC** automatiza tus proyectos:\n\n1️⃣ **Auditoría de Procesos**: Analizamos las tareas manuales y mensajes repetitivos de tu equipo.\n2️⃣ **Diseño de Sistema**: Diseñamos webhooks a medida y modelos de IA configurados.\n3️⃣ **Integración**: Conectamos tu API de WhatsApp, tu CRM, bases de datos y correos.\n4️⃣ **Monitoreo**: Desplegamos sistemas seguros con control de fallas y alertas automáticas.\n\n*Por lo general, las automatizaciones a medida toman entre 2 a 3 semanas en implementarse.* ⚡",
    whatsapp: "Nuestros asistentes de WhatsApp hacen mucho más que simples botones estáticos:\n\n🟢 **Lenguaje Natural**: Entienden las consultas libres de los usuarios (ej: \"Quiero cambiar mi reserva\").\n📅 **Agendamiento Directo**: Integran Google Calendar o Calendly en el mismo chat.\n💳 **Enlaces de Pago**: Generan links de cobro por Stripe al instante en la conversación.\n🔄 **Sincronización CRM**: Guardan resúmenes e información capturada en HubSpot o Salesforce automáticamente.",
    custom: "Automatizamos **CUALQUIER** tipo de flujo digital. Algunos ejemplos comunes:\n\n🔗 **Sincronización de Datos**: Guarda prospectos de chats directamente en planillas, bases de datos o tu CRM.\n📊 **Reportes con IA**: Lee facturas o archivos PDF, sintetiza información y envía resúmenes por Slack/WhatsApp.\n📂 **Extracción (Scraping)**: Monitorea competidores diariamente y actualiza tus sistemas automáticamente.\n📧 **Generación de Archivos**: Crea acuerdos o cotizaciones en PDF al instante y envíalos por email.",
    pricing: "Ofrecemos tres planes principales según las necesidades de tu negocio:\n\n• **ASC START**: USD 50/mes + USD 200 Setup (WhatsApp Business, bienvenida y respuestas rápidas).\n• **ASC GROW**: USD 120/mes + USD 300 Setup (Menú interactivo, captura de leads y flujos personalizados).\n• **ASC AI**: USD 250/mes + USD 600 Setup (IA entrenada para FAQs, integración con CRM y automatizaciones).\n\n*Puedes ver el detalle completo de cada plan en la sección de Precios o consultar por integraciones a medida.*"
  };

  if (presetsBox && chatBox) {
    presetsBox.addEventListener('click', (e) => {
      const button = e.target.closest('.wa-preset-btn');
      if (!button) return;

      const key = button.getAttribute('data-key');
      const userText = button.textContent;

      // Disable buttons
      togglePresets(true);

      // Append user message
      appendMessage(userText, 'out');
      scrollToBottom();

      // Show typing indicator
      showTypingIndicator(true);

      // Delay response to look natural
      setTimeout(() => {
        showTypingIndicator(false);
        const reply = botAnswers[key] || "No entendí la consulta. ¡Intenta con otro botón!";
        appendMessage(reply, 'in');
        scrollToBottom();
        togglePresets(false);
      }, 1400);
    });
  }

  function appendMessage(text, type) {
    const msgElement = document.createElement('div');
    msgElement.className = `wa-msg wa-msg-${type}`;
    
    let formattedText = text.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    msgElement.innerHTML = `
      ${formattedText}
      <span class="wa-time">${timeStr}</span>
    `;
    
    chatBox.insertBefore(msgElement, typingBubble);
  }

  // Handle typing state
  function showTypingIndicator(show) {
    if (typingBubble) {
      typingBubble.style.display = show ? 'flex' : 'none';
      scrollToBottom();
    }
  }

  function togglePresets(disable) {
    const buttons = presetsBox.querySelectorAll('.wa-preset-btn');
    buttons.forEach(btn => {
      btn.disabled = disable;
      btn.style.opacity = disable ? '0.4' : '1';
      btn.style.pointerEvents = disable ? 'none' : 'auto';
    });
  }

  function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
  }


  // --- 4. Interactive Automation Workflow Visualizer ---
  const triggerBtn = document.getElementById('btn-trigger-workflow');
  const nodeWa = document.getElementById('node-wa');
  const nodeAi = document.getElementById('node-ai');
  const nodeDb = document.getElementById('node-db');
  const nodeMail = document.getElementById('node-mail');
  
  const pulse12 = document.getElementById('pulse-1-2');
  const pulse23 = document.getElementById('pulse-2-3');
  const pulse34 = document.getElementById('pulse-3-4');

  let isWorkflowRunning = false;

  if (triggerBtn) {
    triggerBtn.addEventListener('click', runWorkflowAnimation);
  }

  function runWorkflowAnimation() {
    if (isWorkflowRunning) return;
    isWorkflowRunning = true;
    triggerBtn.disabled = true;
    triggerBtn.style.opacity = '0.6';
    triggerBtn.innerHTML = 'Ejecutando Flujo... <i class="fa-solid fa-spinner fa-spin"></i>';

    // Step 1: Active WhatsApp Trigger Node
    nodeWa.classList.add('node-whatsapp-active');
    
    // Activate connection pulse 1 -> 2
    setTimeout(() => {
      pulse12.style.display = 'block';
    }, 300);

    // Step 2: AI Processor Node
    setTimeout(() => {
      nodeWa.classList.remove('node-whatsapp-active');
      nodeAi.classList.add('node-active');
      pulse12.style.display = 'none';
      
      // Activate connections 2 -> 3 and 2 -> 4
      pulse23.style.display = 'block';
      pulse34.style.display = 'block';
    }, 1200);

    // Step 3 & 4: CRM Logging and Email Dispatch
    setTimeout(() => {
      nodeAi.classList.remove('node-active');
      pulse23.style.display = 'none';
      pulse34.style.display = 'none';
      
      nodeDb.classList.add('node-whatsapp-active');
      nodeMail.classList.add('node-purple-active');
    }, 2400);

    // Reset workflow
    setTimeout(() => {
      nodeDb.classList.remove('node-whatsapp-active');
      nodeMail.classList.remove('node-purple-active');
      
      isWorkflowRunning = false;
      triggerBtn.disabled = false;
      triggerBtn.style.opacity = '1';
      triggerBtn.innerHTML = 'Iniciar Demostración de Flujo <i class="fa-solid fa-play"></i>';
    }, 4500);
  }

  // Automatic periodic workflow trigger every 15 seconds
  setInterval(() => {
    if (!isWorkflowRunning) {
      const boardEl = document.getElementById('workflow-visualizer-box');
      if (boardEl) {
        const rect = boardEl.getBoundingClientRect();
        const inView = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        if (inView) {
          runWorkflowAnimation();
        }
      }
    }
  }, 15000);

  // Responsive scaling for the workflow visualizer board
  function resizeWorkflowBoard() {
    const wrapper = document.querySelector('.visualizer-wrapper');
    const board = document.getElementById('workflow-visualizer-box');
    if (wrapper && board) {
      const viewportWidth = window.innerWidth;
      let availableWidth = 680; // Base design width
      
      if (viewportWidth < 1024) {
        // Columns stack, visualizer takes 100% of container width (viewport - 48px padding)
        availableWidth = viewportWidth - 48;
      } else {
        // Desktop grid: visualizer column takes 60% of container width
        const containerWidth = Math.min(1200, viewportWidth - 48);
        availableWidth = containerWidth * 0.6;
      }
      
      const boardWidth = 680;
      const boardHeight = 360;
      
      if (availableWidth < boardWidth) {
        const scale = availableWidth / boardWidth;
        board.style.transform = `scale(${scale})`;
        board.style.transformOrigin = 'top center';
        wrapper.style.height = `${boardHeight * scale}px`;
      } else {
        board.style.transform = 'none';
        wrapper.style.height = `${boardHeight}px`;
      }
    }
  }

  // Run on load and resize
  resizeWorkflowBoard();
  window.addEventListener('load', resizeWorkflowBoard);
  window.addEventListener('resize', resizeWorkflowBoard);


  // --- 5. Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }


  // --- 6. Contact Form Handler & Toast Notification ---
  const contactForm = document.getElementById('main-contact-form');
  const toast = document.getElementById('toast-notification');
  const submitBtn = document.getElementById('btn-submit-form');

  if (contactForm && toast && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Change button state to loading
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.innerHTML = 'Procesando Solicitud... <i class="fa-solid fa-circle-notch fa-spin"></i>';

      // Gather form inputs
      const name = document.getElementById('contact-name').value;
      const company = document.getElementById('contact-company').value;
      const email = document.getElementById('contact-email').value;
      const phone = document.getElementById('contact-phone').value;
      const botType = document.getElementById('contact-bot-type').value;
      const message = document.getElementById('contact-message').value;

      const payload = {
        nombre: name,
        empresa: company,
        email: email,
        whatsapp: phone,
        servicio_automatizar: botType,
        mensaje: message,
        submittedAt: new Date().toISOString()
      };

      try {
        const response = await fetch('https://n8n.proasc.com/webhook/99446ef0-452d-43a9-92cf-5f43deede005', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Trigger success toast notification
        toast.innerHTML = `
          <i class="fa-solid fa-circle-check" style="color: var(--whatsapp);"></i>
          <div>
            <h5 style="font-weight: 700;">¡Solicitud Enviada!</h5>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Te enviaremos un WhatsApp en breve.</p>
          </div>
        `;
        toast.classList.add('toast-active');

        // Clear input values
        contactForm.reset();

      } catch (error) {
        console.error('Error submitting form:', error);
        // Trigger error toast notification
        toast.innerHTML = `
          <i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i>
          <div>
            <h5 style="font-weight: 700; color: #ef4444;">Error al enviar</h5>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Por favor, intenta de nuevo o contáctanos por WhatsApp.</p>
          </div>
        `;
        toast.classList.add('toast-active');
      } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = 'Enviar Solicitud de Plan de Automatización <i class="fa-solid fa-paper-plane"></i>';

        // Dismiss toast after 5 seconds
        setTimeout(() => {
          toast.classList.remove('toast-active');
        }, 5000);
      }
    });
  }

  // --- 7. Newsletter mock subscription ---
  const newsletterForm = document.getElementById('subscribe-newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email-input');
      const submitBtn = document.getElementById('newsletter-submit-btn');

      if (emailInput && submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '¡Suscrito!';
        submitBtn.style.background = 'var(--whatsapp)';
        submitBtn.style.color = '#030712';
        submitBtn.style.borderColor = 'transparent';
        
        setTimeout(() => {
          emailInput.value = '';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Unirse';
          submitBtn.style.background = 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)';
          submitBtn.style.borderColor = 'initial';
        }, 3000);
      }
    });
  }
});
