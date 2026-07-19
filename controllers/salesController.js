import { getSalesReport } from '../models/salesModel.js';
import {
    successResponse,
    errorResponse
} from '../utils/response.js';


export const salesReport = async (req, res) => {
    try {
        const {
            fromDate,
            toDate,
            page = 1,
            limit = 10,
        } = req.body;

        if (!fromDate || !toDate) {
            return errorResponse(res, "From and To dates are required", 400);
        }

        const result = await getSalesReport(
            fromDate,
            toDate,
            Number(page),
            Number(limit)
        );

        return successResponse(
            res,
            "Sales report fetched successfully",
            result
        );
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};