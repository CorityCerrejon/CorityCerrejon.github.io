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

    // Limpiar cualquier resultado previo (si se utiliza)
    document.getElementById("IdNombre").value = "";
    document.getElementById("IdCedula").value = "";
    document.getElementById("IdFechaExamen").value = "";
    document.getElementById("IdTipoExamen").value = "";
    document.getElementById("IdTipoEmpleado").value = "";
    document.getElementById("IdGerencia").value = "";
    document.getElementById("IdSP").value = "";
    document.getElementById("IdTipoTrabajo").value = "";
    document.getElementById("IdSupervisor").value = "";

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

                    // Actualizar los campos con los datos
                    document.getElementById("IdNombre").value = item.Empleado;
                    document.getElementById("IdCedula").value = item.Cédula;
                    document.getElementById("IdFechaExamen").value = item.Fecha_de_Examen;
                    document.getElementById("IdFechaProximoExamen").value = fechaProximoExamen.toLocaleDateString('es-ES');
                    document.getElementById("IdTipoExamen").value = item.Tipo_de_Examen;
                    document.getElementById("IdTipoEmpleado").value = item.Tipo_de_Empleado;
                    document.getElementById("IdGerencia").value = item.Gerencia;
                    document.getElementById("IdSP").value = item.Superintendencia;
                    document.getElementById("IdTipoTrabajo").value = item.Tipo_de_Trabajo;
                    document.getElementById("IdSupervisor").value = item.Supervisor;


                    // Mostrar mensaje de éxito si es necesario
                    // Swal.fire('Éxito', 'La información se ha consultado correctamente.', 'success');
                });
            } else {
                Swal.fire('No se encontraron resultados', 'No se encontraron resultados para la cédula ingresada.', 'info');
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



function SolicitarExamen() {

    let NombrePersona = document.getElementById("IdNombre").value;
    let CedulaPersona = document.getElementById("IdCedula").value;
    let FechaUltimoExamen = document.getElementById("IdFechaExamen").value;

   
    const data = {
        "NombrePersona": NombrePersona,
        "CedulaPersona": CedulaPersona,
        "FechaUltimoExamen": FechaUltimoExamen
    };

    const apiUrlRegistrar = 'https://prod-254.westeurope.logic.azure.com:443/workflows/7b9fac14d7c7447f8f6cf8803e6a1bb8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RXiixC_eJISURFLvBOsQVI0vEzCXkncZlhGpkXEwQcg';

      // Deshabilitar el botón de enviar y mostrar alerta de espera
      $('#correo-btn').prop('disabled', true);
      Swal.fire({
          title: 'Por favor, espere...',
          text: 'Solicitanto examen medico.',
          icon: 'info',
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          }
      });
  
     
    
    $.ajax({
        url: apiUrlRegistrar,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function() {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: `Se ha solicitado examen medico para  ${NombrePersona} con cedula ${CedulaPersona}.`
            }).then((result) => {
                document.getElementById('consulta-form').reset(); // Limpiar el formulario
                $('#correo-btn').prop('disabled', false); // Habilitar el botón de enviar
            });
        },
        error: function(error) {
            console.error('Error al enviar la información:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al enviar el archivo.'
            });
            $('#correo-btn').prop('disabled', false); // Habilitar el botón de enviar en caso de error
        }
    });



}


