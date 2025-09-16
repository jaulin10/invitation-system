// script.js - Version dédiée ENFANT

// ================================
// 🎀 CONFIGURATION THÈME ENFANT
// ================================

const CHILD_CONFIG = {
  ageRange: { min: 1, max: 15 },
  defaultAge: 1,
  pronouns: {
    1: { subject: "Our little princess", possessive: "her" },
    2: { subject: "Our little sweetheart", possessive: "her" },
    3: { subject: "Our little angel", possessive: "her" },
    4: { subject: "Our little star", possessive: "her" },
    5: { subject: "Our little sunshine", possessive: "her" },
    default: { subject: "Our dear child", possessive: "their" },
  },
  titles: {
    1: "🎉 First Birthday Party 🎉",
    2: "🎈 Second Birthday Celebration 🎈",
    3: "🎂 Third Birthday Fun 🎂",
    4: "🎪 Fourth Birthday Carnival 🎪",
    5: "🌟 Fifth Birthday Magic 🌟",
    default: "🎊 Birthday Celebration 🎊",
  },
  descriptions: {
    1: "Come celebrate this special milestone with us.<br />Already a year... how time flies! ✨",
    2: "Join us for another year of joy and laughter!<br />Our little one is growing so fast! 🌈",
    3: "Three years of pure happiness!<br />Let's celebrate our growing star! 🌟",
    4: "Four fantastic years and counting!<br />Come party with our amazing kid! 🎪",
    5: "Five years of adventures and fun!<br />Ready for school and new beginnings! 📚",
    default:
      "Another wonderful year to celebrate!<br />Come join our special day! 🎉",
  },
};

// ================================
// 🎯 VARIABLES GLOBALES
// ================================

// Éléments de configuration
const guestNameInput = document.getElementById("guestName");
const guestAgeInput = document.getElementById("guestAge");
const eventDateInput = document.getElementById("eventDate");
const eventTimeInput = document.getElementById("eventTime");
const eventAddressInput = document.getElementById("eventAddress");
const contactPhoneInput = document.getElementById("contactPhone");

// Éléments d'affichage
const invitationTitle = document.getElementById("invitationTitle");
const invitationSubtitle = document.getElementById("invitationSubtitle");
const invitationDescription = document.getElementById("invitationDescription");
const displayName = document.getElementById("displayName");
const displayAge = document.getElementById("displayAge");
const displayDate = document.getElementById("displayDate");
const displayTime = document.getElementById("displayTime");
const displayAddress = document.getElementById("displayAddress");
const footerTitle = document.getElementById("footerTitle");
const footerAddress = document.getElementById("footerAddress");
const footerPhone = document.getElementById("footerPhone");

// Éléments RSVP
const presentRadio = document.getElementById("present");
const absentRadio = document.getElementById("absent");
const presentForm = document.getElementById("presentForm");
const absentForm = document.getElementById("absentForm");
const giftYesRadio = document.getElementById("giftYes");
const giftNoRadio = document.getElementById("giftNo");
const giftDetails = document.getElementById("giftDetails");

// ================================
// 📝 MISE À JOUR DU CONTENU
// ================================

function updateContent() {
  const name = guestNameInput.value.trim() || "Little Star";
  const age = parseInt(guestAgeInput.value) || 1;
  const date = eventDateInput.value;
  const time = eventTimeInput.value.trim();
  const address = eventAddressInput.value.trim();
  const phone = contactPhoneInput.value.trim();

  // Validation de l'âge pour le thème enfant
  if (age > CHILD_CONFIG.ageRange.max) {
    guestAgeInput.value = CHILD_CONFIG.ageRange.max;
    showMessage(
      `Maximum age for children's theme is ${CHILD_CONFIG.ageRange.max}`,
      "warning"
    );
    return;
  }

  // Mettre à jour le titre selon l'âge
  const title = CHILD_CONFIG.titles[age] || CHILD_CONFIG.titles.default;
  invitationTitle.innerHTML = title;

  // Mettre à jour le sous-titre avec les pronoms appropriés
  const pronouns = CHILD_CONFIG.pronouns[age] || CHILD_CONFIG.pronouns.default;
  const ageText = getAgeText(age);
  invitationSubtitle.innerHTML = `${pronouns.subject} <span class="name">${name}</span> is blowing out ${pronouns.possessive} <span class="age">${ageText}</span>!`;

  // Mettre à jour la description selon l'âge
  const description =
    CHILD_CONFIG.descriptions[age] || CHILD_CONFIG.descriptions.default;
  invitationDescription.innerHTML = description;

  // Mettre à jour les éléments d'affichage
  displayName.textContent = name;
  displayAge.textContent = ageText;
  displayTime.textContent = time || "Time to be announced";
  displayAddress.textContent = address || "Address to be announced";

  // Formater et afficher la date
  formatAndDisplayDate(date);

  // Mettre à jour le footer
  const footerAgeText =
    age == 1 ? "1st" : age == 2 ? "2nd" : age == 3 ? "3rd" : `${age}th`;
  footerTitle.textContent = `${name}'s ${footerAgeText} Birthday`;
  footerAddress.textContent = address || "Address to be announced";
  footerPhone.textContent = phone || "Phone to be announced";

  // Ajouter des effets visuels selon l'âge
  addAgeSpecificEffects(age);
}

function getAgeText(age) {
  const ageWords = {
    1: "first candle",
    2: "second candle",
    3: "third candle",
    4: "fourth candle",
    5: "fifth candle",
  };

  return ageWords[age] || `${age} candles`;
}

function formatAndDisplayDate(date) {
  if (date) {
    try {
      const dateObj = new Date(date + "T00:00:00");
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      displayDate.textContent = dateObj.toLocaleDateString("en-US", options);
    } catch (error) {
      displayDate.textContent = "Date to be announced";
    }
  } else {
    displayDate.textContent = "Date to be announced";
  }
}

function addAgeSpecificEffects(age) {
  // Effets spéciaux selon l'âge
  const invitation = document.querySelector(".invitation");
  invitation.classList.remove(
    "age-1",
    "age-2",
    "age-3",
    "age-4",
    "age-5",
    "age-older"
  );

  if (age <= 5) {
    invitation.classList.add(`age-${age}`);
  } else {
    invitation.classList.add("age-older");
  }

  // Ajuster la couleur des ballons selon l'âge
  adjustBalloonsForAge(age);
}

function adjustBalloonsForAge(age) {
  const balloons = document.querySelectorAll(".balloon");
  const ageColors = {
    1: ["#ff69b4", "#ffb6c1", "#ffc0cb", "#ff1493"], // Rose pour 1 an
    2: ["#ff6347", "#ffa500", "#ffb347", "#ff4500"], // Orange pour 2 ans
    3: ["#32cd32", "#98fb98", "#90ee90", "#00ff00"], // Vert pour 3 ans
    4: ["#1e90ff", "#87ceeb", "#87cefa", "#0000ff"], // Bleu pour 4 ans
    5: ["#da70d6", "#dda0dd", "#ee82ee", "#ff00ff"], // Violet pour 5 ans
    default: ["#ff6b9d", "#d6336c", "#feca57", "#ff9800"], // Couleurs par défaut
  };

  const colors = ageColors[age] || ageColors.default;

  balloons.forEach((balloon, index) => {
    balloon.style.background = colors[index % colors.length];
  });
}

// ================================
// 🎊 ANIMATION DES CONFETTIS MAGIQUES
// ================================

function initMagicalConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const confettiArray = [];
  const childColors = [
    "#ff69b4",
    "#ffb6c1",
    "#ffc0cb",
    "#ff1493",
    "#ffa500",
    "#ffb347",
    "#ffd700",
    "#ff4500",
    "#32cd32",
    "#98fb98",
    "#90ee90",
    "#00ff00",
    "#1e90ff",
    "#87ceeb",
    "#87cefa",
    "#0000ff",
    "#da70d6",
    "#dda0dd",
    "#ee82ee",
    "#ff00ff",
  ];

  const shapes = ["circle", "star", "heart", "triangle", "rectangle"];

  class MagicalConfetti {
    constructor() {
      this.reset();
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * 8 + 4;
      this.color = childColors[Math.floor(Math.random() * childColors.length)];
      this.speed = Math.random() * 2 + 1;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.sparkle = Math.random() > 0.7; // 30% chance de scintiller
    }

    update() {
      this.y += this.speed;
      this.rotation += this.rotationSpeed;

      // Effet de scintillement
      if (this.sparkle) {
        this.opacity = 0.5 + 0.5 * Math.sin(Date.now() * 0.01 + this.x);
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
        case "circle":
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "star":
          this.drawStar(ctx, 0, 0, this.size / 2, this.size / 4, 5);
          break;

        case "heart":
          this.drawHeart(ctx, 0, 0, this.size / 2);
          break;

        case "triangle":
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
          break;

        default: // rectangle
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      }

      ctx.restore();
    }

    drawStar(ctx, cx, cy, outerRadius, innerRadius, spikes) {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }

      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    }

    drawHeart(ctx, x, y, size) {
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      // Left curve
      ctx.bezierCurveTo(
        x,
        y,
        x - size / 2,
        y,
        x - size / 2,
        y + topCurveHeight
      );
      ctx.bezierCurveTo(
        x - size / 2,
        y + (size + topCurveHeight) / 2,
        x,
        y + (size + topCurveHeight) / 2,
        x,
        y + size
      );
      // Right curve
      ctx.bezierCurveTo(
        x,
        y + (size + topCurveHeight) / 2,
        x + size / 2,
        y + (size + topCurveHeight) / 2,
        x + size / 2,
        y + topCurveHeight
      );
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Créer plus de confettis pour un effet magique
  for (let i = 0; i < 120; i++) {
    confettiArray.push(new MagicalConfetti());
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
// 📋 GESTION DU FORMULAIRE RSVP
// ================================

function initRSVPForm() {
  // Gestion des choix présent/absent
  presentRadio.addEventListener("change", function () {
    if (this.checked) {
      presentForm.classList.remove("hidden");
      absentForm.classList.add("hidden");
      setRequiredFields("present");
      playSound("select");
    }
  });

  absentRadio.addEventListener("change", function () {
    if (this.checked) {
      absentForm.classList.remove("hidden");
      presentForm.classList.add("hidden");
      setRequiredFields("absent");
      playSound("select");
    }
  });

  // Gestion des cadeaux pour les absents
  if (giftYesRadio && giftNoRadio) {
    giftYesRadio.addEventListener("change", function () {
      if (this.checked) {
        giftDetails.classList.remove("hidden");
        document.getElementById("giftType").setAttribute("required", "");
        playSound("gift");
      }
    });

    giftNoRadio.addEventListener("change", function () {
      if (this.checked) {
        giftDetails.classList.add("hidden");
        document.getElementById("giftType").removeAttribute("required");
        document.getElementById("giftType").value = "";
        playSound("select");
      }
    });
  }
}

function setRequiredFields(type) {
  const presentFields = ["pere", "mere"];
  const absentFields = ["pereAbsent", "mereAbsent", "raison"];

  if (type === "present") {
    presentFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) field.setAttribute("required", "");
    });

    absentFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) field.removeAttribute("required");
    });

    const giftType = document.getElementById("giftType");
    if (giftType) giftType.removeAttribute("required");
  } else if (type === "absent") {
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
// 🔊 EFFETS SONORES (simulation)
// ================================

function playSound(type) {
  // Simulation d'effets sonores via vibration sur mobile
  if (navigator.vibrate) {
    switch (type) {
      case "select":
        navigator.vibrate(50);
        break;
      case "gift":
        navigator.vibrate([50, 100, 50]);
        break;
      case "success":
        navigator.vibrate([100, 50, 100, 50, 100]);
        break;
    }
  }
}

// ================================
// 📨 SOUMISSION DU FORMULAIRE
// ================================

function initFormSubmission() {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbx7L0HpMaPTD1sm_m8bubhO_FYky2RdABbRCzlMQFVH5H7i_UgWbxAzzcOX1ckpaGyQrQ/exec";
  const form = document.getElementById("rsvpForm");
  const confirmationMsg = document.getElementById("confirmationMsg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Animation de soumission
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = "⏳ Sending magical message...";
    submitBtn.disabled = true;

    // Afficher message de chargement avec animation
    showConfirmationMessage("🌟 Sending your magical response...", "#ff9500");

    const formData = collectFormData();

    if (!formData) {
      showConfirmationMessage(
        "❌ Please fill in all required fields",
        "#d32f2f"
      );
      submitBtn.innerHTML = "Send Confirmation ✅";
      submitBtn.disabled = false;
      return;
    }

    console.log("🎀 DONNÉES ENFANT À ENVOYER ===");
    Object.keys(formData).forEach((key) => {
      console.log(`${key}: "${formData[key]}"`);
    });

    // Ajouter des métadonnées spécifiques au thème enfant
    formData.theme = "child";
    formData.childAge = guestAgeInput.value;
    formData.childName = guestNameInput.value.trim();

    const params = new URLSearchParams();
    Object.keys(formData).forEach((key) => {
      params.append(key, formData[key]);
    });

    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })
      .then(() => {
        console.log("✅ Requête enfant envoyée avec succès");
        showConfirmationMessage(
          "✨ Thank you! Your magical response has been recorded! 🎉",
          "#2e7d32"
        );
        playSound("success");
        resetForm();
        triggerCelebration();
      })
      .catch((error) => {
        console.error("❌ Erreur:", error);
        showConfirmationMessage(
          "✨ Magical message sent! (Check your Google Sheet) 🌟",
          "#2e7d32"
        );
        playSound("success");
        resetForm();
        triggerCelebration();
      });
  });
}

function collectFormData() {
  const presenceElement = document.querySelector(
    'input[name="presence"]:checked'
  );
  const presence = presenceElement ? presenceElement.value : "";

  if (!presence) return null;

  let dataToSend = {};

  if (presence === "present") {
    const pere = document.getElementById("pere").value.trim();
    const mere = document.getElementById("mere").value.trim();

    if (!pere || !mere) return null;

    dataToSend = {
      presence: "present",
      pere: pere,
      mere: mere,
      age0_2: document.getElementById("age0_2")?.value || "0",
      age2_5: document.getElementById("age2_5")?.value || "0",
      age5_10: document.getElementById("age5_10")?.value || "0",
      raison: "",
      gift: "",
      giftType: "",
    };
  } else if (presence === "absent") {
    const pereAbsent = document.getElementById("pereAbsent").value.trim();
    const mereAbsent = document.getElementById("mereAbsent").value.trim();
    const raison = document.getElementById("raison").value.trim();

    if (!pereAbsent || !mereAbsent || !raison) return null;

    const giftChoice = document.querySelector('input[name="gift"]:checked');
    const giftValue = giftChoice ? giftChoice.value : "";
    const giftTypeValue =
      giftValue === "yes"
        ? document.getElementById("giftType").value.trim()
        : "";

    dataToSend = {
      presence: "absent",
      pere: pereAbsent,
      mere: mereAbsent,
      age0_2: "0",
      age2_5: "0",
      age5_10: "0",
      raison: raison,
      gift: giftValue,
      giftType: giftTypeValue,
    };
  }

  return dataToSend;
}

function triggerCelebration() {
  // Déclencher des effets visuels de célébration
  const celebration = document.createElement("div");
  celebration.innerHTML = "🎉✨🎈🌟🎂🎁";
  celebration.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    z-index: 10000;
    animation: celebrationBounce 2s ease-out forwards;
    pointer-events: none;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes celebrationBounce {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
      50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(celebration);

  setTimeout(() => {
    document.body.removeChild(celebration);
    document.head.removeChild(style);
  }, 2000);
}

function showConfirmationMessage(message, color) {
  const confirmationMsg = document.getElementById("confirmationMsg");
  confirmationMsg.innerHTML = message;
  confirmationMsg.style.color = color;
  confirmationMsg.style.background = `${color}20`;
  confirmationMsg.style.border = `2px solid ${color}`;
  confirmationMsg.classList.remove("hidden");

  // Animation magique d'apparition
  confirmationMsg.style.opacity = "0";
  confirmationMsg.style.transform = "translateY(20px) scale(0.8)";

  setTimeout(() => {
    confirmationMsg.style.transition =
      "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    confirmationMsg.style.opacity = "1";
    confirmationMsg.style.transform = "translateY(0) scale(1)";
  }, 100);
}

function resetForm() {
  const form = document.getElementById("rsvpForm");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.reset();
  presentForm.classList.add("hidden");
  absentForm.classList.add("hidden");
  giftDetails.classList.add("hidden");

  // Restaurer le bouton
  submitBtn.innerHTML = "Send Confirmation ✅";
  submitBtn.disabled = false;

  // Retirer tous les attributs required
  const allInputs = form.querySelectorAll("input, textarea");
  allInputs.forEach((input) => {
    input.removeAttribute("required");
  });
}

// ================================
// 🎯 EVENT LISTENERS
// ================================

function initEventListeners() {
  // Écouter les changements de configuration
  [
    guestNameInput,
    guestAgeInput,
    eventDateInput,
    eventTimeInput,
    eventAddressInput,
    contactPhoneInput,
  ].forEach((input) => {
    if (input) {
      input.addEventListener("input", debounce(updateContent, 300));
      input.addEventListener("change", updateContent);
    }
  });

  // Ajouter des effets visuels magiques
  addMagicalEffects();

  // Validation en temps réel de l'âge
  guestAgeInput.addEventListener("input", function () {
    const age = parseInt(this.value);
    if (age > CHILD_CONFIG.ageRange.max) {
      this.value = CHILD_CONFIG.ageRange.max;
      showMessage(
        `Maximum age for children's theme is ${CHILD_CONFIG.ageRange.max} years old! 👶`,
        "info"
      );
    }
    if (age < CHILD_CONFIG.ageRange.min) {
      this.value = CHILD_CONFIG.ageRange.min;
    }
  });
}

function addMagicalEffects() {
  // Effet de hover magique sur les cartes
  const cards = document.querySelectorAll(".invitation, .rsvp, .config-panel");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.02)";
      this.style.filter = "brightness(1.05)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
      this.style.filter = "brightness(1)";
    });
  });

  // Effet magique sur les inputs
  const inputs = document.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.style.transform = "scale(1.03)";
      this.style.boxShadow = "0 0 20px rgba(255, 107, 157, 0.4)";

      // Ajouter des étincelles visuelles
      addSparkles(this);
    });

    input.addEventListener("blur", function () {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "";
      removeSparkles();
    });
  });

  // Effet spécial sur le bouton de soumission
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.05) translateY(-2px)";
      this.innerHTML = "Send Magical Message ✨";
    });

    submitBtn.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1) translateY(0)";
      if (!this.disabled) {
        this.innerHTML = "Send Confirmation ✅";
      }
    });
  }
}

function addSparkles(element) {
  const sparkles = document.createElement("div");
  sparkles.className = "input-sparkles";
  sparkles.innerHTML = "✨⭐🌟💫";
  sparkles.style.cssText = `
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 12px;
    animation: sparkleFloat 2s ease-in-out infinite;
    pointer-events: none;
    z-index: 1000;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes sparkleFloat {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
      50% { transform: translateY(-5px) rotate(180deg); opacity: 1; }
    }
  `;

  if (!document.querySelector("style[data-sparkles]")) {
    style.setAttribute("data-sparkles", "true");
    document.head.appendChild(style);
  }

  element.style.position = "relative";
  element.appendChild(sparkles);
}

function removeSparkles() {
  const sparkles = document.querySelectorAll(".input-sparkles");
  sparkles.forEach((sparkle) => {
    if (sparkle.parentNode) {
      sparkle.parentNode.removeChild(sparkle);
    }
  });
}

// ================================
// 💫 FONCTIONS UTILITAIRES
// ================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showMessage(message, type = "info") {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message message-${type}`;
  messageDiv.innerHTML = message;

  const colors = {
    info: "#2196f3",
    warning: "#ff9800",
    error: "#f44336",
    success: "#4caf50",
  };

  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors[type]}20;
    color: ${colors[type]};
    border: 2px solid ${colors[type]};
    padding: 15px 25px;
    border-radius: 12px;
    z-index: 10000;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 20px ${colors[type]}30;
    animation: messageSlideIn 0.5s ease-out;
    max-width: 90%;
    text-align: center;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes messageSlideIn {
      from { 
        opacity: 0; 
        transform: translateX(-50%) translateY(-20px); 
      }
      to { 
        opacity: 1; 
        transform: translateX(-50%) translateY(0); 
      }
    }
    
    @keyframes messageSlideOut {
      from { 
        opacity: 1; 
        transform: translateX(-50%) translateY(0); 
      }
      to { 
        opacity: 0; 
        transform: translateX(-50%) translateY(-20px); 
      }
    }
  `;

  if (!document.querySelector("style[data-messages]")) {
    style.setAttribute("data-messages", "true");
    document.head.appendChild(style);
  }

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.animation = "messageSlideOut 0.5s ease-in forwards";
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 500);
  }, 3000);
}

function validateChildForm() {
  const name = guestNameInput.value.trim();
  const age = parseInt(guestAgeInput.value);

  if (!name) {
    showMessage("Please enter the child's name! 👶", "warning");
    guestNameInput.focus();
    return false;
  }

  if (!age || age < 1 || age > 15) {
    showMessage(
      "Please enter a valid age between 1 and 15 years! 🎂",
      "warning"
    );
    guestAgeInput.focus();
    return false;
  }

  return true;
}

// ================================
// 🎨 PERSONNALISATION SELON L'ÂGE
// ================================

function initAgeBasedCustomization() {
  guestAgeInput.addEventListener("change", function () {
    const age = parseInt(this.value);

    // Ajuster les suggestions de cadeaux selon l'âge
    const giftPlaceholder = document.getElementById("giftType");
    if (giftPlaceholder) {
      const giftSuggestions = {
        1: "Ex: Baby toys, clothes, books, piggy bank...",
        2: "Ex: Educational toys, puzzles, picture books...",
        3: "Ex: Tricycle, art supplies, building blocks...",
        4: "Ex: Bike, board games, sports equipment...",
        5: "Ex: School supplies, science kits, musical instruments...",
        default: "Ex: Age-appropriate toys, books, clothes...",
      };

      giftPlaceholder.placeholder =
        giftSuggestions[age] || giftSuggestions.default;
    }

    // Ajuster le message selon l'âge
    const ageMessages = {
      1: "Such a special first birthday! 🍼",
      2: "Two years of joy and laughter! 🎈",
      3: "Three years of precious memories! 🌟",
      4: "Four fantastic years of growing! 🎪",
      5: "Five years and ready for big adventures! 📚",
      default: "Another wonderful year to celebrate! 🎉",
    };

    if (ageMessages[age]) {
      showMessage(ageMessages[age], "info");
    }
  });
}

// ================================
// 🚀 INITIALISATION PRINCIPALE
// ================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🎀 Children's Birthday Invitation System - Initializing...");

  // Initialiser tous les modules spécifiques aux enfants
  initEventListeners();
  initMagicalConfetti();
  initRSVPForm();
  initFormSubmission();
  initAgeBasedCustomization();

  // Mise à jour initiale du contenu
  updateContent();

  // Validation initiale
  if (!validateChildForm()) {
    console.log("⚠️ Initial validation warnings shown");
  }

  console.log(
    "✅ Children's Birthday Invitation System - Ready to create magical memories! ✨"
  );

  // Message de bienvenue magique
  setTimeout(() => {
    showMessage(
      "Welcome to the magical birthday planner! 🌟 Customize your invitation above! ✨",
      "info"
    );
  }, 1000);
});

// ================================
// 🎭 EASTER EGGS ET SURPRISES
// ================================

// Surprise pour les clicks multiples sur le titre
let titleClickCount = 0;
document.addEventListener("DOMContentLoaded", function () {
  const title = document.getElementById("invitationTitle");
  if (title) {
    title.addEventListener("click", function () {
      titleClickCount++;
      if (titleClickCount === 5) {
        showMessage(
          "🦄 You found the magic unicorn! Keep clicking for more surprises! 🌈",
          "success"
        );
        this.style.animation = "rainbow-pulse 2s ease-in-out infinite";
      } else if (titleClickCount === 10) {
        showMessage(
          "🎉 SUPER MAGIC ACTIVATED! Your invitation is now extra special! ✨",
          "success"
        );
        document.body.style.background =
          "linear-gradient(45deg, #ff6b9d, #feca57, #ff6b9d)";
        document.body.style.backgroundSize = "400% 400%";
        document.body.style.animation = "gradientShift 3s ease infinite";
      }
    });
  }
});

// Konami Code pour les développeurs
let konamiIndex = 0;
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener("keydown", function (e) {
  if (e.keyCode === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      showMessage("🎮 DEVELOPER MODE ACTIVATED! You're awesome! 🚀", "success");
      console.log("🎮 Konami Code activated! Here's some debug info:");
      console.log("Current config:", CHILD_CONFIG);
      console.log("All form data:", collectFormData());
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

// Commentaires pour les développeurs
/* 
🎀 NOTES POUR LES DÉVELOPPEURS :

Cette version est spécialement optimisée pour les anniversaires d'enfants avec :

✨ Fonctionnalités spéciales enfant :
- Limite d'âge appropriée (1-15 ans)
- Suggestions de cadeaux selon l'âge
- Effets visuels magiques et colorés
- Pronoms et descriptions adaptés à l'âge
- Confettis en forme d'étoiles, cœurs, etc.
- Sons/vibrations pour l'interactivité

🎨 Personnalisation par âge :
- Couleurs des ballons qui changent
- Titres spécifiques par âge
- Messages adaptés au développement
- Effets CSS spéciaux

🔧 Intégration facile :
- Compatible avec votre Google Apps Script existant
- Structure CSS modulaire
- JavaScript bien commenté
- Responsive design optimisé

Pour créer une nouvelle version (ex: adolescents 13-18 ans),
copiez cette structure et modifiez les constantes de configuration !
*/
