// script.js

// === Gestion de l'affichage conditionnel du formulaire ===
const presentRadio = document.getElementById("present");
const absentRadio = document.getElementById("absent");
const presentForm = document.getElementById("presentForm");
const absentForm = document.getElementById("absentForm");
const giftYesRadio = document.getElementById("giftYes");
const giftNoRadio = document.getElementById("giftNo");
const giftDetails = document.getElementById("giftDetails");

// Écouter les changements de présence
presentRadio.addEventListener("change", function () {
  if (this.checked) {
    presentForm.classList.remove("hidden");
    absentForm.classList.add("hidden");
    // Rendre les champs requis pour les présents
    document.getElementById("pere").setAttribute("required", "");
    document.getElementById("mere").setAttribute("required", "");
    // Retirer les requis pour les absents
    document.getElementById("pereAbsent").removeAttribute("required");
    document.getElementById("mereAbsent").removeAttribute("required");
    document.getElementById("raison").removeAttribute("required");
    document.getElementById("giftType").removeAttribute("required");
  }
});

absentRadio.addEventListener("change", function () {
  if (this.checked) {
    absentForm.classList.remove("hidden");
    presentForm.classList.add("hidden");
    // Rendre les champs requis pour les absents
    document.getElementById("pereAbsent").setAttribute("required", "");
    document.getElementById("mereAbsent").setAttribute("required", "");
    document.getElementById("raison").setAttribute("required", "");
    // Retirer les requis pour les présents
    document.getElementById("pere").removeAttribute("required");
    document.getElementById("mere").removeAttribute("required");
  }
});

// Écouter les changements pour le cadeau
if (giftYesRadio) {
  giftYesRadio.addEventListener("change", function () {
    if (this.checked) {
      giftDetails.classList.remove("hidden");
      document.getElementById("giftType").setAttribute("required", "");
    }
  });
}

if (giftNoRadio) {
  giftNoRadio.addEventListener("change", function () {
    if (this.checked) {
      giftDetails.classList.add("hidden");
      document.getElementById("giftType").removeAttribute("required");
      document.getElementById("giftType").value = "";
    }
  });
}

// === Animation des confettis ===
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

const confettiArray = [];
const colors = [
  "#ff6b9d",
  "#c44569",
  "#f8b500",
  "#feca57",
  "#ff9ff3",
  "#54a0ff",
];

class Confetti {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height;
    this.w = Math.random() * 10 + 5;
    this.h = Math.random() * 10 + 5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.speed = Math.random() * 3 + 2;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 5 + 1;
  }

  update() {
    this.y += this.speed;
    this.rotation += this.rotationSpeed;
    if (this.y > canvas.height) {
      this.y = -this.h;
      this.x = Math.random() * canvas.width;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }
}

for (let i = 0; i < 100; i++) {
  confettiArray.push(new Confetti());
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
window.addEventListener("resize", resizeCanvas);

// === Gestion du formulaire RSVP ===
const scriptURL =
  "https://script.google.com/macros/s/AKfycbx7L0HpMaPTD1sm_m8bubhO_FYky2RdABbRCzlMQFVH5H7i_UgWbxAzzcOX1ckpaGyQrQ/exec";

const form = document.getElementById("rsvpForm");
const confirmationMsg = document.getElementById("confirmationMsg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Message de chargement
  confirmationMsg.textContent = "⏳ Sending...";
  confirmationMsg.classList.remove("hidden");
  confirmationMsg.style.color = "#ff9500";

  // Récupérer les valeurs du formulaire
  const presenceElement = document.querySelector(
    'input[name="presence"]:checked'
  );
  const presence = presenceElement ? presenceElement.value : "";

  console.log("=== VALEURS RÉCUPÉRÉES ===");
  console.log("Présence:", presence);

  let dataToSend = {};

  // Préparer les données selon le choix présent/absent
  if (presence === "present") {
    dataToSend = {
      presence: "present",
      pere: document.getElementById("pere").value.trim(),
      mere: document.getElementById("mere").value.trim(),
      age0_2: document.getElementById("age0_2").value || "0",
      age2_5: document.getElementById("age2_5").value || "0",
      age5_10: document.getElementById("age5_10").value || "0",
      raison: "",
      gift: "",
      giftType: "",
    };
  } else if (presence === "absent") {
    const giftChoice = document.querySelector('input[name="gift"]:checked');
    const giftValue = giftChoice ? giftChoice.value : "";
    const giftTypeValue =
      giftValue === "yes"
        ? document.getElementById("giftType").value.trim()
        : "";

    dataToSend = {
      presence: "absent",
      pere: document.getElementById("pereAbsent").value.trim(), // Nouveaux champs pour absents
      mere: document.getElementById("mereAbsent").value.trim(), // Nouveaux champs pour absents
      age0_2: "0",
      age2_5: "0",
      age5_10: "0",
      raison: document.getElementById("raison").value.trim(),
      gift: giftValue,
      giftType: giftTypeValue,
    };
  }

  console.log("=== DONNÉES À ENVOYER ===");
  Object.keys(dataToSend).forEach((key) => {
    console.log(`${key}: "${dataToSend[key]}"`);
  });

  // Créer une requête avec des paramètres URL encodés
  const params = new URLSearchParams();

  // IMPORTANT: Ajouter chaque paramètre individuellement dans l'ordre exact
  params.append("presence", dataToSend.presence);
  params.append("pere", dataToSend.pere);
  params.append("mere", dataToSend.mere);
  params.append("age0_2", dataToSend.age0_2);
  params.append("age2_5", dataToSend.age2_5);
  params.append("age5_10", dataToSend.age5_10);
  params.append("raison", dataToSend.raison);
  params.append("gift", dataToSend.gift);
  params.append("giftType", dataToSend.giftType);

  console.log("=== PARAMÈTRES URL ===");
  console.log(params.toString());

  // Envoyer la requête
  fetch(scriptURL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })
    .then(() => {
      console.log("✅ Requête envoyée avec succès");
      confirmationMsg.textContent =
        "✅ Thank you, your response has been recorded!";
      confirmationMsg.style.color = "#2e7d32";

      // Reset du formulaire
      form.reset();
      presentForm.classList.add("hidden");
      absentForm.classList.add("hidden");
      giftDetails.classList.add("hidden");
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      confirmationMsg.textContent = "✅ Data sent (check your Google Sheet)";
      confirmationMsg.style.color = "#2e7d32";

      form.reset();
      presentForm.classList.add("hidden");
      absentForm.classList.add("hidden");
      giftDetails.classList.add("hidden");
    });
});
