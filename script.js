const calendar = document.querySelector('#calendar');
let mode = 'shift';

const modal = document.getElementById('modal');
const startInput = document.getElementById('startTime');
const endInput = document.getElementById('endTime');
const saveBtn = document.getElementById('saveBtn');
const closeBtn = document.getElementById('closeBtn');
const modalDate = document.getElementById('modal-date');

let activeDayElement = null;

function setMode(newMode) {
    mode = newMode;
}

function createCalendar(days = 30) {
    for (let i = 1; i <= days; i++) {
        const day = document.createElement('div');
        day.classList.add('day');
        day.innerText = i;

        day.addEventListener('click', () => {
            activeDayElement = day;

            modal.classList.remove('hidden');
            modalDate.innerText = `День ${i}`;

            startInput.value = '';
            endInput.value = '';
        });

        calendar.appendChild(day);
    }
}

saveBtn.addEventListener('click', () => {
    const start = startInput.value;
    const end = endInput.value;

    if (!start || !end) {
        alert('Выбери время');
        return;
    }

    activeDayElement.classList.remove('shift','off','vacation');
    activeDayElement.classList.add('shift');

    activeDayElement.innerHTML = `
        <div>${activeDayElement.dataset.day || activeDayElement.innerText}</div>
        <small>${start} - ${end}</small>
    `;

    modal.classList.add('hidden');
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});


console.log(modal, saveBtn, closeBtn);
createCalendar();