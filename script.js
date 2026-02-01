import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// --- SUAS CHAVES AQUI ---
const GOOGLE_API_KEY = "AIzaSyAZefeogwDIYuqRwQ4TOS7ZKr09BGwGL94";
const firebaseConfig = {AIzaSyDqpjtq_HwStJvQoxDsgIYRso_CbhQsWZQ
  apiKey: "AIzaSyDqpjtq_HwStJvQoxDsgIYRso_CbhQsWZQ",
  authDomain: "bankquest-app.firebaseapp.com",
  projectId: "bankquest-app",
  storageBucket: "bankquest-app.appspot.com",
  messagingSenderId: "SUA_ID",
  appId: "SUA_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let questions = [];
let currentQuestion = 0;
let xp = 0;
let streak = 0;

// --- FUNÇÃO GERADORA IA (ESTRATÉGIA PARETO) ---
async function buscarQuestaoInedita() {
    const btn = document.getElementById('ai-btn');
    btn.innerText = "⚡ Gerando com IA...";
    btn.disabled = true;

    const fases = [
        "Fase 1: Vendas e Negociação (CDC, LGPD e Ética) - Peso 80/20",
        "Fase 2: Conhecimentos Bancários (SFN e Pix)",
        "Fase 3: Português (Crase e Interpretação Cesgranrio)",
        "Fase 4: Informática (Segurança e Windows 10)"
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;
    const prompt = {
        contents: [{ parts: [{ text: `Gere uma questão múltipla escolha (A a E) para Agente Comercial do Banco do Brasil, banca Cesgranrio. Foco na ${fases[Math.floor(Math.random() * fases.length)]}. Retorne APENAS o JSON: {"category": "string", "question": "string", "options": ["string", "string", "string", "string", "string"], "correctIndex": number, "explanation": "string"}` }] }]
    };

    try {
        const response = await fetch(url, { method: 'POST', body: JSON.stringify(prompt) });
        const data = await response.json();
        const resText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
        const novaQuestao = JSON.parse(resText);
        
        questions.push(novaQuestao);
        currentQuestion = questions.length - 1;
        loadQuestion();
    } catch (e) {
        console.error(e);
        alert("Erro ao conectar com a IA. Verifique sua chave!");
    } finally {
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
        btn.disabled = false;
    }
}
window.buscarQuestaoInedita = buscarQuestaoInedita; // Expõe a função para o HTML

function loadQuestion() {
    const q = questions[currentQuestion];
    document.getElementById('category').innerText = q.category;
    document.getElementById('question-text').innerText = q.question;
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(i, btn);
        container.appendChild(btn);
    });
    document.getElementById('feedback-area').classList.add('hidden');
}

async function checkAnswer(idx, btn) {
    const q = questions[currentQuestion];
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);

    const isCorrect = idx === q.correctIndex;
    if (isCorrect) {
        btn.classList.add('correct');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        document.getElementById('snd-correct').play();
        xp += 100; streak++;
    } else {
        btn.classList.add('wrong');
        btns[q.correctIndex].classList.add('correct');
        document.getElementById('snd-wrong').play();
        streak = 0;
    }

    document.getElementById('score-counter').innerText = `💎 ${xp} XP`;
    document.getElementById('streak-counter').innerText = `🔥 ${streak}`;
    document.getElementById('explanation').innerText = q.explanation;
    document.getElementById('feedback-area').classList.remove('hidden');

    // Salva no Firebase para o Relatório de Direção
    await setDoc(doc(db, "user_stats", "endrew"), {
        xp: xp,
        total_hits: increment(isCorrect ? 1 : 0),
        total_errors: increment(isCorrect ? 0 : 1)
    }, { merge: true });
}

async function gerarRelatorioEstrategico() {
    const docSnap = await getDoc(doc(db, "user_stats", "endrew"));
    if (docSnap.exists()) {
        const d = docSnap.data();
        const total = d.total_hits + d.total_errors;
        const perc = ((d.total_hits / total) * 100).toFixed(1);
        alert(`DESEMPENHO: ${perc}%\nDIREÇÃO: ${perc < 80 ? "Continue na Fase 1 (Vendas)!" : "Rumo à Fase de Simulados!"}`);
    }
}
window.gerarRelatorioEstrategico = gerarRelatorioEstrategico;
