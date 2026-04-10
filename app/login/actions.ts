'use server'

import { signIn } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  await signIn('credentials', {
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: '/',
  })
}
