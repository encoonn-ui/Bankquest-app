// --- CONFIGURAÇÃO NOVA (COM SEU SERVIDOR) ---
// Coloque aqui o link que você copiou do Cloudflare (Workers)
const WORKER_URL = "https://plain-surf-53cfproxy-gemini-concurso.encoonn.workers.dev"; // Cole seu link aqui se for diferente

async function buscarQuestaoInedita() {
    // 1. Prepara o terreno (Visual)
    const btn = document.getElementById('ai-btn');
    const catTag = document.getElementById('category');
    const qText = document.getElementById('question-text');
    const container = document.getElementById('options-container');
    const feedbackArea = document.getElementById('feedback-area');

    btn.innerText = "⚡ CONECTANDO AO CÉREBRO...";
    btn.disabled = true;
    catTag.innerText = "ANALISANDO EDITAL...";
    
    if(feedbackArea) feedbackArea.classList.add('hidden');

    // 2. Sorteia o Tópico (Igual ao seu código original)
    const fases = [
       "Fase 1: Vendas e Negociação (CDC e LGPD) - FOCO TOTAL",
       "Fase 2: Conhecimentos Bancários (Pix e SFN)",
       "Fase 3: Português (Crase e Interpretação Cesgranrio)",
       "Fase 4: Informática (Segurança da Informação)"
    ];
    const faseSorteada = fases[Math.floor(Math.random() * fases.length)];

    try {
        // 3. Chama o SEU servidor (Worker) em vez do Google direto
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // Enviamos apenas o texto do prompt
                prompt: `Aja como mentor para o Banco do Brasil. Gere uma questão Cesgranrio sobre ${faseSorteada}. Responda APENAS o JSON: {"category": "${faseSorteada}", "question": "Pergunta", "options": ["A","B","C","D","E"], "correct": 0, "comment": "Comentário"}`
            })
        });

        if (!response.ok) {
            throw new Error(`Erro no Servidor: ${response.status}`);
        }

        const data = await response.json();

        // 4. Limpeza da Resposta (Igual ao seu código original)
        // O Worker devolve a estrutura do Google, então lemos do mesmo jeito:
        let resText = data.candidates[0].content.parts[0].text;
        
        // Remove os marcadores de código que o Gemini às vezes coloca (```json ... ```)
        resText = resText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        // Converte o texto limpo em Objeto Real
        questaoAtual = JSON.parse(resText);

        // 5. Mostra na Tela
        catTag.innerText = questaoAtual.category;
        qText.innerText = questaoAtual.question;
        
        // Limpa botões antigos e cria os novos
        container.innerHTML = "";
        
        questaoAtual.options.forEach((opt, i) => {
            const b = document.createElement('button');
            b.className = 'option-btn';
            b.innerText = opt;
            // Estilo mantido
            b.style.cssText = "background: #29292e; border: 1px solid #323238; color: white; padding: 15px; border-radius: 8px; cursor: pointer; text-align: left; transition: 0.2s; font-size: 1rem;";
            
            b.onmouseover = () => b.style.borderColor = "#8257e6";
            b.onmouseout = () => b.style.borderColor = "#323238";
            b.onclick = () => verificarResposta(i, b); // Chama sua função de verificar
            
            container.appendChild(b);
        });

    } catch (error) {
        console.error(error);
        alert("Erro ao gerar missão. Tente novamente! (Verifique o console para detalhes)");
        catTag.innerText = "ERRO DE CONEXÃO";
    } finally {
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
        btn.disabled = false;
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
