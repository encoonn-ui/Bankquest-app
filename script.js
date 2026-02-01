// Banco de Questões (Simulando o que viria do Firebase/JSON)
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
