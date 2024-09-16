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

                        document.getElementById("IdNombre").value = item.Empleado;
                        document.getElementById("IdCedula").value = item.Cédula;
                        document.getElementById("IdFechaExamen").value = item.Fecha_de_Examen;
                        document.getElementById("IdTipoExamen").value = item.Tipo_de_Examen;
                        document.getElementById("IdTipoEmpleado").value = item.Tipo_de_Empleado;
        
                        
                        //<td>${fechaProximoExamen.toLocaleDateString('es-ES')}</td>
                        //<td>${diasTranscurridos}</td>
                        //<td>${item.Tipo_de_Trabajo}</td>
                        //<td>${item.Gerencia}</td>
                        //<td>${item.Superintendencia}</td>
                        //<td>${item.Supervisor}</td>
                   
                });

               
            } else {
                alert("No se encontraron resultados para la cédula ingresada.");
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
