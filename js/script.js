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

    Swal.fire({
        title: 'Consultando la información...',
        text: 'Por favor, espere.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    limpiarFormulario();

    $.ajax({
        url: apiUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ "cedula": cedula }),
        success: function(response) {
            Swal.close();

            if (response.length > 0) {
                const item = response[0];
                const tipoDeTrabajo = item.Tipo_de_Trabajo;

                // Verificar si el campo Tipo_de_Trabajo está vacío, es nulo o diferente de 'PTC' o 'MPT'
                if (!tipoDeTrabajo || tipoDeTrabajo === '' || (tipoDeTrabajo !== 'PTC' && tipoDeTrabajo !== 'MPT')) {
                    Swal.fire({
                        title: 'Ingresar tipo de trabajo',
                        text: 'No se encontró el tipo de trabajo, Por favor seleccionelo',
                        icon: 'question',
                        input: 'select',
                        inputOptions: {
                            'PTC': 'PTC',
                            'MPT': 'MPT'
                        },
                        inputPlaceholder: 'Selecciona el tipo de trabajo',
                        showCancelButton: true,
                        confirmButtonText: 'Seleccionar',
                        cancelButtonText: 'Cancelar',
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Debes seleccionar un tipo de trabajo.';
                            }
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const tipoDeTrabajoSeleccionado = result.value;
                            item.Tipo_de_Trabajo = tipoDeTrabajoSeleccionado;

                            // Continuar con la lógica después de seleccionar el tipo de trabajo
                            procesarDatos(item);
                        }
                    });
                } else {
                    // Si el tipo de trabajo es válido, continuar con la lógica normal
                    procesarDatos(item);
                }
            } else {
                Swal.fire('No se encontraron resultados', 'No se encontraron resultados para la cédula ingresada.', 'info');
            }
        },
        error: function() {
            Swal.close();
            Swal.fire('Error', 'Hubo un error al consultar los datos.', 'error');
        }
    });
}

function procesarDatos(item) {
    document.getElementById("resultado").style.display = "";
    document.getElementById("correo-btn").style.display = "inline-block";

    let fechaExamen = new Date(item.Fecha_de_Examen.split('/').reverse().join('-'));
    let hoy = new Date();
    let diasTranscurridos = Math.floor((hoy - fechaExamen) / (1000 * 60 * 60 * 24));

    let diasParaSumar = item.Tipo_de_Trabajo === 'PTC' ? 365 : item.Tipo_de_Trabajo === 'MPT' ? 730 : 0;
    let fechaProximoExamen = new Date(fechaExamen);
    fechaProximoExamen.setDate(fechaProximoExamen.getDate() + diasParaSumar);

    let diasParaVencer = diasParaSumar - diasTranscurridos;
    let estado = diasParaVencer <= 0 ? 'Vencido' : diasParaVencer <= 60 ? 'Por Vencer' : 'Vigente';

    actualizarCampos(item, fechaProximoExamen, diasTranscurridos, estado);
}

function limpiarFormulario() {
    $('#IdNombre, #IdCedula, #IdFechaExamen, #IdFechaProximoExamen, #IdDiasTranscurridos, #IdEstado, #IdTipoExamen, #IdTipoEmpleado, #IdGerencia, #IdSP, #IdTipoTrabajo, #IdSupervisor').val('');
}

function actualizarCampos(item, fechaProximoExamen, diasTranscurridos, estado) {
    $('#IdNombre').val(item.Empleado || '');
    $('#IdCedula').val(item.Cédula || '');
    $('#IdFechaExamen').val(item.Fecha_de_Examen || '');
    $('#IdFechaProximoExamen').val(fechaProximoExamen.toLocaleDateString('es-ES') || '');
    $('#IdDiasTranscurridos').val(diasTranscurridos || '');
    $('#IdEstado').val(estado || '');
    $('#IdTipoExamen').val(item.Tipo_de_Examen || '');
    $('#IdTipoEmpleado').val(item.Tipo_de_Empleado || '');
    $('#IdGerencia').val(item.Gerencia || '');
    $('#IdSP').val(item.Superintendencia || '');
    $('#IdTipoTrabajo').val(item.Tipo_de_Trabajo || '');
    $('#IdSupervisor').val(item.Supervisor || '');
}

function SolicitarExamen() {
    let NombrePersona = document.getElementById("IdNombre").value;
    let CedulaPersona = document.getElementById("IdCedula").value;
    let FechaUltimoExamen = document.getElementById("IdFechaExamen").value;
    let Gerencia = document.getElementById("IdGerencia").value;
    let Superintendencia = document.getElementById("IdSP").value;
    let TipoDeTrabajo = document.getElementById("IdTipoTrabajo").value;

    const data = {
        "NombrePersona": NombrePersona,
        "CedulaPersona": CedulaPersona,
        "FechaUltimoExamen": FechaUltimoExamen,
        "Gerencia": Gerencia,
        "Superintendencia": Superintendencia,
        "TipoDeTrabajo": TipoDeTrabajo
    };

    const apiUrlRegistrar = 'https://prod-254.westeurope.logic.azure.com:443/workflows/7b9fac14d7c7447f8f6cf8803e6a1bb8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=RXiixC_eJISURFLvBOsQVI0vEzCXkncZlhGpkXEwQcg';

    // Deshabilitar el botón de enviar y mostrar alerta de espera
    $('#correo-btn').prop('disabled', true);
    Swal.fire({
        title: 'Por favor, espere...',
        text: 'Solicitando examen médico.',
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
                text: `Se ha solicitado examen médico para ${NombrePersona} con cédula ${CedulaPersona}.`
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
