"use server"

import { registerUserService } from "@/lib/strapi";
import { SignupFormSchema, type FormState } from "@/validations/auth";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const cookieConfig = {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    httpOnly: true, // only accessible in the server side
    domain: process.env.HOST ?? 'localhost',
    secure: process.env.NODE_ENV === 'production', // use https for security
}

// use server is not display in the console because actions are run on the server
// actions are run on the server side
export async function registerUserAction(prevState: FormState , formData: FormData): Promise<FormState> {
    const fields = {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    // validations occur in the server side, in the backend
    const validatedFields = SignupFormSchema.safeParse(fields);

    if (!validatedFields.success) {
        const flattenedErrors = z.flattenError(validatedFields.error)

        console.log('Validation errors:', flattenedErrors.fieldErrors)

        return {
            success: false,
            message: "Validation errors",
            strapiErrors: null,
            zodErrors: flattenedErrors.fieldErrors,
            data: {
                // prev data of the state
                ...prevState.data,
                // new data of the state
                ...fields,
            }
        }
    }

    const response = await registerUserService(validatedFields.data)

    if (!response || response.error) {
        return {
            success: false,
            message: "Registration errors",
            strapiErrors: response.error,
            zodErrors: null,
            data: {
                // prev data of the state
                ...prevState.data,
                // new data of the state
                ...fields,
            }
        }
    }

    // JWT token is stored in a cookie
    const cookieStore = await cookies()
    cookieStore.set('jwt', response.jwt, cookieConfig)
    redirect('/dashboard')

    /*
    console.log('Registration successful')

    return {
        success: true,
        message: "Registration succesful",
        strapiErrors: null,
        zodErrors: null,
        data: {
            // prev data of the state
            ...prevState.data,
            // new data of the state
            ...fields,
        }
    }
    */
}