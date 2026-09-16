"use strict";

/* =========================================================
   WORD SCRIBBLE
   Main JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
   DARK / LIGHT MODE
===================================================== */

const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("wordscribble-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

function updateThemeButton() {
    if (!themeToggle) return;

    const darkMode =
        document.body.classList.contains("dark-mode");

    themeToggle.textContent = darkMode ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
    );

    themeToggle.title =
        darkMode
            ? "Switch to light mode"
            : "Switch to dark mode";
}

updateThemeButton();

themeToggle?.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    const darkMode =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "wordscribble-theme",
        darkMode ? "dark" : "light"
    );

    updateThemeButton();
});

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    function randomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function shuffleArray(array) {
        const copy = [...array];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = randomInt(i + 1);
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }

        return copy;
    }

    function escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function showMessage(container, message, type = "info") {
        if (!container) return;

        container.innerHTML = `
            <div class="result-message ${type}">
                ${escapeHTML(message)}
            </div>
        `;
    }

    function showResultItems(container, items) {
        if (!container) return;

        if (!items.length) {
            showMessage(container, "No results generated.");
            return;
        }

        container.innerHTML = `
            <div class="result-list">
                ${items
                    .map(
                        (item) => `
                            <button
                                type="button"
                                class="result-chip"
                                title="Click to copy"
                                data-copy="${escapeHTML(item)}"
                            >
                                ${escapeHTML(item)}
                            </button>
                        `
                    )
                    .join("")}
            </div>
        `;
    }

    async function copyText(text) {
        if (!text) return false;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }

            /* Fallback for local file testing */

            const textarea = document.createElement("textarea");

            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            textarea.style.pointerEvents = "none";

            document.body.appendChild(textarea);

            textarea.focus();
            textarea.select();

            const success = document.execCommand("copy");

            textarea.remove();

            return success;

        } catch (error) {
            console.error("Copy failed:", error);
            return false;
        }
    }

    function temporaryButtonText(button, text) {
        if (!button) return;

        const original = button.textContent;

        button.textContent = text;

        setTimeout(() => {
            button.textContent = original;
        }, 1400);
    }


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            const open = navLinks.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                String(open)
            );

        });


        navLinks.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    /* =====================================================
       WORD SCRAMBLER
    ===================================================== */

    const scrambleInput = $("scrambleInput");
    const resultCount = $("resultCount");
    const preserveSpaces = $("preserveSpaces");
    const preserveEnds = $("preserveEnds");
    const scrambleBtn = $("scrambleBtn");
    const clearScrambleBtn = $("clearScrambleBtn");
    const scrambleResults = $("scrambleResults");


    function shuffleCharacters(text) {
        return shuffleArray(Array.from(text)).join("");
    }


    function scrambleWord(word, keepEnds) {

        const chars = Array.from(word);

        if (chars.length <= 1) {
            return word;
        }

        if (keepEnds && chars.length > 2) {

            const first = chars[0];
            const last = chars[chars.length - 1];

            const middle = chars.slice(1, -1);

            return (
                first +
                shuffleArray(middle).join("") +
                last
            );
        }

        return shuffleArray(chars).join("");
    }


    function scrambleText(text, keepSpaces, keepEnds) {

        if (!keepSpaces) {
            return scrambleWord(
                text.replace(/\s+/g, ""),
                keepEnds
            );
        }

        return text
            .split(/(\s+)/)
            .map((part) => {

                if (/^\s+$/.test(part)) {
                    return part;
                }

                return scrambleWord(
                    part,
                    keepEnds
                );

            })
            .join("");
    }


    function generateScrambles() {

        if (!scrambleInput || !scrambleResults) return;

        const value = scrambleInput.value.trim();

        if (!value) {

            showMessage(
                scrambleResults,
                "Enter a word or phrase first.",
                "error"
            );

            scrambleInput.focus();

            return;
        }


        const requestedCount =
            Number(resultCount?.value || 10);

        const keepSpaces =
            Boolean(preserveSpaces?.checked);

        const keepEnds =
            Boolean(preserveEnds?.checked);


        const results = new Set();

        let attempts = 0;

        const maxAttempts =
            Math.max(100, requestedCount * 30);


        while (
            results.size < requestedCount &&
            attempts < maxAttempts
        ) {

            const scrambled = scrambleText(
                value,
                keepSpaces,
                keepEnds
            );

            if (scrambled !== value) {
                results.add(scrambled);
            }

            attempts++;
        }


        if (!results.size) {

            showMessage(
                scrambleResults,
                "This input cannot produce a different arrangement.",
                "info"
            );

            return;
        }


        showResultItems(
            scrambleResults,
            Array.from(results)
        );

    }


    scrambleBtn?.addEventListener(
        "click",
        generateScrambles
    );


    scrambleInput?.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {
                event.preventDefault();
                generateScrambles();
            }

        }
    );


    clearScrambleBtn?.addEventListener(
        "click",
        () => {

            scrambleInput.value = "";
            scrambleResults.innerHTML = "";

            scrambleInput.focus();

        }
    );


    /* =====================================================
       WORD UNSCRAMBLER
    ===================================================== */

    const unscrambleInput = $("unscrambleInput");
    const unscrambleBtn = $("unscrambleBtn");
    const clearUnscrambleBtn = $("clearUnscrambleBtn");
    const unscrambleResults = $("unscrambleResults");


    function generateUniquePermutations(
        text,
        maximum = 40
    ) {

        const characters = Array.from(text);

        const results = new Set();

        const used = new Array(
            characters.length
        ).fill(false);

        characters.sort();


        function backtrack(path) {

            if (results.size >= maximum) {
                return;
            }

            if (path.length === characters.length) {

                results.add(path.join(""));

                return;
            }


            for (
                let i = 0;
                i < characters.length;
                i++
            ) {

                if (used[i]) continue;

                if (
                    i > 0 &&
                    characters[i] === characters[i - 1] &&
                    !used[i - 1]
                ) {
                    continue;
                }


                used[i] = true;

                path.push(characters[i]);

                backtrack(path);

                path.pop();

                used[i] = false;


                if (results.size >= maximum) {
                    break;
                }

            }

        }


        backtrack([]);

        return Array.from(results);
    }


    function runUnscrambler() {

        if (
            !unscrambleInput ||
            !unscrambleResults
        ) {
            return;
        }


        const letters = unscrambleInput.value
            .trim()
            .replace(/\s+/g, "");


        if (!letters) {

            showMessage(
                unscrambleResults,
                "Enter some letters first.",
                "error"
            );

            unscrambleInput.focus();

            return;
        }


        /*
         Generating every permutation becomes extremely
         expensive very quickly.

         We therefore limit this browser version.
        */

        if (Array.from(letters).length > 8) {

            showMessage(
                unscrambleResults,
                "Please enter 8 letters or fewer for arrangement generation.",
                "error"
            );

            return;
        }


        let permutations =
            generateUniquePermutations(
                letters,
                40
            );


        /*
         Do not show the original input first.
        */

        permutations =
            permutations.filter(
                (word) =>
                    word.toLowerCase() !==
                    letters.toLowerCase()
            );


        if (!permutations.length) {

            showMessage(
                unscrambleResults,
                "No alternative arrangements could be generated."
            );

            return;
        }


        showResultItems(
            unscrambleResults,
            permutations
        );

    }


    unscrambleBtn?.addEventListener(
        "click",
        runUnscrambler
    );


    unscrambleInput?.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                runUnscrambler();

            }

        }
    );


    clearUnscrambleBtn?.addEventListener(
        "click",
        () => {

            unscrambleInput.value = "";

            unscrambleResults.innerHTML = "";

            unscrambleInput.focus();

        }
    );


    /* =====================================================
       ANAGRAM GENERATOR
    ===================================================== */

    const anagramInput = $("anagramInput");
    const anagramBtn = $("anagramBtn");
    const clearAnagramBtn = $("clearAnagramBtn");
    const anagramResults = $("anagramResults");


    function generateAnagrams() {

        if (!anagramInput || !anagramResults) {
            return;
        }


        const value = anagramInput.value.trim();


        if (!value) {

            showMessage(
                anagramResults,
                "Enter a word or phrase first.",
                "error"
            );

            anagramInput.focus();

            return;
        }


        const originalCharacters =
            Array.from(value);

        const results = new Set();

        let attempts = 0;


        while (
            results.size < 20 &&
            attempts < 500
        ) {

            const shuffled =
                shuffleArray(
                    originalCharacters
                ).join("");


            if (
                shuffled.toLowerCase() !==
                value.toLowerCase()
            ) {

                results.add(shuffled);

            }

            attempts++;

        }


        if (!results.size) {

            showMessage(
                anagramResults,
                "This input cannot produce another arrangement."
            );

            return;
        }


        showResultItems(
            anagramResults,
            Array.from(results)
        );

    }


    anagramBtn?.addEventListener(
        "click",
        generateAnagrams
    );


    anagramInput?.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                generateAnagrams();

            }

        }
    );


    clearAnagramBtn?.addEventListener(
        "click",
        () => {

            anagramInput.value = "";

            anagramResults.innerHTML = "";

            anagramInput.focus();

        }
    );


    /* =====================================================
       RANDOM WORD GENERATOR
    ===================================================== */

    const randomWords = {

        nouns: [

            "ocean",
            "forest",
            "planet",
            "river",
            "mountain",
            "garden",
            "window",
            "camera",
            "bridge",
            "library",

            "cloud",
            "computer",
            "keyboard",
            "pencil",
            "coffee",
            "island",
            "village",
            "journey",
            "music",
            "language",

            "dream",
            "story",
            "picture",
            "market",
            "flower",
            "sunrise",
            "rain",
            "book",
            "idea",
            "adventure",

            "engine",
            "castle",
            "paper",
            "school",
            "friend",
            "world",
            "light",
            "road",
            "tree",
            "star"

        ],


        verbs: [

            "create",
            "explore",
            "discover",
            "build",
            "write",
            "learn",
            "imagine",
            "travel",
            "design",
            "solve",

            "develop",
            "read",
            "think",
            "grow",
            "move",
            "listen",
            "search",
            "connect",
            "improve",
            "practice",

            "generate",
            "share",
            "organize",
            "transform",
            "compare",
            "study",
            "play",
            "draw",
            "teach",
            "calculate"

        ],


        adjectives: [

            "bright",
            "creative",
            "quiet",
            "rapid",
            "simple",
            "clever",
            "modern",
            "gentle",
            "bold",
            "curious",

            "useful",
            "fresh",
            "calm",
            "powerful",
            "friendly",
            "colorful",
            "smart",
            "unique",
            "quick",
            "happy",

            "small",
            "large",
            "smooth",
            "strong",
            "clear",
            "warm",
            "cool",
            "brave",
            "natural",
            "peaceful"

        ]

    };


    const wordCategory = $("wordCategory");
    const randomWordCount = $("randomWordCount");
    const randomWordBtn = $("randomWordBtn");
    const randomWordResults = $("randomWordResults");


    function generateRandomWords() {

        if (!randomWordResults) return;


        const category =
            wordCategory?.value || "all";


        const count =
            Number(
                randomWordCount?.value || 5
            );


        let pool;


        if (category === "all") {

            pool = [

                ...randomWords.nouns,
                ...randomWords.verbs,
                ...randomWords.adjectives

            ];

        } else {

            pool =
                randomWords[category] || [];

        }


        const shuffled =
            shuffleArray(pool);


        const result =
            shuffled.slice(
                0,
                Math.min(count, shuffled.length)
            );


        showResultItems(
            randomWordResults,
            result
        );

    }


    randomWordBtn?.addEventListener(
        "click",
        generateRandomWords
    );


    /* =====================================================
       WORD & CHARACTER COUNTER
    ===================================================== */

    const counterInput = $("counterInput");

    const wordCount = $("wordCount");
    const characterCount = $("characterCount");
    const characterNoSpaceCount =
        $("characterNoSpaceCount");

    const sentenceCount = $("sentenceCount");
    const paragraphCount = $("paragraphCount");
    const readingTime = $("readingTime");

    const clearCounterBtn =
        $("clearCounterBtn");


    function getWords(text) {

        if (!text.trim()) {
            return [];
        }


        /*
         Use Intl.Segmenter where available.
        */

        if (
            typeof Intl !== "undefined" &&
            typeof Intl.Segmenter === "function"
        ) {

            try {

                const segmenter =
                    new Intl.Segmenter(
                        undefined,
                        {
                            granularity: "word"
                        }
                    );


                return Array.from(
                    segmenter.segment(text)
                )
                    .filter(
                        (segment) =>
                            segment.isWordLike
                    )
                    .map(
                        (segment) =>
                            segment.segment
                    );

            } catch (error) {

                console.warn(
                    "Intl.Segmenter unavailable:",
                    error
                );

            }

        }


        return (
            text.match(
                /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu
            ) || []
        );

    }


    function getSentences(text) {

        if (!text.trim()) {
            return [];
        }


        if (
            typeof Intl !== "undefined" &&
            typeof Intl.Segmenter === "function"
        ) {

            try {

                const segmenter =
                    new Intl.Segmenter(
                        undefined,
                        {
                            granularity:
                                "sentence"
                        }
                    );


                return Array.from(
                    segmenter.segment(text)
                )
                    .map(
                        (segment) =>
                            segment.segment.trim()
                    )
                    .filter(Boolean);

            } catch (error) {

                console.warn(
                    "Sentence segmentation unavailable:",
                    error
                );

            }

        }


        return (
            text.match(
                /[^.!?]+[.!?]+|[^.!?]+$/g
            ) || []
        );

    }


    function updateCounter() {

        if (!counterInput) return;


        const text =
            counterInput.value;


        const words =
            getWords(text);


        const characters =
            Array.from(text).length;


        const charactersNoSpaces =
            Array.from(
                text.replace(/\s/g, "")
            ).length;


        const sentences =
            getSentences(text);


        const paragraphs =
            text.trim()
                ? text
                    .trim()
                    .split(/\n\s*\n/)
                    .filter(
                        (paragraph) =>
                            paragraph.trim()
                    ).length
                : 0;


        /*
         Approximate reading speed:
         200 words per minute.
        */

        const minutes =
            words.length === 0
                ? 0
                : Math.max(
                    1,
                    Math.ceil(
                        words.length / 200
                    )
                );


        if (wordCount) {
            wordCount.textContent =
                words.length;
        }


        if (characterCount) {
            characterCount.textContent =
                characters;
        }


        if (characterNoSpaceCount) {

            characterNoSpaceCount.textContent =
                charactersNoSpaces;

        }


        if (sentenceCount) {

            sentenceCount.textContent =
                sentences.length;

        }


        if (paragraphCount) {

            paragraphCount.textContent =
                paragraphs;

        }


        if (readingTime) {

            readingTime.textContent =
                `${minutes} min`;

        }

    }


    counterInput?.addEventListener(
        "input",
        updateCounter
    );


    clearCounterBtn?.addEventListener(
        "click",
        () => {

            counterInput.value = "";

            updateCounter();

            counterInput.focus();

        }
    );


    updateCounter();


    /* =====================================================
       QUICK TEXT TOOLS
    ===================================================== */

    const textToolInput =
        $("textToolInput");

    const textToolOutput =
        $("textToolOutput");

    const copyTextResult =
        $("copyTextResult");

    const clearTextTools =
        $("clearTextTools");


    function titleCase(text) {

        return text.replace(
            /\p{L}[\p{L}\p{M}'’-]*/gu,
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
        );

    }


    function transformText(action) {

        if (
            !textToolInput ||
            !textToolOutput
        ) {
            return;
        }


        const text =
            textToolInput.value;


        if (!text.trim()) {

            textToolOutput.value = "";

            textToolInput.focus();

            return;
        }


        let result = "";


        switch (action) {


            case "reverse":

                result =
                    Array.from(text)
                        .reverse()
                        .join("");

                break;



            case "sort":

                result =
                    text
                        .trim()
                        .split(/\s+/)
                        .sort(
                            (a, b) =>
                                a.localeCompare(
                                    b,
                                    undefined,
                                    {
                                        sensitivity:
                                            "base"
                                    }
                                )
                        )
                        .join(" ");

                break;



            case "duplicates": {

                const words =
                    text
                        .trim()
                        .split(/\s+/);


                const seen =
                    new Set();


                result =
                    words
                        .filter((word) => {

                            const normalized =
                                word.toLocaleLowerCase();

                            if (
                                seen.has(
                                    normalized
                                )
                            ) {
                                return false;
                            }

                            seen.add(
                                normalized
                            );

                            return true;

                        })
                        .join(" ");

                break;

            }



            case "uppercase":

                result =
                    text.toLocaleUpperCase();

                break;



            case "lowercase":

                result =
                    text.toLocaleLowerCase();

                break;



            case "titlecase":

                result =
                    titleCase(text);

                break;



            default:

                result = text;

        }


        textToolOutput.value =
            result;

    }


    document
        .querySelectorAll(
            "[data-text-action]"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    transformText(
                        button.dataset.textAction
                    );

                }
            );

        });


    copyTextResult?.addEventListener(
        "click",
        async () => {

            const value =
                textToolOutput?.value || "";


            if (!value) {

                temporaryButtonText(
                    copyTextResult,
                    "Nothing to copy"
                );

                return;
            }


            const success =
                await copyText(value);


            temporaryButtonText(
                copyTextResult,
                success
                    ? "Copied!"
                    : "Copy failed"
            );

        }
    );


    clearTextTools?.addEventListener(
        "click",
        () => {

            textToolInput.value = "";

            textToolOutput.value = "";

            textToolInput.focus();

        }
    );


    /* =====================================================
       CLICK RESULT TO COPY
    ===================================================== */

    document.addEventListener(
        "click",
        async (event) => {

            const chip =
                event.target.closest(
                    "[data-copy]"
                );


            if (!chip) return;


            const value =
                chip.dataset.copy;


            const success =
                await copyText(value);


            if (success) {

                const original =
                    chip.textContent;

                chip.textContent =
                    "✓ Copied";

                setTimeout(() => {

                    chip.textContent =
                        original;

                }, 1000);

            }

        }
    );


    /* =====================================================
       SMOOTH INTERNAL NAVIGATION
    ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) return;


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });


                    history.replaceState(
                        null,
                        "",
                        targetId
                    );

                }
            );

        });


});