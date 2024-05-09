import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {getFirestore} from "firebase-admin/firestore";
import {User} from "../common/utils";

const db = getFirestore();

export default onDocumentUpdated("users/{userId}", (event) => {
  const newValue = event.data?.after.data() as User;
  const previousValue = event.data?.before.data() as User;

  // We'll only update if the username has changed.
  if (newValue.username == previousValue.username) {
    return null;
  }

  const {userId} = event.params;
  const batch = db.batch();
  if (previousValue.username) {
    batch.delete(db.collection("usernames").doc(previousValue.username));
  }
  batch.set(db.collection("usernames").doc(newValue.username), {userId});
  return batch.commit();
});
