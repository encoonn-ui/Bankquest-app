// --- CONFIGURAÇÃO NOVA (COM SEU SERVIDOR) ---
// Coloque aqui o link que você copiou do Cloudflare (Workers)
const WORKER_URL = "https://plain-surf-53cfproxy-gemini-concurso.encoonn.workers.dev"; // Cole seu link aqui se for diferente

async function buscarQuestaoInedita() {
    // 1. Defina o link do seu Worker do Cloudflare (visto na image_15b579.png)
const WORKER_URL = "https://plain-surf-53cfproxy-gemini-concurso.encoonn.workers.dev";

async function buscarQuestaoInedita() {
    const btn = document.getElementById('ai-btn');
    const catTag = document.getElementById('category');
    const qText = document.getElementById('question-text');
    const container = document.getElementById('options-container');

    // Feedback visual para o usuário
    btn.innerText = "⚡ GERANDO MISSÃO...";
    btn.disabled = true;

    // Sorteio de tópicos (Baseado no seu estudo para Agente Comercial)
    const fases = [
       "Vendas e Negociação (Foco em CDC)",
       "Conhecimentos Bancários (Estrutura do SFN)",
       "Informática (Segurança de Dados)"
    ];
    const faseSorteada = fases[Math.floor(Math.random() * fases.length)];

    try {
        // Chamada para o SEU servidor no Cloudflare
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: `Gere uma questão de múltipla escolha para o Banco do Brasil sobre ${faseSorteada}. Responda APENAS o JSON neste formato: {"category": "${faseSorteada}", "question": "texto da pergunta", "options": ["A", "B", "C", "D", "E"], "correct": 0}`
            })
        });

        const data = await response.json();
        
        // Limpando a resposta da IA para garantir que seja um JSON puro
        let resText = data.candidates[0].content.parts[0].text;
        resText = resText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const questao = JSON.parse(resText);

        // Preenchendo a página com a questão
        catTag.innerText = questao.category;
        qText.innerText = questao.question;
        container.innerHTML = ""; // Limpa opções antigas

        questao.options.forEach((opt, i) => {
            const b = document.createElement('button');
            b.className = 'option-btn';
            b.innerText = opt;
            b.onclick = () => alert(i === questao.correct ? "Acertou!" : "Errou!");
            container.appendChild(b);
        });

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com o servidor da IA.");
    } finally {
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
        btn.disabled = false;
    }
}
}
}

// --- FUNÇÃO DE RESPOSTA ---
function verificarResposta(idx, b) {
    const todosBotoes = document.querySelectorAll('.option-btn');
    todosBotoes.forEach(btn => btn.disabled = true);

    const feedbackArea = document.getElementById('feedback-area');
    const explanation = document.getElementById('explanation');

    if (idx === questaoAtual.correctIndex) {
        // ACERTOU
        b.style.background = "rgba(4, 211, 97, 0.2)";
        b.style.borderColor = "#04d361";
        b.style.color = "#04d361";
        
        // Som e Confetes
        const snd = document.getElementById('snd-correct');
        if(snd) snd.play().catch(e => console.log("Audio pendente"));
        if(typeof confetti !== 'undefined') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        
        xp += 100;
        streak++;
    } else {
        // ERROU
        b.style.background = "rgba(247, 90, 104, 0.2)";
        b.style.borderColor = "#f75a68";
        
        if(todosBotoes[questaoAtual.correctIndex]) {
            todosBotoes[questaoAtual.correctIndex].style.borderColor = "#04d361";
            todosBotoes[questaoAtual.correctIndex].style.color = "#04d361";
        }
        streak = 0;
    }

    if(explanation) explanation.innerText = "💡 " + questaoAtual.explanation;
    if(feedbackArea) feedbackArea.classList.remove('hidden');
    
    const xpEl = document.getElementById('score-counter');
    const skEl = document.getElementById('streak-counter');
    if(xpEl) xpEl.innerText = `💎 ${xp} XP`;
    if(skEl) skEl.innerText = `🔥 ${streak}`;
}

// Conecta ao HTML
window.buscarQuestaoInedita = buscarQuestaoInedita;
