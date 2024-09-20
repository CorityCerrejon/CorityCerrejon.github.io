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
                    const NombrePersona = item.Empleado;
                    

                    Swal.fire({
                        title: `${NombrePersona} necesito de tu ayuda`,
                        text: '¿Eres PTC o MPT?',
                        icon: 'question',
                        showDenyButton: true,
                        confirmButtonText: 'PTC',
                        denyButtonText: 'MPT',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // El usuario seleccionó "PTC"
                            item.Tipo_de_Trabajo = 'PTC';
                            procesarDatos(item); // Lógica para continuar con PTC
                        } else if (result.isDenied) {
                            // El usuario seleccionó "MPT"
                            item.Tipo_de_Trabajo = 'MPT';
                            procesarDatos(item); // Lógica para continuar con MPT
                        }
                        // Si se cancela, no pasa nada, el flujo se detiene
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

    let diasParaSumar = item.Tipo_de_Trabajo === 'PTC' ? 366 : item.Tipo_de_Trabajo === 'MPT' ? 732 : 0;
    let fechaProximoExamen = new Date(fechaExamen);
    fechaProximoExamen.setDate(fechaProximoExamen.getDate() + diasParaSumar );

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
    let FechaProximoExamen = document.getElementById("IdFechaProximoExamen").value;
    let Gerencia = document.getElementById("IdGerencia").value;
    let Superintendencia = document.getElementById("IdSP").value;
    let Supervisor = document.getElementById("IdSupervisor").value;
    let TipoDeTrabajo = document.getElementById("IdTipoTrabajo").value;
    let FechaTentativaExamen = document.getElementById("IdFechaSelect").value;

    // Debug: Verificar qué valores se están obteniendo
    console.log({
        NombrePersona,
        CedulaPersona,
        FechaUltimoExamen,
        FechaProximoExamen,
        Gerencia,
        Superintendencia,
        TipoDeTrabajo,
        Supervisor,
        FechaTentativaExamen
    });

    // Validar que todos los campos necesarios estén llenos
    if (!NombrePersona || !CedulaPersona || !FechaUltimoExamen || !FechaProximoExamen || !Gerencia || !Superintendencia || !TipoDeTrabajo || !Supervisor || !FechaTentativaExamen) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obligatorios',
            text: 'Todos los campos deben estar llenos. Por favor, completa todos los campos.'
        });
        return; // Detener el proceso si algún campo está vacío
    }

    // Validar si las fechas son válidas (si están vacías o mal formateadas)
    if (!isValidDate(FechaTentativaExamen)) {
        Swal.fire({
            icon: 'warning',
            title: 'Fecha inválida',
            text: 'Por favor, selecciona una fecha válida para el examen.'
        });
        return;
    }

    // Formatear la fecha de yyyy-mm-dd a dd/mm/yyyy
    FechaTentativaExamen = formatFecha(FechaTentativaExamen);

    const data = {
        "NombrePersona": NombrePersona,
        "CedulaPersona": CedulaPersona,
        "FechaUltimoExamen": FechaUltimoExamen,
        "FechaProximoExamen": FechaProximoExamen,
        "Gerencia": Gerencia,
        "Superintendencia": Superintendencia,
        "TipoDeTrabajo": TipoDeTrabajo,
        "FechaTentativaExamen": FechaTentativaExamen
    };

    // Preguntar si realmente desea solicitar el examen
    Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas solicitar el examen médico para ${NombrePersona}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, solicitar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Si el usuario confirma, realizar la solicitud
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
                    }).then(() => {
                        document.getElementById('consulta-form').reset(); // Limpiar el formulario
                        $('#correo-btn').prop('disabled', false); // Habilitar el botón de enviar
                    });
                },
                error: function(error) {
                    console.error('Error al enviar la información:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al enviar la solicitud.'
                    });
                    $('#correo-btn').prop('disabled', false); // Habilitar el botón de enviar en caso de error
                }
            });
        }
    });
}

// Función para formatear la fecha
function formatFecha(fecha) {
    const partesFecha = fecha.split("-");
    return `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`; // Retornar en formato dd/mm/yyyy
}

// Función para validar que la fecha no esté vacía ni sea inválida
function isValidDate(fecha) {
    return fecha && !isNaN(new Date(fecha).getTime());
}



