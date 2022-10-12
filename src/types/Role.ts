export default interface Role extends Record<string, boolean> {
	admin: boolean;
	chief: boolean;
	reviewer: boolean;
	author: boolean;
}
