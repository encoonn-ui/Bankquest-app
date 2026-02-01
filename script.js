const WORKER_URL = "https://plain-surf-53cfproxy-gemini-concurso.encoonn.workers.dev";

async function buscarQuestaoInedita() {
    const btn = document.getElementById('ai-btn');
    const qText = document.getElementById('question-text');
    
    btn.disabled = true;
    btn.innerText = "⚡ PROCESSANDO (GEMINI FLASH)...";

    try {
        const res = await fetch(WORKER_URL, {
            method: "POST",
            body: JSON.stringify({ 
                prompt: "Gere uma questão inédita Cesgranrio para Banco do Brasil. Responda apenas o JSON puro: {\"category\": \"Materia\", \"question\": \"pergunta\", \"options\": [\"A\",\"B\",\"C\",\"D\",\"E\"], \"correct\": 0, \"explanation\": \"explicação\"}" 
            })
        });

        // Se o Google der erro de limite (429)
        if (res.status === 429) {
            alert("Muitos pedidos! Aguarde 30 segundos e tente novamente.");
            return;
        }

        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
        const questao = JSON.parse(text);

        // Renderização (seu código de colocar na tela continua aqui...)
        document.getElementById('question-text').innerText = questao.question;
        // ... (resto do código das opções)
        
    } catch (err) {
        console.error(err);
        alert("Ocorreu um erro. Verifique o console.");
    } finally {
        btn.disabled = false;
        btn.innerText = "✨ GERAR MISSÃO INÉDITA (IA)";
    }
}
