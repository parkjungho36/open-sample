const pages = [...document.querySelectorAll("[data-page]")];
const routeLinks = [...document.querySelectorAll("[data-route]")];
const validRoutes = new Set(pages.map((page) => page.id));

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
}

window.addEventListener("hashchange", route);
route();

const typed = document.querySelector("#typed");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const countdown = document.querySelector("[data-countdown]");

if (countdown) {
  const targetTime = new Date(countdown.dataset.target).getTime();
  const canvas = countdown.querySelector("[data-dot-countdown]");
  const context = canvas.getContext("2d");
  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
  const labels = ["DAYS", "HOURS", "MINS", "SECS"];
  const palette = ["#087dcc", "#11cfe3", "#82d8f4", "#c8c0f6", "#ffd400", "#111111", "#173b63"];
  let displayValue = "0:00:00:00";
  let pointer = { x: -1000, y: -1000, active: false };
  let displayWidth = 0;
  let displayHeight = 0;
  let dots = [];
  let labelCenters = [];
  let labelY = 0;
  let maskDirty = true;

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
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
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
    context.fillStyle = "#111";
    labels.forEach((label, index) => {
      context.fillText(label, labelCenters[index], labelY);
    });

    if (!reducedMotion) window.requestAnimationFrame(drawCountdown);
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top, active: true };
  });
  canvas.addEventListener("pointerleave", () => {
    pointer = { x: -1000, y: -1000, active: false };
  });

  new ResizeObserver(resizeCanvas).observe(canvas);
  document.fonts?.ready.then(() => {
    maskDirty = true;
  });
  resizeCanvas();
  updateCountdown();
  drawCountdown();
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
