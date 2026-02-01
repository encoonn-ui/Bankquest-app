// --- AREA DE CONFIGURAÇÃO ---
// ⚠️ IMPORTANTE: Apague a chave antiga e cole a NOVA chave que você gerou agora.
const GOOGLE_API_KEY = "AIzaSyAsyvIgxMsEG6eRwUNAFAg6HOpvPGbbrYc"; 

// Variáveis do Jogo
let xp = 0;
let streak = 0;
let questaoAtual = null;

// --- FUNÇÃO CÉREBRO (IA) ---
async function buscarQuestaoInedita() {
    const btn = document.getElementById('ai-btn');
    const catTag = document.getElementById('category');
    const qText = document.getElementById('question-text');
    const container = document.getElementById('options-container');
    const feedbackArea = document.getElementById('feedback-area');

    // 1. Prepara o terreno (Visual)
    btn.innerText = "⚡ CONECTANDO AO CÉREBRO...";
    btn.disabled = true;
    catTag.innerText = "ANALISANDO EDITAL...";
    
    if(feedbackArea) feedbackArea.classList.add('hidden');

    // 2. Sorteia o Tópico (Estratégia Pareto BB)
    const fases = [
        "Fase 1: Vendas e Negociação (CDC e LGPD) - FOCO TOTAL",
        "Fase 2: Conhecimentos Bancários (Pix e SFN)",
        "Fase 3: Português (Crase e Interpretação Cesgranrio)",
        "Fase 4: Informática (Segurança da Informação)"
    ];
    const faseSorteada = fases[Math.floor(Math.random() * fases.length)];

    // 3. Monta o Pedido para o Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;
    
    const promptCorpo = {
        contents: [{
            parts: [{
                text: `Aja como mentor para o Banco do Brasil. Gere uma questão Cesgranrio sobre ${faseSorteada}. Responda APENAS o JSON: {"category": "${faseSorteada}", "question": "Pergunta", "options": ["A","B","C","D","E"], "correctIndex": 0, "explanation": "Explicação curta"}`
            }]
        }]
    };

    try {
        // 4. Envia o Pedido (Com a correção do Header JSON)
        const response = await fetch(url, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // <--- O SEGREDO ESTÁ AQUI
            body: JSON.stringify(promptCorpo) 
        });

        // Verifica se a chave foi aceita
        if (!response.ok) {
            const erroInfo = await response.json();
            throw new Error(`Erro na API (${response.status}): Verifique sua Chave API nova.`);
        }

        const data = await response.json();
        
        // 5. Limpa a resposta da IA
        let resText = data.candidates[0].content.parts[0].text;
        resText = resText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        questaoAtual = JSON.parse(resText);
        
        // 6. Mostra na Tela
        catTag.innerText = questaoAtual.category;
        qText.innerText = questaoAtual.question;
        container.innerHTML = '';

        questaoAtual.options.forEach((opt, i) => {
            const b = document.createElement('button');
            b.className = 'option-btn';
            b.innerText = opt;
            // Estilo garantido via JS
            b.style.cssText = "background: #29292e; border: 1px solid #323238; color: white; padding: 15px; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 10px; width: 100%; font-size: 1rem; transition: 0.2s;";
            
            b.onmouseover = () => b.style.borderColor = "#8257e6";
            b.onmouseout = () => b.style.borderColor = "#323238";
            
            b.onclick = () => verificarResposta(i, b);
            container.appendChild(b);
        });

    } catch (e) {
        console.error(e);
        alert(`🚨 ${e.message}\n\nDica: Gere uma chave nova no Google AI Studio e cole no script.js`);
    } finally {
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
        btn.disabled = false;
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
