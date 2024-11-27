import UserProfile from 'clerk-sveltekit/client/UserProfile.svelte';

export const ssr = false;

export const load: {props: { user: object}} = ({params}: {user: object}) => {
    return {
        props: {
            user: params.user
        }
    }
}