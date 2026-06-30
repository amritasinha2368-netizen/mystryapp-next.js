import axios from 'axios';
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    // Check if EmailJS is not configured or uses placeholders
    const isNotConfigured = 
      !serviceId || !templateId || !publicKey || !privateKey ||
      serviceId.startsWith('your_') || templateId.startsWith('your_') ||
      publicKey.startsWith('your_') || privateKey.startsWith('your_');

    if (isNotConfigured) {
      console.log('\n==================================================');
      console.log(`[DEV MODE] Verification code for @${username} (${email}):`);
      console.log(`🔑 OTP CODE: ${verifyCode}`);
      console.log('==================================================\n');
      return { success: true, message: 'Verification code simulated (check your VS Code terminal).' };
    }

    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        to_email: email,
        username: username,
        otp: verifyCode,
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 200) {
      return { success: true, message: 'Verification email sent successfully.' };
    } else {
      console.warn('EmailJS response error status:', response.status, response.data);
    }
  } catch (emailError: any) {
    console.error('EmailJS sending failed:', emailError?.response?.data || emailError.message || emailError);
  }

  // Fallback to console if real dispatch fails
  console.log('\n==================================================');
  console.log(`[FALLBACK] EmailJS failed. Code for @${username} (${email}):`);
  console.log(`🔑 OTP CODE: ${verifyCode}`);
  console.log('==================================================\n');
  return { success: true, message: 'EmailJS failed. Verification code printed to VS Code terminal.' };
}
