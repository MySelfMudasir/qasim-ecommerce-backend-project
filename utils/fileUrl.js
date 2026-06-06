import dotenv from 'dotenv';
dotenv.config();

export const buildProductImageUrl = (filename) => {
    if (!filename) return null;

    return `${process.env.BASE_URL}/uploads/products/${filename}`;
};

export const buildProductGalleryUrls = (images = []) => {
    return images.map(
        image =>
            `${process.env.BASE_URL}/uploads/products/${image}`
    );
};