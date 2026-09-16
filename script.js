document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  const copyText = async (text, button) => {
    try {
      await navigator.clipboard.writeText(text);
      const old = button.textContent;
      button.textContent = "Copied!";
      setTimeout(() => button.textContent = old, 1200);
    } catch {
      alert("Copy failed. Please copy the text manually.");
    }
  };

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const renderResults = (target, items) => {
    target.innerHTML = "";
    if (!items.length) {
      target.innerHTML = '<p class="note">No results yet.</p>';
      return;
    }
    items.forEach(item => {
      const row = document.createElement("div");
      row.className = "result-item";
      const text = document.createElement("span");
      text.textContent = item;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Copy";
      btn.addEventListener("click", () => copyText(item, btn));
      row.append(text, btn);
      target.appendChild(row);
    });
  };

  const scrambleInput = document.getElementById("scrambleInput");
  const scrambleBtn = document.getElementById("scrambleBtn");
  const scrambleResults = document.getElementById("scrambleResults");

  if (scrambleBtn && scrambleInput && scrambleResults) {
    scrambleBtn.addEventListener("click", () => {
      const raw = scrambleInput.value.trim();
      if (raw.length < 2) {
        scrambleResults.innerHTML = '<p class="note">Enter at least 2 characters.</p>';
        return;
      }

      const count = Number(document.getElementById("resultCount")?.value || 10);
      const preserveSpaces = document.getElementById("preserveSpaces")?.checked;
      const preserveEnds = document.getElementById("preserveEnds")?.checked;

      let results = new Set();
      let attempts = 0;
      const maxAttempts = 500;

      while (results.size < count && attempts < maxAttempts) {
        attempts++;
        let output = "";

        if (preserveEnds && raw.length > 3) {
          const first = raw[0];
          const last = raw[raw.length - 1];
          const middle = raw.slice(1, -1).split("");
          output = first + shuffle(middle).join("") + last;
        } else if (preserveSpaces) {
          const chars = raw.replace(/\s/g, "").split("");
          const mixed = shuffle(chars);
          let idx = 0;
          output = raw.split("").map(ch => /\s/.test(ch) ? ch : mixed[idx++]).join("");
        } else {
          output = shuffle(raw.split("")).join("");
        }

        if (output !== raw) results.add(output);
      }

      renderResults(scrambleResults, [...results]);
    });

    document.getElementById("clearScrambleBtn")?.addEventListener("click", () => {
      scrambleInput.value = "";
      scrambleResults.innerHTML = "";
      scrambleInput.focus();
    });

    scrambleInput.addEventListener("keydown", e => {
      if (e.key === "Enter") scrambleBtn.click();
    });
  }

  const unscrambleInput = document.getElementById("unscrambleInput");
  const unscrambleBtn = document.getElementById("unscrambleBtn");
  const unscrambleResults = document.getElementById("unscrambleResults");

  if (unscrambleBtn && unscrambleInput && unscrambleResults) {
    unscrambleBtn.addEventListener("click", () => {
      const raw = unscrambleInput.value.replace(/\s+/g, "").trim();
      if (raw.length < 2) {
        unscrambleResults.innerHTML = '<p class="note">Enter at least 2 letters.</p>';
        return;
      }
      const results = new Set();
      let attempts = 0;
      while (results.size < 20 && attempts < 800) {
        attempts++;
        const s = shuffle(raw.split("")).join("");
        if (s !== raw) results.add(s);
      }
      renderResults(unscrambleResults, [...results]);
    });

    document.getElementById("clearUnscrambleBtn")?.addEventListener("click", () => {
      unscrambleInput.value = "";
      unscrambleResults.innerHTML = "";
    });
  }

  const anagramInput = document.getElementById("anagramInput");
  const anagramBtn = document.getElementById("anagramBtn");
  const anagramResults = document.getElementById("anagramResults");

  if (anagramBtn && anagramInput && anagramResults) {
    anagramBtn.addEventListener("click", () => {
      const raw = anagramInput.value.trim();
      if (raw.length < 2) {
        anagramResults.innerHTML = '<p class="note">Enter at least 2 characters.</p>';
        return;
      }
      const chars = raw.replace(/\s/g, "").split("");
      const results = new Set();
      let attempts = 0;
      while (results.size < 15 && attempts < 600) {
        attempts++;
        const s = shuffle(chars).join("");
        if (s.toLowerCase() !== raw.replace(/\s/g, "").toLowerCase()) results.add(s);
      }
      renderResults(anagramResults, [...results]);
    });

    document.getElementById("clearAnagramBtn")?.addEventListener("click", () => {
      anagramInput.value = "";
      anagramResults.innerHTML = "";
    });
  }

  const wordBank = {
    noun: ["forest","planet","window","ocean","garden","engine","bridge","pencil","camera","island","shadow","river","cloud","market","castle","signal","puzzle","coffee","mountain","lantern","notebook","harbor","meadow","village","compass"],
    verb: ["build","explore","create","discover","write","travel","learn","imagine","solve","design","jump","wander","listen","observe","connect","improve","focus","share","think","grow","spark","shape","move","invent","search"],
    adjective: ["bright","gentle","rapid","clever","quiet","bold","fresh","calm","curious","vivid","simple","modern","brave","happy","useful","creative","smooth","strong","playful","clear","smart","elegant","warm","wild","nimble"]
  };

  const randomWordBtn = document.getElementById("randomWordBtn");
  const randomWordResults = document.getElementById("randomWordResults");

  if (randomWordBtn && randomWordResults) {
    randomWordBtn.addEventListener("click", () => {
      const category = document.getElementById("wordCategory").value;
      const count = Number(document.getElementById("randomCount").value);
      const pool = category === "all"
        ? [...wordBank.noun, ...wordBank.verb, ...wordBank.adjective]
        : wordBank[category];
      const picks = shuffle(pool).slice(0, count);
      renderResults(randomWordResults, picks);
    });
  }

  const counterInput = document.getElementById("counterInput");
  if (counterInput) {
    const updateCounts = () => {
      const text = counterInput.value;
      const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
      const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
      const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0) : [];

      document.getElementById("wordCount").textContent = words.length;
      document.getElementById("charCount").textContent = text.length;
      document.getElementById("charNoSpaceCount").textContent = text.replace(/\s/g, "").length;
      document.getElementById("sentenceCount").textContent = sentences.length;
      document.getElementById("paragraphCount").textContent = paragraphs.length;
      const minutes = words.length === 0 ? 0 : Math.max(1, Math.ceil(words.length / 200));
      document.getElementById("readingTime").textContent = `${minutes} min`;
    };
    counterInput.addEventListener("input", updateCounts);
    document.getElementById("clearCounterBtn")?.addEventListener("click", () => {
      counterInput.value = "";
      updateCounts();
      counterInput.focus();
    });
  }

  const textToolsInput = document.getElementById("textToolsInput");
  const textToolsOutput = document.getElementById("textToolsOutput");

  if (textToolsInput && textToolsOutput) {
    document.querySelectorAll(".text-action").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = textToolsInput.value;
        const action = btn.dataset.action;
        let out = text;

        if (action === "reverse") out = [...text].reverse().join("");
        if (action === "sort") out = text.split(/\s+/).filter(Boolean).sort((a,b) => a.localeCompare(b)).join(" ");
        if (action === "dedupe") out = [...new Set(text.split(/\s+/).filter(Boolean))].join(" ");
        if (action === "upper") out = text.toUpperCase();
        if (action === "lower") out = text.toLowerCase();
        if (action === "title") out = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

        textToolsOutput.value = out;
      });
    });

    document.getElementById("copyTextToolsBtn")?.addEventListener("click", function() {
      if (textToolsOutput.value) copyText(textToolsOutput.value, this);
    });

    document.getElementById("clearTextToolsBtn")?.addEventListener("click", () => {
      textToolsInput.value = "";
      textToolsOutput.value = "";
    });
  }
});
