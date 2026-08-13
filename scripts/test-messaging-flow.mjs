/**
 * End-to-end messaging flow against a running API (npm run dev).
 * Creates isolated users so existing data is not modified.
 */
const BASE = process.env.API_BASE || "http://localhost:3000/api";
const stamp = Date.now();
const password = "TestPass123!";

function cookieHeader(res) {
  const fromList = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  if (fromList.length) return fromList.map((c) => c.split(";")[0]).join("; ");
  const raw = res.headers.get("set-cookie");
  if (!raw) return "";
  return raw.split(/,(?=\s*[A-Za-z0-9_]+=)/).map((c) => c.split(";")[0].trim()).join("; ");
}

async function req(path, { method = "GET", body, cookie, expectStatus } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (expectStatus && res.status !== expectStatus) {
    throw new Error(
      `${method} ${path} expected ${expectStatus} got ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return { status: res.status, data, cookie: cookieHeader(res) };
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function main() {
  const results = [];
  const pass = (name) => {
    results.push(`PASS ${name}`);
    console.log(`PASS ${name}`);
  };

  const bizEmail = `biz.msg.${stamp}@khorlo.test`;
  const infEmail = `inf.msg.${stamp}@khorlo.test`;
  const extraBizEmail = `biz2.msg.${stamp}@khorlo.test`;
  const extraInfEmail = `inf2.msg.${stamp}@khorlo.test`;

  const bizReg = await req("/auth/register", {
    method: "POST",
    body: { name: "Msg Business", email: bizEmail, password, role: "BUSINESS" },
    expectStatus: 201,
  });
  let bizCookie = bizReg.cookie;
  const bizUser = bizReg.data.user;
  pass("1. Create Business account");

  const infReg = await req("/auth/register", {
    method: "POST",
    body: { name: "Tenzin Choten", email: infEmail, password, role: "INFLUENCER" },
    expectStatus: 201,
  });
  let infCookie = infReg.cookie;
  const infUser = infReg.data.user;
  pass("2. Create Influencer account");

  const extraBiz = await req("/auth/register", {
    method: "POST",
    body: { name: "Other Business", email: extraBizEmail, password, role: "BUSINESS" },
    expectStatus: 201,
  });

  const extraInf = await req("/auth/register", {
    method: "POST",
    body: { name: "Other Creator", email: extraInfEmail, password, role: "INFLUENCER" },
    expectStatus: 201,
  });

  const campaignRes = await req("/campaigns", {
    method: "POST",
    cookie: bizCookie,
    body: {
      title: "Tibetan Restaurant Campaign",
      description: "Food content partnership",
      compensationType: "PAID",
      status: "OPEN",
      creatorSlots: 2,
    },
    expectStatus: 201,
  });
  const campaignId = campaignRes.data.campaign.id;
  pass("3. Business creates Campaign");

  const applyPending = await req("/applications", {
    method: "POST",
    cookie: infCookie,
    body: { campaignId, coverLetter: "I would love to collaborate." },
    expectStatus: 201,
  });
  const applicationId = applyPending.data.application.id;
  pass("4. Influencer applies");

  const beforeAccept = await req("/conversations", { cookie: infCookie, expectStatus: 200 });
  assert(
    (beforeAccept.data.conversations || []).every((c) => c.applicationId !== applicationId),
    "Pending application should not have a conversation"
  );
  pass("23. Pending application cannot send messages (no conversation yet)");

  const viewApp = await req(`/applications/${applicationId}`, {
    cookie: bizCookie,
    expectStatus: 200,
  });
  assert(viewApp.data.application.status === "PENDING", "Application should be pending");
  pass("5. Business views application");

  const acceptRes = await req(`/applications/${applicationId}/status`, {
    method: "PATCH",
    cookie: bizCookie,
    body: { status: "ACCEPTED" },
    expectStatus: 200,
  });
  const conversationId = acceptRes.data.application.conversationId;
  assert(conversationId, "Acceptance must create/return conversationId");
  pass("6. Business accepts application");
  pass("7. Conversation is automatically created");

  const acceptAgain = await req(`/applications/${applicationId}/status`, {
    method: "PATCH",
    cookie: bizCookie,
    body: { status: "ACCEPTED" },
  });
  assert(acceptAgain.status === 409, "Second accept must not create another conversation");
  pass("25. Existing conversation cannot be duplicated");

  const bizConv = await req(`/conversations/${conversationId}`, {
    cookie: bizCookie,
    expectStatus: 200,
  });
  assert(bizConv.data.conversation.otherParticipant.type === "INFLUENCER", "Business should see influencer");
  pass("8. Business opens conversation");

  const sendBiz = await req(`/conversations/${conversationId}/messages`, {
    method: "POST",
    cookie: bizCookie,
    body: { message: "Sounds good, I'll send it tomorrow.", senderId: infUser.id },
    expectStatus: 201,
  });
  assert(sendBiz.data.message.senderId === bizUser.id, "senderId must be authenticated business, not spoofed");
  pass("9. Business sends message");
  pass("21. Sender cannot spoof another senderId");

  const infInbox = await req("/conversations", { cookie: infCookie, expectStatus: 200 });
  const infItem = infInbox.data.conversations.find((c) => c.conversationId === conversationId);
  assert(infItem, "Influencer should see the conversation");
  assert(infItem.otherParticipant.type === "BUSINESS", "Influencer should see business as other participant");
  assert(infItem.unreadCount >= 1, "Influencer unread count should include the new message");
  pass("10. Influencer receives message");
  pass("17. Unread count updates correctly");

  const infNotes = await req("/notifications?type=MESSAGE", { cookie: infCookie, expectStatus: 200 });
  assert((infNotes.data.notifications || []).length >= 1, "Influencer should have a MESSAGE notification");
  pass("11. Influencer receives notification");

  const infMessages = await req(`/conversations/${conversationId}/messages`, {
    cookie: infCookie,
    expectStatus: 200,
  });
  assert(infMessages.data.messages.length >= 1, "Influencer should see business message");
  const afterReadInbox = await req("/conversations", { cookie: infCookie, expectStatus: 200 });
  const afterReadItem = afterReadInbox.data.conversations.find((c) => c.conversationId === conversationId);
  assert(afterReadItem.unreadCount === 0, "Opening conversation should mark received messages as read");
  pass("16. Read status updates correctly");

  const sendInf = await req(`/conversations/${conversationId}/messages`, {
    method: "POST",
    cookie: infCookie,
    body: { message: "Perfect, I'll wait for the brief." },
    expectStatus: 201,
  });
  assert(sendInf.data.message.senderId === infUser.id, "Influencer senderId must be authenticated user");
  pass("12. Influencer replies");

  const bizMessages = await req(`/conversations/${conversationId}/messages`, {
    cookie: bizCookie,
    expectStatus: 200,
  });
  assert(
    bizMessages.data.messages.some((m) => m.id === sendInf.data.message.id),
    "Business should see influencer reply"
  );
  pass("13. Business receives message");
  pass("15. Messages display correctly on both sides");

  const bizNotes = await req("/notifications?type=MESSAGE", { cookie: bizCookie, expectStatus: 200 });
  assert((bizNotes.data.notifications || []).length >= 1, "Business should have a MESSAGE notification");
  pass("14. Business receives notification");

  await req(`/conversations/${conversationId}`, { expectStatus: 401 });
  pass("18. Unauthorized user cannot access conversation");

  const extraBizGet = await req(`/conversations/${conversationId}`, { cookie: extraBiz.cookie });
  assert(extraBizGet.status === 403, "Unrelated business must get 403");
  pass("19. Unrelated Business cannot access conversation");

  const extraInfGet = await req(`/conversations/${conversationId}/messages`, { cookie: extraInf.cookie });
  assert(extraInfGet.status === 403, "Unrelated influencer must get 403");
  pass("20. Unrelated Influencer cannot access conversation");

  const rejectApply = await req("/applications", {
    method: "POST",
    cookie: extraInf.cookie,
    body: { campaignId, coverLetter: "Second applicant" },
    expectStatus: 201,
  });
  await req(`/applications/${rejectApply.data.application.id}/status`, {
    method: "PATCH",
    cookie: bizCookie,
    body: { status: "REJECTED" },
    expectStatus: 200,
  });
  const extraInfConvos = await req("/conversations", { cookie: extraInf.cookie, expectStatus: 200 });
  assert(
    !(extraInfConvos.data.conversations || []).some(
      (c) => c.applicationId === rejectApply.data.application.id
    ),
    "Rejected application must not create a conversation"
  );
  pass("22. Rejected application cannot send messages");

  const acceptedSend = await req(`/conversations/${conversationId}/messages`, {
    method: "POST",
    cookie: bizCookie,
    body: { message: "Thanks!" },
    expectStatus: 201,
  });
  assert(acceptedSend.data.message.id, "Accepted application can still send");
  pass("24. Accepted application can send messages");

  console.log(`\n${results.length} checks passed.`);
}

main().catch((err) => {
  console.error("FAIL", err.message);
  process.exit(1);
});
