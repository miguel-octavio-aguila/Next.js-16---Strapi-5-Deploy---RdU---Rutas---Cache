// frontend/lib/strapi.ts

import qs from "qs";
// 1. ELIMINA las importaciones de 'next/cache'
// import { cacheLife } from 'next/cache';

// 2. AÑADE la importación de 'cache' de 'react'
import { cache } from "react";

export const STRAPI_BASE_URL =
    process.env.STRAPI_BASE_URL || "http://127.0.0.1:1337";

const QUERY_HOME_PAGE = {
    populate: {
        sections: {
        on: {
            "layout.hero-section": {
            populate: {
                image: {
                fields: ["url", "alternativeText"],
                },
                link: {
                populate: true,
                },
            },
            },
        },
        },
    },
};

// 3. ENVUELVE tu función 'getHomePage' con la función 'cache()'
export const getHomePage = cache(async () => {
  // 4. ELIMINA las directivas experimentales
  // 'use cache'
  // cacheLife({ expire: 60}); // 1 minute

    const query = qs.stringify(QUERY_HOME_PAGE);
    const response = await getStrapiData(`/api/home-page?${query}`);
    return response?.data;
});

export async function getStrapiData(url: string) {
    try {
        const fullUrl = `${STRAPI_BASE_URL}${url}`;
        console.log('Fetching:', fullUrl);
        
        const response = await fetch(fullUrl, {
            next: { revalidate: 60 } // Cache por 60 segundos
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data from Strapi:", error);
        // Retorna un objeto vacío en lugar de lanzar error
        return { data: null };
    }
}

export async function registerUserService(userData: object) {
    const url = `${STRAPI_BASE_URL}/api/auth/local/register`;

    try {
        const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        });

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}