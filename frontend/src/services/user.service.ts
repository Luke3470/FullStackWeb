import { get,post } from './services.config.ts'
import { toast } from "vue-sonner"
import joi from "joi"

export async function logIn(body: any) {

    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const { error } = await schema.validate(body)
    if (error) {
        toast.error(error.message || "Input Data was Incorrect")
        return null
    }
    try {
        return await post('login', body)
    } catch (err: any) {
        console.error("Login failed:", err)
        const message = err?.response?.data?.error_message || err.message || "Unable to login."
        toast.error(message)
        return null
    }
}

export async function logOut(token: string) {
    try {
        return await post('logout',null,token)
    } catch (err: any) {
        console.error("Log Out failed:", err)
        const message = err?.response?.data?.error_message || err.message || "Unable to login."
        toast.error(message)
        return null
    }
}

export async function signUp(body: any) {
    const schema = joi.object({
        first_name: joi.string().required(),
        last_name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string()
            .min(8)
            .max(32)
            .pattern(/(?=.*[a-z])/)
            .pattern(/(?=.*[A-Z])/)
            .pattern(/(?=.*\d)/)
            .pattern(/(?=.*[!@#$%^&*])/)
            .required()
            .messages({
                'string.pattern.base':
                    'Password must include uppercase, lowercase, number, and special character (!@#$%^&*)',
                'string.empty': 'Password cannot be empty',
                'string.min': 'Password must be at least 8 characters long',
                'string.max': 'Password cannot exceed 32 characters',
                'any.required': 'Password is required'
            })
    });

    const {error} = await schema.validate(body);

    if (error) {
        toast.error(error.message || "Input Data was Incorrect")
        return null
    }

    try {
        return await post('users',body,null)
    } catch (err: any) {
        console.error("Sign In failed:", err)
        const message = err?.response?.data?.error_message || err.message || "Unable to login."
        toast.error(message)
        return null
    }
}

export async function getUserDetails(userId: string) {
    const url = 'users/'+userId
    return await get(url)
}

export async function getUserQuestions(userId: string) {
    const url = 'question/'+userId
    return await get(url)
}
