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

    btn.innerText = "⚡ GERANDO MISSÃO...";
    btn.disabled = true;
    catTag.innerText = "ANALISANDO EDITAL...";

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
        const response = await fetch(url, { method: 'POST', body: JSON.stringify(promptCorpo) });
        const data = await response.json();
        const resText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
        questaoAtual = JSON.parse(resText);
        
        // Atualiza a Interface
        catTag.innerText = questaoAtual.category;
        qText.innerText = questaoAtual.question;
        container.innerHTML = '';
        document.getElementById('feedback-area').classList.add('hidden');

        questaoAtual.options.forEach((opt, i) => {
            const b = document.createElement('button');
            b.className = 'option-btn';
            b.innerText = opt;
            b.style.cssText = "background: #29292e; border: 1px solid #323238; color: white; padding: 12px; border-radius: 6px; cursor: pointer; text-align: left; margin-bottom: 8px; width: 100%;";
            b.onclick = () => verificarResposta(i, b);
            container.appendChild(b);
        });

    } catch (e) {
        alert("Erro ao conectar com a IA. Verifique sua conexão em Salvador!");
    } finally {
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
        btn.disabled = false;
    }
}

function verificarResposta(idx, b) {
    const todosBotoes = document.querySelectorAll('.option-btn');
    todosBotoes.forEach(btn => btn.disabled = true);

    if (idx === questaoAtual.correctIndex) {
        b.style.background = "#04d361";
        document.getElementById('snd-correct').play();
        confetti({ particleCount: 100 });
        xp += 100;
        streak++;
    } else {
        b.style.background = "#f75a68";
        todosBotoes[questaoAtual.correctIndex].style.background = "#04d361";
        streak = 0;
    }

    document.getElementById('explanation').innerText = "💡 " + questaoAtual.explanation;
    document.getElementById('feedback-area').classList.remove('hidden');
    document.getElementById('score-counter').innerText = `💎 ${xp} XP`;
    document.getElementById('streak-counter').innerText = `🔥 ${streak}`;
}

// Expõe a função para o botão do HTML funcionar
window.buscarQuestaoInedita = buscarQuestaoInedita;
