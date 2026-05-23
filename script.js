// Состояние приложения
let currentTest = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = { correct: 0, totalPoints: 0, maxPoints: 0 };
let startTime = null;
let timerInterval = null;
let timeLeft = 0;
let userName = "Электрик";

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupFloatingButton();
});

function initApp() {
    userName = storage.getUserName();
    document.getElementById('user-name').value = userName;
    displayTests();
    setupEventListeners();
    updateStats();
}

function displayTests() {
    const container = document.getElementById('tests-container');
    container.innerHTML = '';
    
    tests.forEach(test => {
        const questionCount = questions.filter(q => q.testId === test.id).length;
        const bestScore = storage.getBestScore(test.id);
        const maxScore = questions.filter(q => q.testId === test.id).reduce((sum, q) => sum + q.points, 0);
        
        const testCard = document.createElement('div');
        testCard.className = 'test-card';
        testCard.innerHTML = `
            <h3><i class="${test.icon}"></i> ${test.name}</h3>
            <p>${test.description}</p>
            <div class="test-meta">
                <span class="difficulty" style="background: ${test.color}20; color: ${test.color};">
                    <i class="fas fa-chart-line"></i> ${test.difficulty}
                </span>
                <span class="question-count">
                    <i class="fas fa-question"></i> ${questionCount} вопросов
                </span>
                <span class="time-limit">
                    <i class="fas fa-clock"></i> ${Math.floor(test.timeLimit / 60)} мин
                </span>
            </div>
            ${bestScore > 0 ? `<div class="best-score"><i class="fas fa-trophy"></i> Лучший результат: ${Math.round((bestScore / maxScore) * 100)}%</div>` : ''}
            <button class="btn start-test-btn" data-test-id="${test.id}" style="background: ${test.color};">
                <i class="fas fa-play-circle"></i> Начать тест
            </button>
        `;
        container.appendChild(testCard);
    });
    
    document.getElementById('total-questions').textContent = questions.length;
    document.getElementById('total-tests').textContent = tests.length;
    
    const allScores = tests.map(t => storage.getBestScore(t.id));
    const bestOverall = Math.max(...allScores);
    document.getElementById('best-score').textContent = bestOverall > 0 ? `${bestOverall}%` : 'Нет данных';
}

function setupEventListeners() {
    document.getElementById('save-name-btn').addEventListener('click', function() {
        const nameInput = document.getElementById('user-name');
        if (nameInput.value.trim()) {
            userName = nameInput.value.trim();
            storage.saveUserName(userName);
            showNotification('Имя сохранено!', 'success');
        }
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('start-test-btn') || e.target.closest('.start-test-btn')) {
            const btn = e.target.classList.contains('start-test-btn') ? e.target : e.target.closest('.start-test-btn');
            const testId = parseInt(btn.dataset.testId);
            startTest(testId);
        }
    });
    
    document.getElementById('back-btn').addEventListener('click', goHome);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('restart-btn').addEventListener('click', restartTest);
    document.getElementById('new-test-btn').addEventListener('click', goHome);
    document.getElementById('certificate-btn').addEventListener('click', showCertificate);
}

function startTest(testId) {
    currentTest = tests.find(t => t.id === testId);
    
    const allQuestions = questions.filter(q => q.testId === testId);
    const shuffledQuestions = shuffleArray(allQuestions);
    const questionsCount = Math.min(10, allQuestions.length);
    currentQuestions = shuffledQuestions.slice(0, questionsCount);
    
    currentQuestionIndex = 0;
    userAnswers = [];
    score = { correct: 0, totalPoints: 0, maxPoints: 0 };
    timeLeft = currentTest.timeLimit;
    score.maxPoints = currentQuestions.reduce((sum, q) => sum + q.points, 0);
    
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('test-screen').classList.remove('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    
    document.getElementById('current-test-name').textContent = currentTest.name;
    
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    showQuestion();
    updateProgress();
    updateScore();
}

function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    document.getElementById('question-number').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = question.text;
    document.querySelector('.question-points').innerHTML = `<i class="fas fa-star"></i> ${question.points} балл${question.points > 1 ? 'а' : ''}`;
    
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';
    
    const shuffledAnswers = shuffleArray([...question.answers]);
    
    shuffledAnswers.forEach(answer => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-option';
        answerElement.innerHTML = `<span class="answer-text">${answer.text}</span>`;
        answerElement.dataset.answerId = answer.id;
        answerElement.addEventListener('click', () => selectAnswer(answer, shuffledAnswers));
        answersContainer.appendChild(answerElement);
    });
    
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('next-btn').disabled = true;
    
    const nextBtn = document.getElementById('next-btn');
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.innerHTML = 'Завершить тест <i class="fas fa-flag-checkered"></i>';
    } else {
        nextBtn.innerHTML = 'Следующий вопрос <i class="fas fa-arrow-right"></i>';
    }
}

function selectAnswer(selectedAnswer, allAnswers) {
    if (document.querySelector('.answer-option.selected')) return;
    
    const question = currentQuestions[currentQuestionIndex];
    
    const selectedElement = document.querySelector(`[data-answer-id="${selectedAnswer.id}"]`);
    selectedElement.classList.add('selected');
    
    allAnswers.forEach(answer => {
        const element = document.querySelector(`[data-answer-id="${answer.id}"]`);
        if (answer.isCorrect) {
            element.classList.add('correct');
        } else if (answer.id === selectedAnswer.id && !answer.isCorrect) {
            element.classList.add('wrong');
        }
    });
    
    userAnswers.push({
        questionId: question.id,
        selectedAnswerId: selectedAnswer.id,
        isCorrect: selectedAnswer.isCorrect,
        points: selectedAnswer.isCorrect ? question.points : 0
    });
    
    if (selectedAnswer.isCorrect) {
        score.correct++;
        score.totalPoints += question.points;
    }
    updateScore();
    
    document.getElementById('explanation-text').textContent = question.explanation;
    document.getElementById('explanation').classList.remove('hidden');
    document.getElementById('next-btn').disabled = false;
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
        updateProgress();
    } else {
        finishTest();
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `Вопрос ${currentQuestionIndex + 1} из ${currentQuestions.length}`;
}

function updateTimer() {
    timeLeft--;
    
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showNotification('Время вышло! Тест завершен.', 'warning');
        finishTest();
        return;
    }
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.querySelector('#timer span').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft < 60) {
        document.getElementById('timer').style.background = '#e74c3c';
    } else if (timeLeft < 180) {
        document.getElementById('timer').style.background = '#f39c12';
    }
}

function updateScore() {
    document.getElementById('correct-count').textContent = score.correct;
    document.getElementById('wrong-count').textContent = userAnswers.length - score.correct;
    document.getElementById('remaining-count').textContent = currentQuestions.length - userAnswers.length;
    
    const accuracy = userAnswers.length > 0 ? Math.round((score.correct / userAnswers.length) * 100) : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
}

function finishTest() {
    clearInterval(timerInterval);
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const percentage = score.maxPoints > 0 ? Math.round((score.totalPoints / score.maxPoints) * 100) : 0;
    
    storage.saveResult(currentTest.id, percentage, totalTime);
    
    document.getElementById('score-percent').textContent = `${percentage}%`;
    document.getElementById('final-correct').textContent = score.correct;
    document.getElementById('final-wrong').textContent = userAnswers.length - score.correct;
    document.getElementById('final-total').textContent = currentQuestions.length;
    document.getElementById('final-time').textContent = timeString;
    document.getElementById('user-greeting').textContent = `Поздравляем, ${userName}!`;
    
    const message = document.getElementById('result-message');
    if (percentage >= 90) {
        message.textContent = 'Отличный результат! Вы настоящий эксперт!';
        message.style.color = '#2ecc71';
    } else if (percentage >= 70) {
        message.textContent = 'Хороший результат! Знания на хорошем уровне!';
        message.style.color = '#3498db';
    } else if (percentage >= 50) {
        message.textContent = 'Удовлетворительно. Есть над чем поработать.';
        message.style.color = '#f39c12';
    } else {
        message.textContent = 'Нужно больше практики. Рекомендуем изучить материал еще раз.';
        message.style.color = '#e74c3c';
    }
    
    displayAnswersReview();
    
    document.getElementById('test-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displayAnswersReview() {
    const container = document.getElementById('answers-review-container');
    container.innerHTML = '';
    
    userAnswers.forEach((userAnswer, index) => {
        const question = currentQuestions[index];
        const selectedAnswer = question.answers.find(a => a.id === userAnswer.selectedAnswerId);
        const correctAnswer = question.answers.find(a => a.isCorrect);
        
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`;
        reviewItem.innerHTML = `
            <div class="review-question"><strong>Вопрос ${index + 1}:</strong> ${question.text}</div>
            <div class="review-answer ${userAnswer.isCorrect ? 'correct' : 'incorrect'}">
                <i class="fas fa-${userAnswer.isCorrect ? 'check' : 'times'}"></i>
                <span><strong>Ваш ответ:</strong> ${selectedAnswer.text}</span>
            </div>
            ${!userAnswer.isCorrect ? `<div class="review-answer correct"><i class="fas fa-check"></i> <span><strong>Правильный ответ:</strong> ${correctAnswer.text}</span></div>` : ''}
            <div class="review-explanation"><i class="fas fa-info-circle"></i> ${question.explanation}</div>
        `;
        container.appendChild(reviewItem);
    });
}

function goHome() {
    clearInterval(timerInterval);
    
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('test-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    
    updateStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restartTest() {
    if (currentTest) {
        startTest(currentTest.id);
    }
}

function showCertificate() {
    const percentage = Math.round((score.totalPoints / score.maxPoints) * 100);
    const certWindow = window.open('', '_blank');
    certWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Сертификат - ${currentTest.name}</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
            .certificate { background: white; padding: 60px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 800px; border: 20px solid #f1c40f; position: relative; }
            h1 { color: #2c3e50; margin-bottom: 30px; }
            .score { font-size: 72px; color: #e74c3c; margin: 30px 0; font-weight: bold; }
            .info { margin: 20px 0; font-size: 18px; color: #555; }
            .signature { margin-top: 50px; display: flex; justify-content: space-between; padding-top: 30px; border-top: 2px solid #ddd; }
            .date { margin-top: 30px; color: #777; }
            .logo { position: absolute; top: 20px; right: 20px; font-size: 24px; color: #3498db; }
        </style>
        </head>
        <body>
            <div class="certificate">
                <div class="logo">⚡ ЭлектроТест</div>
                <h1>СЕРТИФИКАТ</h1>
                <p class="info">Настоящим удостоверяется, что</p>
                <h2>${userName}</h2>
                <p class="info">успешно прошел(а) тестирование по курсу</p>
                <h3>"${currentTest.name}"</h3>
                <div class="score">${percentage}%</div>
                <p class="info">Правильных ответов: ${score.correct} из ${currentQuestions.length}</p>
                <div class="signature">
                    <div><p>___________________</p><p>Подпись участника</p></div>
                    <div><p>___________________</p><p>Подпись руководителя</p></div>
                </div>
                <div class="date">Дата: ${new Date().toLocaleDateString('ru-RU')}</div>
            </div>
        </body>
        </html>
    `);
    certWindow.document.close();
}

function updateStats() {
    const bestScore = storage.getBestScore(currentTest ? currentTest.id : 1);
    document.getElementById('best-score').textContent = bestScore > 0 ? `${bestScore}%` : '0%';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ========== ПЛАВАЮЩАЯ КНОПКА И МОДАЛЬНОЕ ОКНО ==========

function setupFloatingButton() {
    const floatingBtn = document.getElementById('floating-error-btn');
    const modal = document.getElementById('errorModal');
    const closeSpan = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelErrorBtn');
    const errorForm = document.getElementById('errorForm');
    
    // Открытие модального окна
    if (floatingBtn) {
        floatingBtn.onclick = function() {
            if (modal) {
                // Заполняем данные, если есть текущий тест
                if (currentTest && currentQuestions && currentQuestions[currentQuestionIndex]) {
                    const q = currentQuestions[currentQuestionIndex];
                    const testNameInput = document.getElementById('errorTestName');
                    const questionIdInput = document.getElementById('errorQuestionId');
                    const questionTextInput = document.getElementById('errorQuestionText');
                    if (testNameInput) testNameInput.value = currentTest.name;
                    if (questionIdInput) questionIdInput.value = q.id;
                    if (questionTextInput) questionTextInput.value = q.text;
                }
                modal.style.display = 'flex';
            }
        };
        console.log('✅ Кнопка "Сообщить об ошибке" работает!');
    }
    
    // Закрытие окна
    if (closeSpan) closeSpan.onclick = function() { if (modal) modal.style.display = 'none'; };
    if (cancelBtn) cancelBtn.onclick = function() { if (modal) modal.style.display = 'none'; };
    if (modal) modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
    
    // Отправка формы
    if (errorForm) {
        errorForm.onsubmit = function(e) {
            e.preventDefault();
            
            const description = document.getElementById('errorDescription').value.trim();
            if (!description) {
                alert('❌ Пожалуйста, опишите ошибку!');
                return;
            }
            
            const errorData = {
                testName: document.getElementById('errorTestName').value || 'не указан',
                questionId: document.getElementById('errorQuestionId').value || 'не указан',
                questionText: document.getElementById('errorQuestionText').value || 'не указан',
                errorType: document.getElementById('errorType').value,
                description: description,
                email: document.getElementById('userEmail').value || 'не указан',
                userName: userName || localStorage.getItem('electrotest_username') || 'Аноним',
                date: new Date().toLocaleString('ru-RU')
            };
            
            // Сохраняем в localStorage
            let errors = JSON.parse(localStorage.getItem('electrotest_errors') || '[]');
            errors.push(errorData);
            localStorage.setItem('electrotest_errors', JSON.stringify(errors));
            
            console.log('✅ Ошибка сохранена:', errorData);
            console.table(errors);
            
            alert('✅ Спасибо! Сообщение об ошибке сохранено.\n\nОтправьте разработчику: wolf57867@gmail.com');
            
            // Очищаем форму и закрываем
            errorForm.reset();
            if (modal) modal.style.display = 'none';
        };
    }
}

// Экспорт для отладки
window.ElectroTest = { tests, questions, storage, restartTest, goHome };