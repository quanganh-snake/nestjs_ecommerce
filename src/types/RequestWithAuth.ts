import { Request } from "express";
import { User } from "src/entities/user.entity";

export type RequestWithAuth = Request & {user: Omit<User, 'password'>}