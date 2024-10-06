import { z } from 'zod';

export const UserSchema = z.object({
  firstName: z
    .string()
    .regex(/^[A-Za-z]*$/, 'First name must contain only letters.'),
  lastName: z
    .string()
    .regex(/^[A-Za-z]*$/, 'Last name must contain only letters.'),
});
