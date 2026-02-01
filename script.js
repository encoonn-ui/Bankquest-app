const WORKER_URL = "https://plain-surf-53cfproxy-gemini-concurso.encoonn.workers.dev";
let questaoAtual = null;
let cooldownAtivo = false;

// Variáveis de Gamificação
let xp = 0;
let streak = 0;
let levelProgress = 0;
const medalhasObtidas = new Set();

// LISTA PARETO (Os 20% que garantem 80% da prova do BB/Cesgranrio)
const temasPareto = [
    "Atendimento Bancário: Código de Defesa do Consumidor (CDC)",
    "Conhecimentos Bancários: Sistema Financeiro Nacional e PIX",
    "Vendas e Negociação: Ética e Gatilhos Mentais de Venda",
    "Informática: Segurança da Informação e Redes Sociais",
    "Atualidades: Open Banking e Moedas Digitais"
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
    catTag.innerText = "ESTRATÉGIA PARETO...";
    if(feedbackArea) feedbackArea.classList.add('hidden');

    // Sorteia um tema baseado na Lei de Pareto
    const temaSorteado = temasPareto[Math.floor(Math.random() * temasPareto.length)];

    try {
        const res = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                prompt: `Aja como um mentor especialista na banca Cesgranrio. Gere uma questão inédita de nível médio/difícil sobre ${temaSorteado} para o Banco do Brasil. Siga a Lei de Pareto focando no que mais cai. Responda APENAS o JSON puro: {"category": "${temaSorteado}", "question": "texto", "options": ["A","B","C","D","E"], "correct": 0, "explanation": "explicação detalhada"}` 
            })
        });

        const data = await res.json();
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        questaoAtual = JSON.parse(text);

        // Renderização Visual
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
        console.error(err);
        alert("Erro ao conectar com a IA. Tente novamente.");
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
        // ACERTOU: Feedback Viciante
        b.style.borderColor = "var(--correct)";
        b.style.color = "var(--correct)";
        b.style.background = "rgba(0, 255, 136, 0.1)";
        
        if(sndCorrect) sndCorrect.play();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

        xp += 100;
        streak++;
        atualizarProgresso(100);
        checarMedalhas(questaoAtual.category);
    } else {
        // ERROU
        b.style.borderColor = "var(--wrong)";
        b.style.color = "var(--wrong)";
        if(sndError) sndError.play();
        
        // Mostra a correta
        todos[questaoAtual.correct].style.borderColor = "var(--correct)";
        streak = 0;
    }

    if(explanation) explanation.innerText = "💡 EXPLICAÇÃO PARETO: " + questaoAtual.explanation;
    if(feedbackArea) feedbackArea.classList.remove('hidden');

    document.getElementById('score-counter').innerText = `💎 ${xp} XP`;
    document.getElementById('streak-counter').innerText = `🔥 ${streak}`;
    
    iniciarCooldown(10); // 10 segundos para manter o foco
}

function atualizarProgresso(ganho) {
    const bar = document.getElementById('level-progress');
    levelProgress += 20; // Sobe 20% a cada acerto
    if (levelProgress > 100) levelProgress = 20; // "Sobe de nível" e reseta barra
    bar.style.width = levelProgress + "%";
}

function checarMedalhas(categoria) {
    const container = document.getElementById('medals-container');
    let medalha = "";

    if (streak === 3) medalha = "🥉";
    if (streak === 5) medalha = "🥈";
    if (streak === 10) medalha = "🥇";

    if (medalha && !medalhasObtidas.has(medalha + categoria)) {
        const span = document.createElement('span');
        span.className = "medal-icon";
        span.innerText = medalha;
        span.title = `Conquista em ${categoria}`;
        container.appendChild(span);
        medalhasObtidas.add(medalha + categoria);
    }
}

function iniciarCooldown(segundos) {
    const btn = document.getElementById('ai-btn');
    cooldownAtivo = true;
    let tempoRestante = segundos;

    const intervalo = setInterval(() => {
        btn.innerText = `⏳ PRÓXIMA MISSÃO EM ${tempoRestante}s...`;
        tempoRestante--;

        if (tempoRestante < 0) {
            clearInterval(intervalo);
            cooldownAtivo = false;
            btn.disabled = false;
            btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
        }
    }, 1000);
}

window.buscarQuestaoInedita = buscarQuestaoInedita;
