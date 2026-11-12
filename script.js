/* ============================================================
   script.js — Funciones compartidas de la serie "Aprender desde 0"
   1) Muestra tu IP pública en la esquina superior derecha.
   2) Contador de visitas por página (localStorage) + panel.
   3) Simulador de consola para practicar comandos.
   Sin dependencias. Funciona con file:// y en GitHub Pages.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. IP pública en la esquina ---------- */
  function showIP() {
    var box = document.createElement("div");
    box.id = "ip-corner";
    box.innerHTML = "🌐 IP: <span id='ip-val'>cargando…</span>";
    document.body.appendChild(box);
    fetch("https://api.ipify.org?format=json")
      .then(function (r) { return r.json(); })
      .then(function (d) { document.getElementById("ip-val").textContent = d.ip; })
      .catch(function () { document.getElementById("ip-val").textContent = "(sin conexión)"; });
  }

  /* ---------- 2. Contador de visitas (localStorage) ---------- */
  function trackVisit() {
    var key = "visitas::" + location.pathname.split("/").pop();
    var n = parseInt(localStorage.getItem(key) || "0", 10) + 1;
    localStorage.setItem(key, String(n));
    // total del sitio
    var totalKey = "visitas::total";
    var total = parseInt(localStorage.getItem(totalKey) || "0", 10) + 1;
    localStorage.setItem(totalKey, String(total));
    return { page: n, total: total };
  }

  function renderVisitPanel(stats) {
    var panel = document.createElement("div");
    panel.id = "visit-panel";
    panel.innerHTML =
      "<div class='vp-title'>📊 Panel de visitas (este navegador)</div>" +
      "<div class='vp-row'><span>Esta página:</span><b>" + stats.page + "</b></div>" +
      "<div class='vp-row'><span>Total del sitio:</span><b>" + stats.total + "</b></div>" +
      "<div class='vp-note'>Para tráfico real (todos los usuarios) agregá Google Analytics o Plausible en el HTML.</div>";
    document.body.appendChild(panel);
  }

  /* ---------- 3. Simulador de consola ---------- */
  var FS = {
    "/": ["home", "etc", "var", "usr", "tmp"],
    "/home": ["usuario"],
    "/home/usuario": ["documentos", "descargas", "proyectos", "notas.txt"],
  };
  var cwd = "/home/usuario";
  var user = "usuario";
  var host = "localhost";

  var commands = {
    help: function () {
      return "Comandos disponibles:\n" +
        "  ls, cd, pwd, cat, echo, clear, whoami, hostname, date, uname,\n" +
        "  ipconfig, ip a, ping, mkdir, touch, rm, help, exit\n" +
        "Escribí un comando y Enter. 'clear' limpia la pantalla.";
    },
    ls: function (args) {
      var dir = args[0] ? resolvePath(args[0]) : cwd;
      var entries = FS[dir];
      if (!entries) return "ls: no se puede acceder a '" + dir + "': No existe el directorio";
      return entries.join("  ");
    },
    cd: function (args) {
      if (!args[0] || args[0] === "~") { cwd = "/home/usuario"; return ""; }
      var target = resolvePath(args[0]);
      if (FS[target]) { cwd = target; return ""; }
      return "cd: " + args[0] + ": No existe el directorio";
    },
    pwd: function () { return cwd; },
    cat: function (args) {
      if (!args[0]) return "cat: falta operando";
      if (args[0].endsWith("notas.txt")) return "Mis notas de estudio:\n- Repasar redes\n- Practicar bash\n- Leer sobre crypto";
      return "cat: " + args[0] + ": No existe el archivo";
    },
    echo: function (args) { return args.join(" "); },
    clear: function () { return "__CLEAR__"; },
    whoami: function () { return user; },
    hostname: function () { return host; },
    date: function () { return new Date().toString(); },
    uname: function () { return "Linux " + host + " 6.8.0-generic x86_64 GNU/Linux"; },
    "ipconfig": function () { return "Adaptador de Ethernet:\n  IPv4: 192.168.1.42\n  Máscara: 255.255.255.0\n  Puerta de enlace: 192.168.1.1"; },
    "ip": function (args) {
      if (args[0] === "a") return "1: lo: <LOOPBACK> inet 127.0.0.1/8\n2: eth0: <UP> inet 192.168.1.42/24";
      return "Uso: ip a | ip route";
    },
    ping: function (args) {
      if (!args[0]) return "ping: falta operando";
      return "PING " + args[0] + ": 56 bytes, time=12.4 ms\nPING " + args[0] + ": 56 bytes, time=11.9 ms\n--- " + args[0] + " ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss";
    },
    mkdir: function (args) {
      if (!args[0]) return "mkdir: falta operando";
      var target = resolvePath(args[0]);
      if (!FS[cwd]) FS[cwd] = [];
      if (FS[cwd].indexOf(args[0]) === -1) FS[cwd].push(args[0]);
      FS[target] = [];
      return "";
    },
    touch: function (args) {
      if (!args[0]) return "touch: falta operando";
      if (!FS[cwd]) FS[cwd] = [];
      if (FS[cwd].indexOf(args[0]) === -1) FS[cwd].push(args[0]);
      return "";
    },
    rm: function (args) {
      if (!args[0]) return "rm: falta operando";
      if (FS[cwd]) {
        var i = FS[cwd].indexOf(args[0]);
        if (i !== -1) { FS[cwd].splice(i, 1); delete FS[resolvePath(args[0])]; return ""; }
      }
      return "rm: no se puede borrar '" + args[0] + "': No existe";
    },
    exit: function () { return "Sesión cerrada. Escribí 'help' para volver a empezar."; }
  };

  function resolvePath(p) {
    if (p.startsWith("/")) return p.replace(/\/+$/, "") || "/";
    if (p === "..") {
      var parts = cwd.split("/").filter(Boolean);
      parts.pop();
      return "/" + parts.join("/");
    }
    if (p === ".") return cwd;
    return (cwd === "/" ? "" : cwd) + "/" + p;
  }

  function initConsole(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var term = document.createElement("div");
    term.className = "console";
    term.innerHTML =
      "<div class='console-bar'><span class='dot red'></span><span class='dot yellow'></span><span class='dot green'></span><span class='console-title'>terminal — practicá aquí</span></div>" +
      "<div class='console-body' id='console-body-" + containerId + "'></div>" +
      "<div class='console-input-row'><span class='prompt'>" + user + "@" + host + ":" + cwd + "$</span><input class='console-input' id='console-input-" + containerId + "' name='console-input' type='text' autocomplete='off' spellcheck='false' placeholder='escribí un comando y Enter…'></div>";
    container.appendChild(term);

    var body = term.querySelector(".console-body");
    var input = term.querySelector(".console-input");
    var promptEl = term.querySelector(".prompt");

    function print(text, cls) {
      if (text === "__CLEAR__") { body.innerHTML = ""; return; }
      var div = document.createElement("div");
      div.className = "console-line " + (cls || "");
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function updatePrompt() {
      promptEl.textContent = user + "@" + host + ":" + cwd + "$";
    }

    // Mensaje de bienvenida
    print("Bienvenido al simulador de terminal. Escribí 'help' para ver los comandos.", "info");
    print("Probá: ls, cd documentos, cat notas.txt, whoami, ip a, ping google.com", "info");

    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var raw = input.value.trim();
      input.value = "";
      if (!raw) { updatePrompt(); return; }
      // echo del comando
      var echo = document.createElement("div");
      echo.className = "console-line cmd";
      echo.textContent = promptEl.textContent + " " + raw;
      body.appendChild(echo);
      body.scrollTop = body.scrollHeight;

      var parts = raw.split(/\s+/);
      var cmd = parts[0].toLowerCase();
      var args = parts.slice(1);
      if (commands[cmd]) {
        var out = commands[cmd](args);
        if (out) print(out);
      } else {
        print(cmd + ": comando no encontrado. Escribí 'help'.", "err");
      }
      updatePrompt();
    });

    // Foco al hacer clic en la terminal
    term.addEventListener("click", function () { input.focus(); });
  }

  /* ---------- Inicialización ---------- */
  function init() {
    showIP();
    var stats = trackVisit();
    renderVisitPanel(stats);
    // Inicializar consolas si existen
    var consoles = document.querySelectorAll("[data-console]");
    consoles.forEach(function (el) { initConsole(el.id); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Exponer para uso manual
  window.initConsole = initConsole;
})();
