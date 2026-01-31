/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accessCodes from "../accessCodes.js";
import type * as adminAuth from "../adminAuth.js";
import type * as clearDemoCodes from "../clearDemoCodes.js";
import type * as http from "../http.js";
import type * as menuItems from "../menuItems.js";
import type * as orders from "../orders.js";
import type * as roles from "../roles.js";
import type * as seedAccessCodes from "../seedAccessCodes.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessCodes: typeof accessCodes;
  adminAuth: typeof adminAuth;
  clearDemoCodes: typeof clearDemoCodes;
  http: typeof http;
  menuItems: typeof menuItems;
  orders: typeof orders;
  roles: typeof roles;
  seedAccessCodes: typeof seedAccessCodes;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
