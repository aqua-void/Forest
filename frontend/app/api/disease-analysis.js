// frontend/app/api/disease-analysis.js
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { imageUrl, userId, farmId } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "imageUrl is required" });
        }

        // Forward the request to FastAPI backend
        const response = await axios.post(`${BACKEND_URL}/disease-analysis`, {
            imageUrl,
            user_id: userId || "anonymous",
            farm_id: farmId || "default_farm",
        });

        // Return the backend response directly
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("API proxy error:", error.message || error);
        return res.status(500).json({
            error: "Failed to analyze image",
            details: error.response?.data || error.message,
        });
    }
}
