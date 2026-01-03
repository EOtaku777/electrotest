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
});

function initApp() {
    // Загрузить имя пользователя
    userName = storage.getUserName();
    document.getElementById('user-name').value = userName;
    
    // Отобразить тесты
    displayTests();
    
    // Настроить обработчики событий
    setupEventListeners();
    
    // Обновить статистику
    updateStats();
}

// Отображение списка тестов
function displayTests() {
    const container = document.getElementById('tests-container');
    container.innerHTML = '';
    
    tests.forEach(test => {
        const questionCount = questions.filter(q => q.testId === test.id).length;
        const bestScore = storage.getBestScore(test.id);
        const maxScore = questions
            .filter(q => q.testId === test.id)
            .reduce((sum, q) => sum + q.points, 0);
        
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
            ${bestScore > 0 ? `
                <div class="best-score">
                    <i class="fas fa-trophy"></i> Лучший результат: ${Math.round((bestScore / maxScore) * 100)}%
                </div>
            ` : ''}
            <button class="btn start-test-btn" data-test-id="${test.id}" style="background: ${test.color};">
                <i class="fas fa-play-circle"></i> Начать тест
            </button>
        `;
        
        // Стили для мета-информации
        const style = document.createElement('style');
        style.textContent = `
            .test-meta {
                display: flex;
                gap: 10px;
                margin: 15px 0;
                flex-wrap: wrap;
            }
            .test-meta span {
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .best-score {
                background: #fff3cd;
                color: #856404;
                padding: 8px 12px;
                border-radius: 8px;
                margin: 10px 0;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 8px;
            }
        `;
        document.head.appendChild(style);
        
        container.appendChild(testCard);
    });
    
    // Обновить статистику на главной
    document.getElementById('total-questions').textContent = questions.length;
    document.getElementById('total-tests').textContent = tests.length;
    
    // Лучший результат среди всех тестов
    const allScores = tests.map(t => storage.getBestScore(t.id));
    const bestOverall = Math.max(...allScores);
    document.getElementById('best-score').textContent = bestOverall > 0 ? `${bestOverall}%` : 'Нет данных';
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Сохранение имени
    document.getElementById('save-name-btn').addEventListener('click', function() {
        const nameInput = document.getElementById('user-name');
        if (nameInput.value.trim()) {
            userName = nameInput.value.trim();
            storage.saveUserName(userName);
            showNotification('Имя сохранено!', 'success');
        }
    });
    
    // Начало теста
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('start-test-btn') || e.target.closest('.start-test-btn')) {
            const btn = e.target.classList.contains('start-test-btn') ? e.target : e.target.closest('.start-test-btn');
            const testId = parseInt(btn.dataset.testId);
            startTest(testId);
        }
    });
    
    // Навигация
    document.getElementById('back-btn').addEventListener('click', goHome);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('restart-btn').addEventListener('click', restartTest);
    document.getElementById('new-test-btn').addEventListener('click', goHome);
    document.getElementById('certificate-btn').addEventListener('click', showCertificate);
}

// Начать тест
function startTest(testId) {
    currentTest = tests.find(t => t.id === testId);
    currentQuestions = shuffleArray(questions.filter(q => q.testId === testId));
    currentQuestionIndex = 0;
    userAnswers = [];
    score = { correct: 0, totalPoints: 0, maxPoints: 0 };
    timeLeft = currentTest.timeLimit;
    
    // Рассчитать максимальное количество баллов
    score.maxPoints = currentQuestions.reduce((sum, q) => sum + q.points, 0);
    
    // Переключить экраны
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('test-screen').classList.remove('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    
    // Установить название теста
    document.getElementById('current-test-name').textContent = currentTest.name;
    
    // Запустить таймер
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    // Показать первый вопрос
    showQuestion();
    updateProgress();
    updateScore();
}

// Показать текущий вопрос
function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // Номер вопроса
    document.getElementById('question-number').textContent = currentQuestionIndex + 1;
    
    // Текст вопроса
    document.getElementById('question-text').textContent = question.text;
    
    // Баллы за вопрос
    document.querySelector('.question-points').innerHTML = `<i class="fas fa-star"></i> ${question.points} балл${question.points > 1 ? 'а' : ''}`;
    
    // Варианты ответов
    const answersContainer = document.getElementById('answers-container');
    answersContainer.innerHTML = '';
    
    // Перемешать варианты ответов
    const shuffledAnswers = shuffleArray([...question.answers]);
    
    shuffledAnswers.forEach(answer => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-option';
        answerElement.innerHTML = `
            <span class="answer-text">${answer.text}</span>
        `;
        answerElement.dataset.answerId = answer.id;
        
        answerElement.addEventListener('click', () => selectAnswer(answer, shuffledAnswers));
        
        answersContainer.appendChild(answerElement);
    });
    
    // Скрыть объяснение и отключить кнопку "Далее"
    document.getElementById('explanation').classList.add('hidden');
    document.getElementById('next-btn').disabled = true;
    
    // Обновить текст кнопки
    const nextBtn = document.getElementById('next-btn');
    if (currentQuestionIndex === currentQuestions.length - 1) {
        nextBtn.innerHTML = 'Завершить тест <i class="fas fa-flag-checkered"></i>';
    } else {
        nextBtn.innerHTML = 'Следующий вопрос <i class="fas fa-arrow-right"></i>';
    }
}

// Выбрать ответ
function selectAnswer(selectedAnswer, allAnswers) {
    // Если ответ уже выбран, ничего не делаем
    if (document.querySelector('.answer-option.selected')) return;
    
    const question = currentQuestions[currentQuestionIndex];
    
    // Отметить выбранный ответ
    const selectedElement = document.querySelector(`[data-answer-id="${selectedAnswer.id}"]`);
    selectedElement.classList.add('selected');
    
    // Показать правильные/неправильные ответы
    allAnswers.forEach(answer => {
        const element = document.querySelector(`[data-answer-id="${answer.id}"]`);
        
        if (answer.isCorrect) {
            element.classList.add('correct');
        } else if (answer.id === selectedAnswer.id && !answer.isCorrect) {
            element.classList.add('wrong');
        }
    });
    
    // Записать ответ пользователя
    userAnswers.push({
        questionId: question.id,
        selectedAnswerId: selectedAnswer.id,
        isCorrect: selectedAnswer.isCorrect,
        points: selectedAnswer.isCorrect ? question.points : 0
    });
    
    // Обновить счет
    if (selectedAnswer.isCorrect) {
        score.correct++;
        score.totalPoints += question.points;
    }
    updateScore();
    
    // Показать объяснение
    document.getElementById('explanation-text').textContent = question.explanation;
    document.getElementById('explanation').classList.remove('hidden');
    
    // Активировать кнопку "Далее"
    document.getElementById('next-btn').disabled = false;
    
    // Прокрутить к объяснению
    document.getElementById('explanation').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Следующий вопрос
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
        updateProgress();
    } else {
        finishTest();
    }
}

// Обновить прогресс
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = 
        `Вопрос ${currentQuestionIndex + 1} из ${currentQuestions.length}`;
}

// Обновить таймер
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
    
    document.querySelector('#timer span').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Изменение цвета при малом остатке времени
    if (timeLeft < 60) {
        document.getElementById('timer').style.background = '#e74c3c';
    } else if (timeLeft < 180) {
        document.getElementById('timer').style.background = '#f39c12';
    }
}

// Обновить счет
function updateScore() {
    document.getElementById('correct-count').textContent = score.correct;
    document.getElementById('wrong-count').textContent = userAnswers.length - score.correct;
    document.getElementById('remaining-count').textContent = 
        currentQuestions.length - userAnswers.length;
    
    // Точность
    const accuracy = userAnswers.length > 0 ? 
        Math.round((score.correct / userAnswers.length) * 100) : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
}

// Завершить тест
function finishTest() {
    clearInterval(timerInterval);
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Рассчитать процент правильных ответов
    const percentage = score.maxPoints > 0 ? 
        Math.round((score.totalPoints / score.maxPoints) * 100) : 0;
    
    // Сохранить результат
    storage.saveResult(currentTest.id, percentage, totalTime);
    
    // Обновить экран результатов
    document.getElementById('score-percent').textContent = `${percentage}%`;
    document.getElementById('final-correct').textContent = score.correct;
    document.getElementById('final-wrong').textContent = userAnswers.length - score.correct;
    document.getElementById('final-total').textContent = currentQuestions.length;
    document.getElementById('final-time').textContent = timeString;
    document.getElementById('user-greeting').textContent = `Поздравляем, ${userName}!`;
    
    // Сообщение в зависимости от результата
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
    
    // Отобразить обзор ответов
    displayAnswersReview();
    
    // Переключить экраны
    document.getElementById('test-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    // Прокрутить к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Отобразить обзор ответов
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
            <div class="review-question">
                <strong>Вопрос ${index + 1}:</strong> ${question.text}
            </div>
            <div class="review-answer ${userAnswer.isCorrect ? 'correct' : 'incorrect'}">
                <i class="fas fa-${userAnswer.isCorrect ? 'check' : 'times'}"></i>
                <span><strong>Ваш ответ:</strong> ${selectedAnswer.text}</span>
            </div>
            ${!userAnswer.isCorrect ? `
                <div class="review-answer correct">
                    <i class="fas fa-check"></i>
                    <span><strong>Правильный ответ:</strong> ${correctAnswer.text}</span>
                </div>
            ` : ''}
            <div class="review-explanation">
                <i class="fas fa-info-circle"></i> ${question.explanation}
            </div>
        `;
        
        container.appendChild(reviewItem);
    });
}

// Вернуться на главную
function goHome() {
    clearInterval(timerInterval);
    
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('test-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    
    // Обновить статистику
    updateStats();
    
    // Прокрутить к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Начать тест заново
function restartTest() {
    if (currentTest) {
        startTest(currentTest.id);
    }
}

// Показать сертификат
function showCertificate() {
    const percentage = Math.round((score.totalPoints / score.maxPoints) * 100);
    
    const certificate = window.open('', '_blank');
    certificate.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Сертификат - ${currentTest.name}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .certificate {
                    background: white;
                    padding: 60px;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    max-width: 800px;
                    border: 20px solid #f1c40f;
                    position: relative;
                }
                h1 {
                    color: #2c3e50;
                    margin-bottom: 30px;
                }
                .score {
                    font-size: 72px;
                    color: #e74c3c;
                    margin: 30px 0;
                    font-weight: bold;
                }
                .info {
                    margin: 20px 0;
                    font-size: 18px;
                    color: #555;
                }
                .signature {
                    margin-top: 50px;
                    display: flex;
                    justify-content: space-between;
                    padding-top: 30px;
                    border-top: 2px solid #ddd;
                }
                .date {
                    margin-top: 30px;
                    color: #777;
                }
                .logo {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    font-size: 24px;
                    color: #3498db;
                }
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
                    <div>
                        <p>___________________</p>
                        <p>Подпись участника</p>
                    </div>
                    <div>
                        <p>___________________</p>
                        <p>Подпись руководителя</p>
                    </div>
                </div>
                <div class="date">Дата: ${new Date().toLocaleDateString('ru-RU')}</div>
            </div>
        </body>
        </html>
    `);
    certificate.document.close();
}

// Обновить статистику
function updateStats() {
    const bestScore = storage.getBestScore(currentTest ? currentTest.id : 1);
    document.getElementById('best-score').textContent = bestScore > 0 ? `${bestScore}%` : '0%';
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Стили для уведомления
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .notification-success { background: #2ecc71; }
        .notification-warning { background: #f39c12; }
        .notification-info { background: #3498db; }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Удалить уведомление через 3 секунды
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

// Вспомогательные функции
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Экспорт для использования в консоли (для отладки)
window.ElectroTest = {
    tests,
    questions,
    storage,
    restartTest,
    goHome
};