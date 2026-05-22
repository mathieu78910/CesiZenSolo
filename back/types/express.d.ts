// Extension de type Express pour exposer req.user dans les handlers.
import "express";

declare module "express" {
  export interface Request {
    user?: {
      userId: number;
      role: string;
      email: string;
    };
  }
}
