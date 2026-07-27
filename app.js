const pages = [...document.querySelectorAll("[data-page]")];
const routeLinks = [...document.querySelectorAll("[data-route]")];
const validRoutes = new Set(pages.map((page) => page.id));
const siteHeader = document.querySelector(".nav");

window.lucide?.createIcons();

function syncHeaderTheme() {
  const heroSection = document.querySelector(".hero");
  const homePage = document.querySelector("#home");
  if (!siteHeader || !heroSection || !homePage) return;
  const heroAtTop = homePage.classList.contains("active") && window.scrollY <= 8;
  siteHeader.classList.toggle("is-hero", heroAtTop);
  document.body.classList.toggle("hero-at-top", heroAtTop);
}

function route() {
  const requestedRoute = location.hash.slice(1) || "home";
  const normalizedRoute = requestedRoute === "info" ? "home" : requestedRoute;
  const routeId = validRoutes.has(normalizedRoute) ? normalizedRoute : "home";

  pages.forEach((page) => {
    const isActive = page.id === routeId;
    page.classList.toggle("active", isActive);
    page.setAttribute("aria-hidden", String(!isActive));
  });

  routeLinks.forEach((link) => {
    const isActive = link.dataset.route === routeId;
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (requestedRoute !== routeId && requestedRoute !== "info") {
    history.replaceState(null, "", `#${routeId}`);
  }

  window.scrollTo({ top: 0, behavior: "auto" });
  syncHeaderTheme();
}

window.addEventListener("hashchange", route);
window.addEventListener("scroll", syncHeaderTheme, { passive: true });
window.addEventListener("resize", syncHeaderTheme);
route();

const typed = document.querySelector("#typed");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const countdown = document.querySelector("[data-countdown]");
const hero = document.querySelector(".hero");
const auroraCanvas = document.querySelector("[data-hero-aurora]");

if (hero && auroraCanvas) {
  const auroraContext = auroraCanvas.getContext("2d");
  const auroraPointer = {
    x: .5,
    y: .82,
    targetX: .5,
    targetY: .82,
    active: false
  };
  let auroraWidth = 0;
  let auroraHeight = 0;
  let auroraStars = [];
  let auroraFrame = 0;
  let auroraLastFrame = 0;
  let auroraVisible = true;

  function resizeAurora() {
    const rect = hero.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1);
    auroraWidth = rect.width;
    auroraHeight = rect.height;
    auroraCanvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
    auroraCanvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
    auroraContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const starCount = Math.round(Math.min(190, Math.max(90, rect.width / 8)));
    auroraStars = Array.from({ length: starCount }, (_, index) => {
      const seedX = Math.abs(Math.sin(index * 91.317 + 1.3) * 43758.5453) % 1;
      const seedY = Math.abs(Math.sin(index * 47.771 + 4.8) * 24634.6345) % 1;
      const seedSize = Math.abs(Math.sin(index * 17.113 + 8.1) * 15937.131) % 1;
      return {
        x: seedX,
        y: seedY,
        radius: .35 + seedSize * 1.15,
        alpha: .18 + seedSize * .48,
        phase: index * .73
      };
    });
  }

  function addAuroraGlow(x, y, radius, color) {
    const gradient = auroraContext.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(.46, color.replace(/[\d.]+\)$/, ".04)"));
    gradient.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
    auroraContext.fillStyle = gradient;
    auroraContext.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  function drawAurora(time = 0) {
    auroraFrame = 0;
    if (!auroraVisible || document.hidden) return;
    if (!reducedMotion && time - auroraLastFrame < 33) {
      auroraFrame = window.requestAnimationFrame(drawAurora);
      return;
    }
    auroraLastFrame = time;
    auroraContext.clearRect(0, 0, auroraWidth, auroraHeight);
    auroraPointer.x += (auroraPointer.targetX - auroraPointer.x) * .045;
    auroraPointer.y += (auroraPointer.targetY - auroraPointer.y) * .045;

    const drift = reducedMotion ? 0 : time * .000075;
    const floorY = auroraHeight * .93;
    const pointerX = auroraPointer.x * auroraWidth;
    const pointerY = Math.max(auroraHeight * .58, auroraPointer.y * auroraHeight);

    auroraContext.save();
    auroraContext.globalCompositeOperation = "lighter";
    addAuroraGlow(
      auroraWidth * (.2 + Math.sin(drift * 1.7) * .05),
      auroraHeight * .33,
      auroraWidth * .34,
      "rgba(112, 82, 178, .12)"
    );
    addAuroraGlow(
      auroraWidth * (.78 + Math.sin(drift * 1.35 + 2) * .055),
      auroraHeight * .42,
      auroraWidth * .38,
      "rgba(55, 129, 184, .1)"
    );
    addAuroraGlow(auroraWidth * (.16 + Math.sin(drift * 4) * .035), floorY, auroraWidth * .34, "rgba(236, 168, 203, .07)");
    addAuroraGlow(auroraWidth * (.39 + Math.sin(drift * 3 + 1) * .045), floorY - 8, auroraWidth * .3, "rgba(183, 180, 244, .08)");
    addAuroraGlow(auroraWidth * (.61 + Math.sin(drift * 2.6 + 2) * .04), floorY, auroraWidth * .32, "rgba(110, 197, 238, .08)");
    addAuroraGlow(auroraWidth * (.84 + Math.sin(drift * 3.4 + 3) * .035), floorY, auroraWidth * .33, "rgba(118, 220, 190, .07)");
    if (auroraPointer.active) {
      addAuroraGlow(pointerX, pointerY, Math.max(48, auroraWidth * .038), "rgba(180, 211, 255, .11)");
    }

    const band = auroraContext.createLinearGradient(0, auroraHeight * .56, 0, auroraHeight);
    band.addColorStop(0, "rgba(25, 25, 27, 0)");
    band.addColorStop(.72, "rgba(126, 157, 210, .035)");
    band.addColorStop(1, "rgba(224, 188, 222, .025)");
    auroraContext.fillStyle = band;
    auroraContext.fillRect(0, auroraHeight * .5, auroraWidth, auroraHeight * .5);
    auroraContext.restore();

    auroraContext.save();
    const parallaxX = (auroraPointer.x - .5) * 18;
    const parallaxY = (auroraPointer.y - .5) * 10;
    auroraStars.forEach((star, index) => {
      const depth = .35 + (index % 5) * .13;
      const x = star.x * auroraWidth - parallaxX * depth;
      const y = star.y * auroraHeight - parallaxY * depth;
      const twinkle = reducedMotion ? 1 : .72 + Math.sin(time * .0012 + star.phase) * .28;
      auroraContext.beginPath();
      auroraContext.arc(x, y, star.radius, 0, Math.PI * 2);
      auroraContext.fillStyle = `rgba(224, 232, 255, ${star.alpha * twinkle})`;
      auroraContext.fill();
    });

    const orbitAlpha = .055 + (auroraPointer.active ? .025 : 0);
    auroraContext.strokeStyle = `rgba(193, 184, 255, ${orbitAlpha})`;
    auroraContext.lineWidth = 1;
    auroraContext.beginPath();
    auroraContext.ellipse(
      auroraWidth * .5,
      auroraHeight * .43,
      auroraWidth * .31,
      auroraHeight * .13,
      -.15 + Math.sin(drift) * .035,
      .15,
      Math.PI * 1.72
    );
    auroraContext.stroke();
    auroraContext.restore();

    if (!reducedMotion) auroraFrame = window.requestAnimationFrame(drawAurora);
  }

  function startAurora() {
    if (auroraFrame || !auroraVisible || document.hidden) return;
    auroraFrame = window.requestAnimationFrame(drawAurora);
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    auroraPointer.targetX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    auroraPointer.targetY = Math.min(1, Math.max(.55, (event.clientY - rect.top) / rect.height));
    auroraPointer.active = true;
  });
  hero.addEventListener("pointerleave", () => {
    auroraPointer.targetX = .5;
    auroraPointer.targetY = .82;
    auroraPointer.active = false;
  });

  new ResizeObserver(resizeAurora).observe(hero);
  new IntersectionObserver(([entry]) => {
    auroraVisible = entry.isIntersecting;
    if (auroraVisible) startAurora();
  }, { threshold: .01 }).observe(hero);
  document.addEventListener("visibilitychange", startAurora);
  resizeAurora();
  startAurora();
}

if (countdown) {
  const targetTime = new Date(countdown.dataset.target).getTime();
  const canvas = countdown.querySelector("[data-dot-countdown]");
  const context = canvas.getContext("2d");
  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
  const labels = ["DAYS", "HOURS", "MINS", "SECS"];
  const palette = ["#38a9f3", "#16d5e8", "#9ae4fa", "#d3ccff", "#ffe26a", "#ffffff", "#9ec7f1"];
  let displayValue = "0:00:00:00";
  let pointer = { x: -1000, y: -1000, active: false };
  let displayWidth = 0;
  let displayHeight = 0;
  let dots = [];
  let labelCenters = [];
  let labelY = 0;
  let maskDirty = true;
  let countdownFrame = 0;
  let countdownLastFrame = 0;
  let countdownVisible = true;

  function updateCountdown() {
    const remaining = Math.max(0, targetTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };

    const nextDisplayValue = [
      String(values.days),
      String(values.hours).padStart(2, "0"),
      String(values.minutes).padStart(2, "0"),
      String(values.seconds).padStart(2, "0")
    ].join(" : ");
    if (nextDisplayValue !== displayValue) {
      displayValue = nextDisplayValue;
      maskDirty = true;
    }

    countdown.setAttribute(
      "aria-label",
      `온라인 챌린지 접수 마감까지 ${values.days}일 ${values.hours}시간 ${values.minutes}분 ${values.seconds}초`
    );

    if (remaining === 0) countdown.classList.add("is-complete");
    return remaining;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1);
    displayWidth = rect.width;
    displayHeight = rect.height;
    canvas.width = Math.round(rect.width * pixelRatio);
    canvas.height = Math.round(rect.height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    maskDirty = true;
  }

  function rebuildDotMask() {
    const labelSpace = Math.max(28, displayHeight * .15);
    const numberHeight = displayHeight - labelSpace;
    let fontSize = Math.max(44, numberHeight * .82);

    maskCanvas.width = Math.max(1, Math.ceil(displayWidth));
    maskCanvas.height = Math.max(1, Math.ceil(displayHeight));
    maskContext.clearRect(0, 0, displayWidth, displayHeight);
    maskContext.textAlign = "center";
    maskContext.textBaseline = "middle";
    maskContext.font = `700 ${fontSize}px "Open Sans", Arial, sans-serif`;

    while (maskContext.measureText(displayValue).width > displayWidth - 28 && fontSize > 28) {
      fontSize -= 2;
      maskContext.font = `700 ${fontSize}px "Open Sans", Arial, sans-serif`;
    }

    const numberCenterY = numberHeight * .49;
    maskContext.fillStyle = "#000";
    maskContext.fillText(displayValue, displayWidth / 2, numberCenterY);

    const pixels = maskContext.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    const gap = Math.max(5.2, Math.min(8, displayWidth / 132));
    dots = [];

    for (let y = gap / 2; y < numberHeight; y += gap) {
      for (let x = gap / 2; x < displayWidth; x += gap) {
        const pixelX = Math.min(maskCanvas.width - 1, Math.floor(x));
        const pixelY = Math.min(maskCanvas.height - 1, Math.floor(y));
        const alpha = pixels[(pixelY * maskCanvas.width + pixelX) * 4 + 3];
        if (alpha > 35) {
          const colorIndex = Math.abs(Math.floor(x / gap) * 17 + Math.floor(y / gap) * 31) % palette.length;
          const sizeSeed = Math.abs(Math.floor(x / gap) * 13 + Math.floor(y / gap) * 19) % 7;
          const radius = gap * (.18 + sizeSeed * .035);
          dots.push({ baseX: x, baseY: y, x, y, radius, color: palette[colorIndex] });
        }
      }
    }

    const groups = displayValue.split(":").map((group) => group.trim());
    const separatorWidth = maskContext.measureText(" : ").width;
    const groupWidths = groups.map((group) => maskContext.measureText(group).width);
    const totalWidth = groupWidths.reduce((sum, width) => sum + width, 0) + separatorWidth * 3;
    let groupCursor = (displayWidth - totalWidth) / 2;
    labelCenters = groupWidths.map((width, index) => {
      const center = groupCursor + width / 2;
      groupCursor += width + (index < groupWidths.length - 1 ? separatorWidth : 0);
      return center;
    });
    labelY = Math.min(displayHeight - 2, numberCenterY + fontSize * .55 + 17);
    maskDirty = false;
  }

  function drawCountdown(time = 0) {
    countdownFrame = 0;
    if (!countdownVisible || document.hidden) return;
    if (!reducedMotion && time - countdownLastFrame < 33) {
      countdownFrame = window.requestAnimationFrame(drawCountdown);
      return;
    }
    countdownLastFrame = time;
    if (maskDirty) rebuildDotMask();
    context.clearRect(0, 0, displayWidth, displayHeight);

    dots.forEach((dot, index) => {
      const deltaX = dot.baseX - pointer.x;
      const deltaY = dot.baseY - pointer.y;
      const distance = Math.max(1, Math.hypot(deltaX, deltaY));
      const proximity = pointer.active ? Math.max(0, 1 - distance / 105) : 0;
      const displacement = proximity * proximity * 24;
      const targetX = dot.baseX + (deltaX / distance) * displacement;
      const targetY = dot.baseY + (deltaY / distance) * displacement;
      const easing = reducedMotion ? 1 : .16;
      dot.x += (targetX - dot.x) * easing;
      dot.y += (targetY - dot.y) * easing;
      const pulse = reducedMotion ? 0 : Math.sin(time * .0022 + index * .17) * .06;
      const radius = dot.radius * (1 + pulse);

      context.beginPath();
      context.arc(dot.x, dot.y, Math.max(1.2, radius), 0, Math.PI * 2);
      context.fillStyle = dot.color;
      context.fill();
    });

    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.font = `700 ${Math.max(12, Math.min(17, displayWidth / 65))}px "Open Sans", sans-serif`;
    context.fillStyle = "rgba(255, 255, 255, .9)";
    labels.forEach((label, index) => {
      context.fillText(label, labelCenters[index], labelY);
    });

    if (!reducedMotion) countdownFrame = window.requestAnimationFrame(drawCountdown);
  }

  function startCountdown() {
    if (countdownFrame || !countdownVisible || document.hidden) return;
    countdownFrame = window.requestAnimationFrame(drawCountdown);
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
  });
  canvas.addEventListener("pointerleave", () => {
    pointer = { x: -1000, y: -1000, active: false };
  });

  new ResizeObserver(resizeCanvas).observe(canvas);
  new IntersectionObserver(([entry]) => {
    countdownVisible = entry.isIntersecting;
    if (countdownVisible) startCountdown();
  }, { threshold: .01 }).observe(countdown);
  document.addEventListener("visibilitychange", startCountdown);
  document.fonts?.ready.then(() => {
    maskDirty = true;
  });
  resizeCanvas();
  updateCountdown();
  startCountdown();
  const countdownInterval = window.setInterval(() => {
    if (updateCountdown() === 0) window.clearInterval(countdownInterval);
  }, 1000);
}

const lines = [
  "ChatGPT에게 물어보세요",
  "플레이어를 움직일 게임을 만들어볼까요?",
  "아이디어를 게임으로 만들어보세요"
];

if (typed && !reducedMotion) {
  let line = 0;
  let letter = 0;

  function type() {
    const text = lines[line];
    typed.textContent = text.slice(0, letter++);

    if (letter <= text.length) {
      window.setTimeout(type, 43);
      return;
    }

    window.setTimeout(() => {
      letter = 0;
      line = (line + 1) % lines.length;
      type();
    }, 1700);
  }

  type();
}

document.querySelectorAll("[data-demo-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "필수 항목을 확인해주세요.";
      return;
    }

    status.textContent = "입력 내용이 확인되었습니다. 실제 접수 시스템 연결 전까지는 서버에 저장되지 않습니다.";
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start"
    });
  });
});

document.querySelectorAll("[data-route-target]").forEach((button) => {
  button.addEventListener("click", () => {
    location.hash = button.dataset.routeTarget;
  });
});

document.querySelectorAll("[data-home-target]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const targetId = link.dataset.homeTarget;
    location.hash = "home";
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });
});
