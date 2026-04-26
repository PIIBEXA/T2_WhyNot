const calendar = document.querySelector('#calendar');
let mode = 'shift';

const modal = document.getElementById('modal');
const startInput = document.getElementById('startTime');
const endInput = document.getElementById('endTime');
const saveBtn = document.getElementById('saveBtn');
const closeBtn = document.getElementById('closeBtn');
const modalDate = document.getElementById('modal-date');

let activeDayElement = null;
let token = null;

// === НАСТРОЙКИ ===
const API_URL = 'http://localhost:8000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = '123456';

// === АВТОРИЗАЦИЯ ===
async function registerIfNeeded() {
    try {
        await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                full_name: "Тестовый Пользователь"
            })
        });
    } catch(e) {
        // Пользователь возможно уже существует
    }
}

async function login() {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            username: TEST_EMAIL,
            password: TEST_PASSWORD
        })
    });
    
    if (!response.ok) {
        console.error("Ошибка логина:", await response.text());
        return null;
    }
    
    const data = await response.json();
    token = data.access_token;
    console.log("✅ Токен получен");
    return token;
}

// === ПОЛУЧЕНИЕ ДАТЫ ===
function getFullDate(day) {
    const year = 2026;
    const month = 4; // апрель
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// === СОХРАНЕНИЕ НА СЕРВЕР ===
async function saveToServer(day, status, start, end) {
    if (!token) {
        await registerIfNeeded();
        await login();
        if (!token) {
            alert("Не удалось авторизоваться");
            return false;
        }
    }
    
    const fullDate = getFullDate(day);
    
    // Формируем данные по схеме API
    let meta = null;
    if (status === 'shift' && start && end) {
        meta = { start, end };
    }
    
    const scheduleData = {
        schedule: [{
            day: fullDate,
            status: status,
            meta: meta
        }]
    };
    
    console.log("Отправляем:", scheduleData);
    
    try {
        const response = await fetch(`${API_URL}/schedules/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(scheduleData)
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error("Ошибка сервера:", error);
            alert(`Ошибка: ${response.status}`);
            return false;
        }
        
        console.log("✅ Сохранено!");
        return true;
    } catch(e) {
        console.error("Ошибка сети:", e);
        alert("Не удалось подключиться к серверу");
        return false;
    }
}

// === ЗАГРУЗКА РАСПИСАНИЯ С СЕРВЕРА ===
async function loadSchedule() {
    if (!token) {
        await registerIfNeeded();
        await login();
    }
    
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/schedules/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("📅 Загруженное расписание:", data);
            return data.schedule_entries || [];
        }
    } catch(e) {
        console.error("Ошибка загрузки:", e);
    }
    return [];
}

// === ОБНОВЛЕНИЕ КАЛЕНДАРЯ ===
async function updateCalendarDisplay() {
    const entries = await loadSchedule();
    
    // Создаём маппер дата -> запись
    const scheduleMap = {};
    entries.forEach(entry => {
        scheduleMap[entry.day] = entry;
    });
    
    // Обновляем каждый день
    const days = document.querySelectorAll('.day');
    days.forEach((day, index) => {
        const dayNumber = index + 1;
        const fullDate = getFullDate(dayNumber);
        const entry = scheduleMap[fullDate];
        
        if (entry) {
            day.classList.remove('shift', 'off', 'vac');
            day.classList.add(entry.status);
            
            if (entry.status === 'shift' && entry.meta?.start && entry.meta?.end) {
                day.innerHTML = `
                    <div>${dayNumber}</div>
                    <small>${entry.meta.start} - ${entry.meta.end}</small>
                `;
            } else {
                const statusText = entry.status === 'off' ? 'Выходной' : 'Отпуск';
                day.innerHTML = `
                    <div>${dayNumber}</div>
                    <small>${statusText}</small>
                `;
            }
        }
    });
}

// === РЕЖИМЫ ===
window.setMode = function(newMode) {
    mode = newMode;
    console.log("Режим:", mode);
}

// === СОЗДАНИЕ КАЛЕНДАРЯ ===
function createCalendar(days = 30) {
    calendar.innerHTML = '';
    
    for (let i = 1; i <= days; i++) {
        const day = document.createElement('div');
        day.classList.add('day');
        day.innerHTML = `<div>${i}</div>`;
        
        day.addEventListener('click', async () => {
            activeDayElement = day;
            const dayNumber = i;
            
            if (mode === 'shift') {
                // Для смены показываем модалку
                modal.classList.remove('hidden');
                modalDate.innerText = `День ${dayNumber}`;
                startInput.value = '';
                endInput.value = '';
            } else {
                // Для выходного или отпуска - сохраняем сразу
                const status = mode === 'off' ? 'off' : 'vac';
                const statusText = mode === 'off' ? 'Выходной' : 'Отпуск';
                
                await saveToServer(dayNumber, status, null, null);
                
                day.classList.remove('shift', 'off', 'vac');
                day.classList.add(status);
                day.innerHTML = `
                    <div>${dayNumber}</div>
                    <small>${statusText}</small>
                `;
            }
        });
        
        calendar.appendChild(day);
    }
    
    // Загружаем сохранённое расписание
    updateCalendarDisplay();
}

// === СОХРАНЕНИЕ ИЗ МОДАЛКИ ===
saveBtn.addEventListener('click', async () => {
    const start = startInput.value;
    const end = endInput.value;
    
    if (!start || !end) {
        alert('Выберите время');
        return;
    }
    
    const dayNumber = parseInt(activeDayElement.innerText);
    
    await saveToServer(dayNumber, 'shift', start, end);
    
    activeDayElement.classList.remove('shift', 'off', 'vac');
    activeDayElement.classList.add('shift');
    activeDayElement.innerHTML = `
        <div>${dayNumber}</div>
        <small>${start} - ${end}</small>
    `;
    
    modal.classList.add('hidden');
});

// === ОТМЕНА В МОДАЛКЕ ===
closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// === ЗАПУСК ===
createCalendar();

// Автоматический логин при загрузке
(async function init() {
    await registerIfNeeded();
    await login();
    await updateCalendarDisplay();
})();