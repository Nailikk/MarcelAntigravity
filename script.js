// ZAVIV Application Logic

// State
const state = {
    currentStep: 0,
    answers: [], // For multi-select questions
    isLocked: false
};

// Questions Data
const questions = [
    {
        id: 1,
        type: 'text',
        text: 'Frage 1: Welche der folgenden Zitate ist NICHT eines des Philosophen Marcels?',
        options: [
            { id: 'a', text: 'Wir müssen noch den Pentagon machen', correct: false },
            { id: 'b', text: 'Meine Base liegt in Schnungel', correct: false },
            { id: 'c', text: 'Freiheitsstatur ist Oksidiart!!', correct: false },
            { id: 'd', text: 'Ich bin Ching Chong Freundlich', correct: true }
        ]
    },
    {
        id: 2,
        type: 'image',
        text: 'Frage 2: Identifizieren Sie alle Bilder, auf denen Marcel NICHT müde aussieht.',
        // Using placeholders with text description for prototype
        options: [
            { id: 'img1', src: 'https://placehold.co/300x200?text=Marcel+Schlafend', text: '[Marcel schlafend]', correct: false },
            { id: 'img2', src: 'https://placehold.co/300x200?text=Marcel+Wach+Aber+Müde', text: '[Marcel wach aber müde]', correct: false },
            { id: 'img3', src: 'https://placehold.co/300x200?text=Marcel+Hyperaktiv', text: '[Marcel hyperaktiv]', correct: true },
            { id: 'img4', src: 'https://placehold.co/300x200?text=Marcel+Gähnt', text: '[Marcel gähnt]', correct: false }
        ]
    },
    {
        id: 3,
        type: 'text',
        text: 'Frage 3: Was macht Marcel gerne mit seiner Schwester?',
        options: [
            { id: 'a', text: 'In die Saune gehen', correct: false },
            { id: 'b', text: 'In der Badewanne Sitzen', correct: false },
            { id: 'c', text: 'Dark Romance Bücher lesen', correct: false },
            { id: 'd', text: 'Gern mit ihr und ihrer Freundin chillen', correct: true }
        ]
    },
    {
        id: 4,
        type: 'image',
        text: 'Frage 4: Wählen Sie das Nahrungsmittel, das Marcel überleben lässt.',
        options: [
            { id: 'img1', src: 'https://placehold.co/300x200?text=Gesunder+Salat', text: '[Salat]', correct: false },
            { id: 'img2', src: 'https://placehold.co/300x200?text=Pizza', text: '[Pizza]', correct: true },
            { id: 'img3', src: 'https://placehold.co/300x200?text=Roher+Brokkoli', text: '[Brokkoli]', correct: false },
            { id: 'img4', src: 'https://placehold.co/300x200?text=Wasser', text: '[Wasser]', correct: false } // Pizza is usually the answer
        ],
        singleSelectImage: true // Special flag for single select image question if needed, or treat as multi select with 1 correct
    },
    {
        id: 5,
        type: 'text',
        text: 'Frage 5: Analysieren Sie Ihren emotionalen Ausbruch vom 30.05.2025 bezüglich Ihrer Technik-Note (11 Punkte). Welches spezifische Symbol wurde als Ursache für das Verfehlen der 14 Punkte identifiziert?',
        options: [
            { id: 'a', text: 'Ein fehlendes Semikolon', correct: false },
            { id: 'b', text: 'Zwei falsche Dollarzeichen', correct: true },
            { id: 'c', text: 'Ein falsch gesetztes Komma', correct: false },
            { id: 'd', text: 'Eine vergessene Klammer', correct: false }
        ]
    },
    {
        id: 6,
        type: 'text',
        text: 'Frage 6: Identitätsprüfung Abteilung E-Sports: Welche Karte wurde Ihnen am 20.08.2025 vorgeworfen zu spielen, woraufhin Sie als "Hurensohn" (gemäß Chatprotokoll) bezeichnet wurden?',
        options: [
            { id: 'a', text: 'Elite-Barbaren', correct: false },
            { id: 'b', text: 'Elektro-Riese', correct: false },
            { id: 'c', text: 'Mega Knight', correct: true },
            { id: 'd', text: 'X-Bogen', correct: false }
        ]
    }
];

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    question: document.getElementById('question-screen'),
    success: document.getElementById('success-screen')
};

const elements = {
    startBtn: document.getElementById('start-btn'),
    questionTitle: document.getElementById('question-title'),
    questionText: document.getElementById('question-text'),
    answersContainer: document.getElementById('answers-container'),
    submitBtn: document.getElementById('submit-btn'),
    progressFill: document.getElementById('progress-fill'),
    failOverlay: document.getElementById('fail-overlay'),
    statusText: document.getElementById('status-text'),
    giftBtn: document.getElementById('gift-btn'),
    giveUpBtn: document.getElementById('give-up-btn'),
    confettiContainer: document.getElementById('confetti-container')
};

// Audio (Simple synthesis for prototype to avoid external dependencies issues, or placeholders)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

function playFailSound() {
    // Harsh error buzzer
    playTone(150, 'sawtooth', 0.5);
    setTimeout(() => playTone(100, 'sawtooth', 0.5), 100);
}

function playSuccessSound() {
    // Happy chime
    playTone(500, 'sine', 0.1);
    setTimeout(() => playTone(800, 'sine', 0.2), 100);
}

// Logic
function init() {
    elements.startBtn.addEventListener('click', startVerification);
    elements.submitBtn.addEventListener('click', validateAnswer);
    elements.giftBtn.addEventListener('click', triggerRickroll);
    elements.giveUpBtn.addEventListener('click', giveUp);
}

function startVerification() {
    state.currentStep = 0;
    state.isLocked = false;
    showScreen('question');
    renderQuestion(0);
    updateStatus("VERIFIZIERUNG LÄUFT...");
}

function showScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('active');
    });
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');
}

function updateStatus(text) {
    elements.statusText.textContent = text;
}

function renderQuestion(index) {
    const q = questions[index];
    elements.questionTitle.textContent = `Sicherheitsfrage ${index + 1}/${questions.length}`;
    elements.questionText.textContent = q.text;

    elements.answersContainer.innerHTML = '';
    elements.answersContainer.className = q.type === 'image' ? 'answers-grid image-mode' : 'answers-grid';

    state.answers = []; // Reset current answers
    elements.submitBtn.classList.add('hidden'); // Hide until selection made

    q.options.forEach(opt => {
        const el = document.createElement('div');

        if (q.type === 'image') {
            el.className = 'image-option';
            el.innerHTML = `<img src="${opt.src}" alt="${opt.text}">`;
        } else {
            el.className = 'answer-option';
            el.textContent = opt.text;
        }

        el.addEventListener('click', () => toggleSelection(el, opt, q));
        elements.answersContainer.appendChild(el);
    });

    updateProgress();
}

function toggleSelection(el, option, question) {
    if (state.isLocked) return;

    // For single choice (text questions usually, or specific image ones)
    // Assuming text is always single choice for now based on prompt "Multiple-Choice-Fragen mit ... 4 Antwortmöglichkeiten" usually implies single select unless specified "Wähle alle".
    // Prompt says: "Textfragen: ... 4 Antwortmöglichkeiten" (usually single correct).
    // "Bildfragen: Wähle alle Bilder aus..." (multi select).

    const isMultiSelect = question.type === 'image' && !question.singleSelectImage;

    if (!isMultiSelect) {
        // Clear previous
        const allOpts = elements.answersContainer.children;
        for (let child of allOpts) {
            child.classList.remove('selected');
        }
        state.answers = [option];
        el.classList.add('selected');
    } else {
        // Toggle
        if (state.answers.includes(option)) {
            state.answers = state.answers.filter(a => a !== option);
            el.classList.remove('selected');
        } else {
            state.answers.push(option);
            el.classList.add('selected');
        }
    }

    if (state.answers.length > 0) {
        elements.submitBtn.classList.remove('hidden');
    } else {
        elements.submitBtn.classList.add('hidden');
    }
}

function validateAnswer() {
    if (state.isLocked) return;

    const q = questions[state.currentStep];
    let isCorrect = false;

    if (q.type === 'image' && !q.singleSelectImage) {
        // Multi select validation
        // Must select ALL correct and NO incorrect
        const correctOptions = q.options.filter(o => o.correct);
        const selectedCorrect = state.answers.filter(a => a.correct);
        const selectedIncorrect = state.answers.filter(a => !a.correct);

        if (selectedCorrect.length === correctOptions.length && selectedIncorrect.length === 0) {
            isCorrect = true;
        }
    } else {
        // Single select
        if (state.answers[0] && state.answers[0].correct) {
            isCorrect = true;
        }
    }

    if (isCorrect) {
        handleSuccess();
    } else {
        handleFail();
    }
}

function handleSuccess() {
    playSuccessSound();
    state.currentStep++;

    if (state.currentStep >= questions.length) {
        finishGame();
    } else {
        renderQuestion(state.currentStep);
    }
}

function handleFail() {
    state.isLocked = true;
    playFailSound();

    // Flash Red
    elements.failOverlay.style.display = 'block';
    elements.failOverlay.classList.add('flash-red');

    updateStatus("ZUGRIFF VERWEIGERT - SITZUNG TERMINIERT");

    setTimeout(() => {
        elements.failOverlay.classList.remove('flash-red');
        elements.failOverlay.style.display = 'none';
        alert("Versuch abgebrochen. Bitte erneut versuchen.");
        resetGame();
    }, 600); // Wait for flash to finish slightly
}

function resetGame() {
    state.currentStep = 0;
    state.answers = [];
    state.isLocked = false;
    showScreen('start');
    updateStatus("Warten auf Eingabe...");
}

function finishGame() {
    showScreen('success');
    updateStatus("ZUGRIFF GEWÄHRT");
    startConfetti();
}

function updateProgress() {
    const pct = (state.currentStep / questions.length) * 100;
    elements.progressFill.style.width = `${pct}%`;
}

function giveUp() {
    if (confirm("Marcel hat aufgegeben. Typisch. Wirklich abbrechen?")) {
        triggerRickroll();
    }
}

function triggerRickroll() {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
}

// Confetti Effect
function startConfetti() {
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'];

    for (let i = 0; i < 100; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.animationDuration = (Math.random() * 3 + 2) + 's';
        conf.style.opacity = Math.random();
        elements.confettiContainer.appendChild(conf);
    }
}

// Init
init();
