// JavaScript para generar el calendario y manejar las entradas

const calendar = document.getElementById('calendar');
const modal = document.getElementById('modal');
const modalDate = document.getElementById('modal-date');
const entryText = document.getElementById('entry-text');
const saveButton = document.getElementById('save-button');
const monthYearText = document.getElementById('monthYearText');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

const hamburgerMenu = document.getElementById('hamburger-menu');
const eventModal = document.getElementById('event-modal');
const eventList = document.getElementById('event-list');

const progressIcon = document.getElementById('progress-icon');
const progressModal = document.getElementById('progress-modal');
const progressIcons = document.querySelectorAll('.progress-icon');
const progressItems = document.querySelectorAll('.progress-item');

let selectedDate;
let currentYear;
let currentMonth;

// Variables para almacenar los totales y progresos manuales en localStorage
//customProgressTotals = {1: 50, 2: 0, ...} -> Total de "horas" calculadas para cada progreso
//manualProgressData = {1: { currentProgress: 10, lastUpdated: 'YYYY-MM-DD' }, 2: { ... }} -> Progreso manual actual y fecha del último reset/update
//progressTitles = {1: "Mi Título", 2: "Otro Título", ...} -> Títulos de los progresos

// Recuperar datos de localStorage al iniciar
const customProgressTotals = JSON.parse(localStorage.getItem('customProgressTotals')) || {};
const manualProgressData = JSON.parse(localStorage.getItem('manualProgressData')) || {};
const progressTitles = JSON.parse(localStorage.getItem('progressTitles')) || {};


// Función para guardar los totales calculados en localStorage
function saveCustomProgressTotals() {
    localStorage.setItem('customProgressTotals', JSON.stringify(customProgressTotals));
}

// Función para guardar los datos de progreso manual en localStorage
function saveManualProgressData() {
    localStorage.setItem('manualProgressData', JSON.stringify(manualProgressData));
}

// Función para guardar los títulos de progreso en localStorage
function saveProgressTitles() {
    localStorage.setItem('progressTitles', JSON.stringify(progressTitles));
}


// Función para generar el calendario del mes actual
function generateCalendar(year, month) {
    calendar.innerHTML = '';

    currentYear = year;
    currentMonth = month;

    const firstDay = new Date(year, month, 1).getDay(); // Día de la semana del primer día (0=Domingo, 6=Sábado)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Número de días en el mes

    // Mostrar el mes y año actual
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    monthYearText.textContent = `${months[month]} ${year}`;

    // Añadir los nombres de los días de la semana (solo visible en desktop/tablet grande según CSS)
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    for (let day of daysOfWeek) {
        const dayName = document.createElement('div');
        dayName.textContent = day;
        dayName.classList.add('day-name');
        calendar.appendChild(dayName);
    }

    // Añadir días vacíos al inicio si el mes no empieza en lunes
    // JS getDay() es 0 (Dom) a 6 (Sab). Convertir a 1 (Lun) a 7 (Dom).
    // Si getDay() es 0 (Dom), el día de la semana es 7. Restamos 1 para el índice (6 espacios).
    // Si getDay() es 1 (Lun), el día de la semana es 1. Restamos 1 para el índice (0 espacios).
    let blankDays = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < blankDays; i++) {
        const emptyCell = document.createElement('div');
        calendar.appendChild(emptyCell);
    }

    // Añadir los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDateKey(date);

        const dayCell = document.createElement('div');
        dayCell.classList.add('day');
        // Agregar el número del día directamente
        dayCell.textContent = day;


        // Marcar el día de hoy
        const today = new Date();
         // Normalizar la fecha de hoy al inicio del día
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
         // Normalizar la fecha del día del calendario al inicio del día
        const cellDateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());


        if (cellDateMidnight.toDateString() === todayMidnight.toDateString()) {
            dayCell.classList.add('today');
        }

        // Marcar días pasados (cualquier día cuya medianoche sea *antes* de la medianoche de hoy)
        if (cellDateMidnight < todayMidnight) {
            dayCell.classList.add('past');
        }

        // Obtener contenido almacenado
        const content = localStorage.getItem(dateString);

        // Variables para palabras clave
        let hasPrueba = false;
        let hasTarea = false;

        if (content) {
             // Opcional: mostrar un pequeño preview del contenido
            const previewDiv = document.createElement('div');
            previewDiv.classList.add('entry-preview');
            previewDiv.textContent = content.split('\n')[0].substring(0, 50) + (content.split('\n')[0].length > 50 ? '...' : ''); // Muestra la primera línea o un fragmento
            dayCell.appendChild(previewDiv);


            const lowerContent = content.toLowerCase();

            hasPrueba = lowerContent.includes('prueba');
            hasTarea = lowerContent.includes('tarea') || lowerContent.includes('entrega');

            if (hasPrueba && hasTarea) {
                dayCell.classList.add('has-multiple');
            } else if (hasPrueba) {
                dayCell.classList.add('has-prueba');
            } else if (hasTarea) {
                dayCell.classList.add('has-tarea');
            } else {
                dayCell.classList.add('has-entry-no-keyword');
            }
        }

        dayCell.addEventListener('click', () => openModal(date));

        calendar.appendChild(dayCell);
    }

    // Actualizar recordatorios
    displayReminders();
}

function openModal(date) {
    selectedDate = date;
    const dateString = formatDateKey(date);
    modalDate.textContent = `Entrada para el ${date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    entryText.value = localStorage.getItem(dateString) || '';
    modal.classList.add('active');
     // Focus en el textarea cuando el modal se abre
    setTimeout(() => entryText.focus(), 300); // Pequeño retraso para que la transición termine
}

// Función para cerrar un modal específico
function closeModal(modalElement) {
    if (modalElement) {
         // Para modales laterales, usar la transición de transform
        if (modalElement.classList.contains('side-modal')) {
             modalElement.style.transform = 'translateX(100%)';
             // Ocultar completamente después de la transición
             modalElement.addEventListener('transitionend', function handler() {
                modalElement.classList.remove('active');
                modalElement.removeEventListener('transitionend', handler);
                modalElement.style.transform = ''; // Limpiar el style para no interferir si se abre de nuevo
             });
        } else { // Para modal principal, usar la transición de opacidad/display
             modalElement.classList.remove('active');
        }
    }
}

// Event listeners para cerrar el modal principal (el de entrada de texto)
document.querySelector('#modal .close-button').addEventListener('click', () => {
    closeModal(modal);
});

document.querySelector('#modal .modal-close-bottom').addEventListener('click', () => {
     closeModal(modal);
 });


// Event listener para guardar la entrada
saveButton.addEventListener('click', () => {
    const dateString = formatDateKey(selectedDate);
    const content = entryText.value.trim(); // Eliminar espacios en blanco al inicio y final

    if (content) {
        localStorage.setItem(dateString, content);
    } else {
        localStorage.removeItem(dateString);
    }

    closeModal(modal);
    generateCalendar(currentYear, currentMonth); // Regenerar el calendario para actualizar colores
    displayReminders(); // Actualizar recordatorios
});

// Navegar entre meses
prevBtn.addEventListener('click', () => {
    if (currentMonth === 0) {
        currentYear--;
        currentMonth = 11;
    } else {
        currentMonth--;
    }
    generateCalendar(currentYear, currentMonth);
});

nextBtn.addEventListener('click', () => {
    if (currentMonth === 11) {
        currentYear++;
        currentMonth = 0;
    } else {
        currentMonth++;
    }
    generateCalendar(currentYear, currentMonth);
});

// Cerrar los modales si se hace clic fuera del contenido
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal(modal);
    }
     // Los side-modals se cierran al hacer clic fuera si su overlay de fondo es el target
    if (event.target === eventModal && eventModal.classList.contains('active')) {
         closeModal(eventModal);
    }
     if (event.target === progressModal && progressModal.classList.contains('active')) {
         closeModal(progressModal);
    }
});


// Funcionalidad del menú de hamburguesa
hamburgerMenu.addEventListener('click', () => {
     closeModal(progressModal); // Cierra el modal de progreso si está abierto
     eventModal.classList.add('active'); // Añade la clase 'active' para activar la transición CSS
     eventModal.style.transform = 'translateX(0)'; // Asegura que la transición se dispare
     displayUpcomingEvents();
});

// Event listeners para cerrar el modal de eventos
document.querySelector('#event-modal .close-button').addEventListener('click', () => {
    closeModal(eventModal);
});
document.querySelector('#event-modal .modal-close-bottom').addEventListener('click', () => {
     closeModal(eventModal);
});


// Funcionalidad del icono de progreso
progressIcon.addEventListener('click', () => {
    closeModal(eventModal); // Cierra el modal de eventos si está abierto
     progressModal.classList.add('active'); // Añade la clase 'active' para activar la transición CSS
     progressModal.style.transform = 'translateX(0)'; // Asegura que la transición se dispare
});

// Event listeners para cerrar el modal de progreso
document.querySelector('#progress-modal .close-button').addEventListener('click', () => {
    closeModal(progressModal);
});
document.querySelector('#progress-modal .modal-close-bottom').addEventListener('click', () => {
     closeModal(progressModal);
});


// Funcionalidad para cambiar entre progresos
progressIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const id = icon.getAttribute('data-id');

        // Remover clase activa de todos los iconos y progresos
        progressIcons.forEach(i => i.classList.remove('active'));
        progressItems.forEach(item => item.classList.remove('active'));

        // Agregar clase activa al icono y progreso seleccionados
        icon.classList.add('active');
        document.getElementById(`progress-item-${id}`).classList.add('active');
    });
});

// Función para formatear la fecha como clave YYYY-MM-DD
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

// Función para parsear una clave YYYY-MM-DD a objeto Date
function parseDateKey(dateString) {
    const [year, month, day] = dateString.split('-');
    // Month is 0-indexed in Date constructor
    return new Date(year, month - 1, day);
}


// Función para mostrar eventos próximos
function displayUpcomingEvents() {
    eventList.innerHTML = '';

    const today = new Date();
    // Normalizar la fecha de hoy al inicio del día
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let events = [];

    // Obtener todas las entradas de localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Verificar si la clave tiene el formato YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
             const eventDate = parseDateKey(key);
            // Normalizar la fecha del evento al inicio del día
            const eventDateMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            const content = localStorage.getItem(key);

            // Incluir solo eventos a partir de hoy (medianoche)
            if (eventDateMidnight >= todayMidnight && content.trim() !== '') {
                 events.push({ date: eventDate, content: content });
            }
        }
    }

    // Ordenar eventos por fecha
    events.sort((a, b) => a.date - b.date);

    if (events.length === 0) {
        eventList.innerHTML = '<p style="text-align: center; color: #777;">No hay eventos próximos.</p>';
        return;
    }

    // Mostrar eventos
    for (let event of events) {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');

        const eventDate = document.createElement('div');
        eventDate.classList.add('event-date');
         // Formatear la fecha para mostrar el día de la semana
        eventDate.textContent = event.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const eventContent = document.createElement('div');
        eventContent.classList.add('event-content');
        eventContent.textContent = event.content;

        eventItem.appendChild(eventDate);
        eventItem.appendChild(eventContent);

        eventList.appendChild(eventItem);
    }
}

// Función para mostrar los recordatorios de la próxima prueba y tarea
function displayReminders() {
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let closestPrueba = null;
    let closestTarea = null;
    let minDaysToPrueba = Infinity;
    let minDaysToTarea = Infinity;

    // Obtener todas las entradas de localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
             const eventDate = parseDateKey(key);
            const eventDateMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            const content = localStorage.getItem(key).toLowerCase();

            // Considerar solo eventos a partir de hoy y con contenido no vacío
            if (eventDateMidnight >= todayMidnight && localStorage.getItem(key).trim() !== '') {
                const daysDifference = Math.ceil((eventDateMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

                if (content.includes('prueba')) {
                    if (daysDifference < minDaysToPrueba) {
                        minDaysToPrueba = daysDifference;
                        closestPrueba = {
                            date: eventDate,
                            content: localStorage.getItem(key),
                            daysRemaining: daysDifference
                        };
                    }
                }

                if (content.includes('tarea') || content.includes('entrega')) {
                    if (daysDifference < minDaysToTarea) {
                        minDaysToTarea = daysDifference;
                        closestTarea = {
                            date: eventDate,
                            content: localStorage.getItem(key),
                            daysRemaining: daysDifference
                        };
                    }
                }
            }
        }
    }

    const remindersDiv = document.getElementById('reminders');
    remindersDiv.innerHTML = '<h3>Recordatorios</h3>'; // Reset y añadir título

    let hasReminders = false;

    if (closestPrueba) {
        const pruebaDiv = document.createElement('div');
        pruebaDiv.classList.add('reminder-item');
        pruebaDiv.innerHTML = `
            <h3>Próxima Prueba</h3>
            <p>Fecha: ${closestPrueba.date.toLocaleDateString('es-ES')}</p>
            <p>Faltan ${closestPrueba.daysRemaining} día(s)</p>
            <p>Detalle: ${closestPrueba.content.split('\n')[0].substring(0, 60)}...</p>
        `;
        remindersDiv.appendChild(pruebaDiv);
        hasReminders = true;
    }

    if (closestTarea) {
        const tareaDiv = document.createElement('div');
        tareaDiv.classList.add('reminder-item');
         tareaDiv.innerHTML = `
             <h3>Próxima Tarea/Entrega</h3>
             <p>Fecha: ${closestTarea.date.toLocaleDateString('es-ES')}</p>
             <p>Faltan ${closestTarea.daysRemaining} día(s)</p>
             <p>Detalle: ${closestTarea.content.split('\n')[0].substring(0, 60)}...</p>
         `;
        remindersDiv.appendChild(tareaDiv);
        hasReminders = true;
    }

     if (!hasReminders) {
         remindersDiv.innerHTML += '<p style="text-align: center; color: #777; font-size: 14px;">No hay recordatorios próximos.</p>';
     }
}


// Función para calcular el progreso personalizado para un progreso específico
function calculateCustomProgress(id) {
    const startDateInput = document.getElementById(`start-date-${id}`);
    const endDateInput = document.getElementById(`end-date-${id}`);
    const customProgressBar = document.getElementById(`custom-progress-bar-${id}`);
    const customProgressPercentageText = document.getElementById(`custom-progress-percentage-${id}`);
    const dayCheckboxesContainer = document.getElementById(`day-checkboxes-${id}`);
    const dayCheckboxes = dayCheckboxesContainer.querySelectorAll('input[type="checkbox"]');

    const startDateValue = startDateInput.value;
    const endDateValue = endDateInput.value;

    if (!startDateValue || !endDateValue) {
        customProgressBar.style.width = '0%';
        customProgressPercentageText.textContent = ' (0 horas de 0 horas)';
         customProgressTotals[id] = 0; // Reset total if dates are empty
         saveCustomProgressTotals();
         updateManualProgressBar(id); // Update manual bar based on new total
        //alert('Por favor, ingresa ambas fechas.');
        return;
    }

    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    if (endDate < startDate) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio.');
         customProgressBar.style.width = '0%';
         customProgressPercentageText.textContent = ' (0 horas de 0 horas)';
          customProgressTotals[id] = 0; // Reset total
          saveCustomProgressTotals();
          updateManualProgressBar(id); // Update manual bar
        return;
    }

    // Obtener los días seleccionados
    let selectedDays = [];
    dayCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedDays.push(parseInt(checkbox.value));
        }
    });

    if (selectedDays.length === 0) {
        alert('Por favor, selecciona al menos un día de la semana.');
         customProgressBar.style.width = '0%';
         customProgressPercentageText.textContent = ' (0 horas de 0 horas)';
          customProgressTotals[id] = 0; // Reset total
          saveCustomProgressTotals();
          updateManualProgressBar(id); // Update manual bar
        return;
    }

    // Calcular el número total de días "activos" (desde inicio hasta fin, incluyendo ambos)
    let totalPossibleDays = 0;
    let dateIterator = new Date(startDate);
     // Asegurarse de que el iterador comience en el inicio del día
    dateIterator.setHours(0, 0, 0, 0);
     endDate.setHours(0,0,0,0); // Normalizar end date too

    while (dateIterator <= endDate) {
         // getDay() retorna 0 para domingo, 1 para lunes, ..., 6 para sábado.
         // Los valores de los checkboxes son 0 para domingo, 1 para lunes, ..., 6 para sábado. Coinciden.
        if (selectedDays.includes(dateIterator.getDay())) {
            totalPossibleDays += 1;
        }
        dateIterator.setDate(dateIterator.getDate() + 1);
    }

    if (totalPossibleDays === 0) {
        alert('No hay días seleccionados entre las fechas dadas.');
         customProgressBar.style.width = '0%';
         customProgressPercentageText.textContent = ' (0 horas de 0 horas)';
          customProgressTotals[id] = 0; // Reset total
          saveCustomProgressTotals();
          updateManualProgressBar(id); // Update manual bar
        return;
    }

    // Calcular el número de días "activos" completados (desde inicio hasta hoy o fin, lo que llegue primero)
    const today = new Date();
    today.setHours(0,0,0,0); // Normalizar today
    let lastDate = today < endDate ? today : endDate;

    let completedDays = 0;
    dateIterator = new Date(startDate);
    dateIterator.setHours(0,0,0,0); // Ensure iterator starts normalized

    while (dateIterator <= lastDate) {
        if (selectedDays.includes(dateIterator.getDay())) {
            completedDays += 1;
        }
        dateIterator.setDate(dateIterator.getDate() + 1);
    }

    // Calcular el porcentaje de progreso
    const progressPercentage = (completedDays / totalPossibleDays) * 100;
    customProgressBar.style.width = `${progressPercentage.toFixed(2)}%`; // Redondear a 2 decimales
    customProgressPercentageText.textContent = ` (${completedDays} días de ${totalPossibleDays} días)`;

    // Guardar datos de configuración del progreso en localStorage
    localStorage.setItem(`customProgressConfig${id}`, JSON.stringify({
        startDate: startDateValue,
        endDate: endDateValue,
        selectedDays: selectedDays
    }));

    // Almacenar el total de días para el progreso manual (barra diaria)
    customProgressTotals[id] = totalPossibleDays; // Store the total possible days
    saveCustomProgressTotals(); // Save the total

    // Actualizar la barra de progreso diaria (ahora basada en el total calculado)
    updateManualProgressBar(id);
}

// Función para actualizar la barra de progreso diaria
function updateManualProgressBar(id) {
    const manualProgressBar = document.getElementById(`manual-progress-bar-${id}`);
    const manualProgressCountText = document.getElementById(`manual-progress-count-${id}`);

    // Obtener el total calculado para este progreso
    const total = customProgressTotals[id] || 0;

    // Obtener el progreso manual actual. Si no existe, inicializarlo a 0.
    // Asegurarse de que el progreso manual no supere el total.
    manualProgressData[id] = manualProgressData[id] || { currentProgress: 0, lastUpdated: formatDateKey(new Date()) };
    let currentManualProgress = manualProgressData[id].currentProgress;

    // Clamp current progress to total
    if (currentManualProgress > total) {
        currentManualProgress = total;
        manualProgressData[id].currentProgress = currentManualProgress;
        saveManualProgressData(); // Save the corrected value
    }


    const progressPercentage = total > 0 ? (currentManualProgress / total) * 100 : 0;
    manualProgressBar.style.width = `${progressPercentage.toFixed(2)}%`; // Redondear a 2 decimales
    manualProgressCountText.textContent = `(${currentManualProgress}/${total})`;
}

// Funcionalidad para calcular el progreso basado en los días seleccionados
const calculateProgressButtons = document.querySelectorAll('.calculate-progress');
calculateProgressButtons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        calculateCustomProgress(id);
    });
});

// Funcionalidad para los progresos manuales (barra diaria)
for (let id = 1; id <= 5; id++) {
    const manualIncrementInput = document.getElementById(`manual-increment-${id}`);
    const addManualProgressButton = document.querySelector(`.add-manual-progress[data-id="${id}"]`);
    const resetManualProgressButton = document.querySelector(`.reset-manual-progress[data-id="${id}"]`);

     // Asegurarse de que manualProgressData[id] existe y tiene lastUpdated
     if (!manualProgressData[id] || !manualProgressData[id].lastUpdated) {
         manualProgressData[id] = { currentProgress: 0, lastUpdated: formatDateKey(new Date()) };
         saveManualProgressData();
     }

     // Reset diario automático si la fecha de última actualización es anterior a hoy
     const todayKey = formatDateKey(new Date());
     if (manualProgressData[id].lastUpdated < todayKey) {
         console.log(`Resetting manual progress for ID ${id} because last update was on ${manualProgressData[id].lastUpdated}, today is ${todayKey}`);
         manualProgressData[id].currentProgress = 0;
         manualProgressData[id].lastUpdated = todayKey;
         saveManualProgressData();
     }


    // Añadir progreso manual
    addManualProgressButton.addEventListener('click', () => {
        const total = customProgressTotals[id] || 0; // Usar el total calculado
        const increment = parseInt(manualIncrementInput.value);

         if (isNaN(increment) || increment < 1) {
             alert('Por favor, ingresa un número válido mayor a 0 para añadir.');
             return;
         }

        manualProgressData[id] = manualProgressData[id] || { currentProgress: 0, lastUpdated: todayKey };
        // Si el progreso manual ya alcanzó el total, no añadir más
        if (manualProgressData[id].currentProgress < total) {
            manualProgressData[id].currentProgress += increment;
             // Asegurarse de que no supere el total
            if (manualProgressData[id].currentProgress > total) {
                 manualProgressData[id].currentProgress = total;
            }
             // Actualizar la fecha de última actualización
            manualProgressData[id].lastUpdated = todayKey;

            saveManualProgressData(); // Guardar progreso en localStorage
            updateManualProgressBar(id); // Actualizar barra de progreso
        } else {
             console.log(`Manual progress for ID ${id} already reached total.`);
             // Opcional: alert('El progreso ya ha alcanzado el total.');
        }
    });

    // Reiniciar progreso manual (esto ahora significa reiniciar el contador *diario*)
    resetManualProgressButton.addEventListener('click', () => {
         manualProgressData[id] = manualProgressData[id] || { currentProgress: 0, lastUpdated: todayKey };
         manualProgressData[id].currentProgress = 0; // Reiniciar el contador diario
         manualProgressData[id].lastUpdated = todayKey; // Registrar que fue reiniciado hoy
        saveManualProgressData(); // Guardar progreso en localStorage
        updateManualProgressBar(id); // Actualizar barra de progreso
    });
}

// Función para guardar y restaurar los títulos de progreso
function saveProgressTitle(id) {
    const titleInput = document.getElementById(`progress-title-${id}`);
    progressTitles[id] = titleInput.value.trim(); // Guardar título (limpiando espacios)
    saveProgressTitles(); // Guardar en localStorage
}

function restoreProgressTitle(id) {
    const titleInput = document.getElementById(`progress-title-${id}`);
    const savedTitle = progressTitles[id] || ''; // Obtener título guardado o cadena vacía
    titleInput.value = savedTitle;
}

// Agregar eventos para guardar los títulos al cambiar
for (let id = 1; id <= 5; id++) {
    const titleInput = document.getElementById(`progress-title-${id}`);
    titleInput.addEventListener('input', () => {
        saveProgressTitle(id);
    });
}

// Restaurar datos al cargar la página
window.addEventListener('load', () => {
    // Restaurar configuración y calcular progreso para los 5 progresos individuales
    for (let id = 1; id <= 5; id++) {
        // Restaurar configuración (fechas, días seleccionados)
        const savedCustomProgressConfig = localStorage.getItem(`customProgressConfig${id}`);
        if (savedCustomProgressConfig) {
            const customProgressConfig = JSON.parse(savedCustomProgressConfig);
            const startDateInput = document.getElementById(`start-date-${id}`);
            const endDateInput = document.getElementById(`end-date-${id}`);
            const dayCheckboxesContainer = document.getElementById(`day-checkboxes-${id}`);
            const dayCheckboxes = dayCheckboxesContainer.querySelectorAll('input[type="checkbox"]');

            startDateInput.value = customProgressConfig.startDate || '';
            endDateInput.value = customProgressConfig.endDate || '';

            // Restaurar días seleccionados
            if (Array.isArray(customProgressConfig.selectedDays)) {
                dayCheckboxes.forEach(checkbox => {
                    checkbox.checked = customProgressConfig.selectedDays.includes(parseInt(checkbox.value));
                });
            }
            // Recalcular progreso basado en la configuración restaurada
            calculateCustomProgress(id); // Esto también guarda el total en customProgressTotals
        } else {
            // Si no hay configuración guardada, asegurar que el total sea 0
            customProgressTotals[id] = 0;
            saveCustomProgressTotals();
            // Y actualizar la barra manual para mostrar (0/0)
            updateManualProgressBar(id);
        }

        // Restaurar progreso manual y actualizar barra
        // El reseteo diario ya se maneja en el bucle de adición/reset de eventos
        if (!manualProgressData[id]) {
             manualProgressData[id] = { currentProgress: 0, lastUpdated: formatDateKey(new Date()) };
             saveManualProgressData();
        }
        updateManualProgressBar(id);


        // Restaurar títulos
        restoreProgressTitle(id);
    }

    // Generar el calendario del mes actual al cargar la página
    const currentDate = new Date();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());

});