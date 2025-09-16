// script.js - Version dédiée FEMME ADULTE

// ================================
// 👗 CONFIGURATION THÈME FEMME
// ================================

const FEMALE_ADULT_CONFIG = {
  ageRange: { min: 18, max: 100 },
  defaultAge: 28,
  milestones: {
    18: "Blossoming into Adulthood",
    21: "Cheers to Freedom",
    25: "Quarter Century Queen",
    30: "Flirty Thirty",
    35: "Thriving Thirty-Five",
    40: "Fabulous at Forty",
    50: "Fifty & Fabulous",
    60: "Sensational Sixty",
    65: "Graceful & Golden",
    70: "Platinum Goddess",
  },
  titles: {
    18: "✨ 18th Birthday Celebration ✨",
    21: "🍾 21st Birthday Bash 🍾",
    25: "💎 Quarter Century Queen 💎",
    30: "🌟 Flirty Thirty Party 🌟",
    35: "💖 Thriving Thirty-Five 💖",
    40: "👑 Fabulous at Forty 👑",
    50: "🌺 Fifty & Fabulous 🌺",
    60: "✨ Sensational Sixty ✨",
    default: "✨ Birthday Celebration ✨",
  },
  descriptions: {
    18: "Celebrating the beginning of your amazing journey!<br />Here's to all the adventures ahead! ✨",
    21: "Finally legal everywhere!<br />Time to celebrate in style! 🍾",
    25: "A quarter century of fabulousness!<br />You're just getting started! 💎",
    30: "Welcome to your flirty thirties!<br />The best decade is just beginning! 🌟",
    35: "Thriving, glowing, and absolutely stunning!<br />Here's to your continued success! 💖",
    40: "Life begins at forty, and you're proof!<br />Fabulous, fierce, and fantastic! 👑",
    50: "Fifty years of grace, beauty, and wisdom!<br />You're aging like fine wine! 🌺",
    60: "Six decades of elegance and achievement!<br />Here's to many more beautiful years! ✨",
    default:
      "Another year of beauty and grace!<br />Let's celebrate your special day! 💕",
  },
  themes: {
    elegant: {
      name: "Elegant & Chic",
      description: "Sophisticated and timeless elegance",
      colors: ["#8e24aa", "#ba68c8", "#ffffff"],
    },
    glamorous: {
      name: "Glamorous Night",
      description: "Sparkle and shine like the star you are",
      colors: ["#ffc107", "#ffeb3b", "#fff8e1"],
    },
    "garden-party": {
      name: "Garden Party",
      description: "Fresh, natural, and beautifully serene",
      colors: ["#4caf50", "#81c784", "#f1f8e9"],
    },
    cocktail: {
      name: "Cocktail Party",
      description: "Chic drinks and sophisticated vibes",
      colors: ["#e91e63", "#f48fb1", "#fce4ec"],
    },
    "spa-day": {
      name: "Spa & Wellness",
      description: "Relaxing, rejuvenating, and peaceful",
      colors: ["#00bcd4", "#4dd0e1", "#e8f5e8"],
    },
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
const themeSelect = document.getElementById("theme");

// Éléments d'affichage
const invitationTitle = document.getElementById("invitationTitle");
const invitationSubtitle = document.getElementById("invitationSubtitle");
const invitationDescription = document.getElementById("invitationDescription");
const displayName = document.getElementById("displayName");
const displayAge = document.getElementById("displayAge");
const displayDate = document.getElementById("displayDate");
const displayTime = document.getElementById("displayTime");
const displayAddress = document.getElementById("displayAddress");
const displayTheme = document.getElementById("displayTheme");
const footerTitle = document.getElementById("footerTitle");
const footerAddress = document.getElementById("footerAddress");
const footerPhone = document.getElementById("footerPhone");
const footerTheme = document.getElementById("footerTheme");

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
  const name = guestNameInput.value.trim() || "Beautiful Soul";
  const age = parseInt(guestAgeInput.value) || 28;
  const date = eventDateInput.value;
  const time = eventTimeInput.value.trim();
  const address = eventAddressInput.value.trim();
  const phone = contactPhoneInput.value.trim();
  const selectedTheme = themeSelect.value;

  // Validation de l'âge pour le thème adulte
  if (age < FEMALE_ADULT_CONFIG.ageRange.min) {
    guestAgeInput.value = FEMALE_ADULT_CONFIG.ageRange.min;
    showMessage(
      `Minimum age for adult theme is ${FEMALE_ADULT_CONFIG.ageRange.min}`,
      "warning"
    );
    return;
  }

  // Mettre à jour le titre selon l'âge
  const title =
    FEMALE_ADULT_CONFIG.titles[age] || FEMALE_ADULT_CONFIG.titles.default;
  invitationTitle.innerHTML = title;

  // Mettre à jour le sous-titre
  const ageText = getAgeText(age);
  invitationSubtitle.innerHTML = `Join us in celebrating <span class="name">${name}</span>'s <span class="age">${ageText}</span>!`;

  // Mettre à jour la description selon l'âge
  const description =
    FEMALE_ADULT_CONFIG.descriptions[age] ||
    FEMALE_ADULT_CONFIG.descriptions.default;
  invitationDescription.innerHTML = description;

  // Mettre à jour les éléments d'affichage
  displayName.textContent = name;
  displayAge.textContent = ageText;
  displayTime.textContent = time || "Time to be announced";
  displayAddress.textContent = address || "Address to be announced";

  // Thème
  const themeInfo = FEMALE_ADULT_CONFIG.themes[selectedTheme];
  displayTheme.textContent = themeInfo ? themeInfo.name : selectedTheme;

  // Formater et afficher la date
  formatAndDisplayDate(date);

  // Mettre à jour le footer
  const footerAgeText = getFooterAgeText(age);
  footerTitle.textContent = `${name}'s ${footerAgeText} Birthday`;
  footerAddress.textContent = address || "Address to be announced";
  footerPhone.textContent = phone || "Phone to be announced";
  footerTheme.textContent = themeInfo ? themeInfo.name : selectedTheme;

  // Appliquer le thème visuel
  applyThemeStyles(selectedTheme);

  // Ajouter des effets visuels selon l'âge
  addAgeSpecificEffects(age);
}

function getAgeText(age) {
  // Milestone special ou âge standard avec une touche féminine
  if (FEMALE_ADULT_CONFIG.milestones[age]) {
    return `${age}th birthday - ${FEMALE_ADULT_CONFIG.milestones[age]}`;
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

function applyThemeStyles(selectedTheme) {
  // Retirer les anciennes classes de thème
  document.body.classList.remove(
    "theme-elegant",
    "theme-glamorous",
    "theme-garden-party",
    "theme-cocktail",
    "theme-spa"
  );

  // Ajouter la nouvelle classe de thème
  document.body.classList.add(`theme-${selectedTheme}`);

  // Ajuster les couleurs des ballons selon le thème
  adjustBalloonsForTheme(selectedTheme);
}

function addAgeSpecificEffects(age) {
  // Effets spéciaux selon les tranches d'âge
  const invitation = document.querySelector(".invitation");
  invitation.classList.remove(
    "age-young",
    "age-prime",
    "age-mature",
    "age-golden"
  );

  if (age >= 18 && age < 30) {
    invitation.classList.add("age-young");
  } else if (age >= 30 && age < 45) {
    invitation.classList.add("age-prime");
  } else if (age >= 45 && age < 65) {
    invitation.classList.add("age-mature");
  } else {
    invitation.classList.add("age-golden");
  }
}

function adjustBalloonsForTheme(selectedTheme) {
  const balloons = document.querySelectorAll(".balloon");
  const themeInfo = FEMALE_ADULT_CONFIG.themes[selectedTheme];

  if (themeInfo && themeInfo.colors) {
    const colors = themeInfo.colors;
    balloons.forEach((balloon, index) => {
      balloon.style.background = colors[index % colors.length];
    });
  }
}

// ================================
// 🎊 ANIMATION DES CONFETTIS FÉMININS
// ================================

function initFeminineConfetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const confettiArray = [];
  const feminineColors = [
    "#8e24aa",
    "#ba68c8",
    "#ce93d8",
    "#e1bee7",
    "#ffc107",
    "#ffeb3b",
    "#fff59d",
    "#fff9c4",
    "#e91e63",
    "#f48fb1",
    "#f8bbd9",
    "#fce4ec",
    "#9c27b0",
    "#ab47bc",
    "#d1c4e9",
    "#ede7f6",
  ];

  const shapes = ["heart", "flower", "butterfly", "star", "circle"];

  class FeminineConfetti {
    constructor() {
      this.reset();
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
      this.sparkle = Math.random() > 0.6; // 40% chance de scintiller
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * 8 + 4;
      this.color =
        feminineColors[Math.floor(Math.random() * feminineColors.length)];
      this.speed = Math.random() * 1.8 + 0.8; // Vitesse gracieuse
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 5;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.sway = Math.random() * 2 + 1; // Mouvement de balancement
      this.swayOffset = Math.random() * Math.PI * 2;
    }

    update() {
      this.y += this.speed;
      this.rotation += this.rotationSpeed;
      this.swayOffset += 0.02;

      // Mouvement de balancement gracieux
      this.x += Math.sin(this.swayOffset) * this.sway;

      // Effet de scintillement
      if (this.sparkle) {
        this.opacity = 0.4 + 0.4 * Math.sin(Date.now() * 0.008 + this.x);
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
        case "heart":
          this.drawHeart(ctx, 0, 0, this.size / 2);
          break;

        case "flower":
          this.drawFlower(ctx, 0, 0, this.size / 2);
          break;

        case "butterfly":
          this.drawButterfly(ctx, 0, 0, this.size / 2);
          break;

        case "star":
          this.drawStar(ctx, 0, 0, this.size / 2, this.size / 4, 5);
          break;

        case "circle":
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();
    }

    drawHeart(ctx, x, y, size) {
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      // Courbe gauche
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
      // Courbe droite
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

    drawFlower(ctx, x, y, size) {
      const petals = 6;
      for (let i = 0; i < petals; i++) {
        const angle = (i * Math.PI * 2) / petals;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.6, size * 0.3, size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Centre de la fleur
      ctx.beginPath();
      ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }

    drawButterfly(ctx, x, y, size) {
      // Ailes supérieures
      ctx.beginPath();
      ctx.ellipse(
        x - size * 0.3,
        y - size * 0.2,
        size * 0.4,
        size * 0.6,
        0,
        0,
        Math.PI * 2
      );
      ctx.ellipse(
        x + size * 0.3,
        y - size * 0.2,
        size * 0.4,
        size * 0.6,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Ailes inférieures
      ctx.beginPath();
      ctx.ellipse(
        x - size * 0.25,
        y + size * 0.3,
        size * 0.3,
        size * 0.4,
        0,
        0,
        Math.PI * 2
      );
      ctx.ellipse(
        x + size * 0.25,
        y + size * 0.3,
        size * 0.3,
        size * 0.4,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Corps
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.1, size * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#333";
      ctx.fill();
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
  }

  // Créer des confettis féminins élégants
  for (let i = 0; i < 90; i++) {
    confettiArray.push(new FeminineConfetti());
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
      playFeminineFeedback("select");
    }
  });

  absentRadio.addEventListener("change", function () {
    if (this.checked) {
      absentForm.classList.remove("hidden");
      presentForm.classList.add("hidden");
      setRequiredFields("absent");
      playFeminineFeedback("select");
    }
  });

  // Gestion des cadeaux pour les absents
  if (giftYesRadio && giftNoRadio) {
    giftYesRadio.addEventListener("change", function () {
      if (this.checked) {
        giftDetails.classList.remove("hidden");
        document.getElementById("giftType").setAttribute("required", "");
        playFeminineFeedback("gift");
      }
    });

    giftNoRadio.addEventListener("change", function () {
      if (this.checked) {
        giftDetails.classList.add("hidden");
        document.getElementById("giftType").removeAttribute("required");
        document.getElementById("giftType").value = "";
        playFeminineFeedback("select");
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
// 🔊 FEEDBACK FÉMININ
// ================================

function playFeminineFeedback(type) {
  // Feedback visuel élégant
  const element = document.activeElement;
  if (element) {
    switch (type) {
      case "select":
        element.style.transform = "scale(1.03)";
        element.style.boxShadow = "0 0 20px rgba(186, 104, 200, 0.3)";
        setTimeout(() => {
          element.style.transform = "scale(1)";
          element.style.boxShadow = "";
        }, 200);
        break;
      case "gift":
        element.style.borderColor = "#ffc107";
        element.style.boxShadow = "0 0 15px rgba(255, 193, 7, 0.4)";
        setTimeout(() => {
          element.style.borderColor = "";
          element.style.boxShadow = "";
        }, 400);
        break;
      case "success":
        // Effet papillon
        createButterflyEffect();
        break;
    }
  }
}

function createButterflyEffect() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const butterfly = document.createElement("div");
      butterfly.innerHTML = "🦋";
      butterfly.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        font-size: 30px;
        z-index: 10000;
        animation: butterflyFly 3s ease-out forwards;
        pointer-events: none;
      `;

      const style = document.createElement("style");
      style.textContent = `
        @keyframes butterflyFly {
          0% { 
            transform: translate(-50%, -50%) rotate(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: translate(${Math.random() * 400 - 200}px, ${
        Math.random() * 400 - 200
      }px) rotate(720deg); 
            opacity: 0; 
          }
        }
      `;

      if (!document.querySelector("style[data-butterfly]")) {
        style.setAttribute("data-butterfly", "true");
        document.head.appendChild(style);
      }

      document.body.appendChild(butterfly);

      setTimeout(() => {
        if (butterfly.parentNode) {
          butterfly.parentNode.removeChild(butterfly);
        }
      }, 3000);
    }, i * 200);
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
    submitBtn.innerHTML = "✨ Sending with love...";
    submitBtn.disabled = true;

    showConfirmationMessage("💖 Sending your beautiful response...", "#8e24aa");

    const formData = collectFormData();

    if (!formData) {
      showConfirmationMessage(
        "❌ Please complete all required fields",
        "#d32f2f"
      );
      submitBtn.innerHTML = "Send Confirmation 💕";
      submitBtn.disabled = false;
      return;
    }

    console.log("👗 DONNÉES FEMME ADULTE À ENVOYER ===");
    Object.keys(formData).forEach((key) => {
      console.log(`${key}: "${formData[key]}"`);
    });

    // Ajouter des métadonnées spécifiques au thème femme adulte
    formData.theme = "adult-female";
    formData.guestAge = guestAgeInput.value;
    formData.guestName = guestNameInput.value.trim();
    formData.partyTheme = themeSelect.value;

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
        console.log("✅ Requête femme adulte envoyée avec succès");
        showConfirmationMessage(
          "✨ Thank you, beautiful! Your response has been lovingly recorded! 💕",
          "#2e7d32"
        );
        playFeminineFeedback("success");
        resetForm();
        triggerFeminineCelebration();
      })
      .catch((error) => {
        console.error("❌ Erreur:", error);
        showConfirmationMessage(
          "✨ Response sent beautifully! (Check your records) 🌸",
          "#2e7d32"
        );
        playFeminineFeedback("success");
        resetForm();
        triggerFeminineCelebration();
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
      specialRequests:
        document.getElementById("specialRequests")?.value.trim() || "",
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
      specialRequests: "",
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

function triggerFeminineCelebration() {
  const celebration = document.createElement("div");
  celebration.innerHTML = "💖✨🌸💎🦋";
  celebration.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3.5rem;
    z-index: 10000;
    animation: feminineCelebration 3s ease-out forwards;
    pointer-events: none;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes feminineCelebration {
      0% { 
        transform: translate(-50%, -50%) scale(0) rotate(0deg); 
        opacity: 0; 
        filter: hue-rotate(0deg);
      }
      30% { 
        transform: translate(-50%, -50%) scale(1.3) rotate(180deg); 
        opacity: 1; 
        filter: hue-rotate(180deg);
      }
      70% { 
        transform: translate(-50%, -50%) scale(1.1) rotate(360deg); 
        opacity: 1; 
        filter: hue-rotate(360deg);
      }
      100% { 
        transform: translate(-50%, -50%) scale(0) rotate(540deg); 
        opacity: 0; 
        filter: hue-rotate(540deg);
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

function showConfirmationMessage(message, color) {
  const confirmationMsg = document.getElementById("confirmationMsg");
  confirmationMsg.innerHTML = message;
  confirmationMsg.style.color = color;
  confirmationMsg.style.background = `${color}10`;
  confirmationMsg.style.border = `2px solid ${color}`;
  confirmationMsg.classList.remove("hidden");

  confirmationMsg.style.opacity = "0";
  confirmationMsg.style.transform = "translateY(20px) scale(0.9)";

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

  submitBtn.innerHTML = "Send Confirmation 💕";
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
    themeSelect,
  ].forEach((input) => {
    if (input) {
      input.addEventListener("input", debounce(updateContent, 300));
      input.addEventListener("change", updateContent);
    }
  });

  // Ajouter des effets visuels féminins
  addFeminineEffects();

  // Validation en temps réel de l'âge
  guestAgeInput.addEventListener("input", function () {
    const age = parseInt(this.value);
    if (age < FEMALE_ADULT_CONFIG.ageRange.min) {
      this.value = FEMALE_ADULT_CONFIG.ageRange.min;
      showMessage(
        `Minimum age for adult theme is ${FEMALE_ADULT_CONFIG.ageRange.min} years! 💕`,
        "info"
      );
    }
    if (age > FEMALE_ADULT_CONFIG.ageRange.max) {
      this.value = FEMALE_ADULT_CONFIG.ageRange.max;
    }
  });

  // Mise à jour description du thème
  themeSelect.addEventListener("change", function () {
    const themeInfo = FEMALE_ADULT_CONFIG.themes[this.value];
    if (themeInfo && themeInfo.description) {
      showMessage(`🎨 ${themeInfo.description}`, "info");
    }
  });
}

function addFeminineEffects() {
  const cards = document.querySelectorAll(".invitation, .rsvp, .config-panel");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.02)";
      this.style.filter = "brightness(1.03)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
      this.style.filter = "brightness(1)";
    });
  });

  const inputs = document.querySelectorAll("input, textarea, select");
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.style.transform = "scale(1.02)";
      this.style.boxShadow = "0 0 20px rgba(186, 104, 200, 0.3)";
      addSparkleEffect(this);
    });

    input.addEventListener("blur", function () {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "";
      removeSparkleEffect();
    });
  });

  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.05) translateY(-3px)";
      this.innerHTML = "Send with Love 💖";
    });

    submitBtn.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1) translateY(0)";
      if (!this.disabled) {
        this.innerHTML = "Send Confirmation 💕";
      }
    });
  }
}

function addSparkleEffect(element) {
  const sparkles = document.createElement("div");
  sparkles.className = "input-sparkles";
  sparkles.innerHTML = "✨💫🌟⭐";
  sparkles.style.cssText = `
    position: absolute;
    top: -15px;
    right: -15px;
    font-size: 12px;
    animation: feminineSparkle 2.5s ease-in-out infinite;
    pointer-events: none;
    z-index: 1000;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes feminineSparkle {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg) scale(0.8); 
        opacity: 0.6; 
      }
      50% { 
        transform: translateY(-8px) rotate(180deg) scale(1.2); 
        opacity: 1; 
      }
    }
  `;

  if (!document.querySelector("style[data-sparkles]")) {
    style.setAttribute("data-sparkles", "true");
    document.head.appendChild(style);
  }

  element.style.position = "relative";
  element.appendChild(sparkles);
}

function removeSparkleEffect() {
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
    info: "#8e24aa",
    warning: "#ff9800",
    error: "#f44336",
    success: "#4caf50",
  };

  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors[type]}08;
    color: ${colors[type]};
    border: 2px solid ${colors[type]};
    padding: 15px 25px;
    border-radius: 12px;
    z-index: 10000;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 6px 20px ${colors[type]}15;
    animation: messageSlideIn 0.5s ease-out;
    max-width: 90%;
    text-align: center;
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.animation = "messageSlideOut 0.5s ease-in forwards";
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 500);
  }, 4000);
}

function validateAdultForm() {
  const name = guestNameInput.value.trim();
  const age = parseInt(guestAgeInput.value);

  if (!name) {
    showMessage("Please enter the guest's name! 💖", "warning");
    guestNameInput.focus();
    return false;
  }

  if (!age || age < 18 || age > 100) {
    showMessage("Please enter a valid adult age (18-100 years)! ✨", "warning");
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
        young: "Ex: Jewelry, spa voucher, experience gift, designer item...",
        prime: "Ex: Luxury skincare, fine wine, art piece, weekend getaway...",
        mature: "Ex: Premium tea, books, comfort items, wellness retreat...",
        golden:
          "Ex: Flowers, comfort gifts, memory book, gentle experiences...",
        default: "Ex: Flowers, jewelry, spa voucher, experience gift...",
      };

      let category;
      if (age >= 18 && age < 30) category = "young";
      else if (age >= 30 && age < 45) category = "prime";
      else if (age >= 45 && age < 65) category = "mature";
      else if (age >= 65) category = "golden";
      else category = "default";

      giftPlaceholder.placeholder = giftSuggestions[category];
    }

    // Messages selon les milestones
    if (FEMALE_ADULT_CONFIG.milestones[age]) {
      showMessage(
        `💖 ${FEMALE_ADULT_CONFIG.milestones[age]} - What a beautiful milestone! ✨`,
        "success"
      );
    }
  });
}

// ================================
// 🚀 INITIALISATION PRINCIPALE
// ================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("👗 Adult Female Birthday Invitation System - Initializing...");

  initEventListeners();
  initFeminineConfetti();
  initRSVPForm();
  initFormSubmission();
  initAgeBasedCustomization();

  updateContent();

  if (!validateAdultForm()) {
    console.log("⚠️ Initial validation warnings shown");
  }

  console.log(
    "✅ Adult Female Birthday Invitation System - Ready for beautiful celebrations! ✨"
  );

  setTimeout(() => {
    showMessage(
      "Welcome to your elegant birthday planner! 💖 Customize your celebration above! ✨",
      "info"
    );
  }, 1000);
});

// ================================
// 🎭 EASTER EGGS FÉMININS
// ================================

let titleClickCount = 0;
document.addEventListener("DOMContentLoaded", function () {
  const title = document.getElementById("invitationTitle");
  if (title) {
    title.addEventListener("click", function () {
      titleClickCount++;
      if (titleClickCount === 3) {
        showMessage(
          "💎 You found the hidden elegance! Keep exploring! 🌸",
          "success"
        );
      } else if (titleClickCount === 7) {
        showMessage(
          "👑 GODDESS MODE ACTIVATED! Your invitation is now divine! ✨",
          "success"
        );
        this.style.background =
          "linear-gradient(135deg, #8e24aa, #ba68c8, #ffc107, #e91e63)";
        this.style.webkitBackgroundClip = "text";
        this.style.webkitTextFillColor = "transparent";
        this.style.animation = "rainbow-pulse 2s ease-in-out infinite";
      }
    });
  }
});

// Double-clic pour effet papillon
document.addEventListener("dblclick", function (e) {
  if (
    e.target.classList.contains("invitation") ||
    e.target.closest(".invitation")
  ) {
    createButterflyEffect();
    showMessage("🦋 Beautiful! Double-click magic activated! 💖", "success");
  }
});

/*
👗 NOTES POUR LES DÉVELOPPEURS :

Cette version est spécialement optimisée pour les anniversaires de femmes adultes avec :

✨ Fonctionnalités spéciales femme :
- Validation d'âge appropriée (18+ ans)
- Système de milestones féminins élégants
- Thèmes de fête variés et sophistiqués
- Suggestions de cadeaux par tranche d'âge
- Confettis en forme de cœurs, fleurs, papillons
- Effets visuels gracieux et élégants

💖 Personnalisation féminine :
- Palette de couleurs douces et sophistiquées
- Animations gracieuses et fluides
- Formulaire adapté aux préférences féminines
- Messages personnalisés et chaleureux
- Effets papillon et scintillements

🔧 Structure modulaire :
- Compatible avec Google Apps Script
- Code bien organisé et commenté
- Facile à personnaliser
- Responsive design élégant
- Système de thèmes intégré
*/
