import express from "express";
import { verifyToken } from "../src/middlewares/auth.js";
import { authorize } from "../src/middlewares/authorize.js";
import {
    salesReport,
    // exportSalesExcel,
    // exportSalesPDF
} from "../controllers/salesController.js";

const router = express.Router();

router.post(
    "/report",
    // verifyToken,
    // authorize("admin"),
    salesReport
);

// router.post(
//     "/export/excel",
//     verifyToken,
//     authorize("admin"),
//     exportSalesExcel
// );

// router.post(
//     "/export/pdf",
//     verifyToken,
//     authorize("admin"),
//     exportSalesPDF
// );

export default router;