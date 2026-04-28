function UserRolesPanel({ users, onRoleChange, savingUserId }) {
  return (
    <section className="panel space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[--accent]">
          Administración
        </p>
        <h3 className="mt-2 text-2xl text-[--ink]">Usuarios y roles</h3>
        <p className="mt-2 text-sm leading-6 text-[--muted]">
          Este bloque deja preparada la gestión de roles para el endpoint admin del backend.
        </p>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <article
            className="flex flex-col gap-3 rounded-[1.15rem] border border-[rgba(109,78,52,0.12)] bg-[rgba(255,255,255,0.4)] p-4 md:flex-row md:items-center md:justify-between"
            key={user.id}
          >
            <div>
              <h4 className="font-semibold text-[--ink]">{user.name}</h4>
              <p className="text-sm text-[--muted]">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[rgba(169,117,59,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[--wood-dark]">
                {user.role}
              </span>

              <select
                className="input min-w-36"
                value={user.role}
                onChange={(event) => onRoleChange(user.id, event.target.value)}
                disabled={savingUserId === user.id}
              >
                <option value="user">Usuario</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default UserRolesPanel
