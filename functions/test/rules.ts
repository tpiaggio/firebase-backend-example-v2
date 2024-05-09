import {readFileSync} from "fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {doc, setDoc, updateDoc} from "firebase/firestore";
import "mocha";

let testEnv: RulesTestEnvironment;
before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "fir-workshop-8801d",
    firestore: {
      host: "localhost",
      port: 8080,
      rules: readFileSync("../firestore.rules", "utf8"),
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

describe("Users", () => {
  it("should allow the user to set a username ONLY if it doesn't exist and it's valid", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();

    // Setup: Create documents in DB for testing (bypassing Security Rules).
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "users/alice"), {username: "alice"});
      await setDoc(doc(db, "usernames/alice"), {userId: "alice"});
      await setDoc(doc(db, "users/bernard"), {username: "bernard"});
      await setDoc(doc(db, "usernames/bernard"), {userId: "bernard"});
    });

    // Can update since username didn't change
    await assertSucceeds(
      updateDoc(doc(aliceDb, "users/alice"), {
        username: "alice",
      })
    );

    // Can set username since "newAlice" doesn't exist
    await assertSucceeds(
      updateDoc(doc(aliceDb, "users/alice"), {
        username: "newAlice",
      })
    );

    // Can't set username since empty is not valid
    await assertFails(
      updateDoc(doc(aliceDb, "users/alice"), {
        username: "",
      })
    );

    // Can't set username since the minimum is 4 characters
    await assertFails(
      updateDoc(doc(aliceDb, "users/alice"), {
        username: "bob",
      })
    );

    // Can't set username since u$er_na.me is not valid
    await assertFails(
      updateDoc(doc(aliceDb, "users/alice"), {
        username: "u$er_na.me",
      })
    );

    // Can't set username since "bernard" already exists
    await assertFails(
      updateDoc(doc(aliceDb, "users/alice"), {
        username: "bernard",
      })
    );

    // Can't set username since "Bernard" already exists (case sensitive)
    await assertFails(
      updateDoc(doc(aliceDb, "users/alice"), {
        username: "Bernard",
      })
    );
  });
});
