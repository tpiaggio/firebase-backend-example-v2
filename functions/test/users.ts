import * as config from "firebase-functions-test";
import * as admin from "firebase-admin";
import {FeaturesList} from "firebase-functions-test/lib/features";
import "../src/index";
import * as onUserCreate from "../src/user/onUserCreate.function";
import * as onUserDelete from "../src/user/onUserDelete.function";
import * as onUserUpdate from "../src/user/onUserUpdate.function";
import {User} from "../src/common/utils";
import {expect} from "chai";
import "mocha";

let test: FeaturesList;
const userId = "user-1";
const previousUser: User = {
  email: "alice@gmail.com",
  username: "alice",
};
const updatedUser: User = {
  email: "alice@gmail.com",
  username: "bernard",
};

describe("users", () => {
  before(async () => {
    if (admin.apps.length == 0) admin.initializeApp();
    test = config(
      {projectId: "fir-workshop-8801d"},
      "./service-account-key.json"
    );
  });

  after(async () => {
    await admin.firestore().doc(`/users/${userId}`).delete();
    test.cleanup();
  });

  it("should add the username when the user gets created", async () => {
    const wrapped = test.wrap(onUserCreate.default);
    const usernameRef = admin.firestore().doc("/usernames/alice");

    const username = await usernameRef.get();
    expect(username.exists).to.be.false;

    const createSnap = test.firestore.makeDocumentSnapshot(
      {...previousUser},
      `users/${userId}`
    );

    await wrapped({data: createSnap, params: {userId}});

    const newUsername = await usernameRef.get();
    expect(newUsername.exists).to.be.true;
  }).timeout(10000);

  it("should delete the username when the user gets deleted", async () => {
    const wrapped = test.wrap(onUserDelete.default);
    const usernameRef = admin.firestore().doc("/usernames/alice");
    await usernameRef.set({userId});

    const deleteSnap = test.firestore.makeDocumentSnapshot(
      {...previousUser},
      `users/${userId}`
    );

    await wrapped({data: deleteSnap, params: {userId}});

    const oldUsername = await usernameRef.get();
    expect(oldUsername.exists).to.be.false;
  }).timeout(10000);

  it("should delete and add the usernames respectively when the username changes", async () => {
    const wrapped = test.wrap(onUserUpdate.default);
    const usernameRef = admin.firestore().doc("/usernames/alice");
    await usernameRef.set({userId});

    const beforeSnap = test.firestore.makeDocumentSnapshot(
      previousUser,
      `users/${userId}`
    );
    const afterSnap = test.firestore.makeDocumentSnapshot(
      updatedUser,
      `users/${userId}`
    );
    const change = test.makeChange(beforeSnap, afterSnap);

    await wrapped({data: change, params: {userId}});

    const deletedUsername = await usernameRef.get();
    expect(deletedUsername.exists).to.be.false;

    const newUsername = await admin.firestore().doc("/usernames/bernard").get();

    expect(newUsername.exists).to.be.true;
  }).timeout(10000);
});
