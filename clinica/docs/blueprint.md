# **App Name**: Médica Corporativo

## Core Features:

- Login Falso: Permite a los usuarios iniciar sesión con un carnet y rol simulados, sin autenticación real, para demostrar la funcionalidad de la aplicación.
- Selector de Rol: Un dropdown en la topbar permite cambiar el rol del usuario actual, actualizando el contexto de autenticación y redirigiendo al dashboard correspondiente.
- Chequeo Diario: Permite a los pacientes completar un formulario de chequeo diario, validando los datos y almacenándolos en la capa de mocks para simular una base de datos.
- Listado y detalle de historial de chequeos: Presenta una tabla filtrable con el historial de chequeos del paciente, permitiendo ver los detalles de cada uno en un modal.
- CRUD Pacientes: Permite al administrador crear, modificar y eliminar información sobre pacientes.  Este should feature basic data validation for new values to confirm to rules such as acceptable string length, data types or uniqueness
- Administración de citas médicas: Permite la creación, edición y cancelación de citas por parte de los médicos o administradores.

## Style Guidelines:

- Primary color: Corporate red (#E11D48) to convey seriousness and sophistication.
- Background color: Light gray (#F2F2F2) to create a clean and modern interface.
- Accent color: Soft pastel green (#C8E6C9) to indicate success and positive states.
- Body and headline font: 'Inter', sans-serif, for a modern, neutral, and easily readable style.
- Font Awesome or Bootstrap Icons for consistent and recognizable visual cues.
- Admin SB2-style layout with a dark gray sidebar and a light topbar for easy navigation.
- Subtle transitions and animations for interactive elements to improve user experience.