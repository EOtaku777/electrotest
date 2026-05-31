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
let currentTheme = 'dark';

// Достижения
let testCounter = 0;

// ========== ТЕМА ==========
function setTheme(theme) {
    currentTheme = theme;
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);
    localStorage.setItem('electrotest_theme', theme);
    
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        if (theme === 'dark') {
            themeBtn.innerHTML = '<i class="fas fa-moon"></i> <span>Тёмная тема</span>';
        } else {
            themeBtn.innerHTML = '<i class="fas fa-sun"></i> <span>Светлая тема</span>';
        }
    }
}

function initTheme() {
    const saved = localStorage.getItem('electrotest_theme');
    if (saved === 'light') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function formatTime(sec) {
    return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPointsWord(points) {
    if (points % 10 === 1 && points % 100 !== 11) return 'балл';
    if ([2, 3, 4].includes(points % 10) && ![12, 13, 14].includes(points % 100)) return 'балла';
    return 'баллов';
}

// ========== СТАТИСТИКА ==========
function getTodayStats() {
    const results = storage.getResults();
    const today = new Date().toISOString().slice(0, 10);
    const todayResults = results.filter(r => r.date && r.date.slice(0, 10) === today);
    const passedToday = todayResults.filter(r => r.score >= 70).length;
    const totalToday = todayResults.length;
    return { passedToday, totalToday };
}

function getStreakData() {
    const results = storage.getResults();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < results.length; i++) {
        if (results[i].score >= 70) { tempStreak++; currentStreak = tempStreak; }
        else { tempStreak = 0; }
        if (tempStreak > bestStreak) bestStreak = tempStreak;
    }
    let dailyStreak = 0;
    const dates = [...new Set(results.map(r => r.date ? r.date.slice(0, 10) : null).filter(d => d))].sort();
    for (let i = dates.length - 1; i >= 0; i--) {
        const dayResults = results.filter(r => r.date && r.date.slice(0, 10) === dates[i]);
        const hasPass = dayResults.some(r => r.score >= 70);
        if (hasPass) dailyStreak++;
        else break;
    }
    return { currentStreak, bestStreak, dailyStreak };
}

function checkAchievement() {
    const results = storage.getResults();
    testCounter = results.length;
    if (testCounter % 5 === 0 && testCounter > 0) {
        const alreadyShown = localStorage.getItem(`achievement_${testCounter}_shown`);
        if (!alreadyShown) {
            localStorage.setItem(`achievement_${testCounter}_shown`, 'true');
            showAchievementToast();
        }
    }
}

function showAchievementToast() {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
            <i class="fas fa-star" style="font-size:28px;"></i>
            <div>
                <strong>🎉 Поздравляем!</strong><br>
                Вы прошли ${testCounter} тестов!<br>
                <a href="https://t.me/eltestRB" target="_blank">Присоединяйтесь к Telegram каналу</a><br>
                <small>Поделитесь предложениями по улучшению</small>
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 8000);
}

// ========== DASHBOARD ==========
function renderDashboard() {
    const totalQuestions = questions.length;
    const totalTests = tests.length;
    const bestOverall = Math.max(...tests.map(t => storage.getBestScore(t.id)));
    const resultsCount = storage.getResults().length;
    const passedCount = storage.getResults().filter(r => r.score >= 70).length;
    const { passedToday, totalToday } = getTodayStats();
    const { currentStreak, bestStreak, dailyStreak } = getStreakData();

    const html = `
        <div class="stats-grid" id="dashboardStats">
            <div class="stat-card"><div class="stat-title"><i class="fas fa-database"></i> Вопросов в базе</div><div class="stat-value">${totalQuestions}</div></div>
            <div class="stat-card"><div class="stat-title"><i class="fas fa-clipboard-list"></i> Доступных тестов</div><div class="stat-value">${totalTests}</div></div>
            <div class="stat-card"><div class="stat-title"><i class="fas fa-trophy"></i> Лучший результат</div><div class="stat-value">${bestOverall > 0 ? bestOverall + '%' : '0%'}</div></div>
            <div class="stat-card"><div class="stat-title"><i class="fas fa-chart-line"></i> Пройдено всего</div><div class="stat-value">${resultsCount}</div></div>
        </div>
        <div class="double-grid">
            <div class="info-card"><div class="card-header"><span><i class="fas fa-calendar-day"></i> Статистика за сегодня</span></div>
                <div class="stat-item-row"><span class="stat-label">✅ Правильно пройдено:</span><span class="stat-number status-pass">${passedToday}</span></div>
                <div class="stat-item-row"><span class="stat-label">📊 Всего попыток:</span><span class="stat-number">${totalToday}</span></div>
                <div class="stat-item-row"><span class="stat-label">📈 Успеваемость:</span><span class="stat-number">${totalToday > 0 ? Math.round((passedToday / totalToday) * 100) : 0}%</span></div>
            </div>
            <div class="info-card"><div class="card-header"><span><i class="fas fa-fire"></i> Серии и рекорды</span></div>
                <div class="stat-item-row"><span class="stat-label">🔥 Текущая серия (подряд):</span><span class="stat-number status-pass">${currentStreak}</span></div>
                <div class="stat-item-row"><span class="stat-label">🏆 Рекордная серия:</span><span class="stat-number">${bestStreak}</span></div>
                <div class="stat-item-row"><span class="stat-label">📅 Дней подряд с прохождением:</span><span class="stat-number status-pass">${dailyStreak}</span></div>
                <div class="stat-item-row"><span class="stat-label">✅ Всего правильно пройдено:</span><span class="stat-number">${passedCount}</span></div>
            </div>
        </div>
        <div class="tests-section" id="testsSection">
            <div class="section-header"><span><i class="fas fa-flask"></i> Доступные тесты</span><span class="status-badge status-pass">${totalTests} тестов</span></div>
            <div class="tests-grid-cards" id="testsGridContainer"></div>
        </div>
        <div class="footer-main"><p>© 2026 ЭлектроТест. Все права защищены. | <a href="https://t.me/eltestRB" target="_blank">Telegram канал</a></p></div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
    
    const grid = document.getElementById('testsGridContainer');
    grid.innerHTML = '';
    tests.forEach(test => {
        const qCount = questions.filter(q => q.testId === test.id).length;
        const bestScore = storage.getBestScore(test.id);
        const maxScore = questions.filter(q => q.testId === test.id).reduce((s, q) => s + q.points, 0);
        const percent = maxScore > 0 ? Math.round((bestScore / maxScore) * 100) : 0;
        const card = document.createElement('div');
        card.className = 'test-card-item';
        card.innerHTML = `
            <div class="test-card-header"><i class="${test.icon}" style="color:${test.color}; font-size:22px"></i><h4>${escapeHtml(test.name)}</h4></div>
            <div class="test-card-desc">${escapeHtml(test.description)}</div>
            <div class="test-card-meta">
                <div class="test-card-stats">
                    <span><i class="fas fa-question"></i> ${qCount} вопр.</span>
                    <span><i class="fas fa-clock"></i> ${Math.floor(test.timeLimit/60)} мин</span>
                    ${bestScore > 0 ? `<span><i class="fas fa-star" style="color:#F5A623"></i> ${percent}%</span>` : ''}
                </div>
                <button class="btn-small start-test" data-id="${test.id}">Начать →</button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    document.querySelectorAll('.start-test').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            startTest(parseInt(btn.dataset.id));
        });
    });
}

// ========== ТЕСТ ==========
function startTest(testId) {
    currentTest = tests.find(t => t.id === testId);
    const allQ = questions.filter(q => q.testId === testId);
    currentQuestions = shuffleArray(allQ).slice(0, Math.min(10, allQ.length));
    currentQuestionIndex = 0;
    userAnswers = [];
    score = { correct: 0, totalPoints: 0, maxPoints: currentQuestions.reduce((s, q) => s + q.points, 0) };
    timeLeft = currentTest.timeLimit;
    startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    renderTestScreen();
}

function updateTimer() {
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        finishTest();
        return;
    }
    timeLeft--;
    const timerEl = document.getElementById('timerDisplay');
    if (timerEl) timerEl.textContent = formatTime(timeLeft);
    if (timeLeft < 60) timerEl?.style.setProperty('background', '#E74C3C');
    else if (timeLeft < 180) timerEl?.style.setProperty('background', '#F5A623');
}

function renderTestScreen() {
    const q = currentQuestions[currentQuestionIndex];
    const wrong = userAnswers.length - score.correct;
    const remaining = currentQuestions.length - userAnswers.length;
    const accuracy = userAnswers.length > 0 ? Math.round((score.correct / userAnswers.length) * 100) : 0;
    
    const html = `
        <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:16px;">
                <button class="btn-secondary btn" id="exitTestBtn"><i class="fas fa-arrow-left"></i> Выйти</button>
                <h3 style="font-size:18px">${escapeHtml(currentTest.name)}</h3>
                <div class="timer" id="timerDisplay">${formatTime(timeLeft)}</div>
            </div>
            
            <div class="question-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                    <span class="status-badge status-progress">Вопрос ${currentQuestionIndex+1} из ${currentQuestions.length}</span>
                    <span><i class="fas fa-star" style="color:#F5A623"></i> ${q.points} ${getPointsWord(q.points)}</span>
                </div>
                <h3 style="font-size:1.2rem; margin-bottom:28px; line-height:1.4;">${escapeHtml(q.text)}</h3>
                <div id="answersContainer"></div>
                <div id="explanationBox" style="margin-top:24px; padding:16px; border-radius:16px; display:none;">
                    <i class="fas fa-lightbulb" style="color:#F5A623"></i> <span id="explanationText"></span>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; flex-wrap:wrap; gap:16px;">
                <div class="small-stats">
                    <div class="small-stat"><i class="fas fa-check-circle" style="color:#2ECC71"></i> <span id="correctStat">${score.correct}</span> прав.</div>
                    <div class="small-stat"><i class="fas fa-times-circle" style="color:#E74C3C"></i> <span id="wrongStat">${wrong}</span> неправ.</div>
                    <div class="small-stat"><i class="fas fa-hourglass-half"></i> <span id="remainingStat">${remaining}</span> осталось</div>
                    <div class="small-stat"><i class="fas fa-percentage"></i> <span id="accuracyStat">${accuracy}</span>% точность</div>
                </div>
                <button class="btn" id="nextQuestionBtn" disabled>Следующий вопрос →</button>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
    renderCurrentQuestion();
    
    document.getElementById('exitTestBtn').addEventListener('click', () => {
        clearInterval(timerInterval);
        renderDashboard();
    });
    document.getElementById('nextQuestionBtn').addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) renderTestScreen();
        else finishTest();
    });
}

function renderCurrentQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    const container = document.getElementById('answersContainer');
    if (!container) return;
    container.innerHTML = '';
    
    const shuffled = shuffleArray([...question.answers]);
    shuffled.forEach(answer => {
        const div = document.createElement('div');
        div.className = 'answer-option';
        div.setAttribute('data-answer-id', answer.id);
        div.innerHTML = `<span class="answer-text">${escapeHtml(answer.text)}</span>`;
        div.addEventListener('click', () => selectAnswer(div, answer, shuffled));
        container.appendChild(div);
    });
    
    document.getElementById('explanationBox').style.display = 'none';
    document.getElementById('nextQuestionBtn').disabled = true;
    updateStatsDisplay();
}

function selectAnswer(selectedDiv, selectedAnswer, allAnswers) {
    if (selectedDiv.classList.contains('selected')) return;
    
    document.querySelectorAll('.answer-option').forEach(d => {
        d.classList.remove('selected', 'correct', 'wrong');
    });
    selectedDiv.classList.add('selected');
    
    allAnswers.forEach(answer => {
        const div = document.querySelector(`.answer-option[data-answer-id="${answer.id}"]`);
        if (div) {
            if (answer.isCorrect) div.classList.add('correct');
            else if (answer.id === selectedAnswer.id && !answer.isCorrect) div.classList.add('wrong');
        }
    });
    
    userAnswers.push({
        questionId: currentQuestions[currentQuestionIndex].id,
        selectedAnswerId: selectedAnswer.id,
        isCorrect: selectedAnswer.isCorrect,
        points: selectedAnswer.isCorrect ? currentQuestions[currentQuestionIndex].points : 0
    });
    
    if (selectedAnswer.isCorrect) {
        score.correct++;
        score.totalPoints += currentQuestions[currentQuestionIndex].points;
    }
    
    document.getElementById('explanationText').innerHTML = escapeHtml(currentQuestions[currentQuestionIndex].explanation);
    document.getElementById('explanationBox').style.display = 'block';
    document.getElementById('nextQuestionBtn').disabled = false;
    updateStatsDisplay();
}

function updateStatsDisplay() {
    const wrong = userAnswers.length - score.correct;
    const remaining = currentQuestions.length - userAnswers.length;
    const accuracy = userAnswers.length > 0 ? Math.round((score.correct / userAnswers.length) * 100) : 0;
    if (document.getElementById('correctStat')) document.getElementById('correctStat').textContent = score.correct;
    if (document.getElementById('wrongStat')) document.getElementById('wrongStat').textContent = wrong;
    if (document.getElementById('remainingStat')) document.getElementById('remainingStat').textContent = remaining;
    if (document.getElementById('accuracyStat')) document.getElementById('accuracyStat').textContent = accuracy;
}

function finishTest() {
    clearInterval(timerInterval);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const percentage = score.maxPoints > 0 ? Math.round((score.totalPoints / score.maxPoints) * 100) : 0;
    storage.saveResult(currentTest.id, percentage, totalTime);
    checkAchievement();
    renderResultsScreen(percentage, totalTime);
}

function renderResultsScreen(percentage, totalTime) {
    const wrong = userAnswers.length - score.correct;
    let message = percentage >= 90 ? 'Отличный результат! Вы настоящий эксперт!' : (percentage >= 70 ? 'Хороший результат! Знания на хорошем уровне!' : (percentage >= 50 ? 'Удовлетворительно. Есть над чем поработать.' : 'Нужно больше практики. Рекомендуем изучить материал еще раз.'));
    
    let reviewHtml = '';
    userAnswers.forEach((ua, idx) => {
        const q = currentQuestions[idx];
        const selected = q.answers.find(a => a.id === ua.selectedAnswerId);
        const correct = q.answers.find(a => a.isCorrect);
        reviewHtml += `
            <div class="info-card" style="margin-bottom:16px; border-left:4px solid ${ua.isCorrect ? '#2ECC71' : '#E74C3C'}">
                <div><strong>Вопрос ${idx+1}:</strong> ${escapeHtml(q.text)}</div>
                <div style="margin-top:8px; color:${ua.isCorrect ? '#2ECC71' : '#E74C3C'}">
                    <i class="fas fa-${ua.isCorrect ? 'check' : 'times'}"></i> Ваш ответ: ${escapeHtml(selected.text)}
                </div>
                ${!ua.isCorrect ? `<div style="margin-top:4px; color:#2ECC71"><i class="fas fa-check"></i> Правильный ответ: ${escapeHtml(correct.text)}</div>` : ''}
                <div style="margin-top:8px; font-size:12px; color:#8E95A5"><i class="fas fa-info-circle"></i> ${escapeHtml(q.explanation)}</div>
            </div>
        `;
    });
    
    const html = `
        <div>
            <div style="text-align:center; margin-bottom:32px;">
                <h1 style="font-size:2rem"><i class="fas fa-trophy" style="color:#F5A623"></i> Тест завершен!</h1>
                <p>Поздравляем, ${escapeHtml(userName)}!</p>
                <div style="font-size:2.5rem; font-weight:700; margin:16px 0">${percentage}%</div>
                <p style="font-size:14px">${message}</p>
            </div>
            
            <div class="double-grid">
                <div class="info-card">
                    <div class="card-header">Результаты</div>
                    <div class="device-row"><span>Правильных ответов:</span><span class="status-badge status-pass">${score.correct}</span></div>
                    <div class="device-row"><span>Неправильных ответов:</span><span class="status-badge status-fail">${wrong}</span></div>
                    <div class="device-row"><span>Всего вопросов:</span><span>${currentQuestions.length}</span></div>
                    <div class="device-row"><span>Время:</span><span>${formatTime(totalTime)}</span></div>
                </div>
                <div class="info-card">
                    <div class="card-header">Действия</div>
                    <div style="display:flex; gap:12px; flex-wrap:wrap;">
                        <button class="btn" id="restartTestBtn">🔄 Пройти заново</button>
                        <button class="btn-secondary btn" id="dashboardBtn">📊 На главную</button>
                        <button class="btn" id="certificateBtn">📜 Сертификат</button>
                    </div>
                </div>
            </div>
            
            <div class="tests-section">
                <div class="section-header"><span><i class="fas fa-chart-bar"></i> Детальный обзор</span></div>
                <div style="padding:20px">${reviewHtml}</div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
    document.getElementById('restartTestBtn')?.addEventListener('click', () => startTest(currentTest.id));
    document.getElementById('dashboardBtn')?.addEventListener('click', () => renderDashboard());
    document.getElementById('certificateBtn')?.addEventListener('click', () => showCertificate(percentage));
}

// ========== СЕРТИФИКАТ (НОВЫЙ ДИЗАЙН) ==========
function showCertificate(percentage) {
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Сертификат - ${currentTest.name}</title>
        <meta charset="UTF-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Georgia', 'Times New Roman', serif;
                background: #2c3e50;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 40px;
            }
            @media print {
                body { background: white; padding: 0; }
                .certificate { box-shadow: none; margin: 0; width: 100%; }
                .no-print { display: none; }
            }
            .certificate {
                width: 900px;
                background: #FFFFFF;
                border: 12px double #C5A059;
                padding: 45px 50px 50px 50px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                position: relative;
            }
            .certificate:before {
                content: "";
                position: absolute;
                top: 25px;
                left: 25px;
                width: 60px;
                height: 60px;
                border-top: 2px solid #C5A059;
                border-left: 2px solid #C5A059;
            }
            .certificate:after {
                content: "";
                position: absolute;
                bottom: 25px;
                right: 25px;
                width: 60px;
                height: 60px;
                border-bottom: 2px solid #C5A059;
                border-right: 2px solid #C5A059;
            }
            .corner-tr {
                position: absolute;
                top: 25px;
                right: 25px;
                width: 60px;
                height: 60px;
                border-top: 2px solid #C5A059;
                border-right: 2px solid #C5A059;
            }
            .corner-bl {
                position: absolute;
                bottom: 25px;
                left: 25px;
                width: 60px;
                height: 60px;
                border-bottom: 2px solid #C5A059;
                border-left: 2px solid #C5A059;
            }
            .logo-emblem {
                margin-bottom: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 15px;
            }
            .logo-emblem .bolt { font-size: 38px; color: #C5A059; }
            .logo-emblem .line { width: 70px; height: 1px; background: #C5A059; }
            .title {
                font-family: 'Times New Roman', 'Georgia', serif;
                font-size: 46px;
                letter-spacing: 10px;
                color: #2C3E50;
                margin-bottom: 15px;
                font-weight: normal;
                text-transform: uppercase;
            }
            .subtitle {
                font-family: 'Georgia', serif;
                font-size: 13px;
                color: #7F8C8D;
                letter-spacing: 4px;
                margin-bottom: 40px;
                text-transform: uppercase;
            }
            .affirmation {
                font-family: 'Georgia', serif;
                font-size: 16px;
                color: #2C3E50;
                margin: 20px 0 15px;
                font-style: italic;
            }
            .recipient-name {
                font-family: 'Times New Roman', 'Georgia', serif;
                font-size: 42px;
                font-weight: bold;
                color: #2C3E50;
                margin: 5px 0 20px;
                text-transform: uppercase;
                letter-spacing: 4px;
                border-bottom: 2px solid #C5A059;
                display: inline-block;
                padding-bottom: 12px;
            }
            .completion-text {
                font-family: 'Georgia', serif;
                font-size: 15px;
                color: #2C3E50;
                margin: 20px 0 15px;
                line-height: 1.5;
            }
            .test-name-cert {
                font-family: 'Times New Roman', 'Georgia', serif;
                font-size: 22px;
                font-weight: bold;
                color: #C5A059;
                margin: 10px 0 25px;
                letter-spacing: 1px;
            }
            .result-box {
                margin: 25px 0;
                padding: 12px 25px;
                background: #F8F9FA;
                border-radius: 30px;
                display: inline-block;
                border: 1px solid #E0E4E8;
            }
            .result-percent {
                font-family: 'Times New Roman', 'Georgia', serif;
                font-size: 38px;
                font-weight: bold;
                color: #C5A059;
            }
            .result-label {
                font-family: 'Georgia', serif;
                font-size: 11px;
                color: #7F8C8D;
                letter-spacing: 2px;
            }
            .signatures {
                display: flex;
                justify-content: space-between;
                margin: 40px 0 20px;
                gap: 50px;
            }
            .sign-item { flex: 1; text-align: center; }
            .sign-line { border-bottom: 1px solid #2C3E50; width: 100%; margin-bottom: 8px; padding-top: 20px; }
            .sign-title { font-family: 'Georgia', serif; font-size: 11px; color: #7F8C8D; letter-spacing: 1px; }
            .date-cert {
                font-family: 'Georgia', serif;
                font-size: 12px;
                color: #7F8C8D;
                margin: 15px 0 10px;
            }
            .footer-cert {
                margin-top: 25px;
                padding-top: 15px;
                border-top: 1px solid #ECF0F1;
                font-family: 'Georgia', serif;
                font-size: 10px;
                color: #BDC3C7;
                text-align: center;
            }
            .footer-cert a { color: #C5A059; text-decoration: none; }
            .print-btn {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: #C5A059;
                color: #2C3E50;
                border: none;
                padding: 10px 30px;
                border-radius: 40px;
                font-family: 'Georgia', serif;
                font-weight: bold;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: all 0.2s;
            }
            .print-btn:hover { background: #A8883A; color: white; transform: translateX(-50%) scale(1.02); }
        </style>
        </head>
        <body>
            <button class="print-btn no-print" onclick="window.print();">🖨 Распечатать сертификат</button>
            
            <div class="certificate">
                <div class="corner-tr"></div>
                <div class="corner-bl"></div>
                
                <div class="logo-emblem">
                    <div class="line"></div>
                    <span class="bolt">⚡</span>
                    <div class="line"></div>
                </div>
                
                <h1 class="title">СЕРТИФИКАТ</h1>
                <div class="subtitle">О ПРОХОЖДЕНИИ ТЕСТИРОВАНИЯ</div>
                
                <div class="affirmation">подтверждает, что</div>
                
                <div class="recipient-name">${escapeHtml(userName)}</div>
                
                <div class="completion-text">успешно прошёл(а) тестирование по курсу</div>
                
                <div class="test-name-cert">«${escapeHtml(currentTest.name)}»</div>
                
                <div class="result-box">
                    <span class="result-percent">${percentage}%</span>
                    <div class="result-label">ПРАВИЛЬНЫХ ОТВЕТОВ</div>
                </div>
                
                <div class="date-cert">Дата: ${new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                
                <div class="signatures">
                    <div class="sign-item"><div class="sign-line"></div><div class="sign-title">ПРЕДСЕДАТЕЛЬ КОМИССИИ</div></div>
                    <div class="sign-item"><div class="sign-line"></div><div class="sign-title">ТЕСТИРУЕМЫЙ</div></div>
                </div>
                
                <div class="footer-cert">
                    <span>⚡</span> ЭлектроТест — система проверки знаний по электробезопасности <span>⚡</span><br>
                    <a href="https://t.me/eltestRB" target="_blank">t.me/eltestRB</a>
                </div>
            </div>
        </body>
        </html>
    `);
    win.document.close();
}

// ========== НАВИГАЦИЯ ==========
function scrollToElement(id) {
    const el = document.getElementById(id);
    if (el) {
        const offset = 80;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - offset, behavior: 'smooth' });
    }
}

function initNavigation() {
    document.querySelectorAll('.nav-item[data-scroll]').forEach(item => {
        item.addEventListener('click', () => {
            scrollToElement(item.dataset.scroll === 'dashboard' ? 'dashboardStats' : 'testsSection');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
    document.getElementById('logoHomeBtn')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('.nav-item[data-scroll="dashboard"]')?.classList.add('active');
    });
}

// ========== РЕДАКТИРОВАНИЕ ИМЕНИ ==========
function initNameEditor() {
    const editBtn = document.getElementById('editUserBtn');
    if (!editBtn) return;
    editBtn.addEventListener('click', () => {
        let newName = prompt('Введите ваше имя (до 20 символов):', userName);
        if (newName && newName.trim()) {
            newName = newName.trim().slice(0, 20);
            if (newName) {
                userName = newName;
                storage.saveUserName(userName);
                document.getElementById('sidebarUserName').textContent = userName;
                renderDashboard();
            }
        }
    });
}

// ========== МОДАЛЬНОЕ ОКНО ==========
function setupModal() {
    const modal = document.getElementById('errorModal');
    const openModal = () => {
        if (currentTest && currentQuestions[currentQuestionIndex]) {
            const q = currentQuestions[currentQuestionIndex];
            document.getElementById('errorTestName').value = currentTest.name;
            document.getElementById('errorQuestionId').value = q.id;
            document.getElementById('errorQuestionText').value = q.text;
        }
        modal.style.display = 'flex';
    };
    document.getElementById('floatingErrorBtn')?.addEventListener('click', openModal);
    document.getElementById('reportNavBtn')?.addEventListener('click', openModal);
    document.querySelector('.modal-close')?.addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('cancelErrorBtn')?.addEventListener('click', () => modal.style.display = 'none');
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    document.getElementById('errorForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!document.getElementById('errorDescription').value.trim()) { alert('Опишите ошибку!'); return; }
        const errors = JSON.parse(localStorage.getItem('electrotest_errors') || '[]');
        errors.push({
            test: document.getElementById('errorTestName').value,
            questionId: document.getElementById('errorQuestionId').value,
            text: document.getElementById('errorQuestionText').value,
            type: document.getElementById('errorType').value,
            description: document.getElementById('errorDescription').value,
            email: document.getElementById('userEmail').value,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('electrotest_errors', JSON.stringify(errors));
        alert('✅ Спасибо! Ошибка сохранена.');
        modal.style.display = 'none';
        document.getElementById('errorForm').reset();
    });
}

// ========== ЗАПУСК ==========
function init() {
    initTheme();
    userName = storage.getUserName();
    document.getElementById('sidebarUserName').textContent = userName;
    renderDashboard();
    initNavigation();
    initNameEditor();
    setupModal();
    
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        const newBtn = themeBtn.cloneNode(true);
        themeBtn.parentNode.replaceChild(newBtn, themeBtn);
        newBtn.addEventListener('click', () => {
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }
}

init();