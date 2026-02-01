// 1. Configuração do Servidor
const WORKER_URL = "https://plain-surf-53cfproxy-gemini-concurso.encoonn.workers.dev";

// Variáveis de controle de jogo
let questaoAtual = null;
let xp = 0;
let streak = 0;

async function buscarQuestaoInedita() {
    const btn = document.getElementById('ai-btn');
    const catTag = document.getElementById('category');
    const qText = document.getElementById('question-text');
    const container = document.getElementById('options-container');
    const feedbackArea = document.getElementById('feedback-area');

    // Feedback visual
    btn.innerText = "⚡ GERANDO MISSÃO...";
    btn.disabled = true;
    if(feedbackArea) feedbackArea.classList.add('hidden');

    const fases = [
       "Vendas e Negociação (Foco em CDC)",
       "Conhecimentos Bancários (Estrutura do SFN)",
       "Informática (Segurança de Dados)"
    ];
    const faseSorteada = fases[Math.floor(Math.random() * fases.length)];

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: `Gere uma questão de múltipla escolha para o Banco do Brasil sobre ${faseSorteada}. Responda APENAS o JSON puro, sem markdown: {"category": "${faseSorteada}", "question": "texto", "options": ["A", "B", "C", "D", "E"], "correct": 0, "explanation": "explicação"}`
            })
        });

        const data = await response.json();
        
        // Trata a resposta do Gemini
        let resText = data.candidates[0].content.parts[0].text;
        resText = resText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        questaoAtual = JSON.parse(resText);

        // Atualiza a tela
        catTag.innerText = questaoAtual.category;
        qText.innerText = questaoAtual.question;
        container.innerHTML = ""; 

        questaoAtual.options.forEach((opt, i) => {
            const b = document.createElement('button');
            b.className = 'option-btn';
            b.innerText = opt;
            // Estilo dos botões
            b.style.cssText = "background: #29292e; border: 1px solid #323238; color: white; padding: 15px; border-radius: 8px; cursor: pointer; text-align: left; transition: 0.2s; font-size: 1rem; width: 100%; margin-bottom: 10px;";
            
            b.onclick = () => verificarResposta(i, b);
            container.appendChild(b);
        });

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao carregar missão. Verifique se o Worker está ativo.");
    } finally {
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
        btn.disabled = false;
    }
}

function verificarResposta(idx, b) {
    const todosBotoes = document.querySelectorAll('.option-btn');
    todosBotoes.forEach(btn => btn.disabled = true);

    const feedbackArea = document.getElementById('feedback-area');
    const explanation = document.getElementById('explanation');

    if (idx === questaoAtual.correct) {
        // ACERTOU
        b.style.background = "rgba(4, 211, 97, 0.2)";
        b.style.borderColor = "#04d361";
        b.style.color = "#04d361";
        
        if(typeof confetti !== 'undefined') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        
        xp += 100;
        streak++;
    } else {
        // ERROU
        b.style.background = "rgba(247, 90, 104, 0.2)";
        b.style.borderColor = "#f75a68";
        
        // Mostra a correta
        if(todosBotoes[questaoAtual.correct]) {
            todosBotoes[questaoAtual.correct].style.borderColor = "#04d361";
            todosBotoes[questaoAtual.correct].style.color = "#04d361";
        }
        streak = 0;
    }

    if(explanation) explanation.innerText = "💡 " + questaoAtual.explanation;
    if(feedbackArea) feedbackArea.classList.remove('hidden');
    
    document.getElementById('score-counter').innerText = `💎 ${xp} XP`;
    document.getElementById('streak-counter').innerText = `🔥 ${streak}`;
}

// Vincula a função ao botão do HTML
window.buscarQuestaoInedita = buscarQuestaoInedita;
