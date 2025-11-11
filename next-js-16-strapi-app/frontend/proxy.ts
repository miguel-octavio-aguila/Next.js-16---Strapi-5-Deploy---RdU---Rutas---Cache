import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { STRAPI_BASE_URL } from "./lib/strapi"

const protectedRoutes = ['/dashboard']

function cheskIsProtectedRoute(pathname: string) {
    // .some is used to check if any of the protected routes starts with the pathname
    // (route => pathname.startsWith(route)) is a callback function that checks if the pathname starts with the route
    return protectedRoutes.some(route => pathname.startsWith(route))
    // you can also use 'return protectedRoutes.includes(pathname)' for a single path check
}

export async function proxy(request: NextRequest) {
    const currentPath = request.nextUrl.pathname

    const isProtectedRoute = cheskIsProtectedRoute(currentPath)

    // NextResponse.next() is used to continue the request and return the response
    // so this is used to continue the request if the route is not protected
    if (!isProtectedRoute) return NextResponse.next()

    // if the route is protected, we need to verify is the user is authenticated
    try {
        const cookieStore = await cookies()
        const jwt = cookieStore.get('jwt')?.value

        if (!jwt) {
            // if the user is not authenticated, we need to redirect to the login page
            return NextResponse.redirect(new URL('/signin', request.url))
        }

        const response = await fetch(`${STRAPI_BASE_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            }
        })
        const userResponse = await response.json()
        console.log(userResponse);
        
        if (!userResponse) {
            // if the user is not authenticated, we need to redirect to the login page
            return NextResponse.redirect(new URL('/signin', request.url))
        }

        // if the user is authenticated, we need to continue the request
        return NextResponse.next()

    } catch (error) {
        console.log('Error verifying user authentication:', error)
        // if the user is not authenticated, we need to redirect to the login page
        return NextResponse.redirect(new URL('/signin', request.url))
    }
}

// this is used to match all routes except the ones that start with api, _next/static, _next/image, and favicon.ico
// and also the dashboard route and all routes that start with /dashboard
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)", // to match all routes except the ones that start with api, _next/static, _next/image, and favicon.ico
        "/dashboard", // to match the dashboard route
        "/dashboard/:path*" // to match all routes that start with /dashboard
    ]
}