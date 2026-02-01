const WORKER_URL = "https://plain-surf-53cfproxy-gemini-concurso.encoonn.workers.dev";
let questaoAtual = null;
let cooldownAtivo = false;
let xp = 0;
let streak = 0;
let historico = [];

const temasPareto = [
    "CDC: Inversão do ônus da prova e responsabilidade solidária",
    "PIX: Mecanismo Especial de Devolução (MED) e limites de segurança",
    "SFN: Papel do Banco Central vs Conselho Monetário Nacional",
    "Gatilhos Mentais: Uso ético da Escassez e Prova Social em Bancos",
    "Segurança Digital: Phishing, Ransomware e Engenharia Social",
    "Lavagem de Dinheiro: Lei 9.613/98 e o papel do COAF"
];

async function buscarQuestaoInedita() {
    if (cooldownAtivo) return;
    const btn = document.getElementById('ai-btn');
    const qText = document.getElementById('question-text');
    const catTag = document.getElementById('category');
    const container = document.getElementById('options-container');
    const feedbackArea = document.getElementById('feedback-area');

    btn.disabled = true;
    btn.innerText = "⚡ ACESSANDO GEMINI 1.5 FLASH...";
    if(feedbackArea) feedbackArea.classList.add('hidden');

    const temaSorteado = temasPareto[Math.floor(Math.random() * temasPareto.length)];

    try {
        const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                prompt: `Aja como mentor Cesgranrio. Gere uma questão inédita para Banco do Brasil sobre ${temaSorteado}. Siga Pareto. Responda APENAS JSON puro: {"category": "${temaSorteado}", "question": "texto", "options": ["A","B","C","D","E"], "correct": 0, "explanation": "explicação"}` 
            })
        });

        const data = await res.json();
        let text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
        questaoAtual = JSON.parse(text);

        catTag.innerText = questaoAtual.category;
        qText.innerText = questaoAtual.question;
        container.innerHTML = "";

        questaoAtual.options.forEach((opt, i) => {
            const b = document.createElement('button');
            b.innerText = opt;
            b.className = "option-btn";
            b.onclick = () => verificarResposta(i, b);
            container.appendChild(b);
        });
    } catch (err) {
        alert("Erro na conexão. Tente novamente.");
        btn.disabled = false;
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
    }
}

function verificarResposta(idx, b) {
    const todos = document.querySelectorAll('.option-btn');
    todos.forEach(t => t.disabled = true);
    const feedbackArea = document.getElementById('feedback-area');
    const explanation = document.getElementById('explanation');
    const sndCorrect = document.getElementById('snd-correct');
    const sndError = document.getElementById('snd-error');

    if (idx === questaoAtual.correct) {
        b.style.borderColor = "var(--correct)";
        b.style.color = "var(--correct)";
        if(sndCorrect) sndCorrect.play();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        xp += 100;
        streak++;
        atualizarHistorico(true);
    } else {
        b.style.borderColor = "var(--wrong)";
        b.style.color = "var(--wrong)";
        if(sndError) sndError.play();
        todos[questaoAtual.correct].style.borderColor = "var(--correct)";
        streak = 0;
        atualizarHistorico(false);
    }

    explanation.innerText = "💡 EXPLICAÇÃO: " + questaoAtual.explanation;
    feedbackArea.classList.remove('hidden');
    document.getElementById('score-counter').innerText = `💎 ${xp} XP`;
    document.getElementById('streak-counter').innerText = `🔥 ${streak}`;
    document.getElementById('level-progress').style.width = (xp % 1000) / 10 + "%";
    
    iniciarCooldown(10);
}

function atualizarHistorico(acertou) {
    const container = document.getElementById('history-panel');
    historico.push(acertou);
    if(historico.length > 5) historico.shift();
    container.innerHTML = "";
    historico.forEach(res => {
        const dot = document.createElement('div');
        dot.className = `dot ${res ? 'correct' : 'wrong'}`;
        container.appendChild(dot);
    });
}

function iniciarCooldown(s) {
    const btn = document.getElementById('ai-btn');
    cooldownAtivo = true;
    let t = s;
    const i = setInterval(() => {
        btn.innerText = `⏳ PRÓXIMA EM ${t}s...`;
        t--;
        if (t < 0) { clearInterval(i); cooldownAtivo = false; btn.disabled = false; btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)"; }
    }, 1000);
}

window.buscarQuestaoInedita = buscarQuestaoInedita;
