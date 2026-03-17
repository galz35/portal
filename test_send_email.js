// Script de prueba de envío de correo usando las credenciales de Planer
const path = require('path');
// Importamos nodemailer desde la ruta de node_modules de Planer para no instalar nada extra
const nodemailerPath = 'D:\\planificacion\\v2sistema\\v2backend\\node_modules\\nodemailer';
const nodemailer = require(nodemailerPath);

async function sendTestEmail() {
  console.log('📬 Iniciando prueba de envío de correo...');
  
  // Configuración de transporte (Gmail SMTP)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: 'rrrhh1930@gmail.com',
      pass: 'cqvekscikoptijvq' // Password de aplicación
    }
  });

  const mailOptions = {
    from: '"Portal Central (Test)" <rrrhh1930@gmail.com>',
    to: 'gustavoadolfolira@gmail.com',
    subject: '🚀 Prueba de Activación de Cuenta - Portal Central 2026',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #004a99; text-align: center;">¡Bienvenido al Nuevo Portal Central!</h2>
        <p>Hola <strong>Gustavo Lira</strong>,</p>
        <p>Estamos configurando la migración del sistema <strong>Planer</strong> al nuevo ecosistema de aplicaciones.</p>
        <p>Este es un correo de prueba para validar el flujo de activación de tu cuenta centralizada.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://127.0.0.1:5173/auth/activate?token=TEST_TOKEN_123456" 
             style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
             Activar Mi Cuenta
          </a>
        </div>
        <p style="color: #666; font-size: 12px; text-align: center;">
          Tu contraseña temporal es: <strong>123456</strong><br>
          Se te pedirá cambiarla al hacer clic en el botón superior.
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #999; text-align: center;">
          Este mensaje fue generado automáticamente por el servicio de notificaciones de Planer V2.
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado con éxito!');
    console.log('🆔 ID del mensaje:', info.messageId);
    console.log('📧 Destinatario:', info.accepted);
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
  }
}

sendTestEmail();
