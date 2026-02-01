// Importar Firebase (via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// SUAS CREDENCIAIS AQUI
const firebaseConfig = {
  apiKey: "AIzaSyDHONAHV0t2u3hJymAAuWNjzw199_i_s58",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
// Relatório de Desempenho (Estratégia Pareto)
async function generateDailyReport(userId) {
    const docRef = doc(db, "user_stats", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const taxaAcerto = (data.total_hits / (data.total_hits + data.total_errors)) * 100;
        
        // Aqui entra o prompt para a sua API Google Flash 2.5
        const prompt = `Analise meu desempenho: Acertos: ${data.total_hits}, Erros: ${data.total_errors}. 
        Foque no cargo Agente Comercial BB. Qual conteúdo do edital devo focar usando Pareto 80/20 para atingir 80% de acerto?`;
        
        console.log("Dica do Mentor AI:", prompt);
        // Em seguida, conectamos a chamada da sua API Key aqui.
    }
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para salvar seu progresso automaticamente
async function saveProgress(xp, streak, hits, errors) {
    await setDoc(doc(db, "user_stats", "endrew"), {
        xp: xp,
        streak: streak,
        total_hits: hits,
        total_errors: errors,
        last_update: new Date()
    }, { merge: true });
}
// Banco de Questões (Simulando o que viria do Firebase/JSON)
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
];
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
        // Incrementa acertos totais
    } else {
        streak = 0;
        // Incrementa erros totais
    }
    document.getElementById('score-counter').innerText = `💎 ${xp} XP`;
    document.getElementById('streak-counter').innerText = `🔥 ${streak}`;
    
    // SALVA NO FIREBASE
    saveProgress(xp, streak, 0, 0); // Depois ajustamos os contadores detalhados
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
