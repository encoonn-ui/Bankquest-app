// CONFIGURAÇÕES GLOBAIS
// Atenção: Esta é sua chave real. No futuro, evite postar em locais públicos.
const GOOGLE_API_KEY = "AIzaSyAZefeogwDIYuqRwQ4TOS7ZKr09BGwGL94";

let xp = 0;
let streak = 0;
let questaoAtual = null;

// FUNÇÃO PRINCIPAL - GERA A MISSÃO USANDO PARETO
async function buscarQuestaoInedita() {
    const btn = document.getElementById('ai-btn');
    const catTag = document.getElementById('category');
    const qText = document.getElementById('question-text');
    const container = document.getElementById('options-container');
    const feedbackArea = document.getElementById('feedback-area');

    // 1. Bloqueia o botão e mostra status
    btn.innerText = "⚡ CONECTANDO AO CÉREBRO...";
    btn.disabled = true;
    catTag.innerText = "ANALISANDO EDITAL...";
    
    // Esconde feedback anterior
    if(feedbackArea) feedbackArea.classList.add('hidden');

    // Estratégia de Fases Cronológicas (Pareto BB)
    const fases = [
        "Fase 1: Vendas e Negociação (CDC e LGPD) - FOCO TOTAL",
        "Fase 2: Conhecimentos Bancários (Pix e SFN)",
        "Fase 3: Português (Crase e Interpretação Cesgranrio)",
        "Fase 4: Informática (Segurança da Informação)"
    ];
    const faseSorteada = fases[Math.floor(Math.random() * fases.length)];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;
    
    const promptCorpo = {
        contents: [{
            parts: [{
                text: `Aja como mentor para o Banco do Brasil. Gere uma questão Cesgranrio sobre ${faseSorteada}. Responda APENAS o JSON: {"category": "${faseSorteada}", "question": "Pergunta", "options": ["A","B","C","D","E"], "correctIndex": 0, "explanation": "Explicação"}`
            }]
        }]
    };

    try {
        // --- AQUI ESTAVA O ERRO ---
        // Adicionei 'headers' para o Google aceitar o pedido
        const response = await fetch(url, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(promptCorpo) 
        });

        if (!response.ok) throw new Error("Erro na API do Google: " + response.status);

        const data = await response.json();
        
        // Limpeza do texto para evitar erros de formatação da IA
        let resText = data.candidates[0].content.parts[0].text;
        resText = resText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        questaoAtual = JSON.parse(resText);
        
        // Atualiza a Interface
        catTag.innerText = questaoAtual.category;
        qText.innerText = questaoAtual.question;
        container.innerHTML = '';

        questaoAtual.options.forEach((opt, i) => {
            const b = document.createElement('button');
            b.className = 'option-btn';
            b.innerText = opt;
            // Estilos inline para garantir visual mesmo se o CSS falhar
            b.style.cssText = "background: #29292e; border: 1px solid #323238; color: white; padding: 15px; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 10px; width: 100%; font-size: 1rem; transition: 0.2s;";
            
            b.onmouseover = () => b.style.borderColor = "#8257e6";
            b.onmouseout = () => b.style.borderColor = "#323238";
            
            b.onclick = () => verificarResposta(i, b);
            container.appendChild(b);
        });

    } catch (e) {
        console.error(e);
        alert(`Erro de Conexão: ${e.message}. Verifique a Chave API.`);
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

    if (idx === questaoAtual.correctIndex) {
        // ACERTOU
        b.style.background = "rgba(4, 211, 97, 0.2)";
        b.style.borderColor = "#04d361";
        b.style.color = "#04d361";
        
        // Toca som se existir
        const snd = document.getElementById('snd-correct');
        if(snd) snd.play().catch(e => console.log("Audio bloqueado pelo navegador"));
        
        // Confetes
        if(typeof confetti !== 'undefined') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        
        xp += 100;
        streak++;
    } else {
        // ERROU
        b.style.background = "rgba(247, 90, 104, 0.2)";
        b.style.borderColor = "#f75a68";
        
        // Mostra a correta
        if(todosBotoes[questaoAtual.correctIndex]) {
            todosBotoes[questaoAtual.correctIndex].style.borderColor = "#04d361";
            todosBotoes[questaoAtual.correctIndex].style.color = "#04d361";
        }
        streak = 0;
    }

    if(explanation) explanation.innerText = "💡 " + questaoAtual.explanation;
    if(feedbackArea) feedbackArea.classList.remove('hidden');
    
    document.getElementById('score-counter').innerText = `💎 ${xp} XP`;
    document.getElementById('streak-counter').innerText = `🔥 ${streak}`;
}

// Expõe a função para o botão do HTML
window.buscarQuestaoInedita = buscarQuestaoInedita;
