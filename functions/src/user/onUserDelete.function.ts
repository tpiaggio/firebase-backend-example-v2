import {onDocumentDeleted} from "firebase-functions/v2/firestore";
import {getFirestore} from "firebase-admin/firestore";
import {User} from "../common/utils";

export default onDocumentDeleted("users/{userId}", (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }

  const deletedValue = snapshot.data() as User;

  if (!deletedValue.username) {
    return null;
  }

  return getFirestore()
    .collection("usernames")
    .doc(deletedValue.username)
    .delete();
});
