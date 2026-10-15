const $ = (id) => document.getElementById(id);

const PRESETS = [
  {
    name: "دائري",
    dot: "dots",
    corner: "dot",
    cd: "dot",
    fg: "#5B21B6",
    bg: "#FFFFFF",
  },
  {
    name: "ناعم",
    dot: "rounded",
    corner: "extra-rounded",
    cd: "dot",
    fg: "#1E1B4B",
    bg: "#FFFFFF",
  },
  {
    name: "كلاسيكي",
    dot: "square",
    corner: "square",
    cd: "square",
    fg: "#0B0D12",
    bg: "#FFFFFF",
  },
  {
    name: "أزرق",
    dot: "rounded",
    corner: "square",
    cd: "square",
    fg: "#1D4ED8",
    bg: "#EFF6FF",
  },
  {
    name: "بنفسجي",
    dot: "extra-rounded",
    corner: "extra-rounded",
    cd: "dot",
    fg: "#6D28D9",
    bg: "#FFFFFF",
  },
  {
    name: "كلاسي",
    dot: "classy-rounded",
    corner: "extra-rounded",
    cd: "dot",
    fg: "#312E81",
    bg: "#F5F3FF",
  },
];
const SWATCHES = [
  "#0B0D12",
  "#1E1B4B",
  "#4C1D95",
  "#6D28D9",
  "#1D4ED8",
  "#0E7490",
  "#047857",
  "#B91C1C",
];
const PH = {
  link: "https://example.com",
  text: "اكتب أي نص",
  email: "name@example.com",
  phone: "+20 100 000 0000",
};

const S = {
  type: "link",
  ...PRESETS[0],
  logo: null,
  active: 0,
  capStyle: 0,
  logoPct: 26,
};

const CAP_STYLES = [
  { name: "عادي", font: "Tajawal", weight: 500 },
  { name: "عريض", font: "Tajawal", weight: 800 },
  { name: "تقني", font: "Space Grotesk", weight: 700 },
  { name: "شريط", font: "Tajawal", weight: 700, pill: true },
];

function buildCapStyles() {
  const box = $("capStyles");
  CAP_STYLES.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "type" + (i === S.capStyle ? " active" : "");
    b.textContent = c.name;
    b.onclick = () => {
      S.capStyle = i;
      box
        .querySelectorAll(".type")
        .forEach((x, j) => x.classList.toggle("active", j === i));
      update();
    };
    box.appendChild(b);
  });
}

function mini(el, p, size, data = "https://is-qr.vercel.app") {
  el.innerHTML = "";
  new QRCodeStyling({
    width: size,
    height: size,
    type: "canvas",
    data,
    margin: 6,
    qrOptions: { errorCorrectionLevel: "M" },
    dotsOptions: { type: p.dot, color: p.fg },
    cornersSquareOptions: { type: p.corner, color: p.fg },
    cornersDotOptions: { type: p.cd, color: p.fg },
    backgroundOptions: { color: p.bg },
  }).append(el);
}

function svgSize(svg) {
  const vb = svg.getAttribute("viewBox");
  return vb
    ? +vb.trim().split(/[\s,]+/)[2]
    : parseFloat(svg.getAttribute("width"));
}

function addLogo(root, doc, W) {
  const ns = "http://www.w3.org/2000/svg";
  const L = (W * S.logoPct) / 100,
    B = L + W * 0.05,
    o = (W - B) / 2;
  const tile = doc.createElementNS(ns, "rect");
  tile.setAttribute("x", o);
  tile.setAttribute("y", o);
  tile.setAttribute("width", B);
  tile.setAttribute("height", B);
  tile.setAttribute("rx", B * 0.2);
  tile.setAttribute("fill", S.bg);
  const im = doc.createElementNS(ns, "image");
  im.setAttribute("href", S.logo);
  im.setAttribute("x", (W - L) / 2);
  im.setAttribute("y", (W - L) / 2);
  im.setAttribute("width", L);
  im.setAttribute("height", L);
  im.setAttribute("preserveAspectRatio", "xMidYMid meet");
  root.appendChild(tile);
  root.appendChild(im);
}

function opts(data, size) {
  return {
    width: size,
    height: size,
    type: "canvas",
    data,
    margin: 8,
    qrOptions: { errorCorrectionLevel: S.logo ? "H" : "M" },
    dotsOptions: { type: S.dot, color: S.fg },
    cornersSquareOptions: { type: S.corner, color: S.fg },
    cornersDotOptions: { type: S.cd, color: S.fg },
    backgroundOptions: { color: S.bg },
  };
}

function parse() {
  const v = $("main").value.trim();
  let data = "",
    msg = "";
  switch (S.type) {
    case "link": {
      if (!v) break;
      const url = /^https?:\/\//i.test(v) ? v : "https://" + v;
      try {
        new URL(url);
        data = url;
      } catch {
        msg = "الرابط غير صحيح";
      }
      break;
    }
    case "text":
      if (!v) msg = "اكتب النص";
      else if (v.length > 500) msg = "الحد الأقصى 500 حرف";
      else data = v;
      break;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        msg = "البريد الإلكتروني غير صحيح";
      else data = "mailto:" + v;
      break;
    case "phone":
      if (!/^\+?[0-9\s-]{6,20}$/.test(v)) msg = "رقم الهاتف غير صحيح";
      else data = "tel:" + v.replace(/[\s-]/g, "");
      break;
    case "wifi": {
      const ssid = $("ssid").value.trim(),
        pass = $("wpass").value,
        sec = $("wsec").value;
      const esc = (s) => s.replace(/([\\;,:"])/g, "\\$1");
      if (!ssid) msg = "اكتب اسم الشبكة";
      else if (sec !== "nopass" && pass.length < 8)
        msg = "كلمة السر 8 أحرف على الأقل";
      else
        data = `WIFI:T:${sec};S:${esc(ssid)};P:${sec === "nopass" ? "" : esc(pass)};;`;
      break;
    }
  }
  $("main").classList.toggle("invalid", !!msg && S.type !== "wifi");
  $("err").textContent = msg;
  return data;
}

function ratio(a, b) {
  const L = (h) => {
    const c = [1, 3, 5]
      .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const x = L(a),
    y = L(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function draw(el, data, size) {
  el.innerHTML = "";
  new QRCodeStyling(opts(data, size)).append(el);
}

function update() {
  const data = parse();
  draw($("qrBox"), data || "https://is-qr.vercel.app", 260);
  if (S.logo) {
    const svg = $("qrBox").querySelector("svg");
    if (svg) addLogo(svg, document, svgSize(svg));
  }
  const cap = $("capIn").value.trim(),
    capEl = $("capOut"),
    cs = CAP_STYLES[S.capStyle];
  capEl.textContent = cap;
  capEl.hidden = !cap;
  capEl.className =
    "cap " + ["cap-normal", "cap-bold", "cap-tech", "cap-pill"][S.capStyle];
  capEl.style.setProperty("--cap-fg", cs.pill ? S.bg : S.fg);
  capEl.style.setProperty("--cap-bg", cs.pill ? S.fg : "transparent");
  const r = ratio(S.fg, S.bg),
    st = $("scanStatus");
  if (r < 3) {
    st.textContent = "التباين ضعيف، قد لا يقرأ الهاتف الرمز";
    st.className = "status status-bad";
  } else {
    st.textContent = "الرمز جاهز للمسح";
    st.className = "status ok";
  }
}

function setType(t) {
  S.type = t;
  document
    .querySelectorAll("#types .type")
    .forEach((b) => b.classList.toggle("active", b.dataset.type === t));
  const w = t === "wifi";
  $("mainWrap").hidden = w;
  $("wifiWrap").hidden = !w;
  const m = $("main");
  m.type = t === "email" ? "email" : t === "phone" ? "tel" : "text";
  m.placeholder = PH[t] || "";
  m.classList.toggle("dir-rtl", t === "text");
  m.classList.toggle("dir-ltr", t !== "text");
  update();
}

function applyPreset(i) {
  S.active = i;
  const p = PRESETS[i];
  Object.assign(S, {
    dot: p.dot,
    corner: p.corner,
    cd: p.cd,
    fg: p.fg,
    bg: p.bg,
  });
  $("dotType").value = S.dot;
  $("cornerType").value = S.corner;
  $("cornerDot").value = S.cd;
  $("fgIn").value = S.fg;
  $("bgIn").value = S.bg;
  document
    .querySelectorAll(".preset")
    .forEach((b, j) => b.classList.toggle("active", j === i));
  update();
}

function buildPresets() {
  const box = $("presets");
  PRESETS.forEach((p, i) => {
    const b = document.createElement("button");
    b.className = "preset";
    b.innerHTML = `<div class="mini" style="--mini-bg:${p.bg}"></div><span>${p.name}</span>`;
    b.onclick = () => applyPreset(i);
    box.appendChild(b);
    mini(b.querySelector(".mini"), p, 96);
  });
}

function buildSwatches() {
  const box = $("swatches");
  SWATCHES.forEach((c) => {
    const d = document.createElement("button");
    d.className = "sw";
    d.style.setProperty("--sw", c);
    d.title = c;
    d.onclick = () => {
      S.fg = c;
      $("fgIn").value = c;
      update();
    };
    box.appendChild(d);
  });
}

document
  .querySelectorAll("#types .type")
  .forEach((b) => (b.onclick = () => setType(b.dataset.type)));
["main", "ssid", "wpass"].forEach((id) =>
  $(id).addEventListener("input", update),
);
$("wsec").addEventListener("change", update);
$("capIn").addEventListener("input", update);
$("logoSize").addEventListener("input", (e) => {
  S.logoPct = +e.target.value;
  $("logoPctTxt").textContent = S.logoPct + "%";
  update();
});
$("dotType").onchange = (e) => {
  S.dot = e.target.value;
  update();
};
$("cornerType").onchange = (e) => {
  S.corner = e.target.value;
  update();
};
$("cornerDot").onchange = (e) => {
  S.cd = e.target.value;
  update();
};
$("fgIn").addEventListener("input", (e) => {
  S.fg = e.target.value;
  update();
});
$("bgIn").addEventListener("input", (e) => {
  S.bg = e.target.value;
  update();
});

$("logoIn").addEventListener("change", (e) => {
  const f = e.target.files[0];
  $("logoErr").textContent = "";
  if (!f) return;
  if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(f.type)) {
    $("logoErr").textContent = "نوع الملف غير مدعوم";
    e.target.value = "";
    return;
  }
  if (f.size > 2 * 1024 * 1024) {
    $("logoErr").textContent = "حجم الشعار يجب ألا يتجاوز 2 ميجا";
    e.target.value = "";
    return;
  }
  const r = new FileReader();
  r.onload = () => {
    S.logo = r.result;
    $("logoName").textContent = f.name;
    $("rmLogo").hidden = false;
    update();
  };
  r.readAsDataURL(f);
});
$("rmLogo").onclick = () => {
  S.logo = null;
  $("logoIn").value = "";
  $("logoName").textContent = "لم يتم رفع شعار";
  $("rmLogo").hidden = true;
  update();
};

function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 1800);
}

function save(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

async function renderRaw(data, size, fmt) {
  const h = document.createElement("div");
  h.className = "hidden-render";
  document.body.appendChild(h);
  const q = new QRCodeStyling(opts(data, size));
  q.append(h);
  try {
    return await q.getRawData(fmt);
  } finally {
    h.remove();
  }
}

$("dlBtn").onclick = async () => {
  const data = parse();
  if (!data) return;
  const size = +$("resIn").value,
    cap = $("capIn").value.trim(),
    fmt = $("fmt").value;
  try {
    if (fmt === "svg") {
      const raw = await renderRaw(data, size, "svg");
      if (!cap && !S.logo) {
        save(raw, "is-qr.svg");
        return;
      }
      const pad = cap ? Math.round(size * 0.08) : 0,
        fs = Math.round(size * 0.065);
      const gap = cap ? Math.round(fs * 1.6) : 0,
        W = size + pad * 2,
        H = size + pad * 2 + gap;
      const doc = new DOMParser().parseFromString(
        await raw.text(),
        "image/svg+xml",
      );
      const root = doc.documentElement,
        ns = "http://www.w3.org/2000/svg";
      if (S.logo) addLogo(root, doc, svgSize(root));
      root.setAttribute("width", W);
      root.setAttribute("height", H);
      root.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const bg = doc.createElementNS(ns, "rect");
      bg.setAttribute("width", W);
      bg.setAttribute("height", H);
      bg.setAttribute("fill", S.bg);
      const g = doc.createElementNS(ns, "g");
      g.setAttribute("transform", `translate(${pad} ${pad})`);
      while (root.firstChild) g.appendChild(root.firstChild);
      const t = doc.createElementNS(ns, "text");
      t.setAttribute("x", W / 2);
      t.setAttribute("y", pad + size + gap / 2);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("dominant-baseline", "middle");
      const cs = CAP_STYLES[S.capStyle],
        ty = pad + size + gap / 2;
      const fitFs = Math.min(fs, (W * 0.92) / (cap.length * 0.55));
      t.setAttribute("font-family", cs.font + ", sans-serif");
      t.setAttribute("font-weight", cs.weight);
      t.setAttribute("font-size", fitFs);
      t.setAttribute("fill", cs.pill ? S.bg : S.fg);
      t.setAttribute("y", ty);
      t.textContent = cap;
      root.append(bg, g);
      if (cs.pill && cap) {
        const tw = cap.length * fitFs * 0.6 + fitFs * 1.4,
          ph = fitFs * 1.7,
          pr = doc.createElementNS(ns, "rect");
        pr.setAttribute("x", W / 2 - tw / 2);
        pr.setAttribute("y", ty - ph / 2);
        pr.setAttribute("width", tw);
        pr.setAttribute("height", ph);
        pr.setAttribute("rx", ph / 2);
        pr.setAttribute("fill", S.fg);
        root.append(pr);
      }
      root.append(t);
      save(
        new Blob([new XMLSerializer().serializeToString(root)], {
          type: "image/svg+xml",
        }),
        "is-qr.svg",
      );
    } else {
      const raw = await renderRaw(data, size, "png");
      const img = new Image();
      img.src = URL.createObjectURL(raw);
      await img.decode();
      const pad = cap ? Math.round(size * 0.08) : 0;
      const fs = Math.round(size * 0.065),
        gap = cap ? Math.round(fs * 1.6) : 0;
      const W = size + pad * 2,
        H = size + pad * 2 + gap;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const x = c.getContext("2d");
      x.fillStyle = S.bg;
      x.fillRect(0, 0, W, H);
      x.drawImage(img, pad, pad, size, size);
      if (S.logo) {
        const li = new Image();
        li.src = S.logo;
        await li.decode();
        const cx = size / 2 + pad,
          cy = pad + size / 2,
          L = (size * S.logoPct) / 100,
          B = L + size * 0.05;
        const ar = li.naturalWidth / li.naturalHeight || 1;
        const lw = ar >= 1 ? L : L * ar,
          lh = ar >= 1 ? L / ar : L;
        x.fillStyle = S.bg;
        x.fillRect(cx - B / 2, cy - B / 2, B, B);
        x.drawImage(li, cx - lw / 2, cy - lh / 2, lw, lh);
      }
      if (cap) {
        const cs = CAP_STYLES[S.capStyle],
          ty = pad + size + gap / 2;
        let f = fs;
        x.font = `${cs.weight} ${f}px ${cs.font}, sans-serif`;
        while (x.measureText(cap).width > W * 0.92 && f > 8) {
          f--;
          x.font = `${cs.weight} ${f}px ${cs.font}, sans-serif`;
        }
        x.textAlign = "center";
        x.textBaseline = "middle";
        if (cs.pill) {
          const tw = x.measureText(cap).width + f * 1.4,
            ph = f * 1.7,
            r = ph / 2;
          const lx = W / 2 - tw / 2,
            ly = ty - ph / 2;
          x.fillStyle = S.fg;
          x.beginPath();
          x.moveTo(lx + r, ly);
          x.arcTo(lx + tw, ly, lx + tw, ly + ph, r);
          x.arcTo(lx + tw, ly + ph, lx, ly + ph, r);
          x.arcTo(lx, ly + ph, lx, ly, r);
          x.arcTo(lx, ly, lx + tw, ly, r);
          x.closePath();
          x.fill();
          x.fillStyle = S.bg;
        } else x.fillStyle = S.fg;
        x.fillText(cap, W / 2, ty);
      }
      c.toBlob((b) => save(b, "is-qr.png"), "image/png");
    }
    toast("تم التحميل");
  } catch (e) {
    toast("تعذّر إنشاء الملف، جرّب مرة تانية");
  }
};

function startPage() {
  buildPresets();
  buildSwatches();
  mini($("heroBox"), PRESETS[1], 230);
  applyPreset(2);
  buildCapStyles();
  setType("link");
  if (typeof AOS !== "undefined") AOS.init({ duration: 1200, once: false, offset: 100 });
}

if (typeof QRCodeStyling !== "undefined") {
  startPage();
} else {
  window.addEventListener("load", () => {
    if (typeof QRCodeStyling !== "undefined") startPage();
    else {
      const st = $("scanStatus");
      st.textContent =
        "تعذّر تحميل مكتبة الـ QR. تأكد من الإنترنت ثم حدّث الصفحة";
      st.className = "status status-bad";
    }
  });
}
