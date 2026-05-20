import jwt, { type Secret, type SignOptions, type JwtPayload } from 'jsonwebtoken'
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET as Secret
const JWT_EXPIRY = (process.env.JWT_EXPIRY || '7d') as SignOptions['expiresIn']

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
}

type Payload = { userId: number, userEmail: string }

export const signToken = (data: Payload) => {
    const options: SignOptions = {
        expiresIn: JWT_EXPIRY,
    }

    return jwt.sign(data, JWT_SECRET, options)
}

export const decodeToken = (token: string): Payload | undefined => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as string | JwtPayload | undefined

        if (!decoded || typeof decoded === 'string') return undefined

        // ensure required fields exist
        const { userId, userEmail } = decoded as Record<string, unknown>
        if (typeof userId !== 'number' && typeof userId !== 'string') return undefined
        if (typeof userEmail !== 'string') return undefined

        return { userId: Number(userId), userEmail }
    } catch {
        return undefined
    }
}
