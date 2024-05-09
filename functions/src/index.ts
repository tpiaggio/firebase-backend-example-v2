import * as admin from "firebase-admin";
admin.initializeApp();

import * as onUserCreate from "./user/onUserCreate.function";
import * as onUserUpdate from "./user/onUserUpdate.function";
import * as onUserDelete from "./user/onUserDelete.function";

export {
  onUserUpdate,
  onUserDelete,
  onUserCreate,
};
