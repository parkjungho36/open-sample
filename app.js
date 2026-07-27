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
