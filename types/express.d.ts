import "express"

export interface UserSession {
	id: number,
	business_id: number,
	role_id: number
}

declare module "express" {
	interface Request {
		session?: {
			user: UserSession | null
		}
	}
}

