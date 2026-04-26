const calendarApril = document.querySelector('#calendar-april');
const calendarMay = document.querySelector('#calendar-may');

const modal = document.getElementById('modal');
const startInput = document.getElementById('startTime');
const endInput = document.getElementById('endTime');
const saveBtn = document.getElementById('saveBtn');
const closeBtn = document.getElementById('closeBtn');
const modalDate = document.getElementById('modal-date');
const quit = document.getElementById('quit')

const numberDays = document.querySelector('.number-days');

let mode = 'shift';
let activeDayElement = null;

const selectedDays = [];

// ---------------- MODE ----------------
window.setMode = function (newMode) {
    mode = newMode;
};

quit.addEventListener('click',() => {
    setTimeout(() => {
            window.location.href = "../Register/index.html";
        }, 1000);
})

// ---------------- CALENDAR ----------------
function createCalendar(container, startDay, endDay, month) {
    for (let i = startDay; i <= endDay; i++) {
        const day = document.createElement('div');
        day.classList.add('day');
        day.innerText = i;
        day.dataset.day = i;
        day.addEventListener('click', () => {
            activeDayElement = day;

            const dateKey = `2026-${String(month).padStart(2,'0')}-${String(i).padStart(2,'0')}`;

            // удалить старую запись
            const index = selectedDays.findIndex(d => d.date === dateKey);
            if (index !== -1) {
                selectedDays.splice(index, 1);
            }

            // добавить новую
            selectedDays.push({
                date: dateKey,
                status: mode,
                start: null,
                end: null
            });

            updateNumberDays();

            // визуал
            activeDayElement.classList.remove('shift','off','vac');
            activeDayElement.classList.add(mode);

            // модалка только для shift
            if (mode === 'shift') {
                modal.classList.remove('hidden');
                modalDate.innerText = `День ${i}.${month}`;
                startInput.value = '';
                endInput.value = '';
            }
        });

        container.appendChild(day);
    }
}

saveBtn.addEventListener('click', () => {
    const start = startInput.value;
    const end = endInput.value;

    if (!start || !end) {
        alert('Выбери время');
        return;
    }

    const dayNumber = activeDayElement.innerText;

    activeDayElement.innerHTML = `
        <div>${dayNumber}</div>
        <small>${start} - ${end}</small>
    `;

    const dateKey = selectedDays.find(d =>
        d.date.endsWith(`-${String(dayNumber).padStart(2,'0')}`)
    );

    if (dateKey) {
        dateKey.start = start;
        dateKey.end = end;
    }

    updateNumberDays();
    modal.classList.add('hidden');
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    day.classList.remove('shift','vac','off')
});

function updateNumberDays() {
    let shift = 0;
    let off = 0;
    let vac = 0;

    selectedDays.forEach(d => {
        if (d.status === 'shift') shift++;
        if (d.status === 'off') off++;
        if (d.status === 'vac') vac++;
    });

    numberDays.innerHTML = `
        <h3>Выбранные дни</h3>
        <div id="dayssmena">Смена: ${shift} days</div>
        <div id="daysoff">Отпуск: ${off} days</div>
        <div id="daysotpusk">Выходной: ${vac} days</div>
    `;
}

document.querySelector('.clear').addEventListener('click', () => {
    document.querySelectorAll('.day').forEach(day => {
        day.classList.remove('shift','off','vac');

        day.innerHTML = day.dataset.day; 
    });

    selectedDays.length = 0;
    updateNumberDays();
});

async function loadUser() {
    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    if (!token) {
        console.log("Нет токена");
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/auth/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("STATUS:", res.status);

        if (!res.ok) {
            const errText = await res.text();
            console.log("ERROR RESPONSE:", errText);
            return;
        }

        const user = await res.json();
        console.log("USER:", user);

        document.querySelector(".name").textContent =
            user.full_name || user.email || "Без имени";

        document.querySelector(".id").textContent =
            "ID: " + user.id;

    } catch (err) {
        console.error("LOAD USER ERROR:", err);
    }
}



loadUser();



loadUser();


document.querySelector('.shift-btn').addEventListener('click', () => setMode('shift'));
document.querySelector('.off-btn').addEventListener('click', () => setMode('off'));
document.querySelector('.vac-btn').addEventListener('click', () => setMode('vac'));


createCalendar(calendarApril, 20, 30, 4);
createCalendar(calendarMay, 1, 5, 5);

updateNumberDays();