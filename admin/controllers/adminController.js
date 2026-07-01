import { bcryptCompare } from "../../utils/bcrypt.js";
import { validationResult } from 'express-validator';
import { bcryptHash } from '../../utils/bcrypt.js';
import { getUserByEmail } from "../models/adminModel.js";
import { errorResponse, successResponse } from "../../utils/response.js";
import jwt from 'jsonwebtoken';
import { createUser } from "../models/adminModel.js";
import logger from "../../utils/logger.js";
import dotenv from 'dotenv';
dotenv.config();


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return errorResponse(
                res,
                'Invalid email or password',
                401
            );
        }

        const isMatch = await bcryptCompare(
            password,
            user.password
        );

        if (!isMatch) {
            return errorResponse(
                res,
                'Invalid email or password',
                401
            );
        }

        if (!user.is_active) {
            return errorResponse(
                res,
                "Account disabled",
                403
            );
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        return successResponse(
            res,
            'User logged in successfully',
            {
                token,
                user: {
                    id: user.id,
                    name: user.displayName || user.first_name,
                    email: user.email,
                    role: user.role,
                    isActive: user.is_active
                }
            },
            200
        );

    } catch (error) {
        next(error);
    }
};


export const register = async (req, res, next) => {
    try {
        const { email, password } = req.body.account;
        const { firstName, lastName, displayName } = req.body.profile;

        logger.info('Registering new user');
        logger.info('========================== Full request body: ==========================');
        logger.info({ ...req.body });
        logger.info('========================== Full request body: ==========================');

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        if (!firstName || !email || !password) {
            return errorResponse(
                res,
                'First name, email, and password are required',
                400
            );
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return errorResponse(
                res,
                'User with this email already exists',
                409
            );
        }


        const hashedPassword = await bcryptHash(password);
        const user = await createUser(firstName, email, hashedPassword, lastName, displayName);

        return successResponse(
            res,
            'User created successfully',
            {
                user: {
                    id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, displayName: user.display_name, role: user.role, isActive: user.is_active
                }
            },
            201
        );
    } catch (error) {
        next(error);
    }
}


export const logout = async (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        return successResponse(res, 'Logged out successfully', {}, 200);
    } catch (error) {
        next(error);
    }
};


export const getToken = async (req, res, next) => {
    try {
        const { userId, userPwd } = req.body;

        const token = jwt.sign(
            {
                userId: userId,
                userEmail: userPwd
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        res.json({
            success: true,
            token
        });
    } catch (error) {
        next(error);
    }
};