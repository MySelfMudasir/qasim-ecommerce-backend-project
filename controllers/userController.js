import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../models/userModel.js';
import { successResponse, errorResponse } from '../utils/response.js';
import path from 'path';
import fs from 'fs';
import { validationResult } from 'express-validator';
import { bcryptHash } from '../utils/bcrypt.js';
import logger from '../utils/logger.js';


export const create = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const errors = validationResult(req);


        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }


        if (!name || !email || !password) {
            return errorResponse(
                res,
                'Name, email, and password are required',
                400
            );
        }

        const hashedPassword = await bcryptHash(password);
        const user = await createUser(name, email, hashedPassword);

        return successResponse(
            res,
            'User created successfully',
            { id: user.id, name: user.name, email: user.email },
            201
        );
    } catch (error) {
        next(error);
    }
};

export const findAll = async (req, res, next) => {
    try {
        // dummy data
        // const absPath = path.resolve('data/users.json');
        // const users = JSON.parse(
        //     fs.readFileSync(absPath, 'utf-8')
        // );

        const users = await getAllUsers();
        if (!users || users.length === 0) {
            return successResponse(res, 'No users found', []);
            logger.info(`No users found`);
        }

        return successResponse(
            res,
            'Users fetched successfully',
            users.map(user => ({ id: user.id, firstName: user.first_name, lastName: user.last_name, displayName: user.display_name, email: user.email, phoneNumber: user.phone_number, address: { streetAddress: user.street_address, city: user.city, state: user.state, zipCode: user.zip_code, country: user.country, }, businessName: user.business_name, businessType: user.business_type, primaryCategory: user.primary_category, monthlyOrders: user.monthly_orders, emailUpdates: user.email_updates, smsUpdates: user.sms_updates, marketingUpdates: user.marketing_updates, role: user.role, isActive: user.is_active, checkoutMode: user.checkout_mode })),
        );
        logger.info(`Users fetched successfully`);
    } catch (error) {
        next(error);
        logger.error(`Error fetching users: ${error.message}`);
    }
};

export const findOne = async (req, res, next) => {
    try {
        const user = await getUserById(req.params.id);

        if (!user) {
            return errorResponse(
                res,
                'User not found',
                404
            );
        }

        return successResponse(
            res,
            'User fetched successfully',
            { id: user.id, firstName: user.first_name, lastName: user.last_name, displayName: user.display_name, email: user.email, phoneNumber: user.phone_number, address: { streetAddress: user.street_address, city: user.city, state: user.state, zipCode: user.zip_code, country: user.country, }, businessName: user.business_name, businessType: user.business_type, primaryCategory: user.primary_category, monthlyOrders: user.monthly_orders, emailUpdates: user.email_updates, smsUpdates: user.sms_updates, marketingUpdates: user.marketing_updates, role: user.role, isActive: user.is_active, checkoutMode: user.checkout_mode },
            200
        );
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { firstName, lastName, displayName, email, phoneNumber, streetAddress, city, state, zipCode, country, businessName, businessType, primaryCategory, monthlyOrders, emailUpdates, smsUpdates, marketingUpdates, role, isActive, checkoutMode, password } = req.body;
        const id = req.params.id;

        const data = { first_name: firstName, last_name: lastName, display_name: displayName, email, phone_number: phoneNumber, street_address: streetAddress, city, state, zip_code: zipCode, country, business_name: businessName, business_type: businessType, primary_category: primaryCategory, monthly_orders: monthlyOrders, email_updates: emailUpdates, sms_updates: smsUpdates, marketing_updates: marketingUpdates, role, is_active: isActive, checkout_mode: checkoutMode };

        // Update password only if provided
        if (password) {
            data.password = await bcryptHash(password);
        }

        const user = await updateUser(id, data);

        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        return successResponse(
            res,
            "User updated successfully",
            user
        );
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const user = await deleteUser(req.params.id);

        if (!user) {
            return errorResponse(
                res,
                'User not found',
                404
            );
        }

        return successResponse(
            res,
            'User deleted successfully',
            user
        );
    } catch (error) {
        next(error);
    }
};