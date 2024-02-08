import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
	const {
		url,
		locals: { supabase }
	} = event;
	const code = url.searchParams.get('code') as string;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
        const session = await event.locals.getSession()
        if (session) {
            let { data: member, error } = await supabase
                .from('members')
                .select('*')
                .eq('email', session.user.email)
                .single();

            if (!member) {
                const { data, error } = await supabase
                    .from('members')
                    .insert([
                        {
                            email: session.user.email,
                            name: session.user.user_metadata.full_name,
                            avatar: session.user.user_metadata.avatar_url,
                        }
                    ]);
                console.log(data, error)
            }
        }
        throw redirect(303, `/account/dashboard`);
    }
  }

  // return the user to an error page with instructions
  throw redirect(303, '/auth/auth-code-error');
};