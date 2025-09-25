import "express"

export interface UserSession {
	id: bigint
}

declare module "express" {
	interface Request {
		session?: {
			user: UserSession | null
		}
	}
}

