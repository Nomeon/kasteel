// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createServerClient } from '@supabase/ssr'
import { redirect, type Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get: (key) => event.cookies.get(key),
            set: (key, value, options) => {
                event.cookies.set(key, value, options)
            },
            remove: (key, options) => {
                event.cookies.delete(key, options)
            }
        }
    })

    /**
     * a little helper that is written for convenience so that instead
     * of calling `const { data: { session } } = await supabase.auth.getSession()`
     * you just call this `await getSession()`
     */

    event.locals.getSession = async () => {
        let {
            data: { session },
        } = await event.locals.supabase.auth.getSession()

        // solving the case if the user was deleted from the database but the browser still has a cookie/loggedin user
        // +lauout.server.js will delete the cookie if the session is null
        const { data: getUserData, error: err }  = await event.locals.supabase.auth.getUser()
        if (getUserData.user == null) {
            session = null
        }

        return session
    }

    if (event.url.pathname.startsWith('/account')) {
        const session = await event.locals.getSession()
        if (!session) {
            throw redirect(303, '/login')
        }
    }

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range'
        },
    })
}