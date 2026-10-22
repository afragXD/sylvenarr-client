import { z } from 'zod';

export const signInSchema = z.object({
	loginOrEmail: z.string().trim().min(1, 'Укажите логин или почту'),
	password: z.string().min(1, 'Укажите пароль'),
});

export type SignInValues = z.infer<typeof signInSchema>;
