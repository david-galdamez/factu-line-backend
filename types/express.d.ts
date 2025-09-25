import "express"

export interface UserSession {
	id: number
}

declare module "express" {
	interface Request {
		session?: {
			user: UserSession | null
		}
	}
}

