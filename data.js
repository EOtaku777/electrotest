// Данные тестов
const tests = [
    {
        id: 1,
        name: "ТКП 45-4.04-149-2009",
        description: "Системы электрооборудования жилых и общественных зданий",
        icon: "fas fa-home",
        color: "#3498db",
        difficulty: "Средний",
        timeLimit: 600 // 10 минут в секундах
    },
    {
        id: 2,
        name: "ПУЭ: Глава 1.8",
        description: "Нормы приемо-сдаточных испытаний",
        icon: "fas fa-clipboard-check",
        color: "#2ecc71",
        difficulty: "Сложный",
        timeLimit: 900 // 15 минут
    },
    {
        id: 3,
        name: "ТКП 181-2009",
        description: "Правила эксплуатации электроустановок",
        icon: "fas fa-cogs",
        color: "#9b59b6",
        difficulty: "Легкий",
        timeLimit: 480 // 8 минут
    },
    {
        id: 4,
        name: "Охрана труда",
        description: "Электробезопасность на производстве",
        icon: "fas fa-user-shield",
        color: "#e74c3c",
        difficulty: "Средний",
        timeLimit: 720 // 12 минут
    }
];

// Данные вопросов
const questions = [
    // Тест 1: ТКП 45-4.04-149-2009 (5 вопросов)
    {
        id: 1,
        testId: 1,
        text: "Какое минимальное сечение медного проводника должно применяться для групповых линий освещения в жилых зданиях?",
        answers: [
            { id: 1, text: "1,5 мм²", isCorrect: false },
            { id: 2, text: "2,5 мм²", isCorrect: true },
            { id: 3, text: "1,0 мм²", isCorrect: false },
            { id: 4, text: "4,0 мм²", isCorrect: false }
        ],
        explanation: "Согласно ТКП 45-4.04-149-2009, для групповых линий освещения минимальное сечение медных проводников - 1,5 мм², но для жилых зданий рекомендуется 2,5 мм² для обеспечения запаса по нагрузке.",
        points: 1
    },
    {
        id: 2,
        testId: 1,
        text: "На какой высоте от пола рекомендуется устанавливать розетки в жилых помещениях?",
        answers: [
            { id: 1, text: "0,3-0,5 м", isCorrect: true },
            { id: 2, text: "0,8-1,0 м", isCorrect: false },
            { id: 3, text: "1,5-1,7 м", isCorrect: false },
            { id: 4, text: "Любая удобная высота", isCorrect: false }
        ],
        explanation: "Пункт 7.1.48 ТКП рекомендует установку розеток на высоте 0,3-1,0 м от пола. В жилых помещениях оптимально 0,3-0,5 м для удобства использования и безопасности.",
        points: 1
    },
    {
        id: 3,
        testId: 1,
        text: "Какое должно быть сопротивление изоляции электропроводки в жилых помещениях?",
        answers: [
            { id: 1, text: "Не менее 0,5 МОм", isCorrect: true },
            { id: 2, text: "Не менее 1,0 МОм", isCorrect: false },
            { id: 3, text: "Не менее 5,0 МОм", isCorrect: false },
            { id: 4, text: "Не менее 10,0 МОм", isCorrect: false }
        ],
        explanation: "Согласно нормам, сопротивление изоляции электропроводки в жилых помещениях должно быть не менее 0,5 МОм при напряжении до 1000 В.",
        points: 1
    },
    {
        id: 4,
        testId: 1,
        text: "Какой цвет изоляции должен быть у нулевого рабочего проводника?",
        answers: [
            { id: 1, text: "Синий", isCorrect: true },
            { id: 2, text: "Желто-зеленый", isCorrect: false },
            { id: 3, text: "Коричневый", isCorrect: false },
            { id: 4, text: "Черный", isCorrect: false }
        ],
        explanation: "Согласно ГОСТ и ТКП, нулевой рабочий проводник должен иметь изоляцию синего цвета для однозначной идентификации.",
        points: 1
    },
    {
        id: 5,
        testId: 1,
        text: "Какое минимальное расстояние должно быть между параллельно проложенными силовыми и слаботочными кабелями?",
        answers: [
            { id: 1, text: "0,1 м", isCorrect: false },
            { id: 2, text: "0,5 м", isCorrect: true },
            { id: 3, text: "1,0 м", isCorrect: false },
            { id: 4, text: "Можно прокладывать вместе", isCorrect: false }
        ],
        explanation: "Для предотвращения электромагнитных помех минимальное расстояние между силовыми и слаботочными кабелями должно быть не менее 0,5 м.",
        points: 2
    },

    // Тест 2: ПУЭ Глава 1.8 (5 вопросов)
    {
        id: 6,
        testId: 2,
        text: "Какое сопротивление изоляции должно быть у силовых кабелей напряжением до 1000 В при приемо-сдаточных испытаниях?",
        answers: [
            { id: 1, text: "Не менее 0,5 МОм", isCorrect: true },
            { id: 2, text: "Не менее 1,0 МОм", isCorrect: false },
            { id: 3, text: "Не менее 5,0 МОм", isCorrect: false },
            { id: 4, text: "Не менее 10,0 МОм", isCorrect: false }
        ],
        explanation: "Согласно ПУЭ Глава 1.8, сопротивление изоляции силовых кабелей до 1000 В должно быть не менее 0,5 МОм.",
        points: 1
    },
    {
        id: 7,
        testId: 2,
        text: "Какое испытательное напряжение применяется для кабелей на напряжение до 1 кВ?",
        answers: [
            { id: 1, text: "500 В", isCorrect: false },
            { id: 2, text: "1000 В", isCorrect: false },
            { id: 3, text: "2500 В", isCorrect: true },
            { id: 4, text: "5000 В", isCorrect: false }
        ],
        explanation: "Для кабелей до 1 кВ обычно применяется испытательное напряжение 2500 В в течение 5 минут.",
        points: 1
    },
    {
        id: 8,
        testId: 2,
        text: "Какой должен быть угол заземления для вертикальных заземлителей?",
        answers: [
            { id: 1, text: "20-30 градусов", isCorrect: false },
            { id: 2, text: "45 градусов", isCorrect: false },
            { id: 3, text: "60-70 градусов", isCorrect: false },
            { id: 4, text: "90 градусов (вертикально)", isCorrect: true }
        ],
        explanation: "Вертикальные заземлители должны устанавливаться строго вертикально (90 градусов) для обеспечения надежного контакта с грунтом.",
        points: 1
    },
    {
        id: 9,
        testId: 2,
        text: "Какое время должен выдерживать автоматический выключатель при испытании на срабатывание?",
        answers: [
            { id: 1, text: "1-3 секунды", isCorrect: false },
            { id: 2, text: "5-10 секунд", isCorrect: false },
            { id: 3, text: "До 30 секунд", isCorrect: true },
            { id: 4, text: "1-2 минуты", isCorrect: false }
        ],
        explanation: "При испытаниях автоматический выключатель должен срабатывать в течение 30 секунд при номинальном токе.",
        points: 2
    },
    {
        id: 10,
        testId: 2,
        text: "Какой прибор используется для измерения сопротивления заземления?",
        answers: [
            { id: 1, text: "Мегаомметр", isCorrect: false },
            { id: 2, text: "Мультиметр", isCorrect: false },
            { id: 3, text: "Измеритель сопротивления заземления", isCorrect: true },
            { id: 4, text: "Осциллограф", isCorrect: false }
        ],
        explanation: "Для измерения сопротивления заземления используется специальный прибор - измеритель сопротивления заземления.",
        points: 1
    },

    // Тест 3: ТКП 181-2009 (5 вопросов)
    {
        id: 11,
        testId: 3,
        text: "Как часто должны проводиться осмотры электроустановок без их отключения?",
        answers: [
            { id: 1, text: "1 раз в месяц", isCorrect: false },
            { id: 2, text: "1 раз в 3 месяца", isCorrect: false },
            { id: 3, text: "1 раз в 6 месяцев", isCorrect: true },
            { id: 4, text: "1 раз в год", isCorrect: false }
        ],
        explanation: "Согласно ТКП 181-2009, осмотры электроустановок должны проводиться не реже 1 раза в 6 месяцев.",
        points: 1
    },
    {
        id: 12,
        testId: 3,
        text: "Кто имеет право проводить эксплуатацию электроустановок напряжением до 1000 В?",
        answers: [
            { id: 1, text: "Любой электрик", isCorrect: false },
            { id: 2, text: "Специалист с 3 группой по электробезопасности", isCorrect: true },
            { id: 3, text: "Специалист с 5 группой", isCorrect: false },
            { id: 4, text: "Инженер-проектировщик", isCorrect: false }
        ],
        explanation: "Для эксплуатации электроустановок до 1000 В необходима минимум 3 группа по электробезопасности.",
        points: 1
    },
    {
        id: 13,
        testId: 3,
        text: "Какой документ должен быть на каждую электроустановку?",
        answers: [
            { id: 1, text: "Акт ввода в эксплуатацию", isCorrect: false },
            { id: 2, text: "Паспорт электроустановки", isCorrect: true },
            { id: 3, text: "Сертификат соответствия", isCorrect: false },
            { id: 4, text: "Договор на обслуживание", isCorrect: false }
        ],
        explanation: "Каждая электроустановка должна иметь паспорт с техническими характеристиками и схемой.",
        points: 1
    },
    {
        id: 14,
        testId: 3,
        text: "В течение какого времени должны храниться журналы осмотров электроустановок?",
        answers: [
            { id: 1, text: "1 год", isCorrect: false },
            { id: 2, text: "3 года", isCorrect: false },
            { id: 3, text: "5 лет", isCorrect: true },
            { id: 4, text: "10 лет", isCorrect: false }
        ],
        explanation: "Журналы осмотров и технического обслуживания электроустановок должны храниться не менее 5 лет.",
        points: 2
    },
    {
        id: 15,
        testId: 3,
        text: "Что должно быть указано на каждом автоматическом выключателе?",
        answers: [
            { id: 1, text: "Дата производства", isCorrect: false },
            { id: 2, text: "Номинальный ток и характеристика срабатывания", isCorrect: true },
            { id: 3, text: "Цена", isCorrect: false },
            { id: 4, text: "Гарантийный срок", isCorrect: false }
        ],
        explanation: "На каждом автоматическом выключателе должны быть четко указаны номинальный ток и характеристика срабатывания (B, C, D).",
        points: 1
    },

    // Тест 4: Охрана труда (5 вопросов)
    {
        id: 16,
        testId: 4,
        text: "Какое напряжение считается безопасным в сырых помещениях?",
        answers: [
            { id: 1, text: "12 В", isCorrect: true },
            { id: 2, text: "36 В", isCorrect: false },
            { id: 3, text: "110 В", isCorrect: false },
            { id: 4, text: "220 В", isCorrect: false }
        ],
        explanation: "В сырых и особо опасных помещениях безопасным считается напряжение не выше 12 В переменного тока.",
        points: 1
    },
    {
        id: 17,
        testId: 4,
        text: "Какой минимальный срок действия урядочения по электробезопасности?",
        answers: [
            { id: 1, text: "6 месяцев", isCorrect: false },
            { id: 2, text: "1 год", isCorrect: true },
            { id: 3, text: "3 года", isCorrect: false },
            { id: 4, text: "5 лет", isCorrect: false }
        ],
        explanation: "Удостоверение по электробезопасности действует 1 год, после чего необходима повторная проверка знаний.",
        points: 1
    },
    {
        id: 18,
        testId: 4,
        text: "Какие средства защиты должны применяться при работе в электроустановках?",
        answers: [
            { id: 1, text: "Только диэлектрические перчатки", isCorrect: false },
            { id: 2, text: "Только указатель напряжения", isCorrect: false },
            { id: 3, text: "Комплекс средств защиты по наряду", isCorrect: true },
            { id: 4, text: "Защитные очки", isCorrect: false }
        ],
        explanation: "При работе в электроустановках применяется комплекс средств защиты, указанный в наряде-допуске.",
        points: 1
    },
    {
        id: 19,
        testId: 4,
        text: "Как часто проводятся тренировочные занятия по оказанию первой помощи?",
        answers: [
            { id: 1, text: "1 раз в месяц", isCorrect: false },
            { id: 2, text: "1 раз в квартал", isCorrect: false },
            { id: 3, text: "1 раз в полгода", isCorrect: true },
            { id: 4, text: "1 раз в год", isCorrect: false }
        ],
        explanation: "Тренировочные занятия по оказанию первой помощи при поражении электрическим током проводятся не реже 1 раза в полгода.",
        points: 2
    },
    {
        id: 20,
        testId: 4,
        text: "Что необходимо сделать в первую очередь при поражении человека электрическим током?",
        answers: [
            { id: 1, text: "Вызвать врача", isCorrect: false },
            { id: 2, text: "Начать реанимацию", isCorrect: false },
            { id: 3, text: "Освободить от действия тока", isCorrect: true },
            { id: 4, text: "Дать воды", isCorrect: false }
        ],
        explanation: "Первое действие - немедленное освобождение пострадавшего от действия электрического тока с использованием средств защиты.",
        points: 1
    }
];

// Локальное хранилище для результатов
const storage = {
    saveResult(testId, score, time) {
        const results = this.getResults();
        results.push({
            testId,
            score,
            time,
            date: new Date().toISOString()
        });
        localStorage.setItem('electrotest_results', JSON.stringify(results));
    },
    
    getResults() {
        return JSON.parse(localStorage.getItem('electrotest_results') || '[]');
    },
    
    getBestScore(testId) {
        const results = this.getResults()
            .filter(r => r.testId === testId)
            .sort((a, b) => b.score - a.score);
        return results.length > 0 ? results[0].score : 0;
    },
    
    getUserName() {
        return localStorage.getItem('electrotest_username') || 'Электрик';
    },
    
    saveUserName(name) {
        localStorage.setItem('electrotest_username', name);
    },
    
    clearResults() {
        localStorage.removeItem('electrotest_results');
    }
};