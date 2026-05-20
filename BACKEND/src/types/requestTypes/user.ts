import { z } from 'zod'
import { AccountType, Gender } from '../../../generated/prisma/enums.js'

export const SignupSchema = z.object({
    name: z.string().trim(),
    email: z.email().trim(),
    accountType: z.nativeEnum(AccountType).default("STUDENT"),
    password: z.string().trim().min(8),
})

export const LoginSchema = z.object({
    email: z.email().trim(),
    password: z.string().trim().min(8),
})

export const OTPSchema = z.object({
    otp: z.string().trim().length(6),
    email: z.email().trim()
})


export const ProfileSchema = z.object({
    gender: z.nativeEnum(Gender).optional(),
    dob: z.date().optional(),
    about: z.string().trim().optional(),
    phoneNumber: z.string().trim().optional(),
    collegeName: z.string().trim().optional()
})