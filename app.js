const pages = [...document.querySelectorAll("[data-page]")];
const routeLinks = [...document.querySelectorAll("[data-route]")];
const validRoutes = new Set(pages.map((page) => page.id));
const siteHeader = document.querySelector(".nav");
let activeRouteId = pages.find((page) => page.classList.contains("active"))?.id || "home";
let routeLeaveGuard = null;

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
  const requestedHash = location.hash.slice(1) || "home";
  const [requestedRoute, requestedDetailsTarget] = requestedHash.split(":");
  const normalizedRoute = requestedRoute === "info" ? "home" : requestedRoute;
  const routeId = validRoutes.has(normalizedRoute) ? normalizedRoute : "home";

  if (
    routeId !== activeRouteId
    && routeLeaveGuard?.(activeRouteId, routeId, { detailsTarget: requestedDetailsTarget })
  ) {
    history.replaceState(null, "", `#${activeRouteId}`);
    return;
  }

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

  activeRouteId = routeId;
  const detailsTarget = routeId === "apply" && requestedDetailsTarget
    ? document.getElementById(requestedDetailsTarget)
    : null;

  if (detailsTarget) {
    const detailsFold = detailsTarget.closest(".details-fold");
    if (detailsFold instanceof HTMLDetailsElement) detailsFold.open = true;
    const detailsAnchorId = detailsFold?.id;
    document.querySelectorAll("[data-details-anchor]").forEach((link) => {
      if (link.dataset.detailsAnchor === detailsAnchorId) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        detailsTarget.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start"
        });
        detailsTarget.focus({ preventScroll: true });
      });
    });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }
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
  const successView = submitPage.querySelector("[data-submit-success]");
  const googleSlot = submitPage.querySelector("[data-google-signin-slot]");
  const googleFallback = submitPage.querySelector("[data-google-signin-fallback]");
  const authStatus = submitPage.querySelector("[data-auth-status]");
  const accountEmails = [...submitPage.querySelectorAll("[data-account-email]")];
  const accountAvatar = submitPage.querySelector("[data-account-avatar]");
  const switchAccountButtons = [...submitPage.querySelectorAll("[data-switch-account]")];
  const applicationForm = submitPage.querySelector("[data-application-form]");
  const termsDialog = submitPage.querySelector("[data-terms-dialog]");
  const termsTitle = submitPage.querySelector("[data-terms-title]");
  const termsScroll = submitPage.querySelector("[data-terms-scroll]");
  const termsProgress = submitPage.querySelector("[data-terms-progress]");
  const termsAccept = submitPage.querySelector("[data-terms-accept]");
  const termsClose = submitPage.querySelector("[data-terms-close]");
  const countryInput = submitPage.querySelector("[data-country-input]");
  const countryTrigger = submitPage.querySelector("[data-country-trigger]");
  const countrySelection = submitPage.querySelector("[data-country-selection]");
  const countryError = submitPage.querySelector("[data-country-error]");
  const countryDialog = submitPage.querySelector("[data-country-dialog]");
  const countrySearch = submitPage.querySelector("[data-country-search]");
  const countryOptions = submitPage.querySelector("[data-country-options]");
  const countryEmpty = submitPage.querySelector("[data-country-empty]");
  const countryClose = submitPage.querySelector("[data-country-close]");
  const countryCancel = submitPage.querySelector("[data-country-cancel]");
  const countryConfirm = submitPage.querySelector("[data-country-confirm]");
  const internationalConsent = submitPage.querySelector('[data-consent-trigger="international"]');
  const thumbnailInput = submitPage.querySelector("[data-thumbnail-input]");
  const thumbnailEmpty = submitPage.querySelector("[data-thumbnail-empty]");
  const thumbnailPreview = submitPage.querySelector("[data-thumbnail-preview]");
  const thumbnailImage = submitPage.querySelector("[data-thumbnail-image]");
  const thumbnailName = submitPage.querySelector("[data-thumbnail-name]");
  const thumbnailStatus = submitPage.querySelector("[data-thumbnail-status]");
  const gameDescription = submitPage.querySelector("[data-game-description]");
  const descriptionCount = submitPage.querySelector("[data-description-count]");
  const platformOptions = [...submitPage.querySelectorAll('input[name="game-platform"]')];
  const platformOtherWrap = submitPage.querySelector("[data-platform-other-wrap]");
  const platformOtherInput = submitPage.querySelector("[data-platform-other]");
  const formStatus = applicationForm.querySelector(".form-status");
  const submitButton = applicationForm.querySelector('button[type="submit"]');
  const applicationTitle = submitPage.querySelector("[data-application-title]");
  const successTitle = submitPage.querySelector("#submit-success-title");
  const successTeam = submitPage.querySelector("[data-success-team]");
  const submitAnotherButton = submitPage.querySelector("[data-submit-another]");
  const confettiCanvas = submitPage.querySelector("[data-confetti]");
  const discardDialog = submitPage.querySelector("[data-discard-dialog]");
  const discardClose = submitPage.querySelector("[data-discard-close]");
  const discardCancel = submitPage.querySelector("[data-discard-cancel]");
  const discardConfirm = submitPage.querySelector("[data-discard-confirm]");
  const discardKicker = submitPage.querySelector("[data-discard-kicker]");
  const discardTitle = submitPage.querySelector("[data-discard-title]");
  const discardMessage = submitPage.querySelector("[data-discard-message]");
  const discardNotice = submitPage.querySelector("[data-discard-notice]");
  const discardNoticeTitle = submitPage.querySelector("[data-discard-notice-title]");
  const discardNoticeBody = submitPage.querySelector("[data-discard-notice-body]");
  const googleClientId = document.querySelector('meta[name="google-oauth-client-id"]')?.content.trim();
  const consentState = { event: false, privacy: false, international: false };
  const consentDocuments = {
    event: {
      title: "OpenAI Game Hackathon in Seoul 참가 약관",
      template: document.querySelector("#event-terms-content")
    },
    privacy: {
      title: "개인정보 수집·이용 동의서",
      template: document.querySelector("#privacy-terms-content")
    },
    international: {
      title: "개인정보 국외 이전 동의서",
      template: document.querySelector("#international-transfer-terms-content")
    }
  };
  const countryCodes = `
    AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
    BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
    CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
    DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR
    GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
    HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP
    KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY
    MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
    NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY
    QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
    TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ
    VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW
  `.trim().split(/\s+/);
  const countryEntries = new Map();
  let activeConsent = null;
  let googleInitialized = false;
  let selectedCountryCode = "";
  let pendingCountryCode = "";
  let thumbnailObjectUrl = "";
  let validationRules = [];
  let hasSubmittedForm = false;
  let formIsDirty = false;
  let pendingDiscardAction = null;
  let allowNextRouteChange = false;
  const touchedValidationKeys = new Set();

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

    accountEmails.forEach((element) => {
      element.textContent = account.email;
    });
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

  function normalizeCountryName(value) {
    return value.trim().toLocaleLowerCase("ko-KR");
  }

  function buildCountryOptions() {
    if (!countryOptions) return;

    const koreanNames = window.Intl?.DisplayNames
      ? new Intl.DisplayNames(["ko"], { type: "region" })
      : { of: (code) => code };
    const englishNames = window.Intl?.DisplayNames
      ? new Intl.DisplayNames(["en"], { type: "region" })
      : { of: (code) => code };
    const countries = countryCodes
      .map((code) => ({
        code,
        korean: koreanNames.of(code),
        english: englishNames.of(code)
      }))
      .filter(({ korean, english }) => korean && english)
      .sort((a, b) => {
        if (a.code === "KR") return -1;
        if (b.code === "KR") return 1;
        return a.korean.localeCompare(b.korean, "ko");
      });

    const fragment = document.createDocumentFragment();
    countries.forEach(({ code, korean, english }) => {
      const label = `${korean} (${english})`;
      const option = document.createElement("button");
      const copy = document.createElement("span");
      const koreanName = document.createElement("strong");
      const englishName = document.createElement("small");
      const countryCode = document.createElement("span");

      option.type = "button";
      option.className = "country-option";
      option.dataset.countryCode = code;
      option.dataset.countrySearch = normalizeCountryName(`${label} ${code}`);
      option.setAttribute("role", "radio");
      option.setAttribute("aria-checked", "false");

      copy.className = "country-option-copy";
      koreanName.textContent = korean;
      englishName.textContent = english;
      countryCode.className = "country-option-code";
      countryCode.textContent = code;

      copy.append(koreanName, englishName);
      option.append(copy, countryCode);
      option.addEventListener("click", () => updatePendingCountry(code));
      fragment.append(option);
      countryEntries.set(code, { code, korean, english, label });
    });
    countryOptions.replaceChildren(fragment);
  }

  function updatePendingCountry(countryCode) {
    pendingCountryCode = countryCode;
    countryOptions.querySelectorAll(".country-option").forEach((option) => {
      option.setAttribute("aria-checked", String(option.dataset.countryCode === countryCode));
    });
    countryConfirm.disabled = !pendingCountryCode;
  }

  function filterCountryOptions(query) {
    const normalizedQuery = normalizeCountryName(query);
    let visibleCount = 0;

    countryOptions.querySelectorAll(".country-option").forEach((option) => {
      const isVisible = !normalizedQuery || option.dataset.countrySearch.includes(normalizedQuery);
      option.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });
    countryEmpty.hidden = visibleCount > 0;
  }

  function renderCountrySelection(countryCode) {
    const country = countryEntries.get(countryCode);
    countrySelection.textContent = country?.label || "국가 선택";
    countryTrigger.classList.toggle("is-selected", Boolean(country));
  }

  function syncCountryConsent(requireValidSelection = false) {
    const countryCode = countryInput.value;
    const countryChanged = countryCode !== selectedCountryCode;

    if (countryChanged) updateConsentRow("international", false);
    selectedCountryCode = countryCode;

    const requiresInternationalConsent = Boolean(countryCode && countryCode !== "KR");
    internationalConsent.hidden = !requiresInternationalConsent;
    if (!requiresInternationalConsent) updateConsentRow("international", false);

    const showError = requireValidSelection && !countryCode;
    countryTrigger.setAttribute("aria-invalid", String(showError));
    countryError.hidden = !showError;

    return countryCode;
  }

  function openCountryDialog() {
    pendingCountryCode = selectedCountryCode;
    countrySearch.value = "";
    filterCountryOptions("");
    updatePendingCountry(pendingCountryCode);
    countryDialog.showModal();
    document.body.classList.add("terms-modal-open");
    window.requestAnimationFrame(() => {
      countrySearch.focus();
      if (pendingCountryCode) {
        countryOptions
          .querySelector(`[data-country-code="${pendingCountryCode}"]`)
          ?.scrollIntoView({ block: "center" });
      } else {
        countryOptions.scrollTop = 0;
      }
    });
  }

  function closeCountryDialog() {
    if (countryDialog.open) countryDialog.close();
  }

  function confirmCountrySelection() {
    if (!pendingCountryCode) return;
    const countryChanged = countryInput.value !== pendingCountryCode;
    countryInput.value = pendingCountryCode;
    renderCountrySelection(pendingCountryCode);
    syncCountryConsent(false);
    if (countryChanged) formIsDirty = true;
    touchedValidationKeys.add("representative-country");
    refreshValidationRule("representative-country", true);
    refreshValidationRule("international-consent");
    closeCountryDialog();
  }

  function clearThumbnailPreview() {
    if (thumbnailObjectUrl) URL.revokeObjectURL(thumbnailObjectUrl);
    thumbnailObjectUrl = "";
    thumbnailImage.removeAttribute("src");
    thumbnailName.textContent = "";
    thumbnailPreview.hidden = true;
    thumbnailEmpty.hidden = false;
  }

  function updateThumbnailPreview() {
    const file = thumbnailInput.files?.[0];
    clearThumbnailPreview();
    thumbnailInput.setCustomValidity("");
    thumbnailStatus.textContent = "";

    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      thumbnailInput.setCustomValidity("JPG 또는 PNG 이미지를 선택해주세요.");
      thumbnailStatus.textContent = "JPG 또는 PNG 이미지만 업로드할 수 있습니다.";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      thumbnailInput.setCustomValidity("10MB 이하의 이미지를 선택해주세요.");
      thumbnailStatus.textContent = "파일 크기는 최대 10MB까지 가능합니다.";
      return;
    }

    thumbnailObjectUrl = URL.createObjectURL(file);
    thumbnailImage.src = thumbnailObjectUrl;
    thumbnailName.textContent = file.name;
    thumbnailEmpty.hidden = true;
    thumbnailPreview.hidden = false;
  }

  function updateDescriptionCount() {
    descriptionCount.textContent = String(gameDescription.value.length);
  }

  function updatePlatformOther() {
    const selectedPlatform = platformOptions.find((option) => option.checked)?.value;
    const isOther = selectedPlatform === "Other";
    platformOtherWrap.hidden = !isOther;
    platformOtherInput.required = isOther;
    if (!isOther) platformOtherInput.value = "";
  }

  function resetProjectFields() {
    clearThumbnailPreview();
    thumbnailInput.setCustomValidity("");
    thumbnailStatus.textContent = "";
    updateDescriptionCount();
    updatePlatformOther();
  }

  function isValidUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function getRuleErrorElement(rule) {
    if (rule.errorElement) {
      rule.errorElement.classList.add("field-error");
      return rule.errorElement;
    }

    const error = document.createElement("p");
    error.className = "field-error";
    error.hidden = true;
    error.dataset.errorFor = rule.key;
    if (rule.insertAfter) rule.container.insertAdjacentElement("afterend", error);
    else rule.container.append(error);
    rule.errorElement = error;
    return error;
  }

  function connectRuleDescription(rule, error) {
    if (!error.id) error.id = `error-${rule.key.replace(/[^a-z0-9-]/gi, "-")}`;
    rule.targets.forEach((target) => {
      const describedBy = new Set((target.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      describedBy.add(error.id);
      target.setAttribute("aria-describedby", [...describedBy].join(" "));
    });
  }

  function setRuleState(rule, message) {
    const error = getRuleErrorElement(rule);
    connectRuleDescription(rule, error);
    const hasError = Boolean(message);

    error.textContent = message;
    error.hidden = !hasError;
    rule.container.classList.toggle("has-error", hasError);
    rule.targets.forEach((target) => {
      target.setAttribute("aria-invalid", String(hasError));
    });
  }

  function validateRule(rule, reveal = false) {
    const isActive = rule.isActive ? rule.isActive() : true;
    const message = isActive ? rule.validate() : "";
    if (reveal || touchedValidationKeys.has(rule.key) || hasSubmittedForm) {
      setRuleState(rule, message);
    } else if (!isActive) {
      setRuleState(rule, "");
    }
    return message;
  }

  function findValidationRule(key) {
    return validationRules.find((rule) => rule.key === key);
  }

  function refreshValidationRule(key, reveal = false) {
    const rule = findValidationRule(key);
    if (rule) validateRule(rule, reveal);
  }

  function createValidationRules() {
    const field = (name) => applicationForm.elements.namedItem(name);
    const inputRule = (key, validate, options = {}) => {
      const element = field(key);
      return {
        key,
        targets: [element],
        container: options.container || element.closest("label"),
        focusTarget: options.focusTarget || element,
        validate,
        isActive: options.isActive
      };
    };

    const eventConsent = submitPage.querySelector('[data-consent-trigger="event"]');
    const privacyConsent = submitPage.querySelector('[data-consent-trigger="privacy"]');
    const ageConfirmation = field("age-confirmation");
    const teamSizeOptions = [...applicationForm.querySelectorAll('input[name="team-size"]')];
    const teamSizeField = applicationForm.querySelector(".team-size");
    const platformField = applicationForm.querySelector(".platform-field");

    validationRules = [
      {
        key: "representative-country",
        targets: [countryTrigger],
        container: countryTrigger,
        focusTarget: countryTrigger,
        errorElement: countryError,
        validate: () => countryInput.value ? "" : "대표자의 거주 국가를 선택해주세요.",
        bindEvents: false
      },
      {
        key: "event-consent",
        targets: [eventConsent],
        container: eventConsent,
        focusTarget: eventConsent,
        insertAfter: true,
        validate: () => consentState.event ? "" : "참가 약관을 확인하고 동의해주세요.",
        bindEvents: false
      },
      {
        key: "privacy-consent",
        targets: [privacyConsent],
        container: privacyConsent,
        focusTarget: privacyConsent,
        insertAfter: true,
        validate: () => consentState.privacy ? "" : "개인정보 수집·이용 동의서를 확인하고 동의해주세요.",
        bindEvents: false
      },
      {
        key: "international-consent",
        targets: [internationalConsent],
        container: internationalConsent,
        focusTarget: internationalConsent,
        insertAfter: true,
        isActive: () => !internationalConsent.hidden,
        validate: () => consentState.international ? "" : "개인정보 국외 이전 동의서를 확인하고 동의해주세요.",
        bindEvents: false
      },
      {
        key: "age-confirmation",
        targets: [ageConfirmation],
        container: ageConfirmation.closest(".consent-row"),
        focusTarget: ageConfirmation,
        insertAfter: true,
        validate: () => ageConfirmation.checked ? "" : "만 19세 이상임을 확인해주세요."
      },
      inputRule("applicant-name", () => {
        return field("applicant-name").value.trim() ? "" : "성명을 입력해주세요.";
      }),
      inputRule("team-name", () => {
        return field("team-name").value.trim() ? "" : "외부에 표시할 팀명을 입력해주세요.";
      }),
      {
        key: "team-size",
        targets: teamSizeOptions,
        container: teamSizeField,
        focusTarget: teamSizeOptions[0],
        validate: () => teamSizeOptions.some((option) => option.checked)
          ? ""
          : "팀 구성 인원을 선택해주세요."
      },
      {
        key: "game-thumbnail",
        targets: [thumbnailInput],
        container: applicationForm.querySelector(".thumbnail-field"),
        focusTarget: thumbnailInput,
        errorElement: thumbnailStatus,
        validate: () => {
          const file = thumbnailInput.files?.[0];
          if (!file) return "게임 썸네일을 업로드해주세요.";
          if (!["image/jpeg", "image/png"].includes(file.type)) {
            return "JPG 또는 PNG 이미지만 업로드할 수 있습니다.";
          }
          return file.size <= 10 * 1024 * 1024
            ? ""
            : "파일 크기는 최대 10MB까지 가능합니다.";
        }
      },
      inputRule("game-title", () => {
        return field("game-title").value.trim() ? "" : "게임 제목을 입력해주세요.";
      }),
      inputRule("game-description", () => {
        return field("game-description").value.trim() ? "" : "게임 소개를 입력해주세요.";
      }),
      {
        key: "game-platform",
        targets: platformOptions,
        container: platformField,
        focusTarget: platformOptions[0],
        validate: () => platformOptions.some((option) => option.checked)
          ? ""
          : "게임 플랫폼을 하나 선택해주세요."
      },
      inputRule("game-platform-other", () => {
        return platformOtherInput.value.trim() ? "" : "기타 플랫폼을 직접 입력해주세요.";
      }, {
        container: platformOtherWrap,
        isActive: () => !platformOtherWrap.hidden
      }),
      inputRule("playable-game-link", () => {
        const value = field("playable-game-link").value.trim();
        if (!value) return "플레이 가능한 게임 링크를 입력해주세요.";
        return isValidUrl(value) ? "" : "http:// 또는 https://로 시작하는 링크를 입력해주세요.";
      }),
      inputRule("demo-video-link", () => {
        const value = field("demo-video-link").value.trim();
        return !value || isValidUrl(value)
          ? ""
          : "http:// 또는 https://로 시작하는 영상 링크를 입력해주세요.";
      })
    ];
  }

  function bindValidationFeedback() {
    validationRules.forEach((rule) => {
      if (rule.bindEvents === false) return;
      rule.targets.forEach((target) => {
        const isChoice = target.matches('input[type="checkbox"], input[type="radio"], input[type="file"]');
        const primaryEvent = isChoice ? "change" : "input";

        target.addEventListener(primaryEvent, () => {
          if (isChoice) touchedValidationKeys.add(rule.key);
          validateRule(rule, isChoice || touchedValidationKeys.has(rule.key) || hasSubmittedForm);
          formStatus.classList.remove("is-success");
        });
        target.addEventListener("blur", () => {
          touchedValidationKeys.add(rule.key);
          validateRule(rule, true);
        });
      });
    });
  }

  function resetValidationFeedback() {
    hasSubmittedForm = false;
    touchedValidationKeys.clear();
    validationRules.forEach((rule) => setRuleState(rule, ""));
    formStatus.textContent = "";
    formStatus.className = "form-status";
    submitButton.disabled = false;
  }

  function runConfetti() {
    if (!confettiCanvas || reducedMotion) return;
    const context = confettiCanvas.getContext("2d");
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const colors = ["#111111", "#ff6b57", "#18a999", "#2684ff", "#f5c542", "#8b5cf6"];
    const particles = Array.from({ length: 150 }, (_, index) => {
      const angle = Math.PI * (.18 + Math.random() * .64);
      const speed = 7 + Math.random() * 12;
      return {
        x: width * (.36 + Math.random() * .28),
        y: Math.min(height * .38, 320),
        vx: Math.cos(angle) * speed * (index % 2 ? 1 : -1),
        vy: -Math.sin(angle) * speed - 4,
        size: 5 + Math.random() * 8,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - .5) * .3,
        color: colors[index % colors.length]
      };
    });
    const startedAt = performance.now();

    confettiCanvas.width = Math.round(width * pixelRatio);
    confettiCanvas.height = Math.round(height * pixelRatio);
    confettiCanvas.style.width = `${width}px`;
    confettiCanvas.style.height = `${height}px`;
    confettiCanvas.classList.add("is-active");
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    function drawFrame(now) {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += .24;
        particle.vx *= .992;
        particle.rotation += particle.spin;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 3, particle.size, particle.size * .62);
        context.restore();
      });

      if (now - startedAt < 2600) {
        window.requestAnimationFrame(drawFrame);
      } else {
        context.clearRect(0, 0, width, height);
        confettiCanvas.classList.remove("is-active");
      }
    }

    window.requestAnimationFrame(drawFrame);
  }

  function showSubmissionSuccess() {
    const teamName = applicationForm.elements.namedItem("team-name").value.trim();
    successTeam.textContent = teamName ? `${teamName}의 신청서가 접수되었습니다.` : "";
    formIsDirty = false;
    applicationView.hidden = true;
    successView.hidden = false;
    submitButton.disabled = true;
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      successTitle.focus({ preventScroll: true });
      runConfetti();
    });
  }

  function startAnotherSubmission() {
    clearApplicationDraft();
    applicationView.hidden = false;
    successTeam.textContent = "";
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      applicationTitle.focus({ preventScroll: true });
    });
  }

  function updateConsentRow(key, agreed) {
    consentState[key] = agreed;
    const trigger = submitPage.querySelector(`[data-consent-trigger="${key}"]`);
    trigger?.setAttribute("aria-pressed", String(agreed));
    if (touchedValidationKeys.has(`${key}-consent`) || hasSubmittedForm) {
      refreshValidationRule(`${key}-consent`, true);
    }
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

  function hasUnsavedApplication() {
    return activeRouteId === "submit" && formIsDirty && !applicationView.hidden && successView.hidden;
  }

  function openDiscardDialog(action) {
    if (!discardDialog || discardDialog.open) return;
    const hasDraft = action.hasDraft ?? hasUnsavedApplication();
    const isSwitch = action.type === "switch";

    pendingDiscardAction = action;
    discardDialog.classList.toggle("has-unsaved-content", hasDraft);
    discardKicker.textContent = isSwitch
      ? (hasDraft ? "UNSAVED APPLICATION" : "ACCOUNT CHANGE")
      : "LEAVE APPLICATION";
    discardTitle.textContent = isSwitch
      ? (hasDraft ? "작성 중인 내용을 지우고 계정을 변경할까요?" : "계정을 변경하시겠습니까?")
      : "신청서 작성을 중단하고 나갈까요?";
    discardMessage.textContent = isSwitch
      ? (hasDraft
        ? "계정을 변경하면 지금 작성 중인 신청서는 저장되지 않습니다."
        : "현재 Google 계정에서 로그아웃한 뒤 다른 계정으로 다시 로그인합니다.")
      : "페이지를 떠나면 지금까지 작성한 신청서는 저장되지 않습니다.";
    discardNoticeTitle.textContent = hasDraft ? "저장되지 않는 항목" : "현재 로그인된 계정";
    discardNoticeBody.textContent = hasDraft
      ? "참가자 정보, 프로젝트 정보, 업로드한 파일과 동의 상태"
      : (readStoredAccount()?.email || "로그인된 Google 계정");
    discardNotice
      .querySelector("[data-lucide]")
      ?.setAttribute("data-lucide", hasDraft ? "triangle-alert" : "circle-user-round");
    window.lucide?.createIcons();
    discardCancel.textContent = hasDraft ? "계속 작성" : "현재 계정 유지";
    discardConfirm.textContent = isSwitch ? "계정 변경" : "페이지 나가기";
    discardDialog.showModal();
    document.body.classList.add("terms-modal-open");
    window.requestAnimationFrame(() => discardCancel.focus());
  }

  function closeDiscardDialog() {
    if (discardDialog?.open) discardDialog.close();
  }

  function clearApplicationDraft() {
    applicationForm.reset();
    resetProjectFields();
    updateConsentRow("event", false);
    updateConsentRow("privacy", false);
    updateConsentRow("international", false);
    selectedCountryCode = "";
    pendingCountryCode = "";
    countryInput.value = "";
    internationalConsent.hidden = true;
    renderCountrySelection("");
    countryTrigger.setAttribute("aria-invalid", "false");
    countryError.hidden = true;
    successView.hidden = true;
    formIsDirty = false;
    resetValidationFeedback();
  }

  function performSwitchAccount() {
    clearApplicationDraft();
    window.google?.accounts?.id?.disableAutoSelect();
    setAccount(null);
  }

  function requestAccountSwitch() {
    openDiscardDialog({
      type: "switch",
      hasDraft: hasUnsavedApplication()
    });
  }

  routeLeaveGuard = (fromRoute, toRoute, routeContext = {}) => {
    if (allowNextRouteChange) {
      allowNextRouteChange = false;
      return false;
    }
    if (fromRoute !== "submit" || toRoute === "submit" || !hasUnsavedApplication()) return false;
    openDiscardDialog({
      type: "route",
      routeId: toRoute,
      detailsTarget: routeContext.detailsTarget,
      hasDraft: true
    });
    return true;
  };

  buildCountryOptions();
  renderCountrySelection("");
  countryTrigger.addEventListener("click", openCountryDialog);
  countrySearch.addEventListener("input", () => filterCountryOptions(countrySearch.value));
  countryClose.addEventListener("click", closeCountryDialog);
  countryCancel.addEventListener("click", closeCountryDialog);
  countryConfirm.addEventListener("click", confirmCountrySelection);
  countryDialog.addEventListener("close", () => {
    document.body.classList.remove("terms-modal-open");
  });
  countryDialog.addEventListener("click", (event) => {
    if (event.target === countryDialog) closeCountryDialog();
  });
  thumbnailInput.addEventListener("change", updateThumbnailPreview);
  gameDescription.addEventListener("input", updateDescriptionCount);
  platformOptions.forEach((option) => {
    option.addEventListener("change", updatePlatformOther);
  });
  resetProjectFields();
  createValidationRules();
  bindValidationFeedback();
  resetValidationFeedback();
  applicationForm.addEventListener("input", () => {
    formIsDirty = true;
  });
  applicationForm.addEventListener("change", () => {
    formIsDirty = true;
  });

  submitPage.querySelectorAll("[data-consent-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const key = trigger.dataset.consentTrigger;
      if (consentState[key]) {
        formIsDirty = true;
        touchedValidationKeys.add(`${key}-consent`);
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
    formIsDirty = true;
    touchedValidationKeys.add(`${activeConsent}-consent`);
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
  discardClose.addEventListener("click", closeDiscardDialog);
  discardCancel.addEventListener("click", closeDiscardDialog);
  discardConfirm.addEventListener("click", () => {
    const action = pendingDiscardAction;
    closeDiscardDialog();
    if (!action) return;
    if (action.type === "switch") {
      performSwitchAccount();
      return;
    }
    clearApplicationDraft();
    allowNextRouteChange = true;
    location.hash = action.detailsTarget
      ? `${action.routeId}:${action.detailsTarget}`
      : action.routeId;
  });
  discardDialog.addEventListener("close", () => {
    pendingDiscardAction = null;
    document.body.classList.remove("terms-modal-open");
  });
  discardDialog.addEventListener("click", (event) => {
    if (event.target === discardDialog) closeDiscardDialog();
  });
  window.addEventListener("beforeunload", (event) => {
    if (!hasUnsavedApplication()) return;
    event.preventDefault();
    event.returnValue = "";
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

  switchAccountButtons.forEach((button) => {
    button.addEventListener("click", requestAccountSwitch);
  });
  submitAnotherButton.addEventListener("click", startAnotherSubmission);

  applicationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hasSubmittedForm = true;
    syncCountryConsent(false);
    const invalidRules = validationRules
      .map((rule) => ({ rule, message: validateRule(rule, true) }))
      .filter(({ message }) => Boolean(message));

    if (invalidRules.length) {
      const firstInvalid = invalidRules[0].rule;
      formStatus.textContent = `필수 항목을 입력하고 형식을 확인해주세요. 표시된 ${invalidRules.length}개 항목을 확인해주세요.`;
      formStatus.classList.add("is-error");
      formStatus.classList.remove("is-success");
      firstInvalid.container.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center"
      });
      window.setTimeout(() => {
        firstInvalid.focusTarget?.focus({ preventScroll: true });
      }, reducedMotion ? 0 : 350);
      return;
    }

    formStatus.textContent = "모든 필수 항목을 확인했습니다.";
    formStatus.classList.remove("is-error");
    formStatus.classList.add("is-success");
    showSubmissionSuccess();
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
