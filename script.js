const calendar = document.querySelector('#calendar');
let mode = 'shift';

const modal = document.getElementById('modal');
const startInput = document.getElementById('startTime');
const endInput = document.getElementById('endTime');
const saveBtn = document.getElementById('saveBtn');
const closeBtn = document.getElementById('closeBtn');
const modalDate = document.getElementById('modal-date');

let activeDayElement = null;

window.setMode = function(newMode) {
    mode = newMode;
    console.log("mode:", mode);
}

document.querySelector('.shift-btn').addEventListener('click', () => setMode('shift'));
document.querySelector('.off-btn').addEventListener('click', () => setMode('off'));
document.querySelector('.vac-btn').addEventListener('click', () => setMode('vac'));

function createCalendar(days = 30) {
    for (let i = 1; i <= days; i++) {
        const day = document.createElement('div');
        day.classList.add('day');
        day.innerText = i;

        day.addEventListener('click', () => {
            activeDayElement = day;
            console.log(mode)
            if (mode === 'shift') {
                modal.classList.remove('hidden');
                modalDate.innerText = `День ${i}`;
            
                startInput.value = '';
                endInput.value = '';
            }

            activeDayElement.classList.remove('shift','off','vac');
            activeDayElement.classList.add(mode);
            
        });

        calendar.appendChild(day);
    }
}

saveBtn.addEventListener('click', async () => {
    console.log(mode)

    const start = startInput.value;
    const end = endInput.value;

    if (!start || !end) {
        alert('Выбери время');
        return;
    }

    activeDayElement.classList.remove('shift','off','vac');
    activeDayElement.classList.add(mode);

    // await saveToServer(
    //     activeDayElement.innerText,
    //     mode,
    //     start,
    //     end
    // );

    activeDayElement.innerHTML = `
        <div>${activeDayElement.innerText}</div>
        <small>${start} - ${end}</small>
    `;

    modal.classList.add('hidden');
});

closeBtn.addEventListener('click', () => {
    activeDayElement.classList.remove('shift','off','vac');
    modal.classList.add('hidden');
});



async function saveToServer(day, status, start, end) {
    await fetch("http://localhost:8000/schedule", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: 1,
            day: `2026-04-${String(day).padStart(2,'0')}`,
            status: status,
            meta: {
                start,
                end
            }
        })
    });
}


// console.log(modal, saveBtn, closeBtn);
createCalendar();