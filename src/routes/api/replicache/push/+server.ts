import { json, type RequestHandler } from "@sveltejs/kit";
import type { PushRequestV1, MutationV1 } from "replicache";


export const POST: RequestHandler = async function ({request, locals}) {
    const push: PushRequestV1 = await request.json();

    const userId = locals?.user?.id;

    if(!userId) {
        return json({error: "Unauthenticated"}, {status: 401});
    }

    let errorMode = false;

    return await db.transaction(async(tx) => {
        let clientGroup = await tx
        .select()
        .from(replicache_client_group)
        .where(eq(replicache_client_group.id, push.clientGroupID))
        .then((rows) => rows[0]);

        if(!clientGroup) {
        clientGroup = {
            id: push.clientGroupID,
            user_id: userId
        }
        }
    });

}