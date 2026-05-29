import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../models/userModel.js';
import { successResponse, errorResponse } from '../utils/response.js';
import path from 'path';
import fs from 'fs';

export const create = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return errorResponse(
                res,
                'Name and email are required',
                400
            );
        }

        const user = await createUser(name, email);

        return successResponse(
            res,
            'User created successfully',
            user,
            201
        );
    } catch (error) {
        next(error);
    }
};

export const findAll = async (req, res, next) => {
    try {
        const absPath = path.resolve('data/users.json');

        const users = JSON.parse(
            fs.readFileSync(absPath, 'utf-8')
        );

        // const users = JSON.parse(fs.readFileSync(absPath, 'utf-8'));
        // const users = await getAllUsers();
        return successResponse(
            res,
            'Users fetched successfully',
            users
        );
    } catch (error) {
        next(error);
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
            user
        );
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        const user = await updateUser(
            req.params.id,
            name,
            email
        );

        if (!user) {
            return errorResponse(
                res,
                'User not found',
                404
            );
        }

        return successResponse(
            res,
            'User updated successfully',
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