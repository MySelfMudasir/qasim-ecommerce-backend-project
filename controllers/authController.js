import { bcryptCompare } from "../utils/bcrypt.js";
import { validationResult } from 'express-validator';
import { bcryptHash } from '../utils/bcrypt.js';
import { getUserByEmail } from "../models/authModel.js";
import { errorResponse, successResponse } from "../utils/response.js";
import jwt from 'jsonwebtoken';
import { createUser } from "../models/userModel.js";
import logger from "../utils/logger.js";
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

        // Clear existing token cookie if it exists
        res.clearCookie("token");
        // SET COOKIE HERE
        res.cookie("token", token, {
            httpOnly: true, // cannot be accessed by JS
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        

        return successResponse(
            res,
            'User logged in successfully',
            {
                token,
                user: {
                    id: user.id,
                    name: user.displayName || user.first_name,
                    email: user.email,
                    checkoutMode: "collection"
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
        const { verificationCode, phoneNumber, phoneCode } = req.body.email;
        const { firstName, lastName, displayName, streetAddress, city, state, zipCode, country } = req.body.profile;
        const { businessName, businessType, primaryCategory, monthlyOrders } = req.body.business;
        const { emailUpdates, smsUpdates, marketingUpdates } = req.body.notifications;

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

        const hashedPassword = await bcryptHash(password);
        const user = await createUser(firstName, email, hashedPassword, phoneNumber, lastName, displayName, streetAddress, city, state, zipCode, country, businessName, businessType, primaryCategory, monthlyOrders, emailUpdates, smsUpdates, marketingUpdates);

        return successResponse(
            res,
            'User created successfully',
            {
                user: {
                    id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, displayName: user.display_name, phoneNumber: user.phone_number, streetAddress: user.street_address, city: user.city, state: user.state, zipCode: user.zip_code, country: user.country, imageUrl: user.image_url, checkoutMode: "collection"
                    // businessName: user.business_name, businessType: user.business_type, primaryCategory: user.primary_category, monthlyOrders: user.monthly_orders, emailUpdates: user.email_updates, smsUpdates: user.sms_updates, marketingUpdates: user.marketing_updates
                }
            },
            201
        );
    } catch (error) {
        next(error);
    }
}



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