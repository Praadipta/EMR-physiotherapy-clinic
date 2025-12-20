// Role-Based Access Control (RBAC)

export type Role = 'admin' | 'fisioterapis';

export type Permission =
	| 'patients:read'
	| 'patients:write'
	| 'patients:delete'
	| 'appointments:read'
	| 'appointments:write'
	| 'appointments:delete'
	| 'clinical:read'
	| 'clinical:write'
	| 'treatments:read'
	| 'treatments:write'
	| 'billing:read'
	| 'billing:write'
	| 'reports:read'
	| 'users:read'
	| 'users:write';

const rolePermissions: Record<Role, Permission[]> = {
	admin: [
		'patients:read',
		'patients:write',
		'patients:delete',
		'appointments:read',
		'appointments:write',
		'appointments:delete',
		'billing:read',
		'billing:write',
		'reports:read',
		'users:read',
		'users:write'
	],
	fisioterapis: [
		'patients:read',
		'appointments:read',
		'appointments:write',
		'clinical:read',
		'clinical:write',
		'treatments:read',
		'treatments:write',
		'reports:read'
	]
};

export function hasPermission(role: Role, permission: Permission): boolean {
	return rolePermissions[role]?.includes(permission) ?? false;
}

export function getPermissions(role: Role): Permission[] {
	return rolePermissions[role] ?? [];
}

export function canAccessResource(role: Role, resource: string, action: 'read' | 'write' | 'delete'): boolean {
	const permission = `${resource}:${action}` as Permission;
	return hasPermission(role, permission);
}
