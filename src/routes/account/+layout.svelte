<script lang='ts'>
    import { onMount } from "svelte";
    import { goto, invalidate } from '$app/navigation'

    
	export let data
    let { supabase, session } = data
    $: ({ supabase, session } = data)

    onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth')
			}
		})
		return () => data.subscription.unsubscribe()
	})

    async function logout() {
        const { error } = await supabase.auth.signOut()
        if (!error) {
            goto('/')
        }
    }
</script>

<button on:click={logout}>Logout</button>
<slot />
