import { redirect } from "@sveltejs/kit";
import { SITE_URL } from "$env/static/private";

const getURL = () => {
    let url = SITE_URL ?? 'http://localhost:5173/'
    url = url.includes('http') ? url : `https://${url}`
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
    return url
}

export const actions = {
	login: async (event) => {
		const { data, error } = await event.locals.supabase.auth.signInWithOAuth({
			provider: 'google',
            options: {
                redirectTo: `${getURL()}auth/callback`
            }
		});
        if (data.url) {
            throw redirect(303, data.url);
        }
		if (error) {
			throw error;
		}
	}
}