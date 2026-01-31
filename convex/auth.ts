
// Simple auth - no JWT needed
// Authentication is handled via access codes in accessCodes.ts

import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Get the userId from the session, if present.
 * Looks for ctx.session.userId or ctx.sessionId, or returns null if not found.
 * Works for both QueryCtx and MutationCtx.
 */
export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
	// Convex best practice: sessionId is usually passed in args or set in ctx.session
	// Here, we check for sessionId in ctx.args or ctx.session
	// You may need to adapt this to your actual session management logic
	if (ctx.session && ctx.session.userId) {
		return ctx.session.userId;
	}
	// If you store sessionId in args, you can look it up here
	if (ctx.args && ctx.args.sessionId) {
		// You may want to fetch the session from DB here
		// For now, just return the sessionId as userId (for demo)
		return ctx.args.sessionId;
	}
	return null;
}
