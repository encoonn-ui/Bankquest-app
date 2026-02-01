// Configurações de Acesso
const GOOGLE_API_KEY = "AIzaSyDqpjtq_HwStJvQoxDsgIYRso_CbhQsWZQ"; 

const firebaseConfig = {
  apiKey: "AIzaSyDqpjtq_HwStJvQoxDsgIYRso_CbhQsWZQ",
  authDomain: "bankquest-app.firebaseapp.com",
  projectId: "bankquest-app",
  storageBucket: "bankquest-app.appspot.com",
  messagingSenderId: "SUA_ID",
  appId: "SUA_APP_ID"
};

// O restante do seu código (const questions...) continua abaixo
    const questions = [
    {
        category: "Vendas e Negociação (Pareto: CDC)",
        question: "De acordo com o Código de Defesa do Consumidor, o prazo para o cliente reclamar de vício aparente em serviços não duráveis (como uma tarifa bancária) é de:",
        options: [
            "30 dias",
            "90 dias",
            "7 dias",
            "15 dias"
        ],
        correctIndex: 0,
        explanation: "Correto! O Art. 26 do CDC define 30 dias para produtos/serviços não duráveis e 90 dias para duráveis."
    },
    {
        category: "Informática (Pareto: Segurança)",
        question: "Um Agente Comercial recebe um link por SMS dizendo que seus pontos do cartão vão expirar. Ao clicar, o site pede a senha. Isso é:",
        options: [
            "Ransomware",
            "Smishing (Phishing via SMS)",
            "Spam comum",
            "Vishing"
        ],
        correctIndex: 1,
        explanation: "Perfeito! Quando o Phishing ocorre via SMS, ele recebe o nome específico de Smishing."
    },
    {
        category: "Português (Pareto: Crase)",
        question: "Assinale a alternativa que preenche corretamente a lacuna: 'O estagiário entregou o relatório ___ gerente.'",
        options: [
            "a",
            "à",
            "há",
            "as"
        ],
        correctIndex: 1,
        explanation: "Correto! Quem entrega, entrega ALGO (o relatório) A alguém (a gerente). Preposição A + Artigo A = À."
    },
    {
        category: "Vendas (Pareto: Ética)",
        question: "No contexto bancário, o sigilo das informações dos clientes é um dever ético e legal. O compartilhamento de dados sem autorização fere qual lei?",
        options: [
            "Lei de Diretrizes Orçamentárias",
            "LGPD (Lei Geral de Proteção de Dados)",
            "Lei Pelé",
            "Código Civil apenas"
        ],
        correctIndex: 1,
        explanation: "Isso! A LGPD regula o tratamento de dados pessoais e é tema certo na Cesgranrio."
    },
    {
        category: "Matemática Financeira (Pareto)",
        question: "No Sistema de Amortização Constante (SAC), o valor das prestações ao longo do tempo tende a:",
        options: [
            "Aumentar",
            "Manter-se constante",
            "Diminuir",
            "Dobrar no final"
        ],
        correctIndex: 2,
        explanation: "Exato! No SAC, como a amortização é fixa e os juros caem sobre o saldo devedor menor, a prestação decresce."
    }
];// Banco de Questões (Simulando o que viria do Firebase/JSON)
const questions = [
    {
        category: "Vendas e Negociação",
        question: "Segundo o Código de Defesa do Consumidor, a prática de condicionar o fornecimento de produto ou serviço ao fornecimento de outro é chamada de:",
        options: [
            "Venda Casada",
            "Venda Cruzada",
            "Upselling",
            "Dumping"
        ],
        correctIndex: 0,
        explanation: "Correto! A Venda Casada é proibida pelo Art. 39 do CDC. É quando o banco te obriga a levar um seguro para te dar um empréstimo."
    },
    {
        category: "Informática - Segurança",
        question: "Qual o nome do ataque onde o criminoso envia um e-mail falso se passando pelo banco para roubar sua senha?",
        options: [
            "Ransomware",
            "Phishing",
            "Spyware",
            "DDoS"
        ],
        correctIndex: 1,
        explanation: "Exato! Phishing (pescaria) é a técnica de enganar o usuário com comunicações falsas."
    }
];

let currentQuestion = 0;
let xp = 0;
let streak = 0;

// Sons
const sndCorrect = document.getElementById('snd-correct');
const sndWrong = document.getElementById('snd-wrong');

function loadQuestion() {
    const q = questions[currentQuestion];
    document.getElementById('category').innerText = q.category;
    document.getElementById('question-text').innerText = q.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = ''; // Limpa opções anteriores

    // Cria os botões dinamicamente
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });

    // Esconde feedback
    document.getElementById('feedback-area').classList.add('hidden');
}

function checkAnswer(selectedIndex, btnElement) {
    const q = questions[currentQuestion];
    const allBtns = document.querySelectorAll('.option-btn');
    
    // Desabilita cliques após responder
    allBtns.forEach(btn => btn.disabled = true);

    if (selectedIndex === q.correctIndex) {
        // ACERTOU
        btnElement.classList.add('correct');
        playSound(true);
        triggerConfetti();
        updateStats(true);
    } else {
        // ERROU
        btnElement.classList.add('wrong');
        // Mostra qual era a certa
        allBtns[q.correctIndex].classList.add('correct');
        playSound(false);
        updateStats(false);
    }

    // Mostra explicação
    document.getElementById('explanation').innerText = q.explanation;
    document.getElementById('feedback-area').classList.remove('hidden');
}

function playSound(isCorrect) {
    // Reseta o áudio para tocar do início se clicar rápido
    if(isCorrect) {
        sndCorrect.currentTime = 0;
        sndCorrect.play();
    } else {
        sndWrong.currentTime = 0;
        sndWrong.play();
    }
}

function updateStats(isCorrect) {
    if(isCorrect) {
        xp += 100;
        streak++;
    } else {
        streak = 0;
    }
    document.getElementById('score-counter').innerText = `💎 ${xp} XP`;
    document.getElementById('streak-counter').innerText = `🔥 ${streak}`;
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        alert("Parabéns! Você completou o módulo de hoje!");
        currentQuestion = 0; // Reinicia para teste
        loadQuestion();
    }
}

// Iniciar o app
loadQuestion();
// FUNÇÃO QUE CONVERSA COM O GEMINI
async function buscarQuestaoInedita() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;
    
    const prompt = {
        contents: [{
            parts: [{
                text: "Gere uma questão inédita da Cesgranrio para o concurso do Banco do Brasil (Agente Comercial). Use a Lei de Pareto para escolher o tema. Retorne APENAS um JSON: {category, question, options:[], correctIndex, explanation}"
            }]
        }]
    };

    try {
        const response = await fetch(url, { method: 'POST', body: JSON.stringify(prompt) });
        const data = await response.json();
        const resText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
        const novaQuestao = JSON.parse(resText);
        
        // Coloca a nova questão no jogo
        questions.push(novaQuestao);
        currentQuestion = questions.length - 1;
        loadQuestion();
    } catch (e) {
        alert("Erro ao gerar missão. Verifique sua chave no console!");
    }
}
async function gerarRelatorioEstrategico() {
    const docRef = doc(db, "user_stats", "endrew");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const d = docSnap.data();
        const totalQuestões = d.total_hits + d.total_errors;
        const aproveitamento = ((d.total_hits / totalQuestões) * 100).toFixed(1);
        
        let direcao = "";
        if (aproveitamento < 50) {
            direcao = "🚨 Alerta: Foque 100% em Teoria de Vendas e Negociação. Você precisa fortalecer a base.";
        } else if (aproveitamento < 80) {
            direcao = "📈 No Caminho: Aumente o ritmo de questões de Informática e Português. Você está quase lá.";
        } else {
            direcao = "🏆 Excelente: Você atingiu o nível de aprovação! Comece a revisar Matemática Financeira.";
        }

        alert(`--- RELATÓRIO DE BATALHA ---\nDesempenho Atual: ${aproveitamento}%\nDireção: ${direcao}`);
    } else {
        alert("Inicie sua primeira missão para gerar dados!");
    }
}
