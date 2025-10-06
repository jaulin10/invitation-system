// ================================
// 🎩 CONFIGURATION GLOBALE
// ================================
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx7L0HpMaPTD1sm_m8bubhO_FYky2RdABbRCzlMQFVH5H7i_UgWbxAzzcOX1ckpaGyQrQ/exec";

// ================================
// 📦 MODULE CONFETTIS
// ================================
const ConfettiModule = (() => {
  let canvas,
    ctx,
    confettiArray = [];
  const shapes = ["square", "diamond", "triangle", "hexagon", "circle"];
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

  class Confetti {
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
      if (this.sparkle)
        this.opacity = 0.4 + 0.4 * Math.sin(Date.now() * 0.006 + this.x);
      if (this.y > canvas.height + this.size) this.reset();
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
          drawDiamond(ctx, 0, 0, this.size / 2);
          break;
        case "triangle":
          drawTriangle(ctx, 0, 0, this.size / 2);
          break;
        case "hexagon":
          drawHexagon(ctx, 0, 0, this.size / 2);
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      ctx.restore();
    }
  }

  function drawDiamond(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
  }
  function drawTriangle(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x - size, y + size);
    ctx.closePath();
    ctx.fill();
  }
  function drawHexagon(ctx, x, y, size) {
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

  function initConfetti() {
    canvas = document.getElementById("confetti");
    ctx = canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    for (let i = 0; i < 80; i++) confettiArray.push(new Confetti());
    animate();
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiArray.forEach((c) => {
      c.update();
      c.draw();
    });
    requestAnimationFrame(animate);
  }

  return { init: initConfetti };
})();

// ================================
// 📄 MODULE INVITATION
// ================================
const InvitationModule = (() => {
  function loadData(defaultData = {}) {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      populate(defaultData);
      return;
    }

    const saved = localStorage.getItem(`invitation_${code}`);
    if (saved) populate(JSON.parse(saved));
    else {
      showMessage("⚠️ Invitation not found. Showing default.", "info");
      populate(defaultData);
    }
  }

  function populate(data) {
    document.getElementById("guestName").textContent =
      data.guestName || "Guest";
    document.getElementById("guestAge").textContent = `${
      data.guestAge || 30
    }th birthday`;

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
      } catch (err) {
        console.error(err);
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

    document.getElementById("footerTitle").textContent = `${
      data.guestName || "Guest"
    }'s ${data.guestAge || 30}th Birthday`;
    document.getElementById("footerAddress").textContent =
      data.eventAddress || "Address TBA";
    document.getElementById("footerPhone").textContent =
      data.contactPhone || "Phone TBA";

    if (data.specialMessage)
      document.getElementById("invitationDescription").innerHTML =
        data.specialMessage;
  }

  return { loadData, populate };
})();

// ================================
// 📝 MODULE RSVP
// ================================
const RSVPModule = (() => {
  function init() {
    const presentRadio = document.getElementById("present");
    const absentRadio = document.getElementById("absent");
    const giftYes = document.getElementById("giftYes");
    const giftNo = document.getElementById("giftNo");

    presentRadio.addEventListener("change", () => toggleFields("present"));
    absentRadio.addEventListener("change", () => toggleFields("absent"));

    if (giftYes && giftNo) {
      giftYes.addEventListener("change", () => toggleGift(true));
      giftNo.addEventListener("change", () => toggleGift(false));
    }

    document
      .getElementById("rsvpForm")
      .addEventListener("submit", handleSubmit);
  }

  function toggleFields(type) {
    toggleVisibility(["presentForm"], type === "present");
    toggleVisibility(["absentForm"], type === "absent");
    setRequiredFields(type);
  }

  function toggleGift(show) {
    toggleVisibility(["giftDetails"], show);
    document
      .getElementById("giftType")
      [show ? "setAttribute" : "removeAttribute"]("required", "");
    if (!show) document.getElementById("giftType").value = "";
  }

  function toggleVisibility(ids, show) {
    ids.forEach((id) =>
      document.getElementById(id)?.classList.toggle("hidden", !show)
    );
  }

  function setRequiredFields(type) {
    const presentFields = ["attendeeName"];
    const absentFields = ["attendeeNameAbsent", "absenceReason"];
    presentFields.forEach((f) =>
      document
        .getElementById(f)
        ?.[type === "present" ? "setAttribute" : "removeAttribute"](
          "required",
          ""
        )
    );
    absentFields.forEach((f) =>
      document
        .getElementById(f)
        ?.[type === "absent" ? "setAttribute" : "removeAttribute"](
          "required",
          ""
        )
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("submitBtn");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "🎯 Sending your response...";
    const formData = collectFormData();
    if (!formData) {
      showMessage("❌ Please fill in all required fields.", "error");
      btn.disabled = false;
      btn.innerHTML = original;
      return;
    }
    formData.invitationCode =
      new URLSearchParams(window.location.search).get("code") || "DIRECT";
    formData.theme = "adult-male";
    formData.timestamp = new Date().toISOString();
    try {
      await submitToGoogle(formData);
      showMessage(
        "🎯 Thank you! Your response has been recorded! 🏆",
        "success"
      );
      document.getElementById("rsvpForm").style.opacity = "0.5";
      document.getElementById("rsvpForm").style.pointerEvents = "none";
      ConfettiModule.init();
    } catch (err) {
      console.error(err);
      showMessage(
        "🎯 Thank you! Your response has been received! 🥂",
        "success"
      );
      ConfettiModule.init();
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  }

  function collectFormData() {
    const presenceEl = document.querySelector('input[name="presence"]:checked');
    if (!presenceEl) return null;
    const presence = presenceEl.value;
    if (presence === "present") {
      const name = document.getElementById("attendeeName").value.trim();
      if (!name) return null;
      return {
        presence,
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
      const giftVal = giftChoice ? giftChoice.value : "";
      const giftType =
        giftVal === "yes"
          ? document.getElementById("giftType").value.trim()
          : "";
      return {
        presence,
        guestName: name,
        email:
          document.getElementById("attendeeEmailAbsent").value.trim() || "",
        guestCount: "0",
        dietaryRequirements: "",
        specialMessage: "",
        absenceReason: reason,
        gift: giftVal,
        giftType,
      };
    }
  }

  async function submitToGoogle(data) {
    const params = new URLSearchParams();
    Object.keys(data).forEach((k) => params.append(k, data[k]));
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  }

  return { init };
})();

// ================================
// 🌟 MODULE EFFETS & EASTER EGGS
// ================================
const EffectsModule = (() => {
  function init() {
    addVisualEffects();
    addPhotoEasterEggs();
  }

  function addVisualEffects() {
    document
      .querySelectorAll(".radio-group,input,textarea,button")
      .forEach((el) => {
        el.addEventListener(
          "mouseenter",
          () => (el.style.transform = "translateY(-2px) scale(1.02)")
        );
        el.addEventListener(
          "mouseleave",
          () => (el.style.transform = "translateY(0) scale(1)")
        );
      });
    document.querySelectorAll("input,textarea").forEach((el) => {
      el.addEventListener(
        "focus",
        () => (el.style.boxShadow = "0 0 20px rgba(26,35,126,0.4)")
      );
      el.addEventListener("blur", () => (el.style.boxShadow = ""));
    });
  }

  function addPhotoEasterEggs() {
    let count = 0;
    const photo = document.getElementById("photo");
    if (!photo) return;
    const easterEggs = [
      { clicks: 3, action: firstSecret },
      { clicks: 7, action: championMode },
    ];
    photo.addEventListener("click", () => {
      count++;
      easterEggs.forEach((egg) => {
        if (count === egg.clicks) egg.action();
      });
    });
    function firstSecret() {
      showMessage("🎉 Surprise! Secret unlocked!", "success");
      ConfettiModule.init();
    }
    function championMode() {
      showMessage("🏆 Champion mode activated!", "success");
      ConfettiModule.init();
    }
  }

  function showMessage(msg, type = "info") {
    const container = document.getElementById("messageContainer");
    if (!container) return;
    container.textContent = msg;
    container.className = type;
    container.style.opacity = "1";
    setTimeout(() => (container.style.opacity = "0"), 5000);
  }

  return { init, showMessage };
})();

// ================================
// 📱 MODULE MOBILE
// ================================
const MobileModule = (() => {
  function init() {
    window.addEventListener("resize", () => {
      /* additional mobile optimizations */
    });
  }
  return { init };
})();

// ================================
// 🏁 INITIALISATION
// ================================
document.addEventListener("DOMContentLoaded", () => {
  InvitationModule.loadData({
    guestName: "John Doe",
    guestAge: 30,
    eventDate: "2025-10-01",
    eventTime: "3:00 PM",
    eventAddress: "123 Party Street, Toronto, ON",
    contactPhone: "123-456-7890",
    themeOption: "Smart Casual",
    specialMessage: "Join us for a fun-filled birthday celebration!",
  });
  RSVPModule.init();
  EffectsModule.init();
  MobileModule.init();
});
