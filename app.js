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
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  });
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

const liquidCanvas = document.querySelector("[data-hero-liquid]");

if (hero && liquidCanvas) {
  const gl = liquidCanvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: "low-power"
  });

  if (gl) {
    const vertexSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    const fragmentSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      float caustics(vec2 p, float time) {
        float value = 0.0;
        float scale = 1.0;
        for (int i = 0; i < 3; i++) {
          p += vec2(
            sin(p.y * 1.35 + time * 1.08),
            cos(p.x * 1.2 - time * 0.92)
          ) * 0.23;
          value += abs(sin(p.x * 2.1 + p.y * 1.7 + time)) / scale;
          p *= 1.72;
          scale *= 1.85;
        }
        return smoothstep(0.35, 1.25, value);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / max(u_resolution.y, 1.0);

        float t = u_time * 0.15;
        float n1 = noise(p * 0.8 + vec2(t, -t * 0.5));
        float n2 = noise(p * 1.5 + vec2(t * 0.8, -t));
        float n3 = noise(p * 0.52 - vec2(t * 0.38, t * 0.3));

        vec3 violet = vec3(0.92, 0.90, 0.98);
        vec3 seashell = vec3(0.98, 0.92, 0.91);
        vec3 ice = vec3(0.91, 0.95, 0.98);
        vec3 color = mix(violet, seashell, smoothstep(0.22, 0.82, n1));
        color = mix(color, ice, smoothstep(0.28, 0.8, n2) * 0.72);
        color = mix(color, vec3(0.94, 0.98, 0.96), n3 * 0.18);

        float light = caustics(p * 0.82, u_time * 0.125);
        color += vec3(0.02, 0.052, 0.06) * light;
        color += vec3(0.045, 0.018, 0.055) * (1.0 - light) * n1;

        float vignette = smoothstep(1.35, 0.18, length(p * vec2(0.72, 0.9)));
        color = mix(color * 0.985, color, vignette);
        float grain = hash(gl_FragCoord.xy * 0.37);
        color += (grain - 0.5) * 0.012;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = vertexShader && fragmentShader ? gl.createProgram() : null;

    if (program) {
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
    }

    if (program && gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );
      const positionLocation = gl.getAttribLocation(program, "a_position");
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      const timeLocation = gl.getUniformLocation(program, "u_time");
      let liquidFrame = 0;
      let liquidLastFrame = 0;
      let liquidVisible = true;
      const liquidStart = performance.now();

      function resizeLiquid() {
        const rect = hero.getBoundingClientRect();
        const scale = Math.min(window.devicePixelRatio || 1, 1);
        liquidCanvas.width = Math.max(1, Math.round(rect.width * scale));
        liquidCanvas.height = Math.max(1, Math.round(rect.height * scale));
        gl.viewport(0, 0, liquidCanvas.width, liquidCanvas.height);
      }

      function drawLiquid(now) {
        liquidFrame = 0;
        if (!liquidVisible || document.hidden) return;
        if (!reducedMotion && now - liquidLastFrame < 32) {
          liquidFrame = requestAnimationFrame(drawLiquid);
          return;
        }
        liquidLastFrame = now;
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(resolutionLocation, liquidCanvas.width, liquidCanvas.height);
        gl.uniform1f(timeLocation, reducedMotion ? 0 : (now - liquidStart) * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!reducedMotion) liquidFrame = requestAnimationFrame(drawLiquid);
      }

      function startLiquid() {
        if (!liquidFrame && liquidVisible && !document.hidden) {
          liquidFrame = requestAnimationFrame(drawLiquid);
        }
      }

      new ResizeObserver(resizeLiquid).observe(hero);
      new IntersectionObserver(([entry]) => {
        liquidVisible = entry.isIntersecting;
        if (liquidVisible) startLiquid();
      }, { threshold: 0.01 }).observe(hero);
      document.addEventListener("visibilitychange", startLiquid);
      resizeLiquid();
      startLiquid();
    }
  }
}

const gallerySearch = document.querySelector("[data-gallery-search]");
const galleryCards = [...document.querySelectorAll("[data-gallery-list] .game-card")];
const galleryEmpty = document.querySelector("[data-gallery-empty]");
const galleryPagination = document.querySelector("[data-gallery-pagination]");
const galleryPageNumbers = document.querySelector("[data-page-numbers]");
const galleryPrev = document.querySelector("[data-page-prev]");
const galleryNext = document.querySelector("[data-page-next]");
const galleryPageSize = 12;
let galleryPage = 1;

document.querySelectorAll(".game-stats span:last-child").forEach((stat) => {
  if (stat.querySelector(".view-eye")) return;
  const firstNode = stat.firstChild;
  if (firstNode?.nodeType === Node.TEXT_NODE) firstNode.remove();
  const eye = document.createElement("i");
  eye.className = "view-eye";
  eye.setAttribute("aria-hidden", "true");
  stat.prepend(eye);
});

function renderGallery() {
  if (!galleryCards.length) return;
  const query = gallerySearch?.value.trim().toLocaleLowerCase() || "";
  const matches = galleryCards.filter((card) => !query || card.dataset.search.toLocaleLowerCase().includes(query));
  const totalPages = Math.max(1, Math.ceil(matches.length / galleryPageSize));
  galleryPage = Math.min(galleryPage, totalPages);
  const start = (galleryPage - 1) * galleryPageSize;

  galleryCards.forEach((card) => {
    const matchIndex = matches.indexOf(card);
    card.hidden = matchIndex < start || matchIndex >= start + galleryPageSize;
  });
  if (galleryEmpty) galleryEmpty.hidden = matches.length > 0;
  if (galleryPagination) galleryPagination.hidden = matches.length === 0;
  if (galleryPrev) galleryPrev.disabled = galleryPage === 1;
  if (galleryNext) galleryNext.disabled = galleryPage === totalPages;

  if (galleryPageNumbers) {
    galleryPageNumbers.replaceChildren();
    for (let page = 1; page <= totalPages; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(page);
      button.setAttribute("aria-label", `${page}페이지`);
      if (page === galleryPage) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => {
        galleryPage = page;
        renderGallery();
      });
      galleryPageNumbers.append(button);
    }
  }
}

if (gallerySearch && galleryCards.length) {
  gallerySearch.addEventListener("input", () => {
    galleryPage = 1;
    renderGallery();
  });
  galleryPrev?.addEventListener("click", () => {
    galleryPage = Math.max(1, galleryPage - 1);
    renderGallery();
  });
  galleryNext?.addEventListener("click", () => {
    galleryPage += 1;
    renderGallery();
  });
  renderGallery();
}

document.querySelectorAll(".game-like").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".game-card");
    const nextPressed = button.getAttribute("aria-pressed") !== "true";
    const buttonCount = button.querySelector("b");
    const currentCount = Number(buttonCount?.textContent || 0);
    const nextCount = Math.max(0, currentCount + (nextPressed ? 1 : -1));
    button.setAttribute("aria-pressed", String(nextPressed));
    const icon = button.querySelector("img");
    if (icon) icon.src = nextPressed ? "assets/favorite.svg" : "assets/favorite-1.svg";
    [buttonCount, card?.querySelector("[data-heart-count]")].forEach((target) => {
      if (target) target.textContent = String(nextCount);
    });
  });
});

if (countdown) {
  const targetTime = new Date(countdown.dataset.target).getTime();
  const canvas = countdown.querySelector("[data-dot-countdown]");
  const context = canvas.getContext("2d");
  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
  const labels = ["DAYS", "HOURS", "MINS", "SECS"];
  const palette = ["#087dcc", "#11cfe3", "#82d8f4", "#766fd2", "#ffd400", "#111111", "#173b63"];
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
    context.fillStyle = "#111";
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

const guestGallery = document.querySelector(".guest-gallery");

if (guestGallery) {
  const guestCards = [...guestGallery.querySelectorAll("[data-guest-index]")];
  const cardSpacing = 245;
  const totalStripWidth = guestCards.length * cardSpacing;
  let carouselScroll = 0;
  let targetCarouselScroll = 0;
  let carouselVelocity = 0;
  let dragStart = 0;
  let lastDragX = 0;
  let draggingGuests = false;
  let galleryVisible = false;
  let lastCarouselFrame = 0;
  let resumeCarouselAt = 0;
  const carouselSpeed = reducedMotion ? 0 : .5;

  function renderGuestGallery() {
    const viewportWidth = guestGallery.clientWidth;
    const curveWidth = Math.max(720, viewportWidth / 1.5);
    guestCards.forEach((card, index) => {
      let x = index * cardSpacing - carouselScroll;
      while (x < -totalStripWidth / 2) x += totalStripWidth;
      while (x > totalStripWidth / 2) x -= totalStripWidth;

      const progress = x / curveWidth;
      const distance = Math.abs(progress);
      const z = -Math.pow(distance, 2) * 500;
      const rotate = progress * 45;
      const opacity = Math.max(0, 1 - Math.pow(distance, 3));

      card.style.transform = `translate3d(calc(-50% + ${x}px), 0, ${z}px) rotateY(${rotate}deg)`;
      card.style.opacity = String(opacity);
      card.style.filter = `saturate(${.72 + opacity * .28}) brightness(${.86 + opacity * .14})`;
      card.style.zIndex = String(Math.round((1 - distance) * 100));
      card.style.visibility = distance < 1.08 ? "visible" : "hidden";
      card.setAttribute("aria-hidden", opacity < .04 ? "true" : "false");
    });
  }

  function animateGuestGallery(time) {
    if (!lastCarouselFrame) lastCarouselFrame = time;
    const elapsed = Math.min(64, time - lastCarouselFrame);
    if (elapsed >= 32) {
      lastCarouselFrame = time;
      if (galleryVisible && !draggingGuests) {
        if (time >= resumeCarouselAt && carouselSpeed) targetCarouselScroll += carouselSpeed * (elapsed / 16.67);
        targetCarouselScroll += carouselVelocity;
        carouselVelocity *= .94;
        carouselScroll += (targetCarouselScroll - carouselScroll) * .12;
        if (Math.abs(carouselScroll) > totalStripWidth * 20) {
          carouselScroll %= totalStripWidth;
          targetCarouselScroll %= totalStripWidth;
        }
        renderGuestGallery();
      }
    }
    window.requestAnimationFrame(animateGuestGallery);
  }

  guestGallery.tabIndex = 0;
  guestGallery.addEventListener("pointerdown", (event) => {
    draggingGuests = true;
    dragStart = event.clientX;
    lastDragX = event.clientX;
    carouselVelocity = 0;
    guestGallery.classList.add("is-dragging");
    guestGallery.setPointerCapture?.(event.pointerId);
  });
  guestGallery.addEventListener("pointermove", (event) => {
    if (!draggingGuests) return;
    const delta = event.clientX - lastDragX;
    lastDragX = event.clientX;
    targetCarouselScroll -= delta * 1.25;
    carouselScroll = targetCarouselScroll;
    carouselVelocity = -delta * .25;
    renderGuestGallery();
  });
  guestGallery.addEventListener("pointerup", (event) => {
    if (!draggingGuests) return;
    draggingGuests = false;
    guestGallery.classList.remove("is-dragging");
    resumeCarouselAt = performance.now() + 1000;
    guestGallery.releasePointerCapture?.(event.pointerId);
  });
  guestGallery.addEventListener("pointercancel", () => {
    draggingGuests = false;
    guestGallery.classList.remove("is-dragging");
    resumeCarouselAt = performance.now() + 1000;
  });
  guestGallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") targetCarouselScroll -= cardSpacing;
    if (event.key === "ArrowRight") targetCarouselScroll += cardSpacing;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      resumeCarouselAt = performance.now() + 1000;
      carouselScroll = targetCarouselScroll;
      renderGuestGallery();
    }
  });
  new IntersectionObserver(([entry]) => {
    galleryVisible = entry.isIntersecting;
    lastCarouselFrame = performance.now();
  }, { rootMargin: "100px" }).observe(guestGallery);
  new ResizeObserver(renderGuestGallery).observe(guestGallery);
  renderGuestGallery();
  window.requestAnimationFrame(animateGuestGallery);
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

const submitPage = document.querySelector("#submit");

if (submitPage) {
  const loginView = submitPage.querySelector("[data-submit-login]");
  const applicationView = submitPage.querySelector("[data-submit-application]");
  const googleSlot = submitPage.querySelector("[data-google-signin-slot]");
  const googleFallback = submitPage.querySelector("[data-google-signin-fallback]");
  const authStatus = submitPage.querySelector("[data-auth-status]");
  const accountEmail = submitPage.querySelector("[data-account-email]");
  const accountAvatar = submitPage.querySelector("[data-account-avatar]");
  const applicantEmail = submitPage.querySelector("[data-applicant-email]");
  const switchAccount = submitPage.querySelector("[data-switch-account]");
  const applicationForm = submitPage.querySelector("[data-application-form]");
  const termsDialog = submitPage.querySelector("[data-terms-dialog]");
  const termsTitle = submitPage.querySelector("[data-terms-title]");
  const termsScroll = submitPage.querySelector("[data-terms-scroll]");
  const termsProgress = submitPage.querySelector("[data-terms-progress]");
  const termsAccept = submitPage.querySelector("[data-terms-accept]");
  const termsClose = submitPage.querySelector("[data-terms-close]");
  const googleClientId = document.querySelector('meta[name="google-oauth-client-id"]')?.content.trim();
  const consentState = { event: false, privacy: false };
  const consentDocuments = {
    event: {
      title: "OpenAI Game Hackathon in Seoul 참가 약관",
      template: document.querySelector("#event-terms-content")
    },
    privacy: {
      title: "개인정보 수집·이용 동의서",
      template: document.querySelector("#privacy-terms-content")
    }
  };
  let activeConsent = null;
  let googleInitialized = false;

  function readStoredAccount() {
    try {
      return JSON.parse(window.sessionStorage.getItem("hackathon-google-account"));
    } catch {
      return null;
    }
  }

  function storeAccount(account) {
    try {
      if (account) window.sessionStorage.setItem("hackathon-google-account", JSON.stringify(account));
      else window.sessionStorage.removeItem("hackathon-google-account");
    } catch {
      // Session storage can be unavailable in privacy-focused browser modes.
    }
  }

  function decodeGoogleCredential(credential) {
    try {
      const encodedPayload = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(window.atob(encodedPayload), (character) => character.charCodeAt(0));
      const payload = JSON.parse(new TextDecoder().decode(bytes));
      return {
        email: payload.email,
        name: payload.name || payload.given_name || payload.email,
        picture: payload.picture || ""
      };
    } catch {
      return null;
    }
  }

  function renderAccount(account) {
    const isAuthenticated = Boolean(account?.email);
    loginView.hidden = isAuthenticated;
    applicationView.hidden = !isAuthenticated;

    if (!isAuthenticated) return;

    accountEmail.textContent = account.email;
    applicantEmail.value = account.email;
    accountAvatar.replaceChildren();

    if (account.picture) {
      const image = document.createElement("img");
      image.src = account.picture;
      image.alt = "";
      image.referrerPolicy = "no-referrer";
      accountAvatar.append(image);
    } else {
      accountAvatar.textContent = (account.name || account.email).trim().charAt(0).toUpperCase();
    }
  }

  function setAccount(account) {
    storeAccount(account);
    renderAccount(account);
    if (account) window.scrollTo({ top: 0, behavior: "auto" });
  }

  function initializeGoogleSignIn() {
    if (googleInitialized || !googleClientId || !window.google?.accounts?.id) return;
    googleInitialized = true;
    googleFallback.hidden = true;
    googleSlot.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: ({ credential }) => {
        const account = decodeGoogleCredential(credential);
        if (!account?.email) {
          authStatus.textContent = "Google 계정 정보를 확인하지 못했습니다. 다시 시도해주세요.";
          return;
        }
        authStatus.textContent = "";
        setAccount(account);
      }
    });
    window.google.accounts.id.renderButton(googleSlot, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "signin_with",
      width: 320,
      locale: "ko"
    });
  }

  function updateConsentRow(key, agreed) {
    consentState[key] = agreed;
    const trigger = submitPage.querySelector(`[data-consent-trigger="${key}"]`);
    trigger?.setAttribute("aria-pressed", String(agreed));
  }

  function updateTermsProgress() {
    const hasReachedEnd = termsScroll.scrollHeight - termsScroll.scrollTop - termsScroll.clientHeight <= 4;
    termsAccept.disabled = !hasReachedEnd;
    termsProgress.textContent = hasReachedEnd
      ? "약관을 모두 확인했습니다."
      : "내용을 끝까지 읽으면 동의할 수 있습니다.";
  }

  function openTerms(key) {
    const documentConfig = consentDocuments[key];
    if (!documentConfig?.template) return;
    activeConsent = key;
    termsTitle.textContent = documentConfig.title;
    termsScroll.replaceChildren(documentConfig.template.content.cloneNode(true));
    termsAccept.disabled = true;
    termsProgress.textContent = "내용을 끝까지 읽으면 동의할 수 있습니다.";
    termsDialog.showModal();
    document.body.classList.add("terms-modal-open");
    window.requestAnimationFrame(() => {
      termsScroll.scrollTop = 0;
      termsScroll.focus();
      updateTermsProgress();
    });
  }

  function closeTerms() {
    if (termsDialog.open) termsDialog.close();
  }

  submitPage.querySelectorAll("[data-consent-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const key = trigger.dataset.consentTrigger;
      if (consentState[key]) {
        updateConsentRow(key, false);
        return;
      }
      openTerms(key);
    });
  });

  termsScroll.addEventListener("scroll", updateTermsProgress, { passive: true });
  termsClose.addEventListener("click", closeTerms);
  termsAccept.addEventListener("click", () => {
    if (termsAccept.disabled || !activeConsent) return;
    updateConsentRow(activeConsent, true);
    closeTerms();
  });
  termsDialog.addEventListener("close", () => {
    activeConsent = null;
    document.body.classList.remove("terms-modal-open");
  });
  termsDialog.addEventListener("click", (event) => {
    if (event.target === termsDialog) closeTerms();
  });

  googleFallback.addEventListener("click", () => {
    if (googleClientId) {
      authStatus.textContent = "Google 로그인 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.";
      return;
    }

    authStatus.textContent = "";
    setAccount({
      email: "participant.demo@gmail.com",
      name: "Demo Participant",
      picture: ""
    });
  });

  switchAccount.addEventListener("click", () => {
    applicationForm.reset();
    updateConsentRow("event", false);
    updateConsentRow("privacy", false);
    window.google?.accounts?.id?.disableAutoSelect();
    setAccount(null);
  });

  applicationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = applicationForm.querySelector(".form-status");

    if (!consentState.event || !consentState.privacy) {
      status.textContent = "참가 약관과 개인정보 수집·이용 동의서를 확인해주세요.";
      submitPage.querySelector(".consent-section")?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
      return;
    }

    if (!applicationForm.checkValidity()) {
      applicationForm.reportValidity();
      status.textContent = "필수 항목과 입력 형식을 확인해주세요.";
      return;
    }

    status.textContent = "신청서 입력 내용이 확인되었습니다. 실제 접수 저장 시스템은 추후 연결됩니다.";
  });

  const googleScript = document.querySelector("#google-identity-services");
  if (window.google?.accounts?.id) initializeGoogleSignIn();
  else googleScript?.addEventListener("load", initializeGoogleSignIn, { once: true });

  renderAccount(readStoredAccount());
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

const detailsAnchorLinks = [...document.querySelectorAll("[data-details-anchor]")];

const setActiveDetailsAnchor = (activeLink) => {
  detailsAnchorLinks.forEach((link) => {
    if (link === activeLink) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
};

detailsAnchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const target = document.getElementById(link.dataset.detailsAnchor);
    if (!target) return;

    setActiveDetailsAnchor(link);
    if (target instanceof HTMLDetailsElement) target.open = true;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });
});

document.querySelectorAll(".details-fold").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    const link = detailsAnchorLinks.find((anchor) => anchor.dataset.detailsAnchor === details.id);
    if (link) setActiveDetailsAnchor(link);
  });
});

const detailsPageSection = document.querySelector("#apply");
const detailsAnchorNav = document.querySelector(".details-anchor-nav");
let detailsAnchorFrame = 0;

const syncDetailsAnchorToScroll = () => {
  detailsAnchorFrame = 0;
  if (!detailsPageSection?.classList.contains("active")) return;

  const threshold = (siteHeader?.offsetHeight || 0) + (detailsAnchorNav?.offsetHeight || 0) + 8;
  let activeLink = detailsAnchorLinks[0];

  detailsAnchorLinks.forEach((link) => {
    const target = document.getElementById(link.dataset.detailsAnchor);
    if (target?.getBoundingClientRect().top <= threshold) activeLink = link;
  });

  if (activeLink) setActiveDetailsAnchor(activeLink);
};

const queueDetailsAnchorSync = () => {
  if (detailsAnchorFrame) return;
  detailsAnchorFrame = window.requestAnimationFrame(syncDetailsAnchorToScroll);
};

window.addEventListener("scroll", queueDetailsAnchorSync, { passive: true });
window.addEventListener("resize", queueDetailsAnchorSync);

const criterionGroups = new Map();
document.querySelectorAll("[data-criterion]").forEach((item) => {
  const key = item.dataset.criterion;
  if (!criterionGroups.has(key)) criterionGroups.set(key, []);
  criterionGroups.get(key).push(item);
});

const updateCriterionHighlight = (key) => {
  const group = criterionGroups.get(key) || [];
  const isActive = group.some((item) => item.matches(":hover") || item.contains(document.activeElement));
  group.forEach((item) => item.classList.toggle("is-criterion-active", isActive));
};

criterionGroups.forEach((group, key) => {
  group.forEach((item) => {
    item.addEventListener("mouseenter", () => updateCriterionHighlight(key));
    item.addEventListener("mouseleave", () => window.requestAnimationFrame(() => updateCriterionHighlight(key)));
    item.addEventListener("mouseover", () => updateCriterionHighlight(key));
    item.addEventListener("mouseout", () => window.requestAnimationFrame(() => updateCriterionHighlight(key)));
    item.addEventListener("focusin", () => updateCriterionHighlight(key));
    item.addEventListener("focusout", () => window.requestAnimationFrame(() => updateCriterionHighlight(key)));
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
    const scrollToTarget = () => window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });

    if (location.hash === "#home" || !location.hash) {
      scrollToTarget();
      return;
    }

    window.addEventListener("hashchange", scrollToTarget, { once: true });
    location.hash = "home";
  });
});
