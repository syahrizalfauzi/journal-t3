export type Sorts =
	| 'createdAt'
	| 'updatedAt'
	| 'username'
	| 'role'
	| 'isActivated'
	| 'email'
	| 'name'
	| 'country'
	| 'maxScale'
	| 'question'
	| 'title'
	| 'status';

export interface SortOrder {
	sort: string;
	order: 'asc' | 'desc';
	label: string;
}
