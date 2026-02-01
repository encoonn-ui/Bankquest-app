// CONFIGURAÇÕES GLOBAIS
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

    // 1. Bloqueia o botão para não clicar duas vezes
    btn.innerText = "⚡ GERANDO MISSÃO...";
    btn.disabled = true;
    catTag.innerText = "ANALISANDO EDITAL...";
    
    // Garante que a área de feedback esteja escondida ao começar
    if(feedbackArea) feedbackArea.classList.add('hidden');

    // Estratégia de Fases Cronológicas para Aprovação
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
        // --- AQUI ESTAVA O ERRO: FALTAVA O HEADER ---
        const response = await fetch(url, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // <--- ESSA LINHA CONSERTA TUDO
            body: JSON.stringify(promptCorpo) 
        });

        const data = await response.json();
        
        // Limpeza de segurança para garantir que o JSON venha limpo
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
            // Estilo direto no JS para garantir que não quebre sem CSS
            b.style.cssText = "background: #29292e; border: 1px solid #323238; color: white; padding: 12px; border-radius: 6px; cursor: pointer; text-align: left; margin-bottom: 8px; width: 100%; transition: all 0.2s;";
            b.onclick = () => verificarResposta(i, b);
            container.appendChild(b);
        });

    } catch (e) {
        console.error(e); // Mostra o erro real no console (F12) se houver
        alert("Erro na conexão. Verifique se sua internet está ok!");
    } finally {
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
        btn.disabled = false;
    }
}

function verificarResposta(idx, b) {
    const todosBotoes = document.querySelectorAll('.option-btn');
    todosBotoes.forEach(btn => btn.disabled = true);

    if (idx === questaoAtual.correctIndex) {
        b.style.background = "#04d361"; // Verde
        b.style.borderColor = "#04d361";
        
        // Tenta tocar o som se existir
        const audio = document.getElementById('snd-correct');
        if(audio) audio.play();
        
        // Confetes
        if(typeof confetti !== 'undefined') confetti({ particleCount: 100 });
        
        xp += 100;
        streak++;
    } else {
        b.style.background = "#f75a68"; // Vermelho
        b.style.borderColor = "#f75a68";
        // Mostra a correta
        if(todosBotoes[questaoAtual.correctIndex]) {
            todosBotoes[questaoAtual.correctIndex].style.background = "#04d361";
        }
        streak = 0;
    }

    const explanationEl = document.getElementById('explanation');
    const feedbackArea = document.getElementById('feedback-area');
    
    if(explanationEl) explanationEl.innerText = "💡 " + questaoAtual.explanation;
    if(feedbackArea) feedbackArea.classList.remove('hidden');
    
    const scoreEl = document.getElementById('score-counter');
    const streakEl = document.getElementById('streak-counter');
    
    if(scoreEl) scoreEl.innerText = `💎 ${xp} XP`;
    if(streakEl) streakEl.innerText = `🔥 ${streak}`;
}

// Expõe a função para o botão do HTML funcionar
window.buscarQuestaoInedita = buscarQuestaoInedita;
