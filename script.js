const WORKER_URL = "https://plain-surf-53cfproxy-gemini-concurso.encoonn.workers.dev";
let questaoAtual = null;
let cooldownAtivo = false;

async function buscarQuestaoInedita() {
    if (cooldownAtivo) return; // Impede cliques extras

    const btn = document.getElementById('ai-btn');
    const qText = document.getElementById('question-text');
    const catTag = document.getElementById('category');
    const container = document.getElementById('options-container');

    // Iniciar carregamento
    btn.disabled = true;
    btn.innerText = "⚡ A ACESSAR O GEMINI FLASH...";
    catTag.innerText = "GERANDO...";

    try {
        const res = await fetch(WORKER_URL, {
            method: "POST",
            body: JSON.stringify({ 
                prompt: "Gere uma questão inédita nível Cesgranrio para o Banco do Brasil. Responda APENAS o JSON puro: {\"category\": \"Matéria\", \"question\": \"pergunta\", \"options\": [\"A\",\"B\",\"C\",\"D\",\"E\"], \"correct\": 0, \"explanation\": \"explicação\"}" 
            })
        });

        if (res.status === 429) {
            throw new Error("Limite de pedidos atingido. Aguarde um pouco.");
        }

        const data = await res.json();
        
        // Tratar resposta
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        questaoAtual = JSON.parse(text);

        // Renderizar questão
        catTag.innerText = questaoAtual.category;
        qText.innerText = questaoAtual.question;
        container.innerHTML = "";

        questaoAtual.options.forEach((opt, i) => {
            const b = document.createElement('button');
            b.innerText = opt;
            b.className = "option-btn";
            b.style.cssText = "display:block; width:100%; margin:10px 0; padding:15px; background:#29292e; color:white; border:1px solid #323238; border-radius:8px; cursor:pointer; text-align:left; font-size:1rem;";
            
            b.onclick = () => {
                const todos = document.querySelectorAll('.option-btn');
                todos.forEach(t => t.disabled = true);
                if(i === questaoAtual.correct) {
                    b.style.borderColor = "#04d361";
                    b.style.color = "#04d361";
                    alert("✅ Resposta Correta!");
                } else {
                    b.style.borderColor = "#f75a68";
                    b.style.color = "#f75a68";
                    alert("❌ Errada. A correta era: " + questaoAtual.options[questaoAtual.correct]);
                }
            };
            container.appendChild(b);
        });

        // Iniciar Cooldown de 15 segundos após sucesso
        iniciarCooldown(15);

    } catch (err) {
        console.error(err);
        alert(err.message || "Erro de conexão.");
        btn.disabled = false;
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
    }
}

function iniciarCooldown(segundos) {
    const btn = document.getElementById('ai-btn');
    cooldownAtivo = true;
    let tempoRestante = segundos;

    const intervalo = setInterval(() => {
        btn.innerText = `⏳ AGUARDE ${tempoRestante}s...`;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
        tempoRestante--;

        if (tempoRestante < 0) {
            clearInterval(intervalo);
            cooldownAtivo = false;
            btn.disabled = false;
            btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
        }
    }, 1000);
}

window.buscarQuestaoInedita = buscarQuestaoInedita;
