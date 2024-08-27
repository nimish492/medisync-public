document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch patient data from the server
    async function fetchPatientData() {
        try {
            const response = await fetch('http://localhost:3000/api/patients');
            const data = await response.json();
            return data.patients; // Adjust based on your API structure
        } catch (error) {
            console.error('Error fetching patient data:', error);
            return [];
        }
    }

    // Function to render patient data
    function renderPatientList(patients) {
        const patientList = document.getElementById('patientList');
        patientList.innerHTML = ''; // Clear existing content

        patients.forEach(patient => {
            // Create a new div for each patient
            const patientDiv = document.createElement('div');
            patientDiv.classList.add('patient-item');

            // Set up the HTML for this patient
            patientDiv.innerHTML = `
                <div class="patient">
                    <img src="${patient.imageUrl}" alt="${patient.name}" class="patient-image" />
                    <div class="patient-info">
                        <a href="patient-details.html?id=${patient._id}" class="patient-name">${patient.name}</a>
                        <p class="patient-status">${patient.status}</p>
                    </div>
                </div>
            `;

            // Append to the patient list
            patientList.appendChild(patientDiv);
        });
    }

    // Fetch data and render
    fetchPatientData().then(patients => {
        renderPatientList(patients);
    });
});



$(document).ready(function () {
    // Initialize FullCalendar
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true, // Enables event dragging
        selectable: true // Enables selecting time slots
    });
    calendar.render();

    calendar.gotoDate(new Date());
    // Make the calendar resizable
    $('#calendar-container').resizable({
        alsoResize: '#calendar',
        stop: function () {
            calendar.updateSize(); // Update the calendar size after resizing
        }
    });
});


$(document).ready(function () {
    // Initialize the chart
    var ctx = document.getElementById('line-chart1').getContext('2d');
    var lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm'],
            datasets: [{
                label: 'Normal saline',
                data: [100, 89, 72, 68, 55, 43, 30],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: false, // Turn off responsive resizing to handle resizing manually
            maintainAspectRatio: false, // Prevent the chart from maintaining aspect ratio
        }
    });

    // Make the chart resizable
    $('#chart-container').resizable({
        alsoResize: '#line-chart',
        stop: function () {
            lineChart.resize(); // Resize the chart after resizing the container
        }
    });
});


$(document).ready(function () {
    // Initialize the chart
    var ctx = document.getElementById('line-chart2').getContext('2d');
    var dataPoints = [30, 43, 55, 68, 72, 89, 91];

    var lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm'],
            datasets: [{
                label: 'Urine',
                data: dataPoints,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                pointBackgroundColor: dataPoints.map((value, index) => {
                    return index === dataPoints.length - 1 ? 'red' : 'rgba(75, 192, 192, 1)';
                }),
                pointRadius: 5,
                pointHoverRadius: 5,
                pointBorderColor: 'transparent', // Remove the border
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
        }
    });

    // Blinking effect
    setInterval(function () {
        var currentColor = lineChart.data.datasets[0].pointBackgroundColor[dataPoints.length - 1];
        lineChart.data.datasets[0].pointBackgroundColor[dataPoints.length - 1] =
            currentColor === 'red' ? 'rgba(75, 192, 192, 1)' : 'red';

        lineChart.update();
    }, 1000);
});