// Plain browser JavaScript. All server data is written with textContent, never innerHTML.
const API = "/api/v1";
const PAGE_SIZE = 5;

const state = {
  token: null,
  user: null,
  editingNoteId: null,
  editingUserId: null,
  postsUserId: null,
  pages: { notes: 1, userPosts: 1, users: 1, allNotes: 1, groups: 1 },
  totals: { notes: 0, userPosts: 0, users: 0, allNotes: 0, groups: 0 },
};

const $ = (id) => document.getElementById(id);

// Keeps the login between page loads in this browser only. The server still verifies every request.
const readToken = () => {
  try { return localStorage.getItem("notepulse_token"); } catch (e) { return null; }
};
const writeToken = (token) => {
  try {
    if (token) localStorage.setItem("notepulse_token", token);
    else localStorage.removeItem("notepulse_token");
  } catch (e) { /* storage blocked: session lasts for this page only */ }
};

const showMessage = (text, isError = false) => {
  const el = $("global-msg");
  el.textContent = text;
  el.className = "msg " + (isError ? "error" : "ok");
};

async function api(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  if (state.token) headers.Authorization = "Bearer " + state.token;

  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const details = (json.errorMessages || []).map((e) => e.message).join("; ");
    throw new Error(details || json.message || "Request failed (" + res.status + ")");
  }
  return json;
}

// Small DOM helper: text is always set with textContent
function h(tag, text, children = []) {
  const el = document.createElement(tag);
  if (text !== undefined && text !== null) el.textContent = text;
  children.forEach((child) => el.appendChild(child));
  return el;
}

function button(label, onClick) {
  const b = h("button", label);
  b.type = "button";
  b.addEventListener("click", onClick);
  return b;
}

function itemBox(children) {
  const box = h("div", null, children);
  box.className = "item";
  return box;
}

function renderList(container, items, renderItem, emptyText) {
  container.replaceChildren();
  if (!items || items.length === 0) {
    container.appendChild(h("p", emptyText));
    return;
  }
  items.forEach((item) => container.appendChild(renderItem(item)));
}

// Prev/Next controls for one list. key matches state.pages and state.totals.
function renderPager(key, loader) {
  const pager = document.querySelector('[data-pager="' + key + '"]');
  const totalPages = Math.max(1, Math.ceil(state.totals[key] / PAGE_SIZE));
  pager.replaceChildren(
    button("Prev", () => {
      if (state.pages[key] > 1) { state.pages[key]--; loader(); }
    }),
    h("span", "Page " + state.pages[key] + " of " + totalPages + " (" + state.totals[key] + " total)"),
    button("Next", () => {
      if (state.pages[key] < totalPages) { state.pages[key]++; loader(); }
    })
  );
}

const pageQuery = (key) => "?page=" + state.pages[key] + "&limit=" + PAGE_SIZE;
const parseInterests = (text) => (text || "").split(",").map((s) => s.trim()).filter(Boolean);
const formatDate = (value) => new Date(value).toLocaleString();

// ---------- Session ----------

function applySession() {
  const loggedIn = Boolean(state.user);
  $("auth-section").hidden = loggedIn;
  $("app-section").hidden = !loggedIn;
  $("logout-btn").hidden = !loggedIn;
  $("admin-section").hidden = !(loggedIn && state.user.role === "admin");
  $("who").textContent = loggedIn ? state.user.name + " (" + state.user.role + ")" : "";
}

function startSession(token, user) {
  state.token = token;
  state.user = user;
  writeToken(token);
  applySession();
  loadNotes();
  loadUserPosts();
  if (user.role === "admin") loadAdminViews();
}

function logout() {
  state.token = null;
  state.user = null;
  writeToken(null);
  applySession();
  showMessage("Logged out");
}

async function restoreSession() {
  const token = readToken();
  if (!token) return applySession();
  state.token = token;
  try {
    const me = await api("GET", "/auth/me");
    startSession(token, me.result);
  } catch (err) {
    state.token = null;
    writeToken(null);
    applySession();
  }
}

// ---------- Login and register ----------

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const res = await api("POST", "/auth/login", {
      email: form.get("email"),
      password: form.get("password"),
    });
    e.target.reset();
    startSession(res.result.token, res.result.user);
    showMessage("Logged in");
  } catch (err) {
    showMessage(err.message, true);
  }
});

$("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const res = await api("POST", "/auth/register", {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      interests: parseInterests(form.get("interests")),
    });
    e.target.reset();
    startSession(res.result.token, res.result.user);
    showMessage("Account created");
  } catch (err) {
    showMessage(err.message, true);
  }
});

$("logout-btn").addEventListener("click", logout);

// ---------- My notes ----------

function resetNoteForm() {
  state.editingNoteId = null;
  $("note-form").reset();
  $("note-save").textContent = "Create note";
  $("note-cancel").hidden = true;
}

$("note-cancel").addEventListener("click", resetNoteForm);

$("note-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const body = { title: form.get("title"), content: form.get("content") };
  try {
    if (state.editingNoteId) {
      await api("PATCH", "/notes/" + state.editingNoteId, body);
      showMessage("Note updated");
    } else {
      await api("POST", "/notes", body);
      showMessage("Note created");
    }
    resetNoteForm();
    loadNotes();
  } catch (err) {
    showMessage(err.message, true);
  }
});

function noteItem(note) {
  const edit = button("Edit", () => {
    state.editingNoteId = note._id;
    $("note-form").elements.title.value = note.title;
    $("note-form").elements.content.value = note.content || "";
    $("note-save").textContent = "Save changes";
    $("note-cancel").hidden = false;
  });
  const del = button("Delete", async () => {
    if (!confirm("Delete this note?")) return;
    try {
      await api("DELETE", "/notes/" + note._id);
      showMessage("Note deleted");
      loadNotes();
    } catch (err) { showMessage(err.message, true); }
  });
  return itemBox([
    h("strong", note.title),
    h("p", note.content || ""),
    h("small", "Updated " + formatDate(note.updatedAt)),
    h("div", null, [edit, del]),
  ]);
}

async function loadNotes() {
  if (!state.user) return;
  try {
    const res = await api("GET", "/notes" + pageQuery("notes"));
    state.totals.notes = res.meta.total;
    renderList($("notes"), res.result, noteItem, "No notes yet.");
    renderPager("notes", loadNotes);
  } catch (err) { showMessage(err.message, true); }
}

// ---------- Posts ----------

$("post-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api("POST", "/posts", { title: form.get("title"), body: form.get("body") });
    e.target.reset();
    showMessage("Post published");
    if (state.postsUserId === state.user._id) loadUserPosts();
  } catch (err) {
    showMessage(err.message, true);
  }
});

$("user-posts-form").addEventListener("submit", (e) => {
  e.preventDefault();
  state.postsUserId = new FormData(e.target).get("userId").trim();
  state.pages.userPosts = 1;
  loadUserPosts();
});

function postItem(post) {
  return itemBox([
    h("strong", post.title),
    h("p", post.body),
    h("small", "by " + (post.author || "unknown") + " on " + formatDate(post.createdAt)),
  ]);
}

async function loadUserPosts() {
  if (!state.postsUserId) return;
  try {
    const res = await api("GET", "/posts/user/" + encodeURIComponent(state.postsUserId) + pageQuery("userPosts"));
    state.totals.userPosts = res.meta.total;
    renderList($("user-posts"), res.result, postItem, "This user has no posts.");
    renderPager("userPosts", loadUserPosts);
  } catch (err) {
    $("user-posts").replaceChildren();
    showMessage(err.message, true);
  }
}

// ---------- Admin: users ----------

function resetUserForm() {
  state.editingUserId = null;
  $("user-form").reset();
  $("user-form").elements.password.placeholder = "Password (required for new user)";
  $("user-save").textContent = "Create user";
  $("user-cancel").hidden = true;
}

$("user-cancel").addEventListener("click", resetUserForm);

$("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const interests = parseInterests(form.get("interests"));
  try {
    if (state.editingUserId) {
      // On edit, send only fields that were filled in
      const body = {};
      ["name", "email", "password"].forEach((key) => {
        if (form.get(key)) body[key] = form.get(key);
      });
      body.role = form.get("role");
      if (form.get("interests")) body.interests = interests;
      await api("PATCH", "/users/" + state.editingUserId, body);
      showMessage("User updated");
    } else {
      await api("POST", "/users", {
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role"),
        interests,
      });
      showMessage("User created");
    }
    resetUserForm();
    loadUsers();
    loadGroups();
  } catch (err) {
    showMessage(err.message, true);
  }
});

function userItem(user) {
  const edit = button("Edit", () => {
    state.editingUserId = user._id;
    const f = $("user-form").elements;
    f.name.value = user.name;
    f.email.value = user.email;
    f.password.value = "";
    f.password.placeholder = "New password (leave blank to keep)";
    f.role.value = user.role;
    f.interests.value = (user.interests || []).join(", ");
    $("user-save").textContent = "Save changes";
    $("user-cancel").hidden = false;
  });
  const del = button("Delete", async () => {
    if (!confirm("Delete user " + user.email + "?")) return;
    try {
      await api("DELETE", "/users/" + user._id);
      showMessage("User deleted");
      loadUsers();
      loadGroups();
    } catch (err) { showMessage(err.message, true); }
  });
  return itemBox([
    h("strong", user.name + " (" + user.role + ")"),
    h("small", user.email + " · id " + user._id),
    h("p", "Interests: " + ((user.interests || []).join(", ") || "none")),
    h("div", null, [edit, del]),
  ]);
}

async function loadUsers() {
  try {
    const res = await api("GET", "/users" + pageQuery("users"));
    state.totals.users = res.meta.total;
    renderList($("users"), res.result, userItem, "No users.");
    renderPager("users", loadUsers);
  } catch (err) { showMessage(err.message, true); }
}

// ---------- Admin: all notes ----------

function adminNoteItem(note) {
  const owner = note.owner && note.owner.email ? note.owner.name + " <" + note.owner.email + ">" : "id " + note.owner;
  return itemBox([
    h("strong", note.title),
    h("p", note.content || ""),
    h("small", "Owner: " + owner + " · " + formatDate(note.createdAt)),
  ]);
}

async function loadAllNotes() {
  try {
    const res = await api("GET", "/notes/all" + pageQuery("allNotes"));
    state.totals.allNotes = res.meta.total;
    renderList($("all-notes"), res.result, adminNoteItem, "No notes.");
    renderPager("allNotes", loadAllNotes);
  } catch (err) { showMessage(err.message, true); }
}

// ---------- Admin: users grouped by interest ----------

function groupItem(group) {
  const names = group.users.map((u) => u.name).join(", ");
  return itemBox([
    h("strong", group.interest + " (" + group.count + ")"),
    h("p", names),
  ]);
}

async function loadGroups() {
  try {
    const res = await api("GET", "/users/interests" + pageQuery("groups"));
    state.totals.groups = res.meta.total;
    renderList($("groups"), res.result, groupItem, "No interests yet.");
    renderPager("groups", loadGroups);
  } catch (err) { showMessage(err.message, true); }
}

function loadAdminViews() {
  loadUsers();
  loadAllNotes();
  loadGroups();
}

// ---------- Start ----------
applySession();
restoreSession();
