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
  const glyphs = {
    "0": ["11111", "10001", "10001", "10001", "10001", "10001", "11111"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["11111", "00001", "00001", "11111", "10000", "10000", "11111"],
    "3": ["11111", "00001", "00001", "01111", "00001", "00001", "11111"],
    "4": ["10001", "10001", "10001", "11111", "00001", "00001", "00001"],
    "5": ["11111", "10000", "10000", "11111", "00001", "00001", "11111"],
    "6": ["11111", "10000", "10000", "11111", "10001", "10001", "11111"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["11111", "10001", "10001", "11111", "10001", "10001", "11111"],
    "9": ["11111", "10001", "10001", "11111", "00001", "00001", "11111"],
    ":": ["0", "0", "1", "0", "1", "0", "0"]
  };
  const labels = ["DAYS", "HOURS", "MINUTES", "SECONDS"];
  let displayValue = "000:00:00:00";
  let pointer = { x: -1000, y: -1000 };
  let displayWidth = 0;
  let displayHeight = 0;

  function updateCountdown() {
    const remaining = Math.max(0, targetTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };

    displayValue = [
      String(values.days).padStart(3, "0"),
      String(values.hours).padStart(2, "0"),
      String(values.minutes).padStart(2, "0"),
      String(values.seconds).padStart(2, "0")
    ].join(":");

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
  }

  function drawCountdown(time = 0) {
    context.clearRect(0, 0, displayWidth, displayHeight);

    const characterUnits = [...displayValue].reduce((sum, character) => {
      return sum + (character === ":" ? 2.2 : 5.8);
    }, 0);
    const step = Math.min((displayWidth - 28) / characterUnits, (displayHeight - 54) / 7);
    const dotRadius = Math.max(1.35, step * .18);
    let cursorX = (displayWidth - characterUnits * step) / 2;
    const startY = Math.max(10, (displayHeight - 7 * step - 28) / 2);
    const groupCenters = [];
    let groupStart = cursorX;
    let groupIndex = 0;

    [...displayValue].forEach((character) => {
      const glyph = glyphs[character];
      const columns = character === ":" ? 1 : 5;

      glyph.forEach((row, rowIndex) => {
        [...row].forEach((cell, columnIndex) => {
          const x = cursorX + columnIndex * step + step / 2;
          const y = startY + rowIndex * step + step / 2;
          const distance = Math.hypot(pointer.x - x, pointer.y - y);
          const proximity = Math.max(0, 1 - distance / 82);
          const pulse = reducedMotion ? 0 : Math.sin(time * .0024 + x * .018 + y * .025) * .08;
          const active = cell === "1";
          const radius = dotRadius * (active ? 1 + proximity * .75 + pulse : .72 + proximity * .22);

          context.beginPath();
          context.arc(x, y, Math.max(.8, radius), 0, Math.PI * 2);
          context.fillStyle = active
            ? `rgba(17, 17, 17, ${Math.min(1, .82 + proximity * .18 + pulse)})`
            : `rgba(17, 17, 17, ${.075 + proximity * .09})`;
          context.fill();
        });
      });

      cursorX += (columns + (character === ":" ? 1.2 : .8)) * step;

      if (character === ":") {
        groupCenters.push((groupStart + cursorX - step * 2) / 2);
        groupStart = cursorX;
        groupIndex += 1;
      }
    });
    groupCenters.push((groupStart + cursorX) / 2);

    context.textAlign = "center";
    context.textBaseline = "bottom";
    context.font = `600 ${Math.max(8, Math.min(11, step * .52))}px "Open Sans", sans-serif`;
    context.fillStyle = "rgba(17, 17, 17, .48)";
    labels.forEach((label, index) => {
      context.fillText(label, groupCenters[index], displayHeight - 2);
    });

    if (!reducedMotion) window.requestAnimationFrame(drawCountdown);
  }

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  });
  canvas.addEventListener("pointerleave", () => {
    pointer = { x: -1000, y: -1000 };
  });

  new ResizeObserver(resizeCanvas).observe(canvas);
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
