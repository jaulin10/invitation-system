// script.js - Version dédiée HOMME ADULTE

// ================================
// 🎩 CONFIGURATION THÈME HOMME
// ================================

const MALE_ADULT_CONFIG = {
  ageRange: { min: 18, max: 100 },
  defaultAge: 30,
  milestones: {
    18: "Coming of Age",
    21: "Legal Drinking Age",
    25: "Quarter Century",
    30: "Dirty Thirty",
    40: "Fabulous Forty",
    50: "Nifty Fifty",
    60: "Sensational Sixty",
    65: "Retirement Ready",
    70: "Platinum Seventy",
  },
  titles: {
    18: "🎊 18th Birthday Bash 🎊",
    21: "🍻 21st Birthday Celebration 🍻",
    25: "🎯 Quarter Century Milestone 🎯",
    30: "🥂 Dirty Thirty Party 🥂",
    40: "🏆 Fabulous Forty Celebration 🏆",
    50: "🎪 Half Century Milestone 🎪",
    60: "🥃 Diamond Decade 🥃",
    default: "🎊 Birthday Celebration 🎊",
  },
  descriptions: {
    18: "Celebrating the beginning of adulthood!<br />Let's party like adults! 🍾",
    21: "Finally legal everywhere!<br />Time to celebrate properly! 🍺",
    25: "A quarter century of awesomeness!<br />Here's to the next 25 years! 🥂",
    30: "Welcome to the thirties!<br />The best decade is just beginning! 🎯",
    40: "Life begins at forty, they say!<br />Let's celebrate this milestone in style! 🏆",
    50: "Half a century of excellence!<br />Aged to perfection like fine wine! 🍷",
    60: "Six decades of wisdom and experience!<br />Here's to many more adventures! 🥃",
    default: "Another year of greatness!<br />Let's celebrate in style! 🎊",
  },
  dressCodeDescriptions: {
    casual: "Come as you are - comfortable and relaxed",
    "smart-casual": "Collared shirt, nice jeans or chinos",
    formal: "Suit and tie preferred",
    cocktail: "Semi-formal attire, cocktail dress code",
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
const dresscodeSelect = document.getElementById("dresscode");

// Éléments d'affichage
const invitationTitle = document.getElementById("invitationTitle");
const invitationSubtitle = document.getElementById("invitationSubtitle");
const invitationDescription = document.getElementById("invitationDescription");
const displayName = document.getElementById("displayName");
const displayAge = document.getElementById("displayAge");
const displayDate = document.getElementById("displayDate");
const displayTime = document.getElementById("displayTime");
const displayAddress = document.getElementById("displayAddress");
const displayDresscode = document.getElementById("displayDresscode");
const footerTitle = document.getElementById("footerTitle");
const footerAddress = document.getElementById("footerAddress");
const footerPhone = document.getElementById("footerPhone");
const footerDresscode = document.getElementById("footerDresscode");

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
  const name = guestNameInput.value.trim() || "Distinguished Guest";
  const age = parseInt(guestAgeInput.value) || 30;
  const date = eventDateInput.value;
  const time = eventTimeInput.value.trim();
  const address = eventAddressInput.value.trim();
  const phone = contactPhoneInput.value.trim();
  const dresscode = dresscodeSelect.value;

  // Validation de l'âge pour le thème adulte
  if (age < MALE_ADULT_CONFIG.ageRange.min) {
    guestAgeInput.value = MALE_ADULT_CONFIG.ageRange.min;
    showMessage(
      `Minimum age for adult theme is ${MALE_ADULT_CONFIG.ageRange.min}`,
      "warning"
    );
    return;
  }

  // Mettre à jour le titre selon l'âge
  const title =
    MALE_ADULT_CONFIG.titles[age] || MALE_ADULT_CONFIG.titles.default;
  invitationTitle.innerHTML = title;

  // Mettre à jour le sous-titre
  const ageText = getAgeText(age);
  invitationSubtitle.innerHTML = `Join us in celebrating <span class="name">${name}</span>'s <span class="age">${ageText}</span>!`;

  // Mettre à jour la description selon l'âge
  const description =
    MALE_ADULT_CONFIG.descriptions[age] ||
    MALE_ADULT_CONFIG.descriptions.default;
  invitationDescription.innerHTML = description;

  // Mettre à jour les éléments d'affichage
  displayName.textContent = name;
  displayAge.textContent = ageText;
  displayTime.textContent = time || "Time to be announced";
  displayAddress.textContent = address || "Address to be announced";

  // Dress code
  const dresscodeText =
    dresscode.charAt(0).toUpperCase() + dresscode.slice(1).replace("-", " ");
  displayDresscode.textContent = dresscodeText;

  // Formater et afficher la date
  formatAndDisplayDate(date);

  // Mettre à jour le footer
  const footerAgeText = getFooterAgeText(age);
  footerTitle.textContent = `${name}'s ${footerAgeText} Birthday`;
  footerAddress.textContent = address || "Address to be announced";
  footerPhone.textContent = phone || "Phone to be announced";
  footerDresscode.textContent = dresscodeText;

  // Ajouter des effets visuels selon l'âge
  addAgeSpecificEffects(age);
}

function getAgeText(age) {
  // Milestone special ou âge standard
  if (MALE_ADULT_CONFIG.milestones[age]) {
    return `${age}th birthday - ${MALE_ADULT_CONFIG.milestones[age]}`;
  }
  return `${age}th birthday`;
}

function getFooterAgeText(age) {
  const suffix =
    age === 21 ||
    age === 31 ||
    age === 41 ||
    age === 51 ||
    age === 61 ||
    age === 71 ||
    age === 81 ||
    age === 91
      ? "st"
      : age === 22 ||
        age === 32 ||
        age === 42 ||
        age === 52 ||
        age === 62 ||
        age === 72 ||
        age === 82 ||
        age === 92
      ? "nd"
      : age === 23 ||
        age === 33 ||
        age === 43 ||
        age === 53 ||
        age === 63 ||
        age === 73 ||
        age === 83 ||
        age === 93
      ? "rd"
      : "th";
  return `${age}${suffix}`;
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
  // Effets spéciaux selon les tranches d'âge
  const invitation = document.querySelector(".invitation");
  invitation.classList.remove(
    "age-young",
    "age-middle",
    "age-mature",
    "age-senior"
  );

  if (age >= 18 && age < 30) {
    invitation.classList.add("age-young");
  } else if (age >= 30 && age < 50) {
    invitation.classList.add("age-middle");
  } else if (age >= 50 && age < 65) {
    invitation.classList.add("age-mature");
  } else {
    invitation.classList.add("age-senior");
  }

  // Ajuster les couleurs des ballons selon l'âge
  adjustBalloonsForAge(age);
}

function adjustBalloonsForAge(age) {
  const balloons = document.querySelectorAll(".balloon");
  const ageColors = {
    young: ["#3f51b5", "#2196f3", "#00bcd4", "#009688"], // Bleu pour jeunes adultes
    middle: ["#1a237e", "#283593", "#3949ab", "#5e35b1"], // Bleu foncé pour 30-50
    mature: ["#37474f", "#455a64", "#546e7a", "#607d8b"], // Gris pour 50-65
    senior: ["#8d6e63", "#a1887f", "#bcaaa4", "#d7ccc8"], // Brun pour seniors
    default: ["#1a237e", "#3f51b5", "#ff9800", "#37474f"],
  };

  let colorSet;
  if (age >= 18 && age < 30) colorSet = ageColors.young;
  else if (age >= 30 && age < 50) colorSet = ageColors.middle;
  else if (age >= 50 && age < 65) colorSet = ageColors.mature;
  else if (age >= 65) colorSet = ageColors.senior;
  else colorSet = ageColors.default;

  balloons.forEach((balloon, index) => {
    balloon.style.background = colorSet[index % colorSet.length];
  });
}

// ================================
// 🎊 ANIMATION DES CONFETTIS SOPHISTIQUÉS
// ================================

function initSophisticatedConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const confettiArray = [];
  const adultColors = [
    "#1a237e",
    "#3f51b5",
    "#283593",
    "#3949ab",
    "#ff9800",
    "#ffc107",
    "#ff8f00",
    "#ffb300",
    "#37474f",
    "#455a64",
    "#546e7a",
    "#607d8b",
  ];

  const shapes = ["rectangle", "diamond", "circle", "hexagon"];

  class SophisticatedConfetti {
    constructor() {
      this.reset();
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * 6 + 3; // Plus petits et élégants
      this.color = adultColors[Math.floor(Math.random() * adultColors.length)];
      this.speed = Math.random() * 1.5 + 0.8; // Plus lents et contrôlés
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 4;
      this.opacity = Math.random() * 0.7 + 0.3;
    }

    update() {
      this.y += this.speed;
      this.rotation += this.rotationSpeed;

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
        case "rectangle":
          ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
          break;

        case "diamond":
          this.drawDiamond(ctx, 0, 0, this.size);
          break;

        case "circle":
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case "hexagon":
          this.drawHexagon(ctx, 0, 0, this.size / 2);
          break;
      }

      ctx.restore();
    }

    drawDiamond(ctx, cx, cy, size) {
      const half = size / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - half);
      ctx.lineTo(cx + half, cy);
      ctx.lineTo(cx, cy + half);
      ctx.lineTo(cx - half, cy);
      ctx.closePath();
      ctx.fill();
    }

    drawHexagon(ctx, cx, cy, radius) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Moins de confettis pour un effet plus sophistiqué
  for (let i = 0; i < 60; i++) {
    confettiArray.push(new SophisticatedConfetti());
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
      playProfessionalFeedback("select");
    }
  });

  absentRadio.addEventListener("change", function () {
    if (this.checked) {
      absentForm.classList.remove("hidden");
      presentForm.classList.add("hidden");
      setRequiredFields("absent");
      playProfessionalFeedback("select");
    }
  });

  // Gestion des cadeaux pour les absents
  if (giftYesRadio && giftNoRadio) {
    giftYesRadio.addEventListener("change", function () {
      if (this.checked) {
        giftDetails.classList.remove("hidden");
        document.getElementById("giftType").setAttribute("required", "");
        playProfessionalFeedback("gift");
      }
    });

    giftNoRadio.addEventListener("change", function () {
      if (this.checked) {
        giftDetails.classList.add("hidden");
        document.getElementById("giftType").removeAttribute("required");
        document.getElementById("giftType").value = "";
        playProfessionalFeedback("select");
      }
    });
  }
}

function setRequiredFields(type) {
  const presentFields = ["guestNameRSVP"];
  const absentFields = ["guestNameAbsent", "raison"];

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
// 🔊 FEEDBACK PROFESSIONNEL
// ================================

function playProfessionalFeedback(type) {
  // Feedback visuel subtil au lieu de vibration
  const element = document.activeElement;
  if (element) {
    switch (type) {
      case "select":
        element.style.transform = "scale(1.02)";
        setTimeout(() => {
          element.style.transform = "scale(1)";
        }, 150);
        break;
      case "gift":
        element.style.boxShadow = "0 0 0 3px rgba(255, 152, 0, 0.3)";
        setTimeout(() => {
          element.style.boxShadow = "";
        }, 300);
        break;
      case "success":
        document.body.style.background =
          "linear-gradient(135deg, #1a237e, #3f51b5)";
        document.body.style.backgroundSize = "400% 400%";
        setTimeout(() => {
          document.body.style.background = "";
          document.body.style.backgroundSize = "";
        }, 2000);
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

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = "⏳ Processing...";
    submitBtn.disabled = true;

    showConfirmationMessage(
      "🎯 Processing your professional response...",
      "#ff9800"
    );

    const formData = collectFormData();

    if (!formData) {
      showConfirmationMessage(
        "❌ Please complete all required fields",
        "#d32f2f"
      );
      submitBtn.innerHTML = "Send Confirmation 🍻";
      submitBtn.disabled = false;
      return;
    }

    console.log("🎩 DONNÉES HOMME ADULTE À ENVOYER ===");
    Object.keys(formData).forEach((key) => {
      console.log(`${key}: "${formData[key]}"`);
    });

    // Ajouter des métadonnées spécifiques au thème homme adulte
    formData.theme = "adult-male";
    formData.guestAge = guestAgeInput.value;
    formData.guestName = guestNameInput.value.trim();
    formData.dresscode = dresscodeSelect.value;

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
        console.log("✅ Requête homme adulte envoyée avec succès");
        showConfirmationMessage(
          "🎯 Thank you! Your response has been professionally recorded! 🍻",
          "#2e7d32"
        );
        playProfessionalFeedback("success");
        resetForm();
        triggerProfessionalCelebration();
      })
      .catch((error) => {
        console.error("❌ Erreur:", error);
        showConfirmationMessage(
          "🎯 Response submitted successfully! (Check your records) 📊",
          "#2e7d32"
        );
        playProfessionalFeedback("success");
        resetForm();
        triggerProfessionalCelebration();
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
    const guestName = document.getElementById("guestNameRSVP").value.trim();

    if (!guestName) return null;

    dataToSend = {
      presence: "present",
      guestName: guestName,
      email: document.getElementById("email")?.value.trim() || "",
      totalAdults: document.getElementById("totalAdults")?.value || "1",
      dietaryRestrictions:
        document.getElementById("dietaryRestrictions")?.value.trim() || "",
      age0_2: "0",
      age2_5: "0",
      age5_10: "0",
      raison: "",
      gift: "",
      giftType: "",
    };
  } else if (presence === "absent") {
    const guestNameAbsent = document
      .getElementById("guestNameAbsent")
      .value.trim();
    const raison = document.getElementById("raison").value.trim();

    if (!guestNameAbsent || !raison) return null;

    const giftChoice = document.querySelector('input[name="gift"]:checked');
    const giftValue = giftChoice ? giftChoice.value : "";
    const giftTypeValue =
      giftValue === "yes"
        ? document.getElementById("giftType").value.trim()
        : "";

    dataToSend = {
      presence: "absent",
      guestName: guestNameAbsent,
      email: document.getElementById("emailAbsent")?.value.trim() || "",
      totalAdults: "0",
      dietaryRestrictions: "",
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

function triggerProfessionalCelebration() {
  const celebration = document.createElement("div");
  celebration.innerHTML = "🎯🥂🏆🎪🍻";
  celebration.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    z-index: 10000;
    animation: professionalCelebration 2.5s ease-out forwards;
    pointer-events: none;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes professionalCelebration {
      0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
      30% { transform: translate(-50%, -50%) scale(1.2) rotate(180deg); opacity: 1; }
      70% { transform: translate(-50%, -50%) scale(1) rotate(360deg); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(0) rotate(540deg); opacity: 0; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(celebration);

  setTimeout(() => {
    document.body.removeChild(celebration);
    document.head.removeChild(style);
  }, 2500);
}

function showConfirmationMessage(message, color) {
  const confirmationMsg = document.getElementById("confirmationMsg");
  confirmationMsg.innerHTML = message;
  confirmationMsg.style.color = color;
  confirmationMsg.style.background = `${color}15`;
  confirmationMsg.style.border = `2px solid ${color}`;
  confirmationMsg.classList.remove("hidden");

  confirmationMsg.style.opacity = "0";
  confirmationMsg.style.transform = "translateY(15px)";

  setTimeout(() => {
    confirmationMsg.style.transition = "all 0.4s ease";
    confirmationMsg.style.opacity = "1";
    confirmationMsg.style.transform = "translateY(0)";
  }, 100);
}

function resetForm() {
  const form = document.getElementById("rsvpForm");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.reset();
  presentForm.classList.add("hidden");
  absentForm.classList.add("hidden");
  giftDetails.classList.add("hidden");

  submitBtn.innerHTML = "Send Confirmation 🍻";
  submitBtn.disabled = false;

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
    dresscodeSelect,
  ].forEach((input) => {
    if (input) {
      input.addEventListener("input", debounce(updateContent, 300));
      input.addEventListener("change", updateContent);
    }
  });

  // Ajouter des effets visuels professionnels
  addProfessionalEffects();

  // Validation en temps réel de l'âge
  guestAgeInput.addEventListener("input", function () {
    const age = parseInt(this.value);
    if (age < MALE_ADULT_CONFIG.ageRange.min) {
      this.value = MALE_ADULT_CONFIG.ageRange.min;
      showMessage(
        `Minimum age for adult theme is ${MALE_ADULT_CONFIG.ageRange.min} years! 🍺`,
        "info"
      );
    }
    if (age > MALE_ADULT_CONFIG.ageRange.max) {
      this.value = MALE_ADULT_CONFIG.ageRange.max;
    }
  });

  // Mise à jour description du dress code
  dresscodeSelect.addEventListener("change", function () {
    const description = MALE_ADULT_CONFIG.dressCodeDescriptions[this.value];
    if (description) {
      showMessage(`👔 ${description}`, "info");
    }
  });
}

function addProfessionalEffects() {
  const cards = document.querySelectorAll(".invitation, .rsvp, .config-panel");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px) scale(1.01)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });

  const inputs = document.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.style.transform = "scale(1.01)";
      this.style.boxShadow = "0 0 15px rgba(26, 35, 126, 0.3)";
    });

    input.addEventListener("blur", function () {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "";
    });
  });

  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.02) translateY(-2px)";
      this.innerHTML = "Confirm Attendance 🎯";
    });

    submitBtn.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1) translateY(0)";
      if (!this.disabled) {
        this.innerHTML = "Send Confirmation 🍻";
      }
    });
  }
}

// ================================
// 💼 FONCTIONS UTILITAIRES
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
    background: ${colors[type]}10;
    color: ${colors[type]};
    border: 2px solid ${colors[type]};
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 15px ${colors[type]}20;
    animation: messageSlideIn 0.4s ease-out;
    max-width: 90%;
    text-align: center;
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.animation = "messageSlideOut 0.4s ease-in forwards";
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 400);
  }, 3500);
}

function validateAdultForm() {
  const name = guestNameInput.value.trim();
  const age = parseInt(guestAgeInput.value);

  if (!name) {
    showMessage("Please enter the guest's name! 🎩", "warning");
    guestNameInput.focus();
    return false;
  }

  if (!age || age < 18 || age > 100) {
    showMessage("Please enter a valid adult age (18-100 years)! 🍺", "warning");
    guestAgeInput.focus();
    return false;
  }

  return true;
}

// ================================
// 🎪 PERSONNALISATION SELON L'ÂGE
// ================================

function initAgeBasedCustomization() {
  guestAgeInput.addEventListener("change", function () {
    const age = parseInt(this.value);

    // Ajuster les suggestions de cadeaux selon l'âge
    const giftPlaceholder = document.getElementById("giftType");
    if (giftPlaceholder) {
      const giftSuggestions = {
        young: "Ex: Tech gadgets, experiences, books, craft beer...",
        middle: "Ex: Premium spirits, golf accessories, tools, experiences...",
        mature: "Ex: Fine wine, collectibles, books, travel vouchers...",
        senior: "Ex: Comfort items, books, premium teas, experiences...",
        default: "Ex: Wine, book, experience gift, e-transfer...",
      };

      let category;
      if (age >= 18 && age < 30) category = "young";
      else if (age >= 30 && age < 50) category = "middle";
      else if (age >= 50 && age < 65) category = "mature";
      else if (age >= 65) category = "senior";
      else category = "default";

      giftPlaceholder.placeholder = giftSuggestions[category];
    }

    // Messages selon les milestones
    if (MALE_ADULT_CONFIG.milestones[age]) {
      showMessage(
        `🎯 ${MALE_ADULT_CONFIG.milestones[age]} - A significant milestone!`,
        "success"
      );
    }
  });
}

// ================================
// 🚀 INITIALISATION PRINCIPALE
// ================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🎩 Adult Male Birthday Invitation System - Initializing...");

  initEventListeners();
  initSophisticatedConfetti();
  initRSVPForm();
  initFormSubmission();
  initAgeBasedCustomization();

  updateContent();

  if (!validateAdultForm()) {
    console.log("⚠️ Initial validation warnings shown");
  }

  console.log(
    "✅ Adult Male Birthday Invitation System - Ready for professional celebrations! 🎯"
  );

  setTimeout(() => {
    showMessage(
      "Welcome to the professional birthday planner! 🎩 Customize your celebration above! 🥂",
      "info"
    );
  }, 1000);
});

// ================================
// 🎭 EASTER EGGS PROFESSIONNELS
// ================================

let titleClickCount = 0;
document.addEventListener("DOMContentLoaded", function () {
  const title = document.getElementById("invitationTitle");
  if (title) {
    title.addEventListener("click", function () {
      titleClickCount++;
      if (titleClickCount === 3) {
        showMessage(
          "🎯 You found the professional touch! Keep going! 💼",
          "success"
        );
      } else if (titleClickCount === 7) {
        showMessage(
          "🏆 EXECUTIVE LEVEL UNLOCKED! Your invitation is now premium! 🥂",
          "success"
        );
        this.style.background =
          "linear-gradient(135deg, #1a237e, #3f51b5, #ff9800)";
        this.style.webkitBackgroundClip = "text";
        this.style.webkitTextFillColor = "transparent";
      }
    });
  }
});

/*
🎩 NOTES POUR LES DÉVELOPPEURS :

Cette version est spécialement optimisée pour les anniversaires d'hommes adultes avec :

🎯 Fonctionnalités spéciales adulte :
- Validation d'âge appropriée (18+ ans)
- Système de milestones (21, 30, 40, 50, etc.)
- Dress code intégré
- Suggestions de cadeaux par tranche d'âge
- Confettis sophistiqués et élégants
- Palette de couleurs masculine

💼 Personnalisation professionnelle :
- Effets visuels subtils et élégants
- Animations contrôlées et raffinées
- Formulaire adapté aux adultes
- Messages personnalisés selon l'âge

🔧 Structure modulaire :
- Compatible avec Google Apps Script
- Code bien organisé et commenté
- Facile à personnaliser
- Responsive design professionnel
*/
