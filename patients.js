$(document).ready(function() {
    // Function to fetch and display patient list
    function fetchPatients() {
        $.ajax({
            url: '/api/patients',
            method: 'GET',
            success: function(patients) {
                $('.patient-list').empty();

                function formatDate(dateString) {
                    const date = new Date(dateString);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                }

                patients.forEach(patient => {
                    const patientElement = `
                        <div class="patient" data-id="${patient._id}" onclick="openModal('${patient._id}')">
                            <img src="${patient.image}" alt="Patient" width="50px" height="50px">
                            <div class="patient-info">
                                <h3>${patient.name}</h3>
                                <a href="${patient.reportLink}" class="report">Report</a>
                            </div>
                            <span class="status ${patient.status === 'On drip' ? 'ongoing' : 'offgoing'}">${patient.status}</span>
                        </div>
                    `;
                    $('.patient-list').append(patientElement);
                });
            },
            error: function(error) {
                console.error('Error fetching patient data:', error);
            }
        });
    }

    // Call fetchPatients to load the list on page load
    fetchPatients();

    // Function to change patient status
    window.changeStatus = function(patientId, statusElement) {
        const currentStatus = $(statusElement).text();
        const newStatus = currentStatus === 'On drip' ? 'Off drip' : 'On drip';

        // Update the status in the UI
        $(statusElement).text(newStatus);
        $(statusElement).toggleClass('ongoing offgoing');

        // Optionally, send an update to the server
        $.ajax({
            url: `/api/patients/${patientId}`,
            method: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify({ status: newStatus }),
            success: function(response) {
                console.log('Status updated successfully');
            },
            error: function(error) {
                console.error('Error updating status:', error);
                // Revert status in case of error
                $(statusElement).text(currentStatus);
                $(statusElement).toggleClass('ongoing offgoing');
            }
        });
    };

    // Search functionality
    $('#patient-search').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        $('.patient').each(function() {
            const name = $(this).find('h3').text().toLowerCase();
            $(this).toggle(name.includes(searchTerm));
        });
    });

    let originalPatientData = {}; // Object to store original values
    window.openModal = function(patientId) {
        $.ajax({
            url: `/api/patients/${patientId}`,
            type: 'GET',
            success: function(patient) {
                // Format date fields to YYYY-MM-DD
                const formattedDob = new Date(patient.dob).toISOString().split('T')[0];

    
                // Store original data when modal is opened
                originalPatientData = {
                    name: patient.name,
                    dob: formattedDob,
                    age: patient.age,
                    symptoms: patient.symptoms,
                    diagnosis: patient.diagnosis,
                    physician: patient.physician,
                    status: patient.status
                    // Add other fields if needed
                };
    
                // Populate the modal with patient data
                $('#patient-name').val(patient.name);
                $('#patient-dob').val(formattedDob);
                $('#patient-age').val(patient.age);
                $('#patient-symptoms').val(patient.symptoms);
                $('#patient-diagnosis').val(patient.diagnosis);
                $('#patient-physician').val(patient.physician);
                $('#status-select').val(patient.status);
                
                $('#patientModal').data('id', patientId).show(); // Show the modal
            },
            error: function(xhr, status, error) {
                console.error('Error loading patient details:', xhr.status, xhr.statusText, error);
                alert('Error loading patient details.');
            }
        });
    };
    
    
    window.editPatient = function() {
        const patientId = $('#patientModal').data('id');
        
        // Collect only the changed fields
        const updatedData = {};
        
        if ($('#patient-name').val() !== originalPatientData.name) {
            updatedData.name = $('#patient-name').val();
        }
        if ($('#patient-dob').val() !== originalPatientData.dob) {
            updatedData.dob = $('#patient-dob').val(); // This should already be in YYYY-MM-DD format
        }
        if ($('#patient-age').val() !== originalPatientData.age) {
            updatedData.age = $('#patient-age').val();
        }
        if ($('#patient-symptoms').val() !== originalPatientData.symptoms) {
            updatedData.symptoms = $('#patient-symptoms').val();
        }
        if ($('#patient-diagnosis').val() !== originalPatientData.diagnosis) {
            updatedData.diagnosis = $('#patient-diagnosis').val();
        }
        if ($('#patient-physician').val() !== originalPatientData.physician) {
            updatedData.physician = $('#patient-physician').val();
        }
        if ($('#patient-lastChecked').val() !== originalPatientData.lastChecked) {
            updatedData.lastChecked = $('#patient-lastChecked').val(); // Ensure this is in YYYY-MM-DD format
        }
        if ($('#status-select').val() !== originalPatientData.status) {
            updatedData.status = $('#status-select').val();
        }
    
        // If there are no changes, don't send the request
        if (Object.keys(updatedData).length === 0) {
            alert('No changes made.');
            return;
        }
    
        $.ajax({
            url: `/api/patients/${patientId}`,
            type: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify(updatedData),
            success: function(response) {
               
                
                // Update only the changed fields in the frontend
                const patientElement = $(`.patient[data-id="${patientId}"]`);
    
                if (updatedData.name) {
                    patientElement.find('.patient-info h3').text(updatedData.name);
                }
                if (updatedData.status) {
                    const statusElement = patientElement.find('.status');
                    statusElement.text(updatedData.status);
                    statusElement.removeClass('ongoing offgoing').addClass(updatedData.status === 'On drip' ? 'ongoing' : 'offgoing');
                }
                // Update other fields as needed
                
                $('#patientModal').hide(); // Hide the details modal
            },
            error: function(error) {
                console.error('Error updating patient:', error);
                alert('Error updating patient.');
            }
        });
    };
    
    



    // Delete Patient Function
    window.deletePatient = function() {
        const patientId = $('#patientModal').data('id'); // Retrieve patient ID from modal data attribute

        if (!patientId) {
            alert('Patient ID is missing.');
            return;
        }

        if (confirm('Are you sure you want to delete this patient?')) {
            $.ajax({
                url: `/api/patients/${patientId}`,
                method: 'DELETE',
                success: function(response) {
                   
                    fetchPatients(); // Refresh the patient list
                    $('#patientModal').hide(); // Hide the details modal
                },
                error: function(error) {
                    console.error('Error deleting patient:', error);
                    alert('Error deleting patient.');
                }
            });
        }
    };

    // Close Modals
    window.closeModal = function() {
        $('#patientModal').hide();
    };

    window.closeFormModal = function() {
        $('#patientFormModal').hide();
    };

    // Show the form to add a new patient
    $('#add-patient').click(function() {
        $('#patientFormModal').show();
    });

    // Add a new medicine input field
    window.addMedicineInput = function() {
        $('#medicineInputs').append(`
            <div class="medicine">
                <label for="medName">Name:</label>
                <input type="text" name="medName[]" required>
                
                <label for="dosage">Dosage:</label>
                <input type="text" name="dosage[]" required>
                
                <label for="frequency">Frequency:</label>
                <input type="text" name="frequency[]" required>
                
                <label for="duration">Duration:</label>
                <input type="text" name="duration[]" required>
            </div>
        `);
    };

    // Handle form submission
    $('#patientForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        $.ajax({
            url: '/api/patients',
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                alert('Patient added successfully!');
                fetchPatients(); // Refresh the patient list
                $('#patientFormModal').hide(); // Hide the form modal
            },
            error: function(error) {
                console.error('Error adding patient:', error);
                alert('Error adding patient.');
            }
        });
    });
});
