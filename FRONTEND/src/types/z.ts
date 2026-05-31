import { z } from 'zod'



export const AccountType = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR'
} as const

export type AccountType = (typeof AccountType)[keyof typeof AccountType]


export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
} as const

export type Gender = (typeof Gender)[keyof typeof Gender]


export const OTPType = {
  RESET: 'RESET',
  LOGIN: 'LOGIN'
} as const

export type OTPType = (typeof OTPType)[keyof typeof OTPType]


export const QuestionType = {
  MCQ: 'MCQ',
  NUMERICAL: 'NUMERICAL',
  WRITTEN: 'WRITTEN'
} as const

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType]


export const Status = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  UNLISTED: 'UNLISTED'
} as const

export type Status = (typeof Status)[keyof typeof Status]


export const PostStatus = {
  PUBLIC: 'PUBLIC',
  PROCESSING: 'PROCESSING',
  PRIVATE: 'PRIVATE'
} as const

export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus]


export const VoteType = {
  UP: 'UP',
  DOWN: 'DOWN'
} as const

export type VoteType = (typeof VoteType)[keyof typeof VoteType]


export const TestStatus = {
  LIVE: 'LIVE',
  DRAFT: 'DRAFT'
} as const

export type TestStatus = (typeof TestStatus)[keyof typeof TestStatus]


export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
} as const

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty]


export const SignupSchema = z.object({
  name: z.string().trim(),
  email: z.email().trim(),
  accountType: z.enum(AccountType).default("STUDENT"),
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


export const ChangePasswordSchema = z.object({
  prevPassword: z.string().trim().min(8),
  newPassword: z.string().trim().min(8),
})

export const ProfileSchema = z.object({
  name: z.string().trim(),
  gender: z.enum(Gender).optional(),
  dob: z.date().optional(),
  about: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  collegeName: z.string().trim().optional()
})

export const ResetPasswordRequestSchema = z.object({
  email: z.email().trim()
})

export const ResetPasswordSchema = z.object({
  token: z.string().trim(),
  password: z.string().trim().min(8),
  email: z.email().trim(),
  otp: z.string().trim().length(6)
})

export const CourseSchema = z.object({
  name: z.string().trim().nonempty(),
  description: z.string().trim(),
  outcomes: z.string().trim().array(),
  price: z.number().min(0).default(0),
  category: z.string().trim(),
  instructions: z.string().trim().array(),
  status: z.enum(Status),
  file: z.instanceof(File, { message: "Thumbnail image is required" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "Max file size is 5MB")
    .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), "Only .jpg and .png files are accepted")
})



export const SectionSchema = z.object({
  name: z.string().trim()
})

export const SubsectionSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim().optional(),
  videoUrl: z.url().trim().optional(),
  duration: z.number().optional(),
  points: z.number().optional()
})


export const ProgressSchema = z.object({
  watchTime: z.number(),
})

export const QuestionSchema = z.object({
  question: z.string().trim(),
  options: z.string().trim().array().length(4).optional(),
  correctOption: z.string().trim(),
  marks: z.number().optional(),
  type: z.enum(QuestionType)
})

export const QuestionSubmitSchema = z.object({
  answer: z.string().trim()
})


export const TestSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim().optional(),
  guidelines: z.string().trim().array(),
  timeline: z.number().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  status: z.enum(TestStatus)
})


export const TestSubmissionSchema = z.object({
  answers: z.object({
    questionId: z.number(),
    answer: z.string().trim()
  }).array()
})

export const ReviewSchema = z.object({
  review: z.string().trim(),
  rating: z.number().min(0).max(5)
})