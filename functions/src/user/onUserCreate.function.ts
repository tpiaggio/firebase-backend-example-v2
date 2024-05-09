import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {getFirestore} from "firebase-admin/firestore";
import {User} from "../common/utils";

export default onDocumentCreated("users/{userId}", (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  const createdValue = snapshot.data() as User;

  return getFirestore()
    .collection("usernames")
    .doc(createdValue.username)
    .set({userId: snapshot.id});
});
