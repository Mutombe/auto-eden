import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, Plus, Shield, ShieldOff, Trash2, UserCheck, UserPlus, Users, UserX, XCircle } from "../../ui/icons";
import { resources } from "../lib/adminApi";
import { patchRows, prefetchList, prependRow, removeRows, replaceRow, tempId, useList, useOptimisticMutation } from "../lib/optimistic";
import { formatDate, timeAgo, useTableState } from "../lib/useTableState";
import { BulkBar, BulkButton, DataTable, Pagination, sk } from "../ui/DataTable";
import { ConfirmDialog, Modal } from "../ui/overlays";
import { Avatar, Button, Card, EmptyState, Field, Input, PageHeader, Pill, Tabs, Toggle } from "../ui/primitives";
import { ExportMenu, SearchInput, Toolbar } from "../ui/Toolbar";

const R = "users";
const TABS = [
  { value: "all", label: "All users", params: {} },
  { value: "staff", label: "Admins", params: { is_staff: "true" } },
  { value: "inactive", label: "Deactivated", params: { is_active: "false" } },
];
const fullName = (u) => [u.first_name, u.last_name].filter(Boolean).join(" ");

export default function UsersPage() {
  const me = useSelector((s) => s.auth.user);
  const [state, update] = useTableState({ tab: "all", ordering: "-date_joined" });
  const tab = TABS.find((t) => t.value === state.tab) || TABS[0];
  const paramsFor = (t, page) => ({ page, page_size: state.page_size, search: state.search, ordering: state.ordering, ...t.params });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const params = useMemo(() => paramsFor(tab, state.page), [state, tab]);
  const qc = useQueryClient();
  const prefetchTab = (value) => {
    const t = TABS.find((x) => x.value === value);
    if (t) prefetchList(qc, R, resources.users.list, paramsFor(t, 1));
  };
  const list = useList(R, resources.users.list, params);
  const rows = list.data?.results || [];
  const [selected, setSelected] = useState(new Set());
  const [form, setForm] = useState({ open: false, user: null });
  const [confirm, setConfirm] = useState(null);
  const clearSel = () => setSelected(new Set());

  const create = useOptimisticMutation({
    resource: R,
    mutationFn: ({ data }) => resources.users.create(data),
    apply: (qc, { data }, ctx) => {
      ctx.tempId = tempId();
      const { password, ...rest } = data;
      prependRow(qc, R, { ...rest, id: ctx.tempId, is_active: true, date_joined: new Date().toISOString(), vehicle_count: 0, bid_count: 0, __temp: true });
    },
    settle: (qc, user, _, ctx) => replaceRow(qc, R, ctx.tempId, user),
    success: (u) => `${u.username} created`,
    failure: ({ data }) => `Couldn't create ${data.username}`,
  });
  const save = useOptimisticMutation({
    resource: R,
    mutationFn: ({ id, data }) => resources.users.update(id, data),
    apply: (qc, { id, data }) => {
      const { password, ...rest } = data;
      patchRows(qc, R, [id], { ...rest, __pending: true });
    },
    settle: (qc, user) => replaceRow(qc, R, user.id, user),
    success: (_, { toastText }) => toastText || "User updated",
    failure: "Couldn't update user",
  });
  const bulkSave = useOptimisticMutation({
    resource: R,
    mutationFn: ({ ids, data }) => Promise.all(ids.map((id) => resources.users.update(id, data))),
    apply: (qc, { ids, data }) => patchRows(qc, R, ids, { ...data, __pending: true }),
    success: (_, { ids, data }) => `${ids.length} users ${data.is_active ? "activated" : "deactivated"}`,
    failure: "Bulk update failed",
  });
  const remove = useOptimisticMutation({
    resource: R,
    mutationFn: ({ ids }) => Promise.all(ids.map((id) => resources.users.remove(id))),
    apply: (qc, { ids }) => removeRows(qc, R, ids),
    success: (_, { ids }) => (ids.length > 1 ? `${ids.length} users deleted` : "User deleted"),
    failure: "Couldn't delete",
    also: ["vehicles", "bids"],
  });

  const isMe = (u) => u.id === me?.id;
  const setActive = (u, is_active) =>
    save.mutate({ id: u.id, data: { is_active }, toastText: `${u.username} ${is_active ? "activated" : "deactivated"}` });
  const setStaff = (u, is_staff) =>
    save.mutate({ id: u.id, data: { is_staff }, toastText: is_staff ? `${u.username} is now an admin` : `${u.username} is no longer an admin` });

  const columns = [
    {
      id: "user",
      skeleton: sk.person(30, 2),
      header: "User",
      sortKey: "username",
      cell: (u) => (
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <Avatar name={u.username} size={30} />
          <div className="leading-tight min-w-0">
            <div className="font-semibold text-gray-900 truncate max-w-[220px]">
              {u.username} {isMe(u) && <span className="text-[11px] font-medium text-gray-400">(you)</span>}
            </div>
            <div className="text-[12px] text-gray-500 truncate max-w-[240px]">{u.email || "—"}</div>
          </div>
        </div>
      ),
    },
    { id: "name", header: "Name", hideBelow: "xl", skeleton: sk.text("w-24"), cell: (u) => <span className="text-gray-700">{fullName(u) || "—"}</span> },
    { id: "phone", header: "Phone", hideBelow: "xl", skeleton: sk.text("w-20"), cell: (u) => <span className="text-gray-600">{u.phone || "—"}</span> },
    {
      id: "role",
      skeleton: sk.pill("w-20"),
      header: "Role",
      cell: (u) => (u.is_superuser ? <Pill tone="dark">Owner</Pill> : u.is_staff ? <Pill tone="violet">Admin</Pill> : <Pill tone="gray" dot={false}>Customer</Pill>),
    },
    { id: "vehicles", header: "Listings", sortKey: "vehicle_count", align: "right", skeleton: sk.num("w-6"), cell: (u) => <span className="tabular-nums">{u.vehicle_count ?? 0}</span> },
    { id: "bids", header: "Bids", sortKey: "bid_count", align: "right", hideBelow: "lg", skeleton: sk.num("w-6"), cell: (u) => <span className="tabular-nums">{u.bid_count ?? 0}</span> },
    { id: "joined", header: "Joined", sortKey: "date_joined", hideBelow: "lg", skeleton: sk.text("w-20"), cell: (u) => <span className="text-gray-500 whitespace-nowrap">{formatDate(u.date_joined)}</span> },
    { id: "login", header: "Last seen", sortKey: "last_login", hideBelow: "xl", skeleton: sk.text("w-14"), cell: (u) => <span className="text-gray-500 whitespace-nowrap">{timeAgo(u.last_login)}</span> },
    {
      id: "active",
      skeleton: sk.toggle(),
      header: "Active",
      cell: (u) => <Toggle checked={!!u.is_active} disabled={u.__temp || u.__pending || isMe(u) || u.is_superuser} onChange={(v) => setActive(u, v)} label="Active" />,
    },
  ];

  const exportColumns = [
    { id: "id", header: "ID" },
    { id: "username", header: "Username" },
    { id: "email", header: "Email" },
    { id: "first_name", header: "First name" },
    { id: "last_name", header: "Last name" },
    { id: "phone", header: "Phone" },
    { id: "role", header: "Role", exportValue: (u) => (u.is_superuser ? "Owner" : u.is_staff ? "Admin" : "Customer") },
    { id: "is_active", header: "Active", exportValue: (u) => (u.is_active ? "Yes" : "No") },
    { id: "vehicle_count", header: "Listings" },
    { id: "bid_count", header: "Bids" },
    { id: "date_joined", header: "Joined", exportValue: (u) => formatDate(u.date_joined, true) },
    { id: "last_login", header: "Last login", exportValue: (u) => (u.last_login ? formatDate(u.last_login, true) : "") },
  ];

  const rowMenu = (u) => [
    { label: "Edit", icon: Pencil, onClick: () => setForm({ open: true, user: u }) },
    { label: "Reset password", icon: KeyRound, onClick: () => setForm({ open: true, user: u, passwordOnly: true }) },
    { divider: true },
    !u.is_superuser && !isMe(u) && (u.is_staff
      ? { label: "Remove admin access", icon: ShieldOff, onClick: () => setStaff(u, false) }
      : { label: "Make admin", icon: Shield, onClick: () => setStaff(u, true) }),
    !u.is_superuser && !isMe(u) && (u.is_active
      ? { label: "Deactivate", icon: UserX, onClick: () => setActive(u, false) }
      : { label: "Activate", icon: UserCheck, onClick: () => setActive(u, true) }),
    !u.is_superuser && !isMe(u) && { divider: true },
    !u.is_superuser && !isMe(u) && { label: "Delete user", icon: Trash2, danger: true, onClick: () => setConfirm({ ids: [u.id], label: u.username, listings: u.vehicle_count }) },
  ];

  return (
    <>
      <PageHeader title="Users" subtitle={list.data ? `${list.data.count.toLocaleString()} accounts` : "Customers and staff"}>
        <ExportMenu listFn={resources.users.list} params={params} columns={exportColumns} filename="autoeden_users" selectedRows={rows.filter((r) => selected.has(r.id))} total={list.data?.count || 0} />
        <Button variant="primary" icon={Plus} onClick={() => setForm({ open: true, user: null })}>New user</Button>
      </PageHeader>
      <Card className="overflow-hidden">
        <div className="px-4 pt-1">
          <Tabs value={tab.value} onHover={prefetchTab} onChange={(value) => { clearSel(); update({ tab: value }); }} tabs={TABS.map((t) => ({ value: t.value, label: t.label }))} />
        </div>
        <Toolbar>
          <SearchInput value={state.search} onChange={(search) => update({ search })} placeholder="Search username, email, name, phone…" />
        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={list.isLoading}
          isFetching={list.isFetching}
          ordering={state.ordering}
          onSort={(ordering) => update({ ordering }, { resetPage: false })}
          selected={selected}
          onSelect={setSelected}
          onRowClick={(u) => setForm({ open: true, user: u })}
          rowMenu={rowMenu}
          mobileCard={(u) => (
            <div className="flex items-center gap-3">
              <Avatar name={u.username} size={36} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[14px] truncate">{u.username}</div>
                <div className="text-[12.5px] text-gray-500 truncate">{u.email}</div>
                <div className="flex gap-1.5 mt-1">
                  {u.is_superuser ? <Pill tone="dark">Owner</Pill> : u.is_staff ? <Pill tone="violet">Admin</Pill> : null}
                  {!u.is_active && <Pill tone="red">Deactivated</Pill>}
                  <span className="text-[12px] text-gray-500">{u.vehicle_count} listings</span>
                </div>
              </div>
            </div>
          )}
          empty={<EmptyState icon={list.isError ? XCircle : Users} title={list.isError ? "Couldn't load users" : "No users found"} action={list.isError ? <Button onClick={() => list.refetch()}>Retry</Button> : null} />}
        />
        {(list.data?.count ?? 0) > 0 && (
          <Pagination page={state.page} pageSize={state.page_size} count={list.data.count} totalPages={list.data.total_pages} onPage={(page) => { clearSel(); update({ page }, { resetPage: false }); }} onPageSize={(page_size) => update({ page_size })} />
        )}
      </Card>

      <BulkBar count={selected.size} onClear={clearSel}>
        <BulkButton icon={UserCheck} onClick={() => { bulkSave.mutate({ ids: [...selected].filter((id) => id !== me?.id), data: { is_active: true } }); clearSel(); }}>Activate</BulkButton>
        <BulkButton icon={UserX} onClick={() => { bulkSave.mutate({ ids: [...selected].filter((id) => id !== me?.id), data: { is_active: false } }); clearSel(); }}>Deactivate</BulkButton>
      </BulkBar>

      <UserForm
        state={form}
        onClose={() => setForm({ open: false, user: null })}
        onSubmit={(data) => {
          if (form.user) save.mutate({ id: form.user.id, data, toastText: data.password && Object.keys(data).length === 1 ? `Password reset for ${form.user.username}` : `${form.user.username} saved` });
          else create.mutate({ data });
        }}
        isSelf={form.user && isMe(form.user)}
      />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`Delete ${confirm?.label}?`}
        message={`This permanently deletes the account${confirm?.listings ? ` and its ${confirm.listings} vehicle listing${confirm.listings > 1 ? "s" : ""}` : ""}. Consider deactivating instead — it's reversible.`}
        onConfirm={() => remove.mutate({ ids: confirm.ids })}
      />
    </>
  );
}

function UserForm({ state, onClose, onSubmit, isSelf }) {
  const { open, user, passwordOnly } = state;
  const editing = !!user;
  const [f, setF] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setF({
      username: user?.username || "",
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      is_staff: !!user?.is_staff,
      is_active: user ? !!user.is_active : true,
      password: "",
    });
  }, [open, user]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e?.target ? e.target.value : e }));

  const submit = (e) => {
    e?.preventDefault();
    const er = {};
    if (!passwordOnly) {
      if (!f.username.trim()) er.username = "Required";
      if (!f.email.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) er.email = "Enter a valid email";
    }
    if ((!editing || passwordOnly) && f.password.length < 8) er.password = "At least 8 characters";
    if (editing && !passwordOnly && f.password && f.password.length < 8) er.password = "At least 8 characters";
    setErrors(er);
    if (Object.keys(er).length) return;

    let data;
    if (passwordOnly) data = { password: f.password };
    else {
      data = { username: f.username.trim(), email: f.email.trim(), first_name: f.first_name.trim(), last_name: f.last_name.trim(), is_staff: f.is_staff, is_active: f.is_active };
      if (f.password) data.password = f.password;
      if (isSelf) {
        delete data.is_staff;
        delete data.is_active;
      }
    }
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      icon={passwordOnly ? KeyRound : editing ? Pencil : UserPlus}
      title={passwordOnly ? `Reset password · ${user?.username}` : editing ? `Edit ${user.username}` : "New user"}
      subtitle={editing && !passwordOnly ? `Joined ${formatDate(user.date_joined)} · ${user.vehicle_count ?? 0} listings` : undefined}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>{passwordOnly ? "Set password" : editing ? "Save" : "Create user"}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {!passwordOnly && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Username" required error={errors.username}><Input value={f.username || ""} onChange={set("username")} invalid={errors.username} /></Field>
              <Field label="Email" required error={errors.email}><Input type="email" value={f.email || ""} onChange={set("email")} invalid={errors.email} /></Field>
              <Field label="First name"><Input value={f.first_name || ""} onChange={set("first_name")} /></Field>
              <Field label="Last name"><Input value={f.last_name || ""} onChange={set("last_name")} /></Field>
            </div>
            {!isSelf && !user?.is_superuser && (
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                <label className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <div className="text-[13.5px] font-medium">Admin access</div>
                    <div className="text-[12px] text-gray-500">Can use this console and verify listings</div>
                  </div>
                  <Toggle checked={!!f.is_staff} onChange={set("is_staff")} label="Admin access" />
                </label>
                <label className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <div className="text-[13.5px] font-medium">Active</div>
                    <div className="text-[12px] text-gray-500">Deactivated users can't sign in</div>
                  </div>
                  <Toggle checked={!!f.is_active} onChange={set("is_active")} label="Active" />
                </label>
              </div>
            )}
          </>
        )}
        <Field
          label={passwordOnly ? "New password" : editing ? "New password" : "Password"}
          required={!editing || passwordOnly}
          error={errors.password}
          hint={editing && !passwordOnly ? "Leave blank to keep the current password" : "At least 8 characters"}
        >
          <Input type="password" autoComplete="new-password" value={f.password || ""} onChange={set("password")} invalid={errors.password} />
        </Field>
      </form>
    </Modal>
  );
}
