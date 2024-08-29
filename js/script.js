function enviarCedula() {
    const cedula = $('#cedula').val();
    const apiUrl = 'https://prod-220.westeurope.logic.azure.com:443/workflows/b3f2cd4d08f34a62a50a93ae97e48c3f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=zetpnpmUjmK9BXE2jHg2PYxUE2HrYKRutvzA-M1L5zo';

    if (!cedula) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Por favor, ingrese el número de cédula.'
        });
        return;
    }

    // Mostrar alerta de espera
    Swal.fire({
        title: 'Consultando la información...',
        text: 'Por favor, espere.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $('#resultado').empty();

    $.ajax({
        url: apiUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ "cedula": cedula }),
        success: function(response) {
            Swal.close(); // Cerrar la alerta de espera

            if (response.length > 0) {
                // Crear tabla para mostrar los datos
                let table = '<table class="table table-striped table-bordered"><thead><tr><th>Cédula</th><th>Empleado</th><th>Fecha de Examen</th><th>Fecha del Próximo Examen</th><th>Días Transcurridos</th><th>Estado</th><th>Tipo de Examen</th><th>Tipo de Empleado</th><th>Tipo de Trabajo</th><th>Gerencia</th><th>Superintendencia</th><th>Supervisor</th></tr></thead><tbody>';

                response.forEach(item => {
                    // Parsear la fecha del examen
                    let fechaExamen = new Date(item.Fecha_de_Examen.split('/').reverse().join('-'));
                    let hoy = new Date();
                    let diasTranscurridos = Math.floor((hoy - fechaExamen) / (1000 * 60 * 60 * 24));

                    let diasParaSumar = item.Tipo_de_Trabajo === 'PTC' ? 365 : item.Tipo_de_Trabajo === 'MPT' ? 730 : 0;
                    let fechaProximoExamen = new Date(fechaExamen);
                    fechaProximoExamen.setDate(fechaProximoExamen.getDate() + diasParaSumar);

                    let estado = '';
                    let diasParaVencer = diasParaSumar - diasTranscurridos;

                    if (diasParaVencer <= 0) {
                        estado = 'Vencido';
                    } else if (diasParaVencer <= 60) {
                        estado = 'Por Vencer';
                    } else {
                        estado = 'Vigente';
                    }

                    table += `<tr>
                        <td>${item.Cédula}</td>
                        <td>${item.Empleado}</td>
                        <td>${item.Fecha_de_Examen}</td>
                        <td>${fechaProximoExamen.toLocaleDateString('es-ES')}</td>
                        <td>${diasTranscurridos}</td>
                        <td>${estado}</td>
                        <td>${item.Tipo_de_Examen}</td>
                        <td>${item.Tipo_de_Empleado}</td>
                        <td>${item.Tipo_de_Trabajo}</td>
                        <td>${item.Gerencia}</td>
                        <td>${item.Superintendencia}</td>
                        <td>${item.Supervisor}</td>
                    </tr>`;
                });

                table += '</tbody></table>';
                $('#resultado').html(table);
            } else {
                $('#resultado').html('<p>No se encontraron resultados para la cédula ingresada.</p>');
            }
        },
        error: function(error) {
            Swal.close(); // Cerrar la alerta de espera
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al consultar los datos.'
            });
        }
    });
}