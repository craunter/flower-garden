(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);

  const landing = $("#landing");
  const enter = $("#enterGardenBtn");
  const veil = $("#transitionVeil");
  const garden = $("#garden");
  const particles = $("#gardenParticles");
  const hint = $("#gardenHint");
  const foundCount = $("#foundCount");
  const progressFill = $("#progressFill");

  const modal = $("#secretModal");
  const secretClose = $("#secretClose");
  const secretIcon = $("#secretIcon");
  const secretTitle = $("#secretTitle");
  const secretMessage = $("#secretMessage");

  const soundToggle = $("#soundToggle");
  const nightToggle = $("#nightToggle");

  const finale = $("#finale");
  const butterfly = $("#butterfly");

  const memoryModal = $("#memoryModal");
  const memoryClose = $("#memoryClose");

  const ending = $("#ending");

  /* =========================
     BACKGROUND MUSIC
  ========================= */

  const bgMusic = new Audio("assets/background-music.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.25;

  /* =========================
     INITIAL STATE
  ========================= */

  garden.hidden = true;
  finale.hidden = true;
  memoryModal.hidden = true;
  ending.hidden = true;
  modal.hidden = true;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* =========================
     SECRET MESSAGES
  ========================= */

  const secrets = [
    {
      icon: "😴",
      title: "A little sleeping legend",
      text:
        "Some people have hobbies.<br>" +
        "You somehow turned sleeping into an art form. 😴<br><br>" +
        "And honestly... I don't think anything is beating this one.",
    },

    {
      icon: "🎵",
      title: "The song I had to hide here",
      text:
        "Every garden needs a song.<br>" +
        "So I had to leave yours here too.<br><br>" +
        "<b>Ke Yo Maya Ho</b> 🎵<br><br>" +
        "Somehow, it felt right having it somewhere in your garden.",
    },

    {
      icon: "🌱",
      title: "A name that belongs here",
      text:
        "The youngest one in the family gets a name of her own.<br><br>" +
        "<b>Syani.</b><br><br>" +
        "Somehow, this little garden needed that name somewhere in it.",
    },

    {
      icon: "✦",
      title: "The answer",
      text:
        "There are many things you could say.<br><br>" +
        "But apparently, sometimes there's only one answer:<br><br>" +
        "<b>“Saying NO.”</b> 😂<br><br>" +
        "Fair enough.",
    },

    {
      icon: "✦",
      title: "One More Secret",
      text:
        "This one isn't about the past.<br><br>" +
        "Maybe there's still a story waiting to be written. ✦",
    },
  ];

  /* =========================
     FLOWER HOTSPOTS
  ========================= */

  const hotspots = [...document.querySelectorAll(".flower-hotspot")];

  let discovered = new Set(
    JSON.parse(localStorage.getItem("aarvikaGardenFound") || "[]")
      .map(Number)
      .filter((n) => n >= 0 && n < 5),
  );

  /* =========================
     SETTINGS
  ========================= */

  let soundOn = localStorage.getItem("aarvikaGardenSound") !== "off";

  let night = localStorage.getItem("aarvikaGardenNight") === "on";

  /* =========================
     AUDIO EFFECTS
  ========================= */

  let audioCtx = null;

  function initAudio() {
    if (!soundOn) return;

    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    } catch (e) {
      console.warn("Audio unavailable:", e);
    }
  }

  function tone(freq, duration = 0.12, volume = 0.018) {
    if (!soundOn) return;

    initAudio();

    if (!audioCtx) return;

    try {
      const oscillator = audioCtx.createOscillator();

      const gain = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = freq;

      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

      gain.gain.exponentialRampToValueAtTime(
        volume,
        audioCtx.currentTime + 0.018,
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + duration,
      );

      oscillator.connect(gain);
      gain.connect(audioCtx.destination);

      oscillator.start();

      oscillator.stop(audioCtx.currentTime + duration + 0.03);
    } catch (e) {}
  }

  /* =========================
     BACKGROUND MUSIC
  ========================= */

  function startMusic() {
    if (!soundOn) return;

    bgMusic.play().catch(() => {
      console.log("Music waiting for user interaction");
    });
  }

  function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  /* =========================
     SAVE PROGRESS
  ========================= */

  function save() {
    localStorage.setItem("aarvikaGardenFound", JSON.stringify([...discovered]));
  }

  /* =========================
     PARTICLES
  ========================= */

  function spawnParticles() {
    if (reduceMotion) return;

    const frag = document.createDocumentFragment();

    for (let i = 0; i < 32; i++) {
      const p = document.createElement("span");

      p.className = "particle";

      p.style.left = 2 + Math.random() * 96 + "%";

      p.style.top = 18 + Math.random() * 74 + "%";

      p.style.setProperty("--size", 1.2 + Math.random() * 2.2 + "px");

      p.style.setProperty("--duration", 10 + Math.random() * 12 + "s");

      p.style.setProperty("--delay", -Math.random() * 18 + "s");

      p.style.setProperty("--drift", -45 + Math.random() * 90 + "px");

      p.style.setProperty("--opacity", 0.18 + Math.random() * 0.45);

      frag.appendChild(p);
    }

    particles.appendChild(frag);
  }

  /* =========================
     PROGRESS
  ========================= */

  function updateProgress() {
    foundCount.textContent = discovered.size;

    progressFill.style.width = (discovered.size / 5) * 100 + "%";

    if (discovered.size === 0) {
      hint.innerHTML =
        "<div>Touch a flower</div>" +
        "<small>and see what it has to say.</small>";
    } else if (discovered.size < 5) {
      const left = 5 - discovered.size;

      hint.innerHTML =
        `<div>${left} secret${left === 1 ? "" : "s"} left to find.</div>` +
        "<small>Keep looking.</small>";
    } else {
      hint.innerHTML =
        "<div>You found all five. ✦</div>" +
        "<small>Something is waiting.</small>";
    }
  }

  /* =========================
     SECRET PARTICLE BURST
  ========================= */

  function burstNear(hotspot) {
    if (reduceMotion) return;

    const rect = hotspot.getBoundingClientRect();

    for (let i = 0; i < 16; i++) {
      const particle = document.createElement("span");

      particle.style.position = "fixed";

      particle.style.left = rect.left + rect.width / 2 + "px";

      particle.style.top = rect.top + rect.height / 2 + "px";

      particle.style.width = "4px";
      particle.style.height = "4px";

      particle.style.borderRadius = "50%";

      particle.style.background = "#f1c979";

      particle.style.boxShadow = "0 0 13px #f1c979";

      particle.style.zIndex = "70";
      particle.style.pointerEvents = "none";

      particle.style.setProperty("--dx", Math.random() * 110 - 55 + "px");

      particle.style.setProperty("--dy", -30 - Math.random() * 85 + "px");

      particle.animate(
        [
          {
            opacity: 0,
            transform: "scale(.4)",
          },

          {
            opacity: 1,
            offset: 0.18,
          },

          {
            opacity: 0,
            transform: "translate(var(--dx),var(--dy)) scale(0)",
          },
        ],
        {
          duration: 900 + Math.random() * 350,

          easing: "ease-out",
        },
      );

      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 1400);
    }
  }

  /* =========================
     REVEAL SECRET
  ========================= */

  function reveal(secretNumber, hotspot) {
    initAudio();

    tone(523, 0.11, 0.02);

    setTimeout(() => tone(659, 0.14, 0.018), 75);

    setTimeout(() => tone(784, 0.22, 0.014), 150);

    burstNear(hotspot);

    if (!discovered.has(secretNumber)) {
      discovered.add(secretNumber);

      save();

      hotspot.classList.add("is-discovered");

      updateProgress();
    }

    const secret = secrets[secretNumber];

    secretIcon.textContent = secret.icon;

    secretTitle.textContent = secret.title;

    secretMessage.innerHTML = secret.text;

    modal.hidden = false;

    hotspot.animate(
      [
        {
          transform: "scale(1)",
        },

        {
          transform: "scale(1.12)",
        },

        {
          transform: "scale(1)",
        },
      ],
      {
        duration: 650,
        easing: "cubic-bezier(.22,1,.36,1)",
      },
    );

    setTimeout(() => secretClose.focus(), 180);
  }

  /* =========================
     CLOSE SECRET
  ========================= */

  function closeSecret() {
    modal.hidden = true;

    tone(392, 0.08, 0.009);

    /*
      IMPORTANT:

      Finale does NOT start while
      the secret card is open.

      It starts only after the
      fifth message has been closed.
    */

    if (discovered.size === 5 && !finaleStarted && !gardenComplete) {
      startFinale();
    }
  }

  /* =========================
     FINALE STATE
  ========================= */

  let finaleStarted = false;

  let butterflyUsed = false;

  let finalEndingShown = false;

  const gardenComplete =
    localStorage.getItem("aarvikaGardenComplete") === "true";

  /* =========================
     START FINALE
  ========================= */

  function startFinale() {
    if (finaleStarted || gardenComplete) {
      return;
    }

    finaleStarted = true;

    setTimeout(() => {
      finale.hidden = false;

      finale.classList.add("active");

      hotspots.forEach((hotspot) => {
        if (hotspot.classList.contains("is-discovered")) {
          hotspot.classList.add("final-glow");
        }
      });

      setTimeout(() => {
        if (!butterflyUsed) {
          butterfly.classList.add("butterfly-flight");
        }
      }, 350);
    }, 700);
  }

  /* =========================
     FINAL ENDING
  ========================= */

  function showFinalEnding() {
    if (finalEndingShown) {
      return;
    }

    finalEndingShown = true;

    localStorage.setItem("aarvikaGardenComplete", "true");

    ending.hidden = false;
  }

  /* =========================
     ENTER GARDEN
  ========================= */

  enter.addEventListener("click", () => {
    initAudio();

    tone(261, 0.1, 0.015);

    setTimeout(() => tone(392, 0.16, 0.013), 90);

    enter.disabled = true;

    landing.classList.add("is-leaving");

    veil.classList.add("is-active");

    const delay = reduceMotion ? 0 : 850;

    setTimeout(() => {
      landing.hidden = true;

      garden.hidden = false;

      garden.classList.add("is-visible");

      spawnParticles();

      updateProgress();

      if (night) {
        garden.classList.add("night-mode");

        nightToggle.textContent = "☀ day mode";

        nightToggle.setAttribute("aria-pressed", "true");
      }

      /* =====================
           START MUSIC
        ===================== */

      try {
        startMusic();
      } catch (e) {
        console.warn("Music unavailable:", e);
      }

      /* =====================
           RETURNING USER
        ===================== */

      if (gardenComplete) {
        /*
            Final journey already completed.

            Do NOT:
            - show butterfly
            - show school-bunk card
            - show "Something is waiting"
            - restart finale
          */

        hint.hidden = true;

        setTimeout(() => showFinalEnding(), reduceMotion ? 250 : 900);
      } else if (discovered.size === 5) {

      /* =====================
           5/5 BUT NOT COMPLETED
        ===================== */
        /*
            User found all five
            but hasn't finished
            the finale yet.
          */

        setTimeout(() => startFinale(), 500);
      }

      setTimeout(() => veil.classList.remove("is-active"), 250);
    }, delay);
  });

  /* =========================
     FLOWER HOTSPOTS
  ========================= */

  hotspots.forEach((hotspot) => {
    hotspot.addEventListener("click", () =>
      reveal(Number(hotspot.dataset.secret), hotspot),
    );
  });

  /* =========================
     SECRET CLOSE
  ========================= */

  secretClose.addEventListener("click", closeSecret);

  document
    .querySelector(".secret-backdrop")
    .addEventListener("click", closeSecret);

  /* =========================
     ESCAPE
  ========================= */

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (!modal.hidden) {
      closeSecret();
    } else if (!memoryModal.hidden) {
      memoryModal.hidden = true;
    }
  });

  /* =========================
     SOUND TOGGLE
  ========================= */

  soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;

    localStorage.setItem("aarvikaGardenSound", soundOn ? "on" : "off");

    soundToggle.textContent = soundOn ? "◉ sound on" : "○ sound off";

    soundToggle.setAttribute("aria-pressed", String(soundOn));

    if (soundOn) {
      initAudio();

      tone(523, 0.1, 0.012);

      startMusic();
    } else {
      stopMusic();
    }
  });

  /* =========================
     NIGHT MODE
  ========================= */

  nightToggle.addEventListener("click", () => {
    night = !night;

    localStorage.setItem("aarvikaGardenNight", night ? "on" : "off");

    garden.classList.toggle("night-mode", night);

    nightToggle.textContent = night ? "☀ day mode" : "☾ night mode";

    nightToggle.setAttribute("aria-pressed", String(night));

    tone(night ? 330 : 440, 0.12, 0.01);
  });

  /* =========================
     BUTTERFLY
     ONE TAP ONLY
  ========================= */

  butterfly.addEventListener("click", () => {
    /*
        Hard one-time guard.

        Once butterfly is tapped,
        it can NEVER trigger the
        memory card again during
        this journey.
      */

    if (butterflyUsed || gardenComplete) {
      return;
    }

    butterflyUsed = true;

    butterfly.classList.remove("butterfly-flight");

    butterfly.classList.add("butterfly-used");

    butterfly.style.pointerEvents = "none";

    butterfly.setAttribute("aria-disabled", "true");

    initAudio();

    tone(784, 0.16, 0.018);

    memoryModal.hidden = false;

    setTimeout(() => memoryClose.focus(), 120);
  });

  /* =========================
     MEMORY CARD CLOSE
  ========================= */

  memoryClose.addEventListener("click", () => {
    /*
        Prevent duplicate final ending.
      */

    if (finalEndingShown) {
      return;
    }

    memoryModal.hidden = true;

    /*
        Start cinematic sunrise
        ONLY after memory card
        has been closed.
      */

    finale.classList.add("sunrise");

    tone(523, 0.18, 0.016);

    setTimeout(() => tone(659, 0.22, 0.014), 120);

    /*
        After sunrise finishes:
        show final message + save
        completed state.
      */

    setTimeout(() => {
      showFinalEnding();
    }, 5200);
  });

  /* =========================
     RESTORE DISCOVERED FLOWERS
  ========================= */

  hotspots.forEach((hotspot, index) => {
    if (discovered.has(index)) {
      hotspot.classList.add("is-discovered");
    }
  });

  /* =========================
     FINAL INITIAL UI GUARD
  ========================= */

  finale.hidden = true;

  memoryModal.hidden = true;

  ending.hidden = true;

  updateProgress();
})();
