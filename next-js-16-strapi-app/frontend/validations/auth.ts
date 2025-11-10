import { z } from "zod";

export const SigninFormSchema = z.object({
    identifier: z
        .string()
        .min(3, "Username or email must be at least 3 characters long"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password must be less than 100 characters long"),
});

export const SignupFormSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username must be less than 20 characters long"),
    email: z
        .email("Email must be a valid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password must be less than 100 characters long"),
});

export type SigninFormValues = z.infer<typeof SigninFormSchema>;
export type SignupFormValues = z.infer<typeof SignupFormSchema>;

export type FormState = {
    success?: boolean;
    message?: string;
    data?: {
        identifier?: string;
        password?: string;
        username?: string;
        email?: string;    
    };
    // stapiErrors and zodErrors is for education content but in a real project you should name them
    // in a different way to avoid clues about what you are using in the frontend
    strapiErrors?: {
        status: number;
        name: string;
        message: string;
        details?: Record<string, string[]>;
    } | null;
    zodErrors?: {
        identifier?: string[];
        password?: string[];
        username?: string[];
        email?: string[];
    } | null;
}