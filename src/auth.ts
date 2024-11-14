import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";
import {GITHUB_SECRET, GITHUB_ID, PROVIDERS} from "$env/static/private"

let authProviders = JSON.parse(PROVIDERS).map((p: string) => {
    switch(p) {
        case 'github':
            return GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET})
    }
})

export const { handle } = SvelteKitAuth({
    providers: authProviders,
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
            }
            return token;
        },
        async session({ session, token , user }) {
            session.access_token = token.accessToken
            return session
        }
    }
})