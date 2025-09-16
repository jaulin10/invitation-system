// ================================
// 🔧 CONFIGURATION
// ================================

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx7L0HpMaPTD1sm_m8bubhO_FYky2RdABbRCzlMQFVH5H7i_UgWbxAzzcOX1ckpaGyQrQ/exec";

// ================================
// 🎊 ANIMATION DES CONFETTIS MASCULINS
// ================================

function initMasculineConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const confettiArray = [];
  const masculineColors = [
    "#1a237e",
    "#3f51b5",
    "#5c6bc0",
    "#7986cb",
    "#ff9800",
    "#ffc107",
    "#ffeb3b",
    "#fff59d",
    "#37474f",
    "#546e7a",
    "#78909c",
    "#90a4ae",
    "#455a64",
    "#263238",
  ];

  const shapes = ["square", "diamond", "triangle", "hexagon", "circle"];

  class MasculineConfetti {
    constructor() {
      this.reset();
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
      this.sparkle = Math.random() > 0.7;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * 8 + 4;
      this.color =
        masculineColors[Math.floor(Math.random() * masculineColors.length)];
      this.speed = Math.random() * 1.5 + 0.8;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 4;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.sway = Math.random() * 1.5 + 0.8;
      this.swayOffset = Math.random() * Math.PI * 2;
    }

    update() {
      this.y += this.speed;
      this.rotation += this.rotationSpeed;
      this.swayOffset += 0.015;

      this.x += Math.sin(this.swayOffset) * this.sway;

      if (this.sparkle) {
        this.opacity = 0.4 + 0.4 * Math.sin(Date.now() * 0.006 + this.x);
      }

      if (this.y > canvas.height + this.size) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;

      switch (this.shape) {
        case "square":
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
          break;
        case "diamond":
          this.drawDiamond(ctx, 0, 0, this.size / 2);
          break;
        case "triangle":
          this.drawTriangle(ctx, 0, 0, this.size / 2);
          break;
        case "hexagon":
          this.drawHexagon(ctx, 0, 0, this.size / 2);
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();
    }

    drawDiamond(ctx, x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      ctx.fill();
    }

    drawTriangle(ctx, x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x - size, y + size);
      ctx.closePath();
      ctx.fill();
    }

    drawHexagon(ctx, x, y, size) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Créer des confettis masculins sophistiqués
  for (let i = 0; i < 80; i++) {
    confettiArray.push(new MasculineConfetti());
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiArray.forEach((confetti) => {
      confetti.update();
      confetti.draw();
    });

    requestAnimationFrame(animateConfetti);
  }

  animateConfetti();
}

// ================================
// 📊 CHARGEMENT DES DONNÉES
// ================================

function loadInvitationData() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    const savedData = localStorage.getItem(`invitation_${code}`);

    if (savedData) {
      const data = JSON.parse(savedData);
      populateInvitation(data);
    } else {
      showMessage(
        "⚠️ Invitation data not found. Showing default information.",
        "info"
      );
    }
  } else {
    console.log("No invitation code provided, using default data");
  }
}

function populateInvitation(data) {
  // Mettre à jour les informations de l'invité
  document.getElementById("guestName").textContent = data.guestName || "Guest";
  document.getElementById("guestAge").textContent = `${
    data.guestAge || 30
  }th birthday`;

  // Mettre à jour les détails de l'événement
  if (data.eventDate) {
    try {
      const date = new Date(data.eventDate);
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      document.getElementById("eventDate").textContent =
        date.toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Error formatting date:", error);
    }
  }

  document.getElementById("eventTime").textContent =
    data.eventTime || "Time TBA";
  document.getElementById("eventAddress").textContent =
    data.eventAddress || "Address TBA";
  document.getElementById("contactPhone").textContent =
    data.contactPhone || "Phone TBA";
  document.getElementById("eventTheme").textContent =
    data.themeOption || "Smart Casual";

  // Footer
  document.getElementById("footerTitle").textContent = `${
    data.guestName || "Guest"
  }'s ${data.guestAge || 30}th Birthday`;
  document.getElementById("footerAddress").textContent =
    data.eventAddress || "Address TBA";
  document.getElementById("footerPhone").textContent =
    data.contactPhone || "Phone TBA";

  // Message spécial si disponible
  if (data.specialMessage) {
    document.getElementById("invitationDescription").innerHTML =
      data.specialMessage;
  }
}

// ================================
// 📝 GESTION DU FORMULAIRE RSVP
// ================================

function initRSVPForm() {
  const presentRadio = document.getElementById("present");
  const absentRadio = document.getElementById("absent");
  const presentForm = document.getElementById("presentForm");
  const absentForm = document.getElementById("absentForm");
  const giftYesRadio = document.getElementById("giftYes");
  const giftNoRadio = document.getElementById("giftNo");
  const giftDetails = document.getElementById("giftDetails");

  // Gestion présent/absent
  presentRadio.addEventListener("change", function () {
    if (this.checked) {
      presentForm.classList.remove("hidden");
      absentForm.classList.add("hidden");
      setRequiredFields("present");
    }
  });

  absentRadio.addEventListener("change", function () {
    if (this.checked) {
      absentForm.classList.remove("hidden");
      presentForm.classList.add("hidden");
      setRequiredFields("absent");
    }
  });

  // Gestion des cadeaux
  if (giftYesRadio && giftNoRadio) {
    giftYesRadio.addEventListener("change", function () {
      if (this.checked) {
        giftDetails.classList.remove("hidden");
        document.getElementById("giftType").setAttribute("required", "");
      }
    });

    giftNoRadio.addEventListener("change", function () {
      if (this.checked) {
        giftDetails.classList.add("hidden");
        document.getElementById("giftType").removeAttribute("required");
        document.getElementById("giftType").value = "";
      }
    });
  }
}

function setRequiredFields(type) {
  const presentFields = ["attendeeName"];
  const absentFields = ["attendeeNameAbsent", "absenceReason"];

  if (type === "present") {
    presentFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) field.setAttribute("required", "");
    });
    absentFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) field.removeAttribute("required");
    });
  } else {
    absentFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) field.setAttribute("required", "");
    });
    presentFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) field.removeAttribute("required");
    });
  }
}

// ================================
// 📨 SOUMISSION DU FORMULAIRE
// ================================

function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const originalText = submitBtn.innerHTML;

  // État de chargement
  submitBtn.disabled = true;
  submitBtn.innerHTML = "🎯 Sending your response...";

  const formData = collectFormData();

  if (!formData) {
    showMessage("❌ Please fill in all required fields.", "error");
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    return;
  }

  // Ajout des métadonnées
  const urlParams = new URLSearchParams(window.location.search);
  formData.invitationCode = urlParams.get("code") || "DIRECT";
  formData.theme = "adult-male";
  formData.timestamp = new Date().toISOString();

  // Envoi des données
  submitToGoogleScript(formData)
    .then(() => {
      showMessage(
        "🎯 Thank you! Your response has been recorded! 🏆",
        "success"
      );
      document.getElementById("rsvpForm").style.opacity = "0.5";
      document.getElementById("rsvpForm").style.pointerEvents = "none";
      triggerMasculineCelebration();
    })
    .catch((error) => {
      console.error("Submission error:", error);
      showMessage(
        "🎯 Thank you! Your response has been received! 🥂",
        "success"
      );
      triggerMasculineCelebration();
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    });
}

function collectFormData() {
  const presenceElement = document.querySelector(
    'input[name="presence"]:checked'
  );
  if (!presenceElement) return null;

  const presence = presenceElement.value;
  let formData = { presence };

  if (presence === "present") {
    const name = document.getElementById("attendeeName").value.trim();
    if (!name) return null;

    formData = {
      ...formData,
      guestName: name,
      email: document.getElementById("attendeeEmail").value.trim() || "",
      guestCount: document.getElementById("guestCount").value || "1",
      dietaryRequirements:
        document.getElementById("dietaryRequirements").value.trim() || "",
      specialMessage:
        document.getElementById("specialMessage").value.trim() || "",
      absenceReason: "",
      gift: "",
      giftType: "",
    };
  } else {
    const name = document.getElementById("attendeeNameAbsent").value.trim();
    const reason = document.getElementById("absenceReason").value.trim();
    if (!name || !reason) return null;

    const giftChoice = document.querySelector('input[name="gift"]:checked');
    const giftValue = giftChoice ? giftChoice.value : "";
    const giftTypeValue =
      giftValue === "yes"
        ? document.getElementById("giftType").value.trim()
        : "";

    formData = {
      ...formData,
      guestName: name,
      email: document.getElementById("attendeeEmailAbsent").value.trim() || "",
      guestCount: "0",
      dietaryRequirements: "",
      specialMessage: "",
      absenceReason: reason,
      gift: giftValue,
      giftType: giftTypeValue,
    };
  }

  return formData;
}

function submitToGoogleScript(data) {
  const params = new URLSearchParams();
  Object.keys(data).forEach((key) => {
    params.append(key, data[key]);
  });

  return fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
}

function triggerMasculineCelebration() {
  const celebration = document.createElement("div");
  celebration.innerHTML = "🏆🎯🥂⚡🎩";
  celebration.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 3.5rem;
        z-index: 10000;
        animation: masculineCelebration 3s ease-out forwards;
        pointer-events: none;
    `;

  const style = document.createElement("style");
  style.textContent = `
        @keyframes masculineCelebration {
            0% { 
                transform: translate(-50%, -50%) scale(0) rotate(0deg); 
                opacity: 0; 
                filter: hue-rotate(0deg);
            }
            30% { 
                transform: translate(-50%, -50%) scale(1.3) rotate(180deg); 
                opacity: 1; 
                filter: hue-rotate(90deg);
            }
            70% { 
                transform: translate(-50%, -50%) scale(1.1) rotate(360deg); 
                opacity: 1; 
                filter: hue-rotate(180deg);
            }
            100% { 
                transform: translate(-50%, -50%) scale(0) rotate(540deg); 
                opacity: 0; 
                filter: hue-rotate(270deg);
            }
        }
    `;

  document.head.appendChild(style);
  document.body.appendChild(celebration);

  setTimeout(() => {
    document.body.removeChild(celebration);
    document.head.removeChild(style);
  }, 3000);
}

// ================================
// 🛠️ UTILITAIRES
// ================================

function showMessage(text, type = "info") {
  const container = document.getElementById("messageContainer");
  const messageId = "msg_" + Date.now();

  container.innerHTML = `<div class="message ${type}" id="${messageId}">${text}</div>`;

  setTimeout(() => {
    const msg = document.getElementById(messageId);
    if (msg) {
      msg.style.animation = "slideIn 0.4s ease-out reverse";
      setTimeout(() => msg.remove(), 400);
    }
  }, 8000);
}

function addVisualEffects() {
  const interactiveElements = document.querySelectorAll(
    ".radio-group, input, textarea, button"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", function () {
      if (!this.disabled) {
        this.style.transform = "translateY(-2px) scale(1.02)";
      }
    });

    element.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  const focusElements = document.querySelectorAll("input, textarea");

  focusElements.forEach((element) => {
    element.addEventListener("focus", function () {
      this.style.boxShadow = "0 0 20px rgba(26, 35, 126, 0.4)";
      addProfessionalEffect(this);
    });

    element.addEventListener("blur", function () {
      this.style.boxShadow = "";
      removeProfessionalEffect();
    });
  });
}

function addProfessionalEffect(element) {
  if (element.querySelector(".professional-effects")) return;

  const effects = document.createElement("div");
  effects.className = "professional-effects";
  effects.innerHTML = "⚡🎯🏆";
  effects.style.cssText = `
        position: absolute;
        top: -10px;
        right: -10px;
        font-size: 12px;
        animation: professionalFloat 2s ease-in-out infinite;
        pointer-events: none;
        z-index: 100;
    `;

  if (!document.getElementById("professional-styles")) {
    const style = document.createElement("style");
    style.id = "professional-styles";
    style.textContent = `
            @keyframes professionalFloat {
                0%, 100% { 
                    transform: translateY(0px) rotate(0deg) scale(0.8); 
                    opacity: 0.6; 
                }
                50% { 
                    transform: translateY(-8px) rotate(90deg) scale(1.2); 
                    opacity: 1; 
                }
            }
        `;
    document.head.appendChild(style);
  }

  element.style.position = "relative";
  element.appendChild(effects);
}

function removeProfessionalEffect() {
  const effects = document.querySelectorAll(".professional-effects");
  effects.forEach((effect) => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect);
    }
  });
}

// ================================
// 🚀 INITIALISATION
// ================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🎩 Birthday Invitation - Male Adult Theme Loaded");

  // Charger les données de l'invitation
  loadInvitationData();

  // Initialiser les confettis
  initMasculineConfetti();

  // Initialiser le formulaire RSVP
  initRSVPForm();

  // Gestion de la soumission
  document
    .getElementById("rsvpForm")
    .addEventListener("submit", handleFormSubmit);

  // Ajouter les effets visuels
  addVisualEffects();

  // Message de bienvenue après un délai
  setTimeout(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      console.log(`Invitation loaded with code: ${code}`);
    }
  }, 1000);
});

// ================================
// 🎭 EASTER EGGS POUR LES INVITÉS
// ================================

let photoClickCount = 0;
document.addEventListener("DOMContentLoaded", function () {
  const photo = document.getElementById("guestPhoto");

  photo.addEventListener("click", function () {
    photoClickCount++;

    if (photoClickCount === 3) {
      this.style.transform = "scale(1.1) rotate(5deg)";
      this.style.filter = "brightness(1.1) saturate(1.3)";
      showMessage("🎯 Nice! You found the secret! Keep going! ⚡", "success");
      createProfessionalEffect();
    } else if (photoClickCount === 7) {
      this.style.animation = "rainbow-pulse 2s ease-in-out infinite";
      this.style.border = "6px solid transparent";
      this.style.backgroundImage =
        "linear-gradient(white, white), linear-gradient(45deg, #1a237e, #3f51b5, #ff9800, #ffc107, #37474f, #546e7a)";
      this.style.backgroundOrigin = "border-box";
      this.style.backgroundClip = "content-box, border-box";

      showMessage(
        "🏆 CHAMPION MODE ACTIVATED! You are absolutely legendary! ⚡",
        "success"
      );

      const style = document.createElement("style");
      style.textContent = `
                @keyframes rainbow-pulse {
                    0%, 100% { filter: hue-rotate(0deg) brightness(1); }
                    25% { filter: hue-rotate(90deg) brightness(1.1); }
                    50% { filter: hue-rotate(180deg) brightness(1.2); }
                    75% { filter: hue-rotate(270deg) brightness(1.1); }
                }
            `;
      document.head.appendChild(style);
    }
  });
});

function createProfessionalEffect() {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const effect = document.createElement("div");
      effect.innerHTML = "⚡";
      effect.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                font-size: 25px;
                z-index: 1000;
                animation: professionalFly 4s ease-out forwards;
                pointer-events: none;
            `;

      const randomX = Math.random() * 400 - 200;
      const randomY = Math.random() * 400 - 200;

      const style = document.createElement("style");
      style.textContent = `
                @keyframes professionalFly {
                    0% { 
                        transform: translate(-50%, -50%) rotate(0deg) scale(1); 
                        opacity: 1; 
                    }
                    50% {
                        transform: translate(${randomX / 2}px, ${
        randomY / 2
      }px) rotate(180deg) scale(1.2);
                        opacity: 0.8;
                    }
                    100% { 
                        transform: translate(${randomX}px, ${randomY}px) rotate(360deg) scale(0.8); 
                        opacity: 0; 
                    }
                }
            `;

      if (!document.querySelector("style[data-professional-" + i + "]")) {
        style.setAttribute("data-professional-" + i, "true");
        document.head.appendChild(style);
      }

      document.body.appendChild(effect);

      setTimeout(() => {
        if (effect.parentNode) {
          effect.parentNode.removeChild(effect);
        }
      }, 4000);
    }, i * 300);
  }
}

// ================================
// 📱 OPTIMISATIONS MOBILES
// ================================

function initMobileOptimizations() {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    document.body.classList.add("mobile");

    const style = document.createElement("style");
    style.textContent = `
            .mobile .invitation,
            .mobile .rsvp {
                margin: 15px auto;
                padding: 25px 20px;
            }
            
            .mobile .radio-group {
                padding: 15px 20px;
                margin-bottom: 10px;
            }
            
            .mobile .submit-btn {
                padding: 18px 0;
                font-size: 1.2rem;
            }
            
            .mobile input,
            .mobile textarea {
                font-size: 16px; /* Évite le zoom sur iOS */
            }
        `;
    document.head.appendChild(style);
  }
}

document.addEventListener("DOMContentLoaded", initMobileOptimizations);
